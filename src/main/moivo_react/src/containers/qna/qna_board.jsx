import React, { useState } from 'react';
import QnA_w from '../../assets/css/qna_board.module.css'; 
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import axiosInstance from "../../utils/axiosConfig";

const Qna_board = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    question: "",
    isSecret: false,
    privatePwd : "",
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
    const userId = parseInt(localStorage.getItem("id"));
  
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
      userId: userId,
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
  }

  return (
    <div className={QnA_w.qnaboardMainDiv}>
      <div><Banner /></div>
      <div className={QnA_w.qnaboardheader}></div>

      <div className={QnA_w.qnaboardTitle}>문의 작성하기</div>

      {/* 네비게이션 */}
      <div className={QnA_w.qnaboardNavi}>
        <Link to="/qna_faqboard">
          <button className={QnA_w.qnaboardNaviBtn}>자주 묻는 질문</button>
        </Link>
        <Link to="/qna_board">
          <button className={QnA_w.qnaboardNaviBtn}>문의 작성하기</button>
        </Link>
        <Link to="/qna_boardlist">
          <button className={QnA_w.qnaboardNaviBtn}>문의 게시글</button>
        </Link>
      </div>

      {/* 게시글 작성 폼 */}
      <div className={QnA_w.qnaboardContainer}>
        <div className={QnA_w.qnaboard}>
          <form onSubmit={handleSubmit} className={QnA_w.qnaboardItem}>
            <div className={QnA_w.qnaboardHeader}>
              <span className={QnA_w.qnaboardQuestionType}>문의 유형</span>
              <select className={QnA_w.qnaboardSelect} name="type" value={formData.type} onChange={handleChange} required >
                <option value="">문의 유형을 선택하세요</option>
                <option value="일반 문의">일반 문의</option>
                <option value="기타 문의">기타 문의</option>
                <option value="사이즈 문의">사이즈 문의</option>
                <option value="비밀 문의">비밀 문의</option>
              </select>
            </div>

            <div className={QnA_w.qnaboardHeader}>
              <span className={QnA_w.qnaboardQuestionType}>제목</span>
              <input type="text" className={QnA_w.qnaboardInput} name="title" placeholder="제목을 입력하세요" value={formData.title} onChange={handleChange} required />
            </div>

            {/* 비밀글 체크박스 */}
            <div className={QnA_w.qnaboardHeader} style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
              <label htmlFor="isSecret" style={{ fontWeight: 'bold', fontSize: '14px' }}>비밀글</label>
              <input type="checkbox" name="isSecret" id="isSecret" className={QnA_w.qnaboardCheckbox} checked={formData.isSecret} onChange={handleChange} />
            </div>

            {/* 비밀글일 때 비밀번호 입력 필드 표시 */}
            {formData.isSecret && (
              <div className={QnA_w.qnaboardHeader}>
                <span className={QnA_w.qnaboardQuestionType}>비밀번호</span>
                <input type="password" className={QnA_w.qnaboardInput} name="privatePwd" placeholder="비밀번호를 입력하세요" value={formData.privatePwd} onChange={handleChange} required={formData.isSecret} />
              </div>
            )}

            <div className={QnA_w.qnaboardHeader}>
              <span className={QnA_w.qnaboardQuestionType}>내용</span>
              <textarea className={QnA_w.qnaboardTextarea} name="question" placeholder="문의 내용을 입력하세요" value={formData.question} onChange={handleChange} required />
            </div>

            <div className={QnA_w.qnaboardSubmit}>
              <button type="submit" className={QnA_w.qnaboardSubmitBtn}>작성하기</button>
            </div>
          </form>
        </div> 
      </div>

      <Footer />
    </div>
  );
};

export default Qna_board;