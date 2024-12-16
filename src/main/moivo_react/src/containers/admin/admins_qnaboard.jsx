import React, { useState, useEffect } from 'react';
import admin_qnaboard from '../../assets/css/admins_qnaboard.module.css';
import Admins_side from '../../components/admin_sidebar/admins_side';
import { PATH } from '../../../scripts/path';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
 
const Admins_qnaboard = () => {
    const [activeIndex, setActiveIndex] = useState(null); // 문의리시트 확장기능
    const [currentPage, setCurrentPage] = useState(1); // 문의리시트 페이징기능
    const [selectedCategory, setSelectedCategory] = useState(''); // 문의리시트 카테고리 필터기능
    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // 문의리시트 카테고리 드롭다운 기능
    const itemsPerPage = 6; // 문의리시트 페이징기능
    const [questions, setQuestions] = useState([]); // 문의리시트 데이터 저장기능
    const [categories, setCategories] = useState([]); // 문의리시트 카테고리 데이터 저장기능
    const [selectedQuestion, setSelectedQuestion] = useState(null); // 문의리시트 선택문의 데이터 저장기능
    const [responseModalOpen, setResponseModalOpen] = useState(false); // 문의리시트 답변등록 모달창 기능
    const [editResponseModalOpen, setEditResponseModalOpen] = useState(false); // 문의리시트 답변수정 모달창 기능
    const [responseInput, setResponseInput] = useState(''); // 문의리시트 답변등록 모달창 기능

    // 토큰타이머 2024-12-16 성찬
const TokenExpiryTimer = () => {
    const { tokenExpiryTime, logout } = useAuth();
    const navigate = useNavigate();
    const [remainingTime, setRemainingTime] = useState('');

    useEffect(() => {
        const updateRemainingTime = () => {
            if (!tokenExpiryTime) {
                console.log('No token expiry time available');
                return;
            }

            const now = Date.now();
            const timeLeft = tokenExpiryTime - now;
            //console.log('Current time left:', timeLeft); // 2024-12-16 성찬 토큰 만료 시간 표시

            if (timeLeft <= 0) {
                setRemainingTime('만료됨');
                logout();
                navigate('/user');
                return;
            }

            // 남은 시간을 분:초 형식으로 변환
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            //console.log('Formatted time:', formattedTime); // 2024-12-16 성찬 토큰 만료 시간 표시
            setRemainingTime(formattedTime);
        };

        // 1초마다 업데이트
        updateRemainingTime();
        const timer = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(timer);
    }, [tokenExpiryTime, logout, navigate]);

    if (!tokenExpiryTime) {
        return (
            <div className={admin_qnaboard.tokenTimer}>
                <i className="fas fa-clock"></i>
                <span>로그인 토큰 정보 없음</span>
            </div>
        );
    }

    return (
        <div className={admin_qnaboard.tokenTimer}>
            <i className="fas fa-clock"></i>
            <span>관리자 로그인 토큰 만료까지: {remainingTime}</span>
        </div>
    );
};

    useEffect(() => {
        fetchQuestions();
        fetchCategories();
    }, []);

    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get(`${PATH.SERVER}/api/admin/qna/management/questions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Server response:', response.data);
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions:', error.response?.data || error.message);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get(`${PATH.SERVER}/api/admin/qna/management/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Server response:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const openResponseModal = (questionId) => {
        const question = questions.find((q) => q.id === questionId);
        setSelectedQuestion(question);
        setResponseModalOpen(true);
    };

    const closeResponseModal = () => {
        setSelectedQuestion(null);
        setResponseModalOpen(false);
        setResponseInput('');
    };

    const openEditResponseModal = (questionId) => {
        const question = questions.find((q) => q.id === questionId);
        setSelectedQuestion(question);
        setResponseInput(question.response);
        setEditResponseModalOpen(true);
    };

    const closeEditResponseModal = () => {
        setSelectedQuestion(null);
        setEditResponseModalOpen(false);
        setResponseInput('');
    };

    // 답변 등록
    const handleRespondToQuestion = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            console.log('Sending response:', responseInput); // 요청 데이터 로깅

            const response = await axios({
                method: 'post',
                url: `${PATH.SERVER}/api/admin/qna/management/questions/${selectedQuestion.id}/response`,
                data: { response: responseInput },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 500; // 302를 포함한 모든 2xx, 3xx, 4xx 상태 허용
                }
            });

            console.log('Server response:', response); // 서버 응답 로깅

            if (response.status === 200) {
                await fetchQuestions();
                closeResponseModal();
                setResponseInput('');
            } else {
                console.error('Failed to submit response:', response.data);
            }
        } catch (error) {
            console.error('Error details:', error.response || error);
        }
    };

        // 답변 수정
        const handleUpdateResponse = async (e) => {
            e.preventDefault();
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                
                await axios({
                    method: 'put',
                    url: `${PATH.SERVER}/api/admin/qna/management/questions/${selectedQuestion.id}/response`,
                    data: { response: responseInput },  // 객체 형태로 변경
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                await fetchQuestions();  // 데이터 새로고침
                closeEditResponseModal();
            } catch (error) {
                console.error('Failed to update response:', error);
            }
        };

        // 답변 삭제
        const handleDeleteResponse = async (questionId) => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                
                await axios({
                    method: 'delete',
                    url: `${PATH.SERVER}/api/admin/qna/management/questions/${questionId}/response`,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                await fetchQuestions();  // 데이터 새로고침
            } catch (error) {
                console.error('Failed to delete response:', error);
            }
        };

    // 문의 카테고리에 따라 필터링된 데이터 생성
    const filteredQuestions = selectedCategory
        ? questions.filter(question => question.categoryId === selectedCategory)
        : questions;

    // 페이징 데이터 계산
    const totalItems = filteredQuestions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setActiveIndex(null); // 페이지 변경 시 열려있는 아이템 초기화
    };

    // 각 문의 카테고리에 맞는 아이콘을 반환하는 함수
    const getIconForCategory = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            switch (category.name) {
                case 'BASIC':
                case 'OTHER':
                    return <i className="fas fa-question-circle"></i>;  // 물음표 아이콘
                case 'PRIVATE':
                    return <i className="fas fa-lock"></i>;  // 자물쇠 아이콘
                case 'SIZE':
                    return <i className="fas fa-ruler"></i>;  // 자 아이콘
                default:
                    return <i className="fas fa-question-circle"></i>;  // 기본 물음표 아이콘
            }
        }
        return <i className="fas fa-question-circle"></i>;  // 카테고리가 없을 경우 기본 물음표 아이콘
    };

    // 드롭다운 토글 함수
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    return (
        <div className={admin_qnaboard.qnalistMainDiv}>
            <div className={admin_qnaboard.sidebar}>
                <Admins_side />
            </div>
            
            <div className={admin_qnaboard.tokenTimerContainer}>
                <TokenExpiryTimer />
            </div>
            
            <div className={admin_qnaboard.qnalistContainer}>
                <div className={admin_qnaboard.filterSection}>
                    <div className={admin_qnaboard.dropdownContainer}>
                        <button 
                            className={admin_qnaboard.dropdownBtn} 
                            onClick={toggleDropdown}
                        >
                            <span>
                                {selectedCategory 
                                    ? categories.find(c => c.id === selectedCategory)?.name 
                                    : '전체 카테고리'
                                }
                            </span>
                            <i className={`fas fa-chevron-${isDropdownVisible ? 'up' : 'down'}`}></i>
                        </button>
                        {isDropdownVisible && (
                            <ul className={admin_qnaboard.filterList}>
                                <li onClick={() => {
                                    setSelectedCategory('');
                                    toggleDropdown();
                                }}>전체</li>
                                {categories.map((category) => (
                                    <li 
                                        key={category.id} 
                                        onClick={() => {
                                            setSelectedCategory(category.id);
                                            toggleDropdown();
                                        }}
                                    >
                                        {category.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {currentPageQuestions.map((question) => (
                    <div key={question.id} className={admin_qnaboard.qnalistItem}>
                        <div 
                            className={admin_qnaboard.qnalistHeader}
                            onClick={() => setActiveIndex(activeIndex === question.id ? null : question.id)}
                        >
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
                        </div>
                        
                        {activeIndex === question.id && (
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