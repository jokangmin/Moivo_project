import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATH } from "../../scripts/path";
import PropTypes from 'prop-types';

// AuthContext 생성 및 내보내기
export const AuthContext = createContext(null);

// useAuth 훅 생성 및 내보내기
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // 2024-12-11 isAdmin 상태 추가 장훈
    const navigate = useNavigate();
    const [tokenExpiryTime, setTokenExpiryTime] = useState(null);

    // 토큰 관리 함수들
    const getAccessToken = () => {
        return localStorage.getItem('accessToken');
    };

    const getRefreshToken = () => {
        return localStorage.getItem('refreshToken');
    };

    const removeTokens = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    // 토큰 갱신 함수
    const refreshAccessToken = async () => {
        try {
            const response = await axios.post('/api/auth/token/refresh', {}, {
                withCredentials: true,
                baseURL: PATH.SERVER
            });
            
            console.log('토큰 재발급 응답:', response.data);
            
            if (response.data.newAccessToken) {
                localStorage.setItem('accessToken', response.data.newAccessToken);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.newAccessToken}`;
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
            removeTokens();
            setIsAuthenticated(false);
            return false;
        }
    };

    // 로그아웃 함수
    const logout = async () => {
        try {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();
            
            // 토큰이 있는 경우에만 로그아웃 요청
            if (accessToken) {
                await axiosInstance.post(`/api/user/logout`, 
                    { refreshToken },
                    {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );
            }
            removeTokens();
            setIsAuthenticated(false);
            setIsAdmin(false); // 2024-12-11 로그아웃 시 isAdmin 상태 초기화 장훈
            
            // 사용자 정보 제거
            localStorage.removeItem('userId');
            localStorage.removeItem('id');

            // 로컬 스토리지 토큰 제거
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            navigate('/');
        } catch (error) {
            console.error('로그아웃 요청 실패:', error);

            // 에러가 발생하더라도 로컬의 토큰은 제거
            localStorage.removeItem("accessToken");
            setIsAuthenticated(false);
            setIsAdmin(false); // 2024-12-11 로그아웃 시 isAdmin 상태 초기화 장훈
            navigate('/');
        }
    };

    // 일반 로그인 함수
    const login = async (userId, pwd) => {
        try {
            const response = await axiosInstance.post(`/api/user/login`, {
                userId,
                pwd
            }, {
                withCredentials: true  // 쿠키 전송을 위해 작성한거임
            });
            return await handleLoginSuccess(response);
        } catch (error) {
            throw error.response?.data?.error || error.message;
        }
    };

    // 카카오 로그인 함수
    // 24.1216~17 - uj (수정)
    const kakaoLogin = async (code) => {
        try {
            const response = await axiosInstance.get(`/api/user/social/kakao/login?code=${code}`, {
                withCredentials: true
            });
            console.log(response.data);
            
            const success = await handleLoginSuccess(response);
            if (success) {
                setIsAuthenticated(true);
                return true;
            }

            return await handleLoginSuccess(response);
        } catch (error) {
            console.error('카카오 로그인 실패:', error);
            throw error.response?.data?.error || error.message;
        }
    };

    // 일반, 카카오 로그인 성공 시 공통 함수
    const handleLoginSuccess = async (response) => {
        const { accessToken, isAdmin } = response.data; //2024-12-11 idAdmin 추가 장훈
        if (!accessToken) {
            throw new Error('로그인에 실패했습니다.');
        }
        
        // 토큰 만료 시간 설정 12.16 성찬
        const expiryTime = getTokenExpiryTime(accessToken);
        setTokenExpiryTime(expiryTime);
        
        // localStorage에 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('id', response.data.id);
        localStorage.setItem('isAdmin', isAdmin); // 2024-12-11 isAdmin 값을 localStorage에 저장 장훈

        // 상태 업데이트
        setIsAuthenticated(true);
        setIsAdmin(isAdmin); // 2024-12-11 isAdmin 상태 업데이트 장훈

        // axios 헤더 설정
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return true;
    };

    // 초기 인증 상태 확인 (새로고침해도 로그인 상태 유지)
    useEffect(() => {
        const token = getAccessToken();
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true'; // 2024-12-11 isAdmin 값을 가져옴 장훈
        if (token) {
            // 토큰이 있을 때 만료 시간도 함께 설정
            const expiryTime = getTokenExpiryTime(token);
            setTokenExpiryTime(expiryTime);
            setIsAuthenticated(true);
            setIsAdmin(storedIsAdmin); // 2024-12-11 isAdmin 상태 설정 장훈
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // 토큰에서 만료 시간 추출하는 함수
    const getTokenExpiryTime = (token) => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000; // milliseconds로 변환
            console.log('Calculated expiry time:', new Date(expiryTime)); // 디버깅용 로그
            return expiryTime;
        } catch (e) {
            console.error('토큰 만료 시간 파싱 실패:', e);
            return null;
        }
    };

    const value = {
        isAuthenticated,
        isAdmin, // 2024-12-11 isAdmin 값을 Context에서 제공 장훈
        setIsAuthenticated,
        setIsAdmin, // 2024-12-11 isAdmin 값을 변경할 수 있는 함수 제공 장훈
        login,
        logout,
        kakaoLogin,
        handleLoginSuccess,
        getAccessToken,
        getRefreshToken,
        refreshAccessToken,
        tokenExpiryTime,
        getTokenExpiryTime,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// PropTypes 정의 추가
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default AuthProvider;