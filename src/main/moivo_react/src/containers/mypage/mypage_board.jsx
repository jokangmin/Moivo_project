import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../assets/css/Mypage_board.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { PATH } from '../../../scripts/path';
import axiosInstance from '../../utils/axiosConfig';

const mypage_board = () => {
  const [MyQnaList, setMyQnaList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("* MyQnaList DB : " + MyQnaList);
  },[MyQnaList])

  //12/18 나의 문의 리스트 가져오기 - km
  const fetchMyQna = async (page = 0, size = 4) => {
    const token = localStorage.getItem("accessToken");
      
    if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/user");
        return;
    }
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    const id = decodedPayload.id; 

    try {
      // 문의 가져오기
      const myQuestionResponse = await axiosInstance.get(`/api/user/mypage/question/${id}`,{
        params: { page, size, sort: 'id,desc' },
      });

      if (myQuestionResponse.data && myQuestionResponse.data.content && Array.isArray(myQuestionResponse.data.content)) {
        setMyQnaList(myQuestionResponse.data.content);
        setTotalPages(myQuestionResponse.data.totalPages);
        setCurrentPage(page);
      } else {
          console.warn("Unexpected response data format:", myQuestionResponse.data);
          setMyQnaList([]);
      }
    } catch (error) {
      console.error("Error data:", error);
      setMyQnaList([]);
    }
  }

  // 페이지네이션 버튼 클릭 시 fetchOrders 호출
    const handlePageClick = (page) => {
      fetchMyQna(page);
  };

  useEffect(() => {
    fetchMyQna();
  }, [navigate]);


  // 답변 표시 여부 관리 상태
  const [showAnswer, setShowAnswer] = useState(
    new Array(MyQnaList.length).fill(false) // 모든 답변은 기본적으로 숨겨져 있음
  );

  // 답변 토글 함수
  const toggleAnswer = (index) => {
    setShowAnswer((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index]; // 해당 문의 항목의 답변 토글
      return newState;
    });
  };

  return (
    <>
      <div className={styles.reviewPage}>
        <Banner />
        {/* 타이틀 */}
        <div className={styles.title}>MY INQUIRIES</div>

        {/* 문의 리스트 */}
        <div className={styles.reviewList}>
          {MyQnaList.map((inquiry, index) => (
            <div key={index} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewType}>
                    {inquiry.categoryId === 1 ? "기본 문의" : 
                    inquiry.categoryId === 2 ? "기타 문의" : 
                    inquiry.categoryId === 3 ? "사이즈 문의" : 
                    inquiry.categoryId === 4 ? "비밀 문의" : 
                    "전체 문의"}
                </span>
                <span className={styles.reviewDate}>{inquiry.questionDate?.replace('T', ' ')}</span>
              </div>
              <div className={styles.reviewTitle} onClick={() => toggleAnswer(index)}>
                {inquiry.title}
              </div>
              <div className={styles.reviewContent}>{inquiry.content}</div>

              {/* 답변 토글 */}
              {showAnswer[index] && (
                <div className={styles.adminAnswer}>
                  <div className={styles.answerTitle}>관리자의 답변:</div>
                  <div className={styles.answerContent}>{inquiry.response}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    className={`${styles.pageButton} ${i === currentPage ? styles.active : ""}`}
                    onClick={() => handlePageClick(i)}
                >
                    {i + 1}
                </button>
            ))}
        </div>

        {/* 메뉴로 돌아가기 */}
        <div className={styles.backToMenu}>
          <Link to="/mypage" className={styles.backLink}>
            My Page
          </Link>
        </div>


      </div>
      <Footer />
    </>
  );
};

export default mypage_board;
