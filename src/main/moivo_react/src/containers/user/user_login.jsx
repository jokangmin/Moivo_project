import React from 'react';
import { Link } from 'react-router-dom';
import signin from '../../assets/css/user_login.module.css';
import kakaoLoginImage from '../../assets/image/kakao_login.png';
import useUserLogin from '../../contexts/user/User_LoginContext';

const user_login = () => {
    const { 
        formData, 
        error, 
        handleSubmit, 
        handleChange, 
        handleFocus, 
        handleKakaoLogin 
    } = useUserLogin();

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