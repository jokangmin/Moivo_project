import React from 'react';
import QnA from '../../assets/css/qna_faqboard.module.css';
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import { Link } from 'react-router-dom';
import { useQnaFaqBoard } from '../../contexts/qna/QnaFaqBoardContext';

const Qna_faqboard = () => {
  const {
    isLoading,
    error,
    currentItems,
    openFAQ,
    currentPage,
    faqList,
    handleToggle,
    handlePageChange,
    getVisiblePages,
  } = useQnaFaqBoard();

  const totalPages = Math.ceil(faqList.length / 6);

  return (
    <div className={QnA.faqmainDiv}>
      <div><Banner /></div>
      <div className={QnA.faqheader}></div>
      <div className={QnA.faqcoment}> 자주 묻는 질문 </div>
      <div className={QnA.faqDiv}>
        
      {/* 고객센터 네비*/}
      <div className={QnA.faqNavi}>
        <Link to="/qna_faqboard">
          <button className={QnA.faqNaviBtn}>자주 묻는 질문</button>
        </Link>

        <Link to="/qna_board">
          <button className={QnA.faqNaviBtn}>문의 작성하기</button>
        </Link>

        <Link to="/qna_boardlist">
          <button className={QnA.faqNaviBtn}>문의 게시글</button>
        </Link>
      </div>
      <div className={QnA.faqss}>
        <div className={QnA.faq}>
          {isLoading ? (
            <p>FAQ 목록을 불러오는 중...</p>
          ) : error ? (
            <p className={QnA.errorMessage}>{error}</p>
          ) : currentItems.length === 0 ? (
            <p>등록된 FAQ가 없습니다.</p>
          ) : (
            <>
              {currentItems.map((faq) => (
                <div key={faq.id} className={QnA.faqItem}>
                  <input  id={`faq-${faq.id}`} type="checkbox" checked={openFAQ === faq.id} onChange={() => handleToggle(faq.id)} />
                  <label htmlFor={`faq-${faq.id}`}>
                    <p className={QnA.faqHeading}>{faq.title}</p>
                    <div className={QnA.faqArrow}></div>
                  </label>
                  {openFAQ === faq.id && (
                    <p className={QnA.faqText}>
                      {faq.content}
                    </p>
                  )}
                </div>
              ))}
              {/* 페이지네이션 버튼 */}
              <div className={QnA.pagination}>
                <button className={QnA.pageArrow} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} >
                    &#8249;
                </button>
                {getVisiblePages(currentPage, totalPages).map((page, index) => (
                    page === "..." ? (
                        <span key={`ellipsis-${index}`}>...</span>
                    ) : (
                        <button key={`page-${page}`} onClick={() => handlePageChange(page)} className={`${QnA.pageButton} ${currentPage === page ? QnA.activePage : ""}`} >
                            {page}
                        </button>
                    )
                ))}
                <button className={QnA.pageArrow} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} >
                    &#8250;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
      <Footer/>
    </div>
  );
};

export default Qna_faqboard;