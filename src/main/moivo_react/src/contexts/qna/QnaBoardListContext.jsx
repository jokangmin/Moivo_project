import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // useSearchParams 추가
import axiosInstance from "../../utils/axiosConfig";
import QnA_b from '../../assets/css/qna_boardlist.module.css';

const QnaBoardListContext = createContext();
export const useQnaBoardList = () => useContext(QnaBoardListContext);

const QnaBoardListProvider = ({ children }) => {
    const navigate = useNavigate();
    // URL 쿼리 파라미터 추가 12/30 장훈
    const [searchParams, setSearchParams] = useSearchParams();

    const [qnaData, setQnaData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedType, setSelectedType] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false); 
    const [enteredPassword, setEnteredPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // 새로운 상태 추가: 편집 모달 관련
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedPost, setEditedPost] = useState({
        categoryId: 1,
        title: '',
        content: '',
        secret: false
    });

    // 현재 로그인한 사용자 ID 상태 추가
    const [currentUserId, setCurrentUserId] = useState(null);

    const categoryMapping = {
        '': 0,
        '일반 문의': 1,
        '기타 문의': 2,
        '사이즈 문의': 3,
        '비밀 문의': 4
    };

    // 서버에서 문의 데이터를 가져오는 함수, 카테고리 필터링 포함, 검색 포함
    const fetchQnaData = async (page = 0, categoryId = 0, search = '') => {
        try {
            const response = await axiosInstance.get('/api/user/question', {
                params: {
                    page: page,
                    categoryid: categoryId,
                    title: search || undefined // 검색어가 없으면 title 파라미터 제외
                }
            });
            setQnaData(response.data.QuestionList || []);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);

            console.log('API 응답 데이터:', response.data);
        } catch (error) {
            console.error('Error fetching QnA data:', error);
        }
    };

    // 현재 사용자 ID 확인
    const checkUserId = () => {
        const storedUserId = localStorage.getItem('id');
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId));
        }
    };

    // 컴포넌트 마운트 시 로그인 정보만 확인
    useEffect(() => {
        checkUserId();
    }, []);

    useEffect(() => {
        // URL 쿼리에서 page, category, search 읽어오기
        const pageParam = parseInt(searchParams.get('page'), 10) || 0;
        const categoryParam = searchParams.get('category') || '';
        const searchTermParam = searchParams.get('search') || '';

        // 상태값에도 반영 (UI 표시를 위해)
        setCurrentPage(pageParam);
        setSelectedType(categoryParam);
        setSearchTerm(searchTermParam);

        // 실제로 서버에 데이터 fetch
        fetchQnaData(pageParam, categoryMapping[categoryParam], searchTermParam);
    }, [searchParams]); 

    // 엔터키 검색
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        setSearchParams({
            page: 0, // 검색 시에는 첫 페이지로
            category: selectedType,
            search: searchTerm
        });
    };

    // 카테고리 필터 선택 핸들러
    const handleFilterChange = (category) => {
        setSelectedType(category);
        setIsDropdownVisible(false);
        setActiveIndex(null);

        // 쿼리 파라미터 업데이트
        setSearchParams({
            page: 0, // 카테고리 바뀔 때도 첫 페이지로
            category,
            search: searchTerm
        });
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        setActiveIndex(null);

        // 쿼리 파라미터 업데이트
        setSearchParams({
            page,
            category: selectedType,
            search: searchTerm
        });
    };

    const resetState = () => {
        setQnaData([]); // 데이터를 초기화
        setCurrentPage(0); // 페이지 번호 초기화
        setSelectedType(''); // 카테고리 필터 초기화
        setSearchTerm('');  // 검색어 초기화

        // 페이지/카테고리/검색어 모두 초기화
        setSearchParams({});
    };

    // 게시글 열기/닫기 (비밀글이면 비밀번호 모달 열기)
    const handleToggle = (index, item) => {
        if (!currentUserId) {
            alert('로그인이 필요합니다.');
            navigate('/user');
            return;
        }
        if (activeIndex === index) {
            setActiveIndex(null);
            return;
        }
        if (item.categoryId === 4) {
            setSelectedPost(item);
            setPasswordModalVisible(true);
        } else {
            setActiveIndex(index);
        }
    };

    // 게시글 수정 모달 열기
    const handleEditPost = (item) => {
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

    // 수정 제출
    const handleEditSubmit = async () => {
        if (!editedPost.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!editedPost.content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }
        try {
            console.log('수정 요청 데이터:', editedPost);
            await axiosInstance.put('/api/user/question/update', {
                ...editedPost,
                userId: currentUserId
            });
            alert('수정이 완료되었습니다.');

            // 수정 후 다시 목록 갱신
            // (URL 파라미터에서 현재 페이지/카테고리/검색어를 추출해 재조회 가능)
            const pageParam = parseInt(searchParams.get('page'), 10) || 0;
            const categoryParam = searchParams.get('category') || '';
            const searchTermParam = searchParams.get('search') || '';

            fetchQnaData(pageParam, categoryMapping[categoryParam], searchTermParam);

            setActiveIndex(null);
            setEditModalVisible(false);
        } catch (error) {
            console.error('수정 중 오류:', error);
            alert('수정에 실패했습니다.');
        }
    };

    // 게시글 삭제
    const handleDeletePost = async (item) => {
        if (currentUserId && currentUserId === item.userId) {
            if (window.confirm('정말로 삭제하시겠습니까?')) {
                try {
                    await axiosInstance.delete('/api/user/question/delete', {
                        data: { 
                            id: item.id,
                            userId: currentUserId 
                        }
                    });
                    const pageParam = parseInt(searchParams.get('page'), 10) || 0;
                    const categoryParam = searchParams.get('category') || '';
                    const searchTermParam = searchParams.get('search') || '';

                    fetchQnaData(pageParam, categoryMapping[categoryParam], searchTermParam);
                    setActiveIndex(null);
                } catch (error) {
                    console.error('삭제 중 오류:', error);
                    alert('삭제에 실패했습니다.');
                }
            }
        } else {
            alert('삭제 권한이 없습니다.');
        }
    };

    // 비밀번호 확인 (비밀글 열기)
    const handlePasswordCheck = async () => {
        try {
            const response = await axiosInstance.get('/api/user/question/private', {
                params: {
                    id: selectedPost.id,
                    privatepwd: enteredPassword
                }
            });

            if (response.status === 200) {
                // 비밀번호 맞으면 글 열기
                setActiveIndex(qnaData.indexOf(selectedPost));
                setPasswordModalVisible(false);
                setEnteredPassword('');
                setPasswordError('');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setPasswordError('비밀번호가 틀렸습니다.');
            } else if (error.response && error.response.status === 401) {
                setPasswordError('인증에 실패했습니다. 다시 로그인해주세요.');
            } else {
                setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
            }
        }
    };

    // 비밀글 모달 닫기
    const closePasswordModal = () => {
        setPasswordModalVisible(false);
        setEnteredPassword('');
        setPasswordError('');
    };

    const getIconForType = (item) => {
        if (item.categoryId === 4) return <i className="fas fa-lock"></i>; // 비밀문의
        switch (item.categoryId) {
            case 1: return <i className="fas fa-question-circle"></i>; 
            case 2: return <i className="fas fa-comment-alt"></i>; 
            case 3: return <i className="fas fa-ruler"></i>; 
            default: return <i className="fas fa-question-circle"></i>;
        }
    };

    const convertNewlinesToBreaks = (text) => {
        return text.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                <br />
            </span>
        ));
    };

    const formatDate = (dateString) => {
        return dateString.replace('T', ' ');
    };

    // 페이징 버튼 렌더
    const renderPagination = () => {
        const maxPagesToShow = 5;
        const pageGroup = Math.floor(currentPage / maxPagesToShow);
        const startPage = pageGroup * maxPagesToShow;
        const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages - 1);

        return (
            <div className={QnA_b.pagination}>
                {pageGroup > 0 && (
                    <button className={QnA_b.paginationBtn} onClick={() => handlePageChange(startPage - 1)}>
                        이전
                    </button>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <button
                        key={page}
                        className={`${QnA_b.paginationBtn} ${currentPage === page ? QnA_b.active : ''}`}
                        onClick={() => handlePageChange(page)}
                    >
                        {page + 1}
                    </button>
                ))}

                {endPage < totalPages - 1 && (
                    <button className={QnA_b.paginationBtn} onClick={() => handlePageChange(endPage + 1)}>
                        다음
                    </button>
                )}
            </div>
        );
    };

    return (
        <QnaBoardListContext.Provider
            value={{
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

                // Actions
                fetchQnaData,
                resetState,
                handleKeyDown,
                handleSearch,
                toggleDropdown: () => setIsDropdownVisible(!isDropdownVisible),
                handleFilterChange,
                handleToggle,
                handleEditPost,
                handleEditSubmit,
                handleDeletePost,
                handlePageChange,
                handlePasswordCheck,
                closePasswordModal,

                // Utils
                getIconForType,
                convertNewlinesToBreaks,
                formatDate,
                renderPagination,

                // Setter
                setQnaData,
                setActiveIndex,
                setCurrentPage,
                setSelectedType,
                setIsDropdownVisible,
                setTotalPages,
                setPasswordModalVisible,
                setEnteredPassword,
                setPasswordError,
                setSelectedPost,
                setSearchTerm,
                setEditModalVisible,
                setEditedPost,
                setCurrentUserId
            }}
        >
            {children}
        </QnaBoardListContext.Provider>
    );
};

export default QnaBoardListProvider;