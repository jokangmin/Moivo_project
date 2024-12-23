import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';

const QnaFaqBoardContext = createContext();
export const useQnaFaqBoard = () => useContext(QnaFaqBoardContext);

const QnaFaqBoardProvider = ({ children }) => {
  const [faqList, setFaqList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [openFAQ, setOpenFAQ] = useState(null); // 열림 상태 관리
  const itemsPerPage = 6; // 한 페이지에 표시할 FAQ 항목 수

  // FAQ 목록을 가져오는 함수
  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/api/user/question/faq/list');
        console.log('API Response:', response.data);
        
        const faqs = Array.isArray(response.data) ? response.data : [];
        
        if (faqs.length === 0) {
          setError('등록된 FAQ가 없습니다.');
        } else {
          setFaqList(faqs);
          setError(null);
        }
      } catch (error) {
        console.error('FAQ 목록을 가져오는데 실패했습니다:', error);
        setError('FAQ 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        setFaqList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleToggle = (id) => {
      // 동일한 항목을 클릭하면 닫고, 새 항목을 클릭하면 열리도록 처리
      setOpenFAQ(openFAQ === id ? null : id);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentItems = faqList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 화면 크기에 따른 표시할 페이지 수 조정을 위한 함수 추가
  const getVisiblePages = (currentPage, totalPages) => {
    // 모바일 환경 감지 (화면 너비 480px 이하)
    const isMobile = window.innerWidth <= 480;
    
    // 모바일일 경우 현재 페이지 주변 1개씩만 표시
    const range = isMobile ? 1 : 2;
    
    let pages = [];
    
    if (totalPages <= 5) {
      // 전체 페이지가 5개 이하면 모두 표시
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // 첫 페이지 항상 포함
      pages.push(1);
      
      // 현재 페이지 주변 페이지들
      for (let i = currentPage - range; i <= currentPage + range; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      // 마지막 페이지 항상 포함
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
      
      // 갭 표시를 위한 처리
      const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
      pages = [];
      
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i-1] > 1) {
          pages.push('...');
        }
        pages.push(sorted[i]);
      }
    }
    return pages;
  };

    return (
        <QnaFaqBoardContext.Provider
            value={{
                faqList,
                isLoading,
                error,
                currentItems,
                openFAQ,
                currentPage,
                handleToggle,
                handlePageChange,
                getVisiblePages,
            }}
        >
            {children}
        </QnaFaqBoardContext.Provider>
    );
};

export default QnaFaqBoardProvider;