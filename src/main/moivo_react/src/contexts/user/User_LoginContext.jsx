import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { PATH } from "../../../scripts/path";
import axiosInstance from '../../utils/axiosConfig';

const useUserLogin = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ userId: '', pwd: '' });
    const [error, setError] = useState('');

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
                await fetchUserData();
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.error || "로그인이 불가능합니다.<br/> 아이디 또는 비밀번호를 확인해주세요.");
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

    return {
        formData,
        error,
        handleSubmit,
        handleChange,
        handleFocus,
        handleKakaoLogin
    };
};

export default useUserLogin;