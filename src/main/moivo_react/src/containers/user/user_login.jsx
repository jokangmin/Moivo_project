import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { PATH } from "../../../scripts/path";
import styles from '../../assets/css/user_login.module.css';
import axios from 'axios';

const user_login = () => {

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ userId: '', pwd: '' });
  const [error, setError] = useState('');

    //사용자 데이터 요청하는 함수임
    const fetchUserData = async () => {
        const token = sessionStorage.getItem("token"); // JWT를 가져옴
        try {
            const response = await axios.get(`${PATH.SERVER}/api/user/info`, {    //  /api/user -> LoginController로 이동
                headers: {
                    Authorization: `Bearer ${token}`, // 헤더에 JWT 추가
                },
            });
            console.log("사용자 정보:", response.data);
        } catch (error) {
            console.error("데이터 요청 실패:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(formData);
            const response = await axios.post(`${PATH.SERVER}/api/user/login`, formData);

            const {jwt, id, wishId, paymentId} = response.data;

            sessionStorage.setItem("token", jwt);
            sessionStorage.setItem("id", id);
            sessionStorage.setItem("wishId", wishId);
            sessionStorage.setItem("paymentId", paymentId);
            
            login({ id, wishId, paymentId }, jwt);
            
            alert("로그인 성공!");
            navigate("/");
        } catch (error) {
            console.error("로그인 실패:", error);
            alert("로그인에 실패했습니다.");
        }
    };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     try {
//       const success = await login(formData);
//       if (success) {
//         navigate('/');
//       } else {
//         setError('로그인에 실패했습니다.');
//       }
//     } catch (error) {
//       setError('서버와의 통신 중 오류가 발생했습니다.');
//     }
//   };

  return (
    <div className={styles.loginMain}>
      <div className={styles.container} id="container">
        <div className={`${styles['form-container']} ${styles['sign-in-container']}`}>
          <form onSubmit={handleSubmit}>
            <Link to="/">
              <h1>Moivo</h1>
            </Link>
            <div className={styles['social-container']}>
              {/*<a href="#" className={styles.social}><i className="fab fa-facebook-f"></i></a>*/}
              {/*<a href="#" className={styles.social}><i className="fab fa-google-plus-g"></i></a>*/}
              {/*  const 원래 REST_API_KEY = '백엔드에서 줘야됌';*/}
              {/*  const REDIRECT_URI = '백엔드에서 줘야됌';*/}
              <a href="https://kauth.kakao.com/oauth/authorize?client_id=714a575754949434c7f9e10bb527da9a&redirect_uri=http://localhost:8080/api/user/oauth2/callback/kakao&response_type=code" className={styles.social}><i className="fab fa-kakao"></i>Kakao</a>
              <a href="http://accounts.google.com/o/oauth2/v2/auth?client_id=679990079220-prfchh4nd9k9oit85na1guc84jk6pjje.apps.googleusercontent.com&redirect_uri=http://localhost:8080/api/user/oauth2/callback/google&response_type=code" className={styles.social}><i className="fab fa-google-plus-g"></i></a>
              <a href="https://nid.naver.com/oauth2.0/authorize?client_id=rkLzelLLwohrsT5K3PzP&redirect_uri=http://localhost:8080/api/user/oauth2/callback/naver&response_type=code" className={styles.social}><i className="fab fa-kakao"></i>Naver</a>
              {/*<a href="https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=714a575754949434c7f9e10bb527da9a&redirect_uri=http://localhost:8080/api/user/oauth2/callback/kakao" className={styles.social}><i className="fab fa-linkedin-in"></i></a>*/}
            </div>
            <span>If you don't want to sign up,<br/>or use your account instead.</span>
            {error && <div className={styles.error}>{error}</div>}
            <input
              type="text"
              name="userId"
              value={formData.id}
              onChange={handleChange}
              placeholder="ID"
              required
            />
            <input
              type="password"
              name="pwd"
              value={formData.pwd}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className={styles['overlay-container']}>
          <div className={styles.overlay}>
            <div className={`${styles['overlay-panel']} ${styles['overlay-right']}`}>
              <h1>Hello, Style Icon!</h1>
              <p>Enter your personal details and start journey with us</p>
              <Link to="/user_signup">
                <button className={styles.ghost} id="signUp">Sign Up</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default user_login;