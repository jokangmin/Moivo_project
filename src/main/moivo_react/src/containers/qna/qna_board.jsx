import React from 'react';
import QnA_w from '../../assets/css/qna_board.module.css'; 
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import { useQnaBoard } from '../../contexts/qna/QnaBoardContext';

const Qna_board = () => {
  const { formData, handleChange, handleSubmit } = useQnaBoard();

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