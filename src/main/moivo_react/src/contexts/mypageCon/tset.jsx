import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate, useSearchParams } from "react-router-dom"; // useSearchParams
// ↑ 기존주석: import ...

const MypageBoardContext = createContext();

export const useMypageBoardContext = () => useContext(MypageBoardContext);

const MypageBoardProvider = ({ children }) => {
    const [MyQnaList, setMyQnaList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // 현재 로그인한 사용자 ID 상태 추가
    const [currentUserId, setCurrentUserId] = useState(null);

    // 새로운 상태 추가: 편집 모달 관련
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedPost, setEditedPost] = useState({
        categoryId: 1,
        title: '',
        content: '',
        secret: false
    });

    // 12/18 나의 문의 리스트 가져오기 - km
    // -------------------------------------
    // 쿼리 파라미터 이용
    // -------------------------------------
    const [searchParams, setSearchParams] = useSearchParams();

    // 현재 사용자 ID 확인
    const checkUserId = () => {
        const storedUserId = localStorage.getItem('id');
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId));
        }
    };

    useEffect(() => {
        console.log("* MyQnaList DB : " + MyQnaList);
        checkUserId();
    }, [MyQnaList]);

    // 12/18 나의 문의 리스트 가져오기 - km
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
                params: { page, size, sort: 'id,desc' },
            });

            if (
                myQuestionResponse.data &&
                myQuestionResponse.data.content &&
                Array.isArray(myQuestionResponse.data.content)
            ) {
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
    };

    // 페이지네이션 버튼 클릭 시
    // ------------------------------------------
    // 여기서 'page'를 쿼리 파라미터로 설정
    // ------------------------------------------
    const handlePageClick = (page) => {
        setSearchParams({ page });
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

            // 수정 후 목록 새로고침
            fetchMyQna(currentPage);
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

                // 삭제 후 목록 새로고침
                fetchMyQna(currentPage);
                alert("삭제되었습니다.");
            } catch (error) {
                console.error("삭제 중 오류:", error);
                alert("삭제에 실패했습니다.");
            }
        }
    };

    // -----------------------------------------------
    // 기존에 [navigate] 의존성으로 fetchMyQna()를
    // 호출하던 부분을 쿼리 파라미터 중심으로 수정
    // -----------------------------------------------
    useEffect(() => {
        // URL의 쿼리 파라미터에서 page값 읽기
        const pageParam = parseInt(searchParams.get("page"), 10) || 0;
        fetchMyQna(pageParam);
    }, [searchParams, navigate]);

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

    // ========================================
    // [추가] 5개 단위로 끊어서 페이지네이션
    // ========================================
    const renderPagination = () => {
        // 페이지가 1개 이하라면 숨기기
        if (totalPages <= 1) return null;

        // 현재 페이지(currentPage)는 0-based
        // 예) currentPage=0~4 → 표시그룹 1..5
        //     currentPage=5~9 → 표시그룹 6..10
        const pageGroupSize = 5;
        const currentGroup = Math.floor(currentPage / pageGroupSize);
        const startPage = currentGroup * pageGroupSize; 
        const endPage = Math.min(startPage + pageGroupSize - 1, totalPages - 1);

        // 페이지 배열 만들기
        const pages = [];
        for (let p = startPage; p <= endPage; p++) {
            pages.push(p);
        }

        return (
            <div style={{ marginTop: '20px' }}>
                {/* 이전 그룹 버튼 */}
                {currentGroup > 0 && (
                    <button style={{ marginRight: '8px' }} onClick={() => handlePageClick(startPage - 1)}>
                        이전
                    </button>
                )}

                {/* 개별 페이지 버튼 (0-based → 표시 p+1) */}
                {pages.map((p) => (
                    <button
                        key={p}
                        style={{ marginRight: '3px', fontWeight: p === currentPage ? 'bold' : 'normal' }}
                        onClick={() => handlePageClick(p)}
                    >
                        {p + 1}
                    </button>
                ))}

                {/* 다음 그룹 버튼 */}
                {endPage < totalPages - 1 && (
                    <button style={{ marginLeft: '8px' }} onClick={() => handlePageClick(endPage + 1)}>
                        다음
                    </button>
                )}
            </div>
        );
    };

    const value = {
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

        // [추가] 5개 단위 페이지네이션 렌더함수
        renderPagination,
    };

    return (
        <MypageBoardContext.Provider value={value}>
            {children}
        </MypageBoardContext.Provider>
    );
};

export default MypageBoardProvider;
