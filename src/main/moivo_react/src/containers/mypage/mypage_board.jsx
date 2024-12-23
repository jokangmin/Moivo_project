import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import styles from "../../assets/css/Mypage_board.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import {PATH} from '../../../scripts/path';
import axiosInstance from '../../utils/axiosConfig';
import QnA_b from "../../assets/css/qna_boardlist.module.css";

const mypage_board = () => {
    const [MyQnaList, setMyQnaList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // 현재 로그인한 사용자 ID 상태 추가
    const [currentUserId, setCurrentUserId] = useState(null);

    // 현재 사용자 ID 확인
    const checkUserId = () => {
        const storedUserId = localStorage.getItem('id');
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId));
        }
    };

    // 새로운 상태 추가: 편집 모달 관련
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedPost, setEditedPost] = useState({
        categoryId: 1,
        title: '',
        content: '',
        secret: false
    });

    useEffect(() => {
        console.log("* MyQnaList DB : " + MyQnaList);
        checkUserId();
    }, [MyQnaList])

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
            const myQuestionResponse = await axiosInstance.get(`/api/user/mypage/question/${id}`, {
                params: {page, size, sort: 'id,desc'},
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

    // 게시글 수정 핸들러 - 모달 열기
    const handleEditPost = (item) => {
        // 로그인한 사용자의 글만 수정 가능
        if (currentUserId && currentUserId === item.userId) {
            setEditedPost({
                id: item.id,
                categoryId: item.categoryId,
                title: item.title,
                content: item.content,
                secret: item.secret || item.categoryId === 4
            });
            setEditModalVisible(true);
        } else {
            alert('수정 권한이 없습니다.');
        }
    };

    // 게시글 수정 제출 핸들러
    const handleEditSubmit = async () => {
        if (!editedPost.title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        if (!editedPost.content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        try {
            console.log("수정 요청 데이터:", editedPost);
            await axiosInstance.put("/api/user/mypage/question/update", {
                ...editedPost,
                userId: currentUserId,
            });

            fetchMyQna(currentPage); // 수정 후 목록 새로고침
            // setActiveIndex(null);
            setEditModalVisible(false);

            alert("수정이 완료되었습니다.");
        } catch (error) {
            console.error("수정 중 오류:", error);
            alert("수정에 실패했습니다.");
        }
    };


    // 게시글 삭제 핸들러
    const handleDeletePost = async (item) => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            try {
                await axiosInstance.delete("/api/user/question/delete", {
                    data: {
                        id: item.id,
                        userId: currentUserId,
                    },
                });

                fetchMyQna(currentPage); // 삭제 후 목록 새로고침
                alert("삭제되었습니다.");
            } catch (error) {
                console.error("삭제 중 오류:", error);
                alert("삭제에 실패했습니다.");
            }
        }
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
        <div className={styles.reviewPage}>
            <Banner/>
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
                            <div>
                                <button onClick={() => handleEditPost(inquiry)}>수정</button>
                                <button onClick={() => handleDeletePost(inquiry)}>삭제</button>
                            </div>
                        </div>
                        <div className={styles.reviewTitle} onClick={() => toggleAnswer(index)}>
                            {inquiry.title}
                        </div>
                        <div className={styles.reviewContent}>
                            <span className={styles.contentText}>{inquiry.content}</span>
                            <span className={styles.reviewDate}>{inquiry.questionDate?.replace('T', ' ')}</span>
                        </div>

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

            {/* 게시글 수정 모달 */}
            {editModalVisible && (
                <div className={QnA_b.modalOverlay}>
                    <div className={QnA_b.modalContent}>
                        <h3>문의 수정</h3>

                        {/* 문의 유형 선택 */}
                        <span className={QnA_b.modalQuestionTitle}>문의 유형</span>
                        <select
                            value={editedPost.categoryId}
                            onChange={(e) => setEditedPost({
                                ...editedPost,
                                categoryId: parseInt(e.target.value),
                            })}
                            className={QnA_b.modalSelect}
                            disabled={editedPost.categoryId === 4}
                        >
                            <option value={1}>일반 문의</option>
                            <option value={2}>기타 문의</option>
                            <option value={3}>사이즈 문의</option>
                            {editedPost.categoryId === 4 && <option value={4}>비밀 문의</option>}
                        </select>

                        {/* 제목 입력 */}
                        <span className={QnA_b.modalQuestionTitle}>제목</span>
                        <input
                            type="text"
                            value={editedPost.title}
                            onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                            placeholder="제목을 입력하세요"
                            className={QnA_b.modalInput}
                        />

                        {/* 비밀글 여부 체크박스 */}
                        {editedPost.categoryId === 4 && (
                            <div className={QnA_b.secretCheckbox}>
                                <label>비밀글</label>
                                <input
                                    type="checkbox"
                                    checked={editedPost.secret}
                                    onChange={(e) => setEditedPost({
                                        ...editedPost,
                                        secret: e.target.checked,
                                        categoryId: e.target.checked ? 4 : 1,
                                    })}
                                />
                            </div>
                        )}

                        {/* 내용 입력 */}
                        <span className={QnA_b.modalQuestionTitle}>내용</span>
                        <textarea
                            value={editedPost.content}
                            onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                            placeholder="내용을 입력하세요"
                            className={QnA_b.modalTextarea}
                        />

                        <div className={QnA_b.modalButtons}>
                            <button onClick={handleEditSubmit}>수정</button>
                            <button onClick={() => setEditModalVisible(false)}>취소</button>
                        </div>
                    </div>
                </div>
            )}





            {/* 페이지네이션 */}
            <div className={styles.pagination}>
                {Array.from({length: totalPages}, (_, i) => (
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

            <Footer/>
        </div>
    );
};

export default mypage_board;
