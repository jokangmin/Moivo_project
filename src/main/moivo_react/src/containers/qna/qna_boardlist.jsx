import React, { useState, useEffect} from 'react';
import axiosInstance from "../../utils/axiosConfig";
import QnA_b from '../../assets/css/qna_boardlist.module.css';
import { Link , useNavigate} from 'react-router-dom';
import Footer from './../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';

const Qna_boardlist = () => {
    const navigate = useNavigate();
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

    const resetState = () => {
        setQnaData([]);  // 데이터를 초기화
        setCurrentPage(0);  // 페이지 번호 초기화
        setSelectedType('');  // 카테고리 필터 초기화
        setSearchTerm('');  // 검색어 초기화

        fetchQnaData(0, 0, '');
    };
    
    // 새로운 상태 추가: 편집 모달 관련
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedPost, setEditedPost] = useState({
        categoryId: 1,
        title: '',
        content: '',
        secret: false
    });

    const categoryMapping = {
        '': 0,
        '일반 문의': 1,
        '기타 문의': 2,
        '사이즈 문의': 3,
        '비밀 문의': 4
    };

    // 현재 로그인한 사용자 ID 상태 추가
    const [currentUserId, setCurrentUserId] = useState(null);

    // 서버에서 문의 데이터를 가져오는 함수, 카테고리 필터링 포함, 검색 포함
    const fetchQnaData = async (page = 0, categoryId = 0, search = '') => {
        try {
            const response = await axiosInstance.get('/api/user/question', {
                params: {
                    page: page,
                    categoryid: categoryId,
                    title: search || undefined  // Only send if search is not empty
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

    // 엔터키 검색 함수 실행
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();  // 엔터 키가 눌렸을 때 검색 함수 실행
        }
    };
    
    //검색 핸들러
    const handleSearch = () => {
        const categoryId = categoryMapping[selectedType] || 0;
        fetchQnaData(0, categoryId, searchTerm);
    };


    // 현재 사용자 ID 확인
    const checkUserId = () => {
        const storedUserId = localStorage.getItem('id');
            if (storedUserId) {
                setCurrentUserId(parseInt(storedUserId));
            }
    };

    useEffect(() => {
        fetchQnaData(0, 0, '');
        checkUserId();
    }, []);

    // 문의 유형별 토글
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    // 카테고리 필터링 핸들러
    const handleFilterChange = (category) => {
        const categoryId = categoryMapping[category];

        // 상태 업데이트
        setSelectedType(category);
        setIsDropdownVisible(false);

        // 서버에 카테고리 필터링 요청
        fetchQnaData(0, categoryId, searchTerm);

        setActiveIndex(null);
    };

    const handleToggle = (index, item) => {
        if (!currentUserId) {
            // 로그인하지 않은 유저는 목록을 클릭하면 로그인 화면으로 이동
            alert('로그인이 필요합니다.');
            navigate('/user');
            return;
        }
        // 현재 열려있는 글인지 확인
        if (activeIndex === index) {
            // 같은 글을 한번 더 클릭했을 때는 글을 닫음
            setActiveIndex(null);
            return;
        }

        if (item.categoryId === 4) { // 비밀글인 경우
            setSelectedPost(item);
            setPasswordModalVisible(true);
        } else {
            setActiveIndex(index);
        }
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
            
            // 현재 페이지와 선택된 카테고리 유지하며 데이터 다시 불러오기
            const categoryId = categoryMapping[selectedType] || 0;
            fetchQnaData(currentPage, categoryId);
             // 초기화
             setActiveIndex(null);
             setEditModalVisible(false);
            
            alert('수정이 완료되었습니다.');
        } catch (error) {
            console.error('수정 중 오류:', error);
            alert('수정에 실패했습니다.');
        }
    };

    // 게시글 삭제 핸들러
    const handleDeletePost = async (item) => {
        // 로그인한 사용자의 글만 삭제 가능
        if (currentUserId && currentUserId === item.userId) {
            if (window.confirm('정말로 삭제하시겠습니까?')) {
                try {
                    await axiosInstance.delete('/api/user/question/delete', {
                        data: { 
                            id: item.id,
                            userId: currentUserId 
                        }
                    });
                    const categoryId = categoryMapping[selectedType] || 0;
                    fetchQnaData(currentPage, categoryId);
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

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        const categoryId = categoryMapping[selectedType] || 0;
        setActiveIndex(null);
        fetchQnaData(page, categoryId, searchTerm);
    };

    // 아이콘 체크
    const getIconForType = (item) => {
        if (item.categoryId === 4) return <i className="fas fa-lock"></i>; // 비밀문의 아이콘
    
        // categoryId에 따라 다른 아이콘 표시
        switch (item.categoryId) {
            case 1: return <i className="fas fa-question-circle"></i>; // 일반문의
            case 2: return <i className="fas fa-comment-alt"></i>; // 기타문의
            case 3: return <i className="fas fa-ruler"></i>; // 사이즈문의
            default: return <i className="fas fa-question-circle"></i>; // 기본 아이콘
        }
    };

    // 비밀번호 확인 함수 수정
    const handlePasswordCheck = async () => {
        console.log(selectedPost.id);
        console.log(enteredPassword);
        
        try {
            // 서버로 비밀번호 확인 요청
            const response = await axiosInstance.get('/api/user/question/private', {
                params: {
                    id: selectedPost.id,
                    privatepwd: enteredPassword
                }
            });

            if (response.data.true === "200ok") {
                // 비밀번호가 맞으면
                setActiveIndex(qnaData.indexOf(selectedPost));
                setPasswordModalVisible(false);
                setEnteredPassword('');
                setPasswordError('');
            } else {
                // 비밀번호가 틀리면
                setPasswordError('비밀번호가 틀렸습니다.');
            }
        } catch (error) {
            console.error('비밀번호 확인 중 오류:', error);
            if (error.response && error.response.status === 401) {
                setPasswordError('인증에 실패했습니다. 다시 로그인해주세요.');
            } else {
                setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
            }
        }
    }

    //비밀글 페스워드 모달
    const closePasswordModal = () => {
        setPasswordModalVisible(false);
        setEnteredPassword('');
        setPasswordError('');
    };

    // 줄바꿈 문자를 <br />로 변환하는 함수
    const convertNewlinesToBreaks = (text) => {
        return text.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                <br />
            </span>
        ));
    };

    // 날짜 형식 변환 함수
    const formatDate = (dateString) => {
        return dateString.replace('T', ' ');
    };

    // 페이징 처리
    const renderPagination = () => {
        const maxPagesToShow = 5;  // 한 번에 표시할 최대 페이지 버튼 수
    
        // 현재 페이지가 속한 페이지 그룹의 시작 페이지 계산
        const pageGroup = Math.floor(currentPage / maxPagesToShow);
        const startPage = pageGroup * maxPagesToShow;
        const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages - 1);
    
        return (
            <div className={QnA_b.pagination}>
                {/* 이전 버튼 (첫 페이지 그룹이 아닐 때만 표시) */}
                {pageGroup > 0 && (
                    <button  className={QnA_b.paginationBtn}  onClick={() => handlePageChange(startPage - 1)} >
                        이전
                    </button>
                )}
    
                {/* 페이지 번호들 */}
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <button key={page} className={`${QnA_b.paginationBtn} ${currentPage === page ? QnA_b.active : ''}`} onClick={() => handlePageChange(page)} >
                        {page + 1}
                    </button>
                ))}
    
                {/* 다음 버튼 (마지막 페이지 그룹이 아닐 때만 표시) */}
                {endPage < totalPages - 1 && (
                    <button className={QnA_b.paginationBtn} onClick={() => handlePageChange(endPage + 1)} >
                        다음
                    </button>
                )}
            </div>
            );
        };


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
                                            {item.response || '답변 대기 중'}
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
                                
                {/* 페이징 버튼 */}
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