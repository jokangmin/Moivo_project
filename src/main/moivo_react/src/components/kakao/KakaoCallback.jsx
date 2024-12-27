import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const KakaoCallback = () => {
    const navigate = useNavigate();
    const { kakaoLogin } = useAuth();

    // 24.12.16 - uj
    // 카카오 로그인 요청
    const kakao = async () => {
        const code = new URL(window.location.href).searchParams.get("code");
        console.log(code);
        if (code) {
            try {
                const success = await kakaoLogin(code);
                if (success) {
                    console.log(success);
                    navigate('/');
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    useEffect(() =>  {
        kakao();
    }, []);
  
    return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoCallback;
