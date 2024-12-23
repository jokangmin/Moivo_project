import axios from 'axios';
import { PATH } from '../../scripts/path';
// yjy 만듬

const axiosInstance = axios.create({
  baseURL: PATH.SERVER,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터: 모든 요청에 토큰 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // 저장된 토큰 가져오기
    console.log('[REQUEST] 현재 요청 헤더의 토큰:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[REQUEST] 토큰이 없습니다. 로그인이 필요한 요청입니다.');
    }
    return config;
  },
  (error) => {
    console.error('[REQUEST ERROR] 요청 설정 중 에러 발생:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 응답 처리 및 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 토큰이 만료되었는지 확인
      const errorMessage = error.response?.data?.message;
      if (errorMessage?.includes('만료된 토큰') || errorMessage?.includes('expired')) {
        console.warn('[RESPONSE] 토큰 만료: 갱신 시도');
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              console.log('[RESPONSE] 갱신된 토큰으로 재요청 진행');
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              console.error('[RESPONSE ERROR] 재요청 중 에러 발생:', err);
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('[RESPONSE] 토큰 갱신 요청 시작');
          const response = await axios.post(
              `${PATH.SERVER}/api/auth/token/refresh`,
              {}, // Refresh Token 요청 시 Body 필요 여부 확인
              { withCredentials: true } // 쿠키 기반 인증 포함
          );
      
          const { newAccessToken } = response.data; // 새로 발급된 토큰
          console.log('[RESPONSE] 새로 갱신된 토큰:', newAccessToken);
      
          if (newAccessToken) {
              // 새 토큰 저장 및 적용
              localStorage.setItem('accessToken', newAccessToken); // localStorage에 저장
              axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`; // axios 기본 헤더 설정
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // 재요청 헤더에 갱신된 토큰 설정
      
              processQueue(null, newAccessToken); // 실패한 요청 큐 처리
              console.log('[RESPONSE] 갱신된 토큰으로 재요청 진행');
              return axiosInstance(originalRequest); // 재요청
          }
      } catch (refreshError) {
          console.error('[RESPONSE ERROR] 토큰 갱신 실패:', refreshError);
          processQueue(refreshError, null); // 실패한 요청 처리
          localStorage.removeItem('accessToken'); // 실패 시 토큰 삭제
          window.location.href = '/user'; // 로그아웃 처리
          return Promise.reject(refreshError); // 에러 반환    
        } finally {
          isRefreshing = false; // 갱신 상태 초기화
        }
      } else {
        // 다른 인증 오류의 경우 바로 에러 반환
        console.error('[RESPONSE] 인증 오류:', errorMessage);
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 404) {
      console.warn('[RESPONSE] 404 응답 처리: 데이터 없음');
      return Promise.resolve({ data: null });
    }

    console.error('[RESPONSE ERROR] 요청 실패:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
