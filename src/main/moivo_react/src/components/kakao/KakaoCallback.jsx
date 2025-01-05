import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const KakaoCallback = () => {
    const navigate = useNavigate();
    const { kakaoLogin } = useAuth();

    useEffect(() => {
        const processKakaoLogin = async () => {
            try {
                const code = new URL(window.location.href).searchParams.get("code");
                if (code) {
                    console.log("[KakaoCallback] 인가 코드:", code);
                    const success = await kakaoLogin(code);
                    if (success) {
                        console.log("[KakaoCallback] 로그인 성공");
                        navigate('/');
                    }
                }
            } catch (error) {
                console.error("[KakaoCallback] 로그인 실패:", error);
                // 중복 로그인이 아닌 다른 에러인 경우에만 로그인 페이지로 이동
                if (!error.response?.status === 409) {
                    navigate('/user');
                }
            }
        };

        processKakaoLogin();
    }, [kakaoLogin, navigate]);

    return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoCallback;
