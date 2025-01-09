/* eslint-disable no-unused-vars */
import React from 'react';
import admin_qnaboard from '../../assets/css/admins_qnaboard.module.css';
import Admins_side from '../../components/admin_sidebar/admins_side';
import { useAdminsBoard } from '../../contexts/adminsCon/AdminsBoardContext';

const Admins_qnaboard = () => {
    const {
        activeIndex,
        currentPage,
        selectedCategory,
        isDropdownVisible,
        questions,
        responseModalOpen,
        editResponseModalOpen,
        responseInput,
        searchQuery,
        filterType,
        currentPageQuestions,
        totalPages,
        categoryNames,

        setSelectedCategory,
        setResponseInput,
        toggleDropdown,
        handleSearch,
        handleStatCardClick,
        handlePageChange,
        toggleQuestion,
        openResponseModal,
        closeResponseModal,
        openEditResponseModal,
        closeEditResponseModal,
        handleRespondToQuestion,
        handleUpdateResponse,
        handleDeleteResponse,
        getIconForCategory,
        getTimeElapsed,
        handleCategorySelect
    } = useAdminsBoard();

    return (
        <div className={admin_qnaboard.qnalistMainDiv}>
            <div className={admin_qnaboard.sidebar}>
                <Admins_side />
            </div>
            <div className={admin_qnaboard.qnalistContainer}>
                <div className={admin_qnaboard.filterSection}>
                    <div className={admin_qnaboard.dropdownContainer}>
                        <button 
                            className={admin_qnaboard.dropdownBtn} 
                            onClick={toggleDropdown}
                        >
                            <span>
                                {categoryNames[selectedCategory] || '전체문의'}
                            </span>
                            <i className={`fas fa-chevron-${isDropdownVisible ? 'up' : 'down'}`}></i>
                        </button>
                        {isDropdownVisible && (
                            <ul className={admin_qnaboard.filterList}>
                                <li onClick={() => handleCategorySelect('ALL')}>전체문의</li>
                                <li onClick={() => handleCategorySelect('BASIC')}>일반문의</li>
                                <li onClick={() => handleCategorySelect('PRIVATE')}>비밀문의</li>
                                <li onClick={() => handleCategorySelect('SIZE')}>사이즈문의</li>
                                <li onClick={() => handleCategorySelect('OTHER')}>기타문의</li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* 통계 섹션 수정 */}
                <div className={admin_qnaboard.statsContainer}>
                    <div 
                        className={`${admin_qnaboard.statCard} ${filterType === 'ALL' ? admin_qnaboard.active : ''}`}
                        onClick={() => handleStatCardClick('ALL')}
                    >
                        <div className={admin_qnaboard.statNumber}>
                            {questions.filter(q => q.fixQuestion === false).length}
                        </div>
                        <div className={admin_qnaboard.statLabel}>전체 문의</div>
                    </div>
                    <div 
                        className={`${admin_qnaboard.statCard} ${filterType === 'ANSWERED' ? admin_qnaboard.active : ''}`}
                        onClick={() => handleStatCardClick('ANSWERED')}
                    >
                        <div className={admin_qnaboard.statNumber}>
                            {questions.filter(q => q.fixQuestion === false && q.response).length}
                        </div>
                        <div className={admin_qnaboard.statLabel}>답변 완료</div>
                    </div>
                    <div 
                        className={`${admin_qnaboard.statCard} ${filterType === 'WAITING' ? admin_qnaboard.active : ''}`}
                        onClick={() => handleStatCardClick('WAITING')}
                    >
                        <div className={admin_qnaboard.statNumber}>
                            {questions.filter(q => q.fixQuestion === false && !q.response).length}
                        </div>
                        <div className={admin_qnaboard.statLabel}>답변 대기</div>
                    </div>
                </div>

                {/* 검색 기능 추가 */}
                <div className={admin_qnaboard.searchContainer}>
                    <i className={`fas fa-search ${admin_qnaboard.searchIcon}`}></i>
                    <input
                        type="text"
                        className={admin_qnaboard.searchInput}
                        placeholder="문의 제목이나 내용으로 검색..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {currentPageQuestions.map((question, index) => (
                    <div key={question.id} className={admin_qnaboard.qnalistItem}>
                        <div 
                            className={admin_qnaboard.qnalistHeader}
                            onClick={() => toggleQuestion(index)}
                        >
                            <span className={admin_qnaboard.statusIcon + 
                                (question.response ? ' answered' : ' waiting')}>
                                <i className={question.response ? 
                                    "fas fa-check-circle" : 
                                    "fas fa-clock"}></i>
                            </span>
                            <span className={admin_qnaboard.qnalistQuestionType}>
                                {getIconForCategory(question.categoryId)}
                            </span>
                            <span className={admin_qnaboard.qnalistQuestionTitle}>
                                {question.title}
                            </span>
                            {question.secret === "true" && (
                                <span className={admin_qnaboard.qnalistSecretLabel}>
                                    <i className="fas fa-lock"></i> 비밀글
                                </span>
                            )}
                            <span className={admin_qnaboard.timeElapsed}>
                                {getTimeElapsed(question.questionDate)}
                            </span>
                        </div>
                        
                        {activeIndex === index && (
                            <div className={admin_qnaboard.qnalistDetails}>
                                <div className={admin_qnaboard.qnalistUserInfo}>
                                    <i className="fas fa-user"> </i> ID : {question.userId}  
                                    <span className={admin_qnaboard.dateDivider}> | </span>
                                    <i className="far fa-clock"></i> {new Date(question.questionDate).toLocaleString()}
                                </div>
                                <div className={admin_qnaboard.qnalistUserQuestion}>
                                    {question.content}
                                </div>
                                
                                <div className={admin_qnaboard.adminResponseSection}>
                                    {question.response ? (
                                        <>
                                            <div className={admin_qnaboard.responseContent}>
                                                <h4><i className="fas fa-comment-dots"></i> 관리자 답변</h4>
                                                <p>{question.response}</p>
                                                <div className={admin_qnaboard.responseDate}>
                                                    <i className="far fa-clock"></i> {new Date(question.responseDate).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={admin_qnaboard.responseButtons}>
                                                <button 
                                                    className={admin_qnaboard.responseButton}
                                                    onClick={() => openEditResponseModal(question.id)}
                                                >
                                                    <i className="fas fa-edit"></i> 답변 수정
                                                </button>
                                                <button
                                                    className={`${admin_qnaboard.responseButton} ${admin_qnaboard.deleteButton}`}
                                                    onClick={() => handleDeleteResponse(question.id)}
                                                >
                                                    <i className="fas fa-trash-alt"></i> 답변 삭제
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className={admin_qnaboard.noResponseWrapper}>
                                            <p className={admin_qnaboard.noResponseMessage}>
                                                <i className="fas fa-info-circle"></i> 아직 답변이 등록되지 않았습니다.
                                            </p>
                                            <button 
                                                className={admin_qnaboard.responseButton}
                                                onClick={() => openResponseModal(question.id)}
                                            >
                                                <i className="fas fa-plus-circle"></i> 답변 등록
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div className={admin_qnaboard.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            className={`${admin_qnaboard.paginationBtn} ${
                                currentPage === page ? admin_qnaboard.active : ''
                            }`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </div>

            {responseModalOpen && (
                <div className={admin_qnaboard.modalOverlay}>
                    <div className={admin_qnaboard.modalContent}>
                        <h3><i className="fas fa-plus-circle"></i> 답변 등록</h3>
                        <form onSubmit={handleRespondToQuestion}>
                            <textarea
                                className={admin_qnaboard.modalInput}
                                value={responseInput}
                                onChange={(e) => setResponseInput(e.target.value)}
                                placeholder="답변을 입력해주세요..."
                                required
                            ></textarea>
                            <div className={admin_qnaboard.modalButtons}>
                                <button type="submit">
                                    <i className="fas fa-check"></i> 등록
                                </button>
                                <button type="button" onClick={closeResponseModal}>
                                    <i className="fas fa-times"></i> 취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editResponseModalOpen && (
                <div className={admin_qnaboard.modalOverlay}>
                    <div className={admin_qnaboard.modalContent}>
                        <h3><i className="fas fa-edit"></i> 답변 수정</h3>
                        <form onSubmit={handleUpdateResponse}>
                            <textarea
                                className={admin_qnaboard.modalInput}
                                value={responseInput}
                                onChange={(e) => setResponseInput(e.target.value)}
                                placeholder="수정할 답변을 입력해주세요..."
                                required
                            ></textarea>
                            <div className={admin_qnaboard.modalButtons}>
                                <button type="submit">
                                    <i className="fas fa-save"></i> 수정
                                </button>
                                <button type="button" onClick={closeEditResponseModal}>
                                    <i className="fas fa-times"></i> 취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admins_qnaboard;