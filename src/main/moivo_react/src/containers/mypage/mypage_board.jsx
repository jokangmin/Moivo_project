import React from "react";
import {Link} from "react-router-dom";
import styles from "../../assets/css/Mypage_board.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import QnA_b from "../../assets/css/qna_boardlist.module.css";
import { useMypageBoardContext } from "../../contexts/mypageCon/MypageBoardContext";

const mypage_board = () => {
    const {
        MyQnaList,
        currentPage,
        totalPages,
        handlePageClick,
        handleEditPost,
        handleEditSubmit,
        handleDeletePost,
        showAnswer,
        toggleAnswer,
        editModalVisible,
        editedPost,
        setEditedPost, 
        setEditModalVisible,
    } = useMypageBoardContext();

    return (
        <div>
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
                                <div className={styles.reviewupdate}>
                                    <button onClick={() => handleEditPost(inquiry) }>수정</button>
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
            </div>    
            <Footer/>
        </div>
    );
};

export default mypage_board;