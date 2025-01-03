/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axiosInstance from "../../utils/axiosConfig";
import { PATH } from '../../../scripts/path';
import PropTypes from 'prop-types';

const AdminsBoardContext = createContext();

export const useAdminsBoard = () => {
    return useContext(AdminsBoardContext);
};

export const AdminsBoardProvider = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const filterFromUrl = searchParams.get('filter');

    const [activeIndex, setActiveIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const itemsPerPage = 6;
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [responseModalOpen, setResponseModalOpen] = useState(false);
    const [editResponseModalOpen, setEditResponseModalOpen] = useState(false);
    const [responseInput, setResponseInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState(filterFromUrl || 'ALL');
    const [categoryMapping, setCategoryMapping] = useState({});
    const [categoryNames, setCategoryNames] = useState({});

    // 문의 목록 조회
    const fetchQuestions = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${PATH.SERVER}/api/admin/qna/management/questions`);
            const data = response.data;
            console.log('Fetched questions raw data:', data);

            setQuestions(data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    }, []);

    // 카테고리 조회
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${PATH.SERVER}/api/admin/qna/management/categories`);
            const categories = response.data;
            
            const mapping = {};
            const names = {};
            
            mapping['ALL'] = 'ALL';
            names['ALL'] = '전체문의';
            
            categories.forEach(category => {
                mapping[category.name] = category.id;
                names[category.name] = category.name;
            });

            setCategoryMapping(mapping);
            setCategoryNames(names);
            setCategories(categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    // 초기 데이터 조회
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/user');
            return;
        }

        const initializeData = async () => {
            try {
                await Promise.all([
                    fetchQuestions(),
                    fetchCategories()
                ]);
            } catch (error) {
                console.error('Failed to initialize data:', error);
            }
        };

        initializeData();
    }, [isAuthenticated, isAdmin, navigate, fetchQuestions, fetchCategories]);

    // 초기 데이터 조회
    useEffect(() => {
        if (filterFromUrl) {
            setFilterType(filterFromUrl);
        }
    }, [filterFromUrl]);

    // 문의 응답 모달 열기
    const openResponseModal = useCallback((questionId) => {
        const question = questions.find((q) => q.id === questionId);
        setSelectedQuestion(question);
        setResponseModalOpen(true);
    }, [questions]);

    // 문의 응답 모달 닫기
    const closeResponseModal = useCallback(() => {
        setSelectedQuestion(null);
        setResponseModalOpen(false);
        setResponseInput('');
    }, []);

    // 문의 응답 수정 모달 열기
    const openEditResponseModal = useCallback((questionId) => {
        const question = questions.find((q) => q.id === questionId);
        setSelectedQuestion(question);
        setResponseInput(question.response);
        setEditResponseModalOpen(true);
    }, [questions]);

    // 문의 응답 수정 모달 닫기
    const closeEditResponseModal = useCallback(() => {
        setSelectedQuestion(null);
        setEditResponseModalOpen(false);
        setResponseInput('');
    }, []);

    // 문의 응답 저장
    const handleRespondToQuestion = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(
                `/api/admin/qna/management/questions/${selectedQuestion.id}/response`,
                { response: responseInput }
            );

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
    }, [selectedQuestion, fetchQuestions, closeResponseModal, responseInput]);

    // 문의 응답 수정
    const handleUpdateResponse = useCallback(async (e) => {
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
    }, [selectedQuestion, responseInput, fetchQuestions, closeEditResponseModal]);

    // 문의 응답 삭제
    const handleDeleteResponse = useCallback(async (questionId) => {
        try {
            await axiosInstance.delete(
                `/api/admin/qna/management/questions/${questionId}/response`
            );
            await fetchQuestions();
        } catch (error) {
            console.error('Failed to delete response:', error);
        }
    }, [fetchQuestions]);

    // 문의 토글
    const toggleQuestion = useCallback((index) => {
        setActiveIndex(activeIndex === index ? null : index);
    }, [activeIndex]);

    // 검색
    const handleSearch = useCallback((e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }, []);

    // 상태 카드 클릭
    const handleStatCardClick = useCallback((type) => {
        setFilterType(type);
        setCurrentPage(1);
    }, []);

    // 문의 목록 필터링
    const filteredQuestions = useMemo(() => {
        // fixQuestion이 false인 게시글만 필터링 (일반 QnA)
        const nonFaqQuestions = questions.filter(question => question.fixQuestion === false);
        
        return nonFaqQuestions.filter(question => {
            const matchesCategory = selectedCategory === 'ALL' ? true : 
                question.categoryId === categoryMapping[selectedCategory];

            const matchesSearch = searchQuery.trim() === '' ? true :
                question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                question.content.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesStatus = true;
            if (filterType !== 'ALL') {
                if (filterType === 'ANSWERED') {
                    matchesStatus = question.response;
                } else if (filterType === 'WAITING') {
                    matchesStatus = !question.response;
                }
            }

            return matchesCategory && matchesSearch && matchesStatus;
        });
    }, [selectedCategory, categoryMapping, searchQuery, filterType, questions]);

    // 문의 목록 페이지네이션
    const totalItems = useMemo(() => {
        return filteredQuestions.length;
    }, [filteredQuestions]);

    // 문의 목록 페이지네이션
    const totalPages = useMemo(() => {
        return Math.ceil(totalItems / itemsPerPage);
    }, [totalItems, itemsPerPage]);

    // 문의 목록 페이지네이션
    const startIndex = useMemo(() => {
        return (currentPage - 1) * itemsPerPage;
    }, [currentPage, itemsPerPage]);

    // 문의 목록 페이지네이션
    const currentPageQuestions = useMemo(() => {
        return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredQuestions, startIndex, itemsPerPage]);

    // 문의 목록 페이지네이션
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        setActiveIndex(null);
    }, []);

    // 카테고리 아이콘 조회
    const getIconForCategory = useCallback((categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            switch (category.name) {
                case 'BASIC':
                case 'OTHER':
                    return <i className="fas fa-question-circle"></i>;
                case 'PRIVATE':
                    return <i className="fas fa-lock"></i>;
                case 'SIZE':
                    return <i className="fas fa-ruler"></i>;
                default:
                    return <i className="fas fa-question-circle"></i>;
            }
        }
        return <i className="fas fa-question-circle"></i>;
    }, [categories]);

    // 카테고리 드롭다운 토글
    const toggleDropdown = useCallback(() => {
        setIsDropdownVisible(prev => !prev);
    }, []);

    // 카테고리 선택
    const handleCategorySelect = useCallback((category) => {
        setSelectedCategory(category);
        setIsDropdownVisible(false);
    }, []);

    // 문의 작성 시간 계산
    const getTimeElapsed = useCallback((date) => {
        const now = new Date();
        const questionDate = new Date(date);
        const diffTime = Math.abs(now - questionDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays}일 전`;
        if (diffHours > 0) return `${diffHours}시간 전`;
        return '방금 전';
    }, []);

    const value = useMemo(() => ({
        activeIndex,
        currentPage,
        selectedCategory,
        isDropdownVisible,
        questions,
        categories,
        selectedQuestion,
        responseModalOpen,
        editResponseModalOpen,
        responseInput,
        searchQuery,
        filterType,
        categoryMapping,
        categoryNames,
        itemsPerPage,
        currentPageQuestions,
        totalPages,

        setActiveIndex,
        setCurrentPage,
        setIsDropdownVisible,
        setQuestions,
        setCategories,
        setSelectedQuestion,
        setResponseModalOpen,
        setEditResponseModalOpen,
        setResponseInput,
        setSearchQuery,
        setFilterType,
        
        fetchQuestions,
        fetchCategories,
        openResponseModal,
        closeResponseModal,
        openEditResponseModal,
        closeEditResponseModal,
        handleRespondToQuestion,
        handleUpdateResponse,
        handleDeleteResponse,
        toggleQuestion,
        handleSearch,
        handleStatCardClick,
        handlePageChange,
        getIconForCategory,
        toggleDropdown,
        handleCategorySelect,
        getTimeElapsed
    }), [
        activeIndex,
        currentPage,
        selectedCategory,
        isDropdownVisible,
        questions,
        categories,
        selectedQuestion,
        responseModalOpen,
        editResponseModalOpen,
        responseInput,
        searchQuery,
        filterType,
        categoryMapping,
        categoryNames,
        itemsPerPage,
        currentPageQuestions,
        totalPages,
        getIconForCategory,
        handleDeleteResponse,
        handleRespondToQuestion,
        handleUpdateResponse,
        openEditResponseModal,
        openResponseModal,
        toggleDropdown,
        toggleQuestion,
        closeEditResponseModal,
        closeResponseModal,
        fetchQuestions,
        fetchCategories,
        handlePageChange,
        handleSearch,
        handleStatCardClick,
        getTimeElapsed,
        handleCategorySelect
    ]);

    return (
        <AdminsBoardContext.Provider value={value}>
            {children}
        </AdminsBoardContext.Provider>
    );
};

export default AdminsBoardProvider;