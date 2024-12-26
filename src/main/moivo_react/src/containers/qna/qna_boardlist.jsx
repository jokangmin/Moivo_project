import React, { useContext } from 'react';
import QnA_b from '../../assets/css/qna_boardlist.module.css';
import { Link } from 'react-router-dom';
import Footer from './../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import { useQnaBoardList } from '../../contexts/qna/QnaBoardListContext';

const Qna_boardlist = () => {
    const {
        qnaData,
        activeIndex,
        currentPage,
        selectedType,
        isDropdownVisible,
        totalPages,
        passwordModalVisible,
        enteredPassword,
        passwordError,
        selectedPost,
        searchTerm,
        editModalVisible,
        editedPost,
        currentUserId,
        resetState,
        fetchQnaData,
        handleKeyDown,
        handleSearch,
        toggleDropdown,
        handleFilterChange,
        handleToggle,
        handleEditPost,
        handleEditSubmit,
        handleDeletePost,
        handlePageChange,
        getIconForType,
        handlePasswordCheck,
        closePasswordModal,
        convertNewlinesToBreaks,
        formatDate,
        renderPagination,
        setSearchTerm,
        setEnteredPassword,
        setPasswordError,
        setEditModalVisible,
        setEditedPost
    } = useQnaBoardList();

    return (
        <div className={QnA_b.qnalistMainDiv}> 
            <div><Banner /></div>
            <div className={QnA_b.qnalistheader}></div>

            <div className={QnA_b.qnalistTitle}>문의 게시글</div>

            {/* 네비게이션 */}
            <div className={QnA_b.qnalistNavi}>
                <Link to="/qna_faqboard">
                    <button className={QnA_b.qnalistNaviBtn}>자주 묻는 질문</button>
                </Link>
                <Link to="/qna_board">
                    <button className={QnA_b.qnalistNaviBtn}>문의 작성하기</button>
                </Link>
                <Link to="/qna_boardlist">
                    <button onClick={resetState} className={QnA_b.qnalistNaviBtn}>문의 게시글</button>
                </Link>
            </div>

            {/* QnA 리스트 */}
            <div className={QnA_b.qnalist}>
                    <div className={QnA_b.qnalistContainer}>

                        {/* 문의 유형 드롭다운 , 검색*/}
                        <div className={QnA_b.dropdownContainer}>
                            <button className={QnA_b.dropdownBtn} onClick={toggleDropdown}>
                                {selectedType || '전체 문의'} {isDropdownVisible ? '▲' : '▼'}
                            </button>
                            {isDropdownVisible && (
                                <ul className={QnA_b.filterList}>
                                    <li onClick={() => handleFilterChange('')}>전체</li>
                                    <li onClick={() => handleFilterChange('일반 문의')}>일반 문의</li>
                                    <li onClick={() => handleFilterChange('기타 문의')}>기타 문의</li>
                                    <li onClick={() => handleFilterChange('사이즈 문의')}>사이즈 문의</li>
                                    <li onClick={() => handleFilterChange('비밀 문의')}>비밀 문의</li>
                                </ul>
                            )}  
                        
                            {/* 검색 */}
                            <div className={QnA_b.search_container}>
                                <input type="text" placeholder="제목으로 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={QnA_b.search_input} onKeyDown={handleKeyDown}/>
                            </div>
                        </div>
                        

                    {qnaData.length === 0 ? (
                        <div>등록된 문의가 없습니다.</div>
                    ) : (
                        qnaData.map((item, index) => (
                            <div key={index} className={QnA_b.qnalistItem}>
                                <div className={QnA_b.qnalistHeader} onClick={() => handleToggle(index, item)}>
                                    <span className={QnA_b.qnalistQuestionType}>
                                        {getIconForType(item)}
                                    </span>
                                    <span className={QnA_b.qnalistQuestionTitle}>
                                        {item.categoryId === 4 ? '비밀글입니다.' : item.title}
                                    </span>
                                </div>
                                {activeIndex === index && (
                                    <div className={QnA_b.qnalistDetails}>
                                        <div className={QnA_b.qnalistUserInfo}>
                                            <span> <i className="fas fa-user"></i> 작성자 : {item.name}</span> | <i className="far fa-clock"></i> <span>{formatDate(item.questionDate)}</span>
                                                {/* 수정, 삭제 버튼 추가 */}
                                                {currentUserId === item.userId && (
                                                <div className={QnA_b.actionButtons}>
                                                    <button onClick={() => handleEditPost(item)}>수정</button>
                                                    <button onClick={() => handleDeletePost(item)}>삭제</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className={QnA_b.qnalistUserQuestion}>{convertNewlinesToBreaks(item.content)}
                                        </div>
                                        <div className={QnA_b.qnalistDivider}></div>
                                        <div className={QnA_b.qnalistUserAnswer}>
                                            <i className='fas fa-user-tie'></i> 관리자 : {item.response || '답변 대기 중'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {/* 게시글 수정 모달 */}
                    {editModalVisible && (
                        <div className={QnA_b.modalOverlay}>
                            <div className={QnA_b.modalContent}>
                                <h3>문의 수정</h3>
                                
                                {/* 문의 유형 선택 */}
                                <span className={QnA_b.modalQuestionTitle}>문의 유형</span>
                                <select value={editedPost.categoryId} onChange={(e) => setEditedPost({
                                            ...editedPost, 
                                            categoryId: parseInt(e.target.value)
                                        })}
                                className={QnA_b.modalSelect}
                                disabled={editedPost.categoryId === 4}
                                >
                                    <option value={1}>일반 문의</option>
                                    <option value={2}>기타 문의</option>
                                    <option value={3}>사이즈 문의</option>
                                    {editedPost.categoryId == 4 && ( <option value={4}>비밀 문의</option>)}
                                </select>
                                
                                {/* 제목 입력 */}
                                <span className={QnA_b.modalQuestionTitle}>제목</span>
                                <input type="text"  value={editedPost.title} onChange={(e) => setEditedPost({
                                        ...editedPost, 
                                        title: e.target.value
                                    })}
                                    placeholder="제목을 입력하세요"
                                    className={QnA_b.modalInput}/>
                                    
                                {/* 비밀글 여부 체크박스 */}
                                {editedPost.categoryId == 4 && (
                                <div className={QnA_b.secretCheckbox}>
                                    <label>비밀글</label>
                                    <input type="checkbox" checked={editedPost.categoryId === 4 || editedPost.secret === true} onChange={(e) => setEditedPost({
                                            ...editedPost, 
                                            categoryId: e.target.checked ? 4 : 1,
                                            secret: e.target.checked
                                        })}
                                        disabled={editedPost.categoryId === 4} />
                                </div>
                                )}

                                    {/* 내용 입력 */}
                                    <span className={QnA_b.modalQuestionTitle}>내용</span>
                                    <textarea value={editedPost.content} onChange={(e) => setEditedPost({
                                            ...editedPost, 
                                            content: e.target.value
                                        })}
                                        placeholder="내용을 입력하세요"
                                        className={QnA_b.modalTextarea} />

                                    <div className={QnA_b.modalButtons}>
                                        <button onClick={handleEditSubmit}>수정</button>
                                        <button onClick={() => setEditModalVisible(false)}>취소</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                                    
                    {/* 페이징 버튼! */}
                    <div className={QnA_b.pagination}>
                        {renderPagination()}
                    </div>
                </div>

                {/* 비밀번호 확인 모달 */}
                {passwordModalVisible && (
                    <div className={QnA_b.modalOverlay}>
                        <div className={QnA_b.modalContent}>
                            <h3>비밀글 비밀번호 확인</h3>
                            <input type="password" placeholder="비밀번호 입력" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)} className={QnA_b.modalInput} />
                            {passwordError && <p className={QnA_b.errorText}>{passwordError}</p>}
                            <div className={QnA_b.modalButtons}>
                                <button onClick={handlePasswordCheck}>확인</button>
                                <button onClick={closePasswordModal}>취소</button>
                            </div>
                        </div>
                    </div>
                )}
            <Footer />
        </div>
    );
};

export default Qna_boardlist;