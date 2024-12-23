import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../utils/axiosConfig";

const QnaBoardContext = createContext();
export const useQnaBoard = () => useContext(QnaBoardContext);

const QnaBoardProvider = ({ children }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        type: "",
        title: "",
        question: "",
        isSecret: false,
        privatePwd: "",
    });
  
    const validateForm = () => {
      if (!formData.type) {
        alert("문의 유형을 선택해주세요.");
        return false;
      }
      if (!formData.title.trim()) {
        alert("제목을 입력해주세요.");
        return false;
      }
      if (!formData.question.trim()) {
        alert("문의 내용을 입력해주세요.");
        return false;
      }
      if (formData.isSecret && !formData.privatePwd) {
        alert("비밀글 비밀번호를 입력해주세요.");
        return false;
      }
      return true;
    };
  
    //2024/12/17 핸들러 예외처리 수정 장훈
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
    
      // 비밀글 체크박스 처리
      if (name === "isSecret") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
          // 체크된 상태에서는 type을 "비밀 문의"로 설정, 체크 해제시 type을 ""으로 설정
          type: checked ? "비밀 문의" : "",
          privatePwd: "",
        }));
      } 
      // 문의 유형(type) 처리
      else if (name === "type") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
          // "비밀 문의"를 선택하면 isSecret을 체크하고, 그 외에는 해제
          isSecret: value === "비밀 문의" ? true : false,
        }));
      } 
      // 기타 필드 처리
      else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: type === "checkbox" ? checked : value,
        }));
      }
    };
  
    //axios 수정
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!validateForm()) return;
    
      const token = localStorage.getItem("accessToken");
    
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/user");
        return;
      }
    
      const postData = {
        categoryId: formData.type === "일반 문의" ? 1 :  
                   formData.type === "기타 문의" ? 2 :
                   formData.type === "사이즈 문의" ? 3 :
                   formData.type === "비밀 문의" ? 4 : 0,
        title: formData.title,
        content: formData.question,
        secret: formData.isSecret,
        privatePwd: formData.isSecret ? formData.privatePwd : "",
      };
      
      try {
        await axiosInstance.post('/api/user/question/add', postData);
        alert("문의가 성공적으로 작성되었습니다!");
        navigate("/qna_boardlist");
      } catch (error) {
        console.error("Error:", error);
        alert("문의 작성 중 오류가 발생했습니다.");
      }
    };

    return (
        <QnaBoardContext.Provider value={{ formData, handleChange, handleSubmit, validateForm }}>
            {children}
        </QnaBoardContext.Provider>
    );
};

export default QnaBoardProvider;