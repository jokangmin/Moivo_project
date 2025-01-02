import React, { useState, useEffect } from 'react';
import admin_qnaboard from '../../assets/css/admins_qnaboard.module.css';
import Admins_side from '../../components/admin_sidebar/admins_side';
import { PATH } from '../../../scripts/path';
import axiosInstance from "../../utils/axiosConfig";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Admins_qnaboard = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const filterFromUrl = searchParams.get('filter');

    const [activeIndex, setActiveIndex] = useState(null); // 문의리시트 확장기능
    const [currentPage, setCurrentPage] = useState(1); // 문의리시트 페이징기능
    const [selectedCategory, setSelectedCategory] = useState('ALL'); // 문의리시트 카테고리 필터기능
    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // 문의리시트 카테고리 드롭다운 기능
    const itemsPerPage = 6; // 문의리시트 페이징기능
    const [questions, setQuestions] = useState([]); // 문의리시트 데이터 저장기능
    const [categories, setCategories] = useState([]); // 문의리시트 카테고리 데이터 저장기능
    const [selectedQuestion, setSelectedQuestion] = useState(null); // 문의리시트 선택문의 데이터 저장기능
    const [responseModalOpen, setResponseModalOpen] = useState(false); // 문의리시트 답변등록 모달창 기능
    const [editResponseModalOpen, setEditResponseModalOpen] = useState(false); // 문의리시트 답변수정 모달창 기능
    const [responseInput, setResponseInput] = useState(''); // 문의리시트 답변등록 모달창 기능
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState(filterFromUrl || 'ALL'); // 'ALL', 'ANSWERED', 'WAITING' 상태 추가

    useEffect(() => {
        // 인증 및 관리자 권한 확인
        if (!isAuthenticated || !isAdmin) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/user');
            return;
        }
        
        // 기존 데이터 fetch 함수들 호출
        fetchQuestions();
        fetchCategories();
    }, [isAuthenticated, isAdmin, navigate]);

    useEffect(() => {
        // URL 파라미터가 변경될 때마다 필터 업데이트
        if (filterFromUrl) {
            setFilterType(filterFromUrl);
        }
    }, [filterFromUrl]);

    const fetchQuestions = async () => {
        try {
            const response = await axiosInstance.get(`${PATH.SERVER}/api/admin/qna/management/questions`);
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get(`${PATH.SERVER}/api/admin/qna/management/categories`);
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
            console.log('Sending response:', responseInput);

            const response = await axiosInstance.post(
                `/api/admin/qna/management/questions/${selectedQuestion.id}/response`,
                { response: responseInput }
            );

            // console.log('Server response:', response);

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
            await axiosInstance.put(
                `/api/admin/qna/management/questions/${selectedQuestion.id}/response`,
                { response: responseInput }
            );
            
            await fetchQuestions();
            closeEditResponseModal();
        } catch (error) {
            console.error('Failed to update response:', error);
        }
    };

    // 답변 삭제
    const handleDeleteResponse = async (questionId) => {
        try {
            await axiosInstance.delete(
                `/api/admin/qna/management/questions/${questionId}/response`
            );
            
            await fetchQuestions();
        } catch (error) {
            console.error('Failed to delete response:', error);
        }
    };

    // 카테고리 매핑 상수 추가
    const CATEGORY_MAPPING = {
        'ALL': 0,      // 전체문의1
        'BASIC': 1,    // 일반문의 2
        'OTHER': 2,    // 기타문의3
        'SIZE': 3,     // 사이즈문의4
        'PRIVATE': 4   // 비밀문의5
    };

    // 카테고리 이름 매핑 추가
    const CATEGORY_NAMES = {
        'ALL': '전체문의',
        'BASIC': '일반문의',
        'OTHER': '기타문의',
        'SIZE': '사이즈문의',
        'PRIVATE': '비밀문의'
    };

    // 문의글 열고 닫기 함수
    const toggleQuestion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // 검색 처리 함수
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };

    // 통계 카드 클릭 핸들러
    const handleStatCardClick = (type) => {
        setFilterType(type);
        setCurrentPage(1); // 페이지를 첫 페이지로 리셋
    };

    // 필터링 로직 수정
    const filteredQuestions = questions.filter(question => {
        // 카테고리 필터링
        const matchesCategory = selectedCategory === 'ALL' ? true : 
            selectedCategory === 'PRIVATE' ? question.secret === "true" :
            question.categoryId === CATEGORY_MAPPING[selectedCategory];

        // 검색어 필터링
        const matchesSearch = searchQuery.trim() === '' ? true :
            question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.content.toLowerCase().includes(searchQuery.toLowerCase());

        // 상태 필터링
        const matchesStatus = filterType === 'ALL' ? true :
            filterType === 'ANSWERED' ? question.response :
            filterType === 'WAITING' ? !question.response : true;

        return matchesCategory && matchesSearch && matchesStatus;
    });

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

    // 검과 시간 계산 함수
    const getTimeElapsed = (date) => {
        const now = new Date();
        const questionDate = new Date(date);
        const diffTime = Math.abs(now - questionDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays}일 전`;
        if (diffHours > 0) return `${diffHours}시간 전`;
        return '방금 전';
    };

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
                                {CATEGORY_NAMES[selectedCategory] || '전체문의'}
                            </span>
                            <i className={`fas fa-chevron-${isDropdownVisible ? 'up' : 'down'}`}></i>
                        </button>
                        {isDropdownVisible && (
                            <ul className={admin_qnaboard.filterList}>
                                <li onClick={() => {
                                    setSelectedCategory('ALL');
                                    toggleDropdown();
                                }}>전체문의</li>
                                <li onClick={() => {
                                    setSelectedCategory('BASIC');
                                    toggleDropdown();
                                }}>일반문의</li>
                                <li onClick={() => {
                                    setSelectedCategory('PRIVATE');
                                    toggleDropdown();
                                }}>비밀문의</li>
                                <li onClick={() => {
                                    setSelectedCategory('SIZE');
                                    toggleDropdown();
                                }}>사이즈문의</li>
                                <li onClick={() => {
                                    setSelectedCategory('OTHER');
                                    toggleDropdown();
                                }}>기타문의</li>
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
                            {questions.length}
                        </div>
                        <div className={admin_qnaboard.statLabel}>전체 문의</div>
                    </div>
                    <div 
                        className={`${admin_qnaboard.statCard} ${filterType === 'ANSWERED' ? admin_qnaboard.active : ''}`}
                        onClick={() => handleStatCardClick('ANSWERED')}
                    >
                        <div className={admin_qnaboard.statNumber}>
                            {questions.filter(q => q.response).length}
                        </div>
                        <div className={admin_qnaboard.statLabel}>답변 완료</div>
                    </div>
                    <div 
                        className={`${admin_qnaboard.statCard} ${filterType === 'WAITING' ? admin_qnaboard.active : ''}`}
                        onClick={() => handleStatCardClick('WAITING')}
                    >
                        <div className={admin_qnaboard.statNumber}>
                            {questions.filter(q => !q.response).length}
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