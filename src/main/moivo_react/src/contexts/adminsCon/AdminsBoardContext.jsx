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

    const fetchQuestions = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${PATH.SERVER}/api/admin/qna/management/questions`);
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    }, []);

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

    useEffect(() => {
        if (filterFromUrl) {
            setFilterType(filterFromUrl);
        }
    }, [filterFromUrl]);

const openResponseModal = useCallback((questionId) => {
    const question = questions.find((q) => q.id === questionId);
    setSelectedQuestion(question);
    setResponseModalOpen(true);
}, [questions]);

const closeResponseModal = useCallback(() => {
    setSelectedQuestion(null);
    setResponseModalOpen(false);
    setResponseInput('');
}, []);

const openEditResponseModal = useCallback((questionId) => {
    const question = questions.find((q) => q.id === questionId);
    setSelectedQuestion(question);
    setResponseInput(question.response);
    setEditResponseModalOpen(true);
}, [questions]);

const closeEditResponseModal = useCallback(() => {
    setSelectedQuestion(null);
    setEditResponseModalOpen(false);
    setResponseInput('');
}, []);

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

    const toggleQuestion = useCallback((index) => {
        setActiveIndex(activeIndex === index ? null : index);
    }, [activeIndex]);

    const handleSearch = useCallback((e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleStatCardClick = useCallback((type) => {
        setFilterType(type);
        setCurrentPage(1);
    }, []);

    const filteredQuestions = useMemo(() => {
        return questions.filter(question => {
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

    const totalItems = useMemo(() => {
        return filteredQuestions.length;
    }, [filteredQuestions]);

    const totalPages = useMemo(() => {
        return Math.ceil(totalItems / itemsPerPage);
    }, [totalItems, itemsPerPage]);

    const startIndex = useMemo(() => {
        return (currentPage - 1) * itemsPerPage;
    }, [currentPage, itemsPerPage]);

    const currentPageQuestions = useMemo(() => {
        return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredQuestions, startIndex, itemsPerPage]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        setActiveIndex(null);
    }, []);

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

    const toggleDropdown = useCallback(() => {
        setIsDropdownVisible(prev => !prev);
    }, []);

    const handleCategorySelect = useCallback((category) => {
        setSelectedCategory(category);
        setIsDropdownVisible(false);
    }, []);

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
        setSelectedCategory,
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