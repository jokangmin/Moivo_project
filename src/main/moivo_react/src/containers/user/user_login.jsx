import axios from 'axios';
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { PATH } from "../../../scripts/path";
import signin from '../../assets/css/user_login.module.css';
import kakaoLoginImage from '../../assets/image/kakao_login.png';
import axiosInstance from '../../utils/axiosConfig';

const user_login = () => {
//d
  const navigate = useNavigate();
  const {login} = useContext(AuthContext);
  const [formData, setFormData] = useState({ userId: '', pwd: '' });
  const [error, setError] = useState('');

    //사용자 데이터 요청하는 함수임
    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axiosInstance.get('/api/user/info', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("사용자 정보:", response.data);
        } catch (error) {
            console.error("데이터 요청 실패:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const success = await login(formData.userId, formData.pwd);
            if (success) {
                navigate('/');
            }
        } catch (error) {
            if (error.message.includes('이미 다른 곳에서 로그인된 계정입니다')) {
                setError('이미 다른 곳에서 로그인된 계정입니다.<br/>기존 세션을 종료하고 다시 시도해주세요.');
            } else {
                setError('로그인에 실패했습니다.<br/>아이디와 비밀번호를 확인해주세요.');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleKakaoLogin = async () => {
        try {
            const response = await axios.get(`${PATH.SERVER}/api/user/social/kakao`);
            console.log(response.data);
            window.location.href = response.data;
        } catch (error) {
            console.error("인증 오류:", error);
        }
    };

    const handleFocus = (e) => {
        if (e.target.name === 'userId' || e.target.name === 'pwd') {
            setError('');
        }
    };
    return (
        <div className={signin.loginMain}>
            <div className={signin.container} id="container">
                <div className={`${signin['form-container']} ${signin['sign-in-container']}`}>
                    <form onSubmit={handleSubmit}>
                        <Link to="/">
                            <h1>Moivo</h1>
                        </Link>
                        <div className={signin['social-container']}>
                        </div>
                        <span>If you don't want to sign up,<br/>or use your account instead.</span>
                        <input type="text" name="userId" value={formData.id} onChange={handleChange} onFocus={handleFocus} placeholder="ID" required/>
                        <input type="password" name="pwd" value={formData.pwd} onChange={handleChange} onFocus={handleFocus} placeholder="Password" required/>
                        {error && <div className={signin.error} dangerouslySetInnerHTML={{ __html: error }} />}
                        <div className={signin.signBtn}>
                            
                            <button type="submit" className={signin.signinbtn}>Sign In</button>
                            
                            {/* 반응형-> 나타나는 회원가입 버튼 */}
                            <Link to="/user_signup">
                                <button type="submit" className={signin.singupbtn}>Sign Up</button>
                            </Link> 
                                
                            <button type="button" className={signin.kakao_nomedia} onClick={handleKakaoLogin} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} >
                                <img src={kakaoLoginImage} alt="카카오 로그인"  style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                            </button>
                        </div>

                        {/* 반응형-> 나타나는 카카오 로그인 버튼 */}
                        <div className={signin.kakao_media}>
                            <button type="button" onClick={handleKakaoLogin} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} >
                                <img src={kakaoLoginImage} alt="카카오 로그인"  style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className={signin['overlay-container']}>
                    <div className={signin.overlay}>
                        <div className={`${signin['overlay-panel']} ${signin['overlay-right']}`}>
                            <h2>Hello, Style Icon!</h2>
                            <p>Enter your personal details and start journey with us</p>
                            <Link to="/user_signup">
                                <button className={signin.ghost} id="signUp">Sign Up</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default user_login;