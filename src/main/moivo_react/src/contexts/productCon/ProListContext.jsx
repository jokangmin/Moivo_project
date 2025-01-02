/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../AuthContext";
import axiosInstance from '../../utils/axiosConfig';
import PropTypes from 'prop-types';

export const ProListContext = createContext();

export const ProListProvider = ({ children }) => {
    const { token } = useContext(AuthContext); // 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken'); // 로컬스토리지에서 토큰 가져오기
    const [products, setProducts] = useState([]); // 상품 목록 상태
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태
    const [pageInfo, setPageInfo] = useState({
        "isFirst": false,
        "isLast": false,
        "hasPrevious": false,
        "hasNext": false,
        "totalPages": 0,
        "startPage": 0,
        "endPage": 0
    });
    const pageBlock = 3; // 페이지 블록 크기
    const itemsPerPage = 16; // 페이지당 상품 수
    const [sortBy, setSortBy] = useState("newest"); // 정렬 기준
    const [categories, setCategories] = useState([{ id: 0, name: '전체' }]); // 카테고리 목록
    const [activeCategory, setActiveCategory] = useState({ id: 0, name: '전체' });
    const [cartItem, setCartItem] = useState(0); // 장바구니 아이템 수
    const [wishItem, setWishItem] = useState(0); // 찜 아이템 수
    const [searchOpen, setSearchOpen] = useState(false); // 검색 열기 상태
    const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const navigate = useNavigate();
    const location = useLocation();

    // 페이지 상태를 세션스토리지에 저장/복원하는 로직 추가
    const [lastViewedState, setLastViewedState] = useState(() => {
        const saved = sessionStorage.getItem('productListState');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            page: currentPage || 0,
            sortBy: sortBy || "newest",
            categoryId: activeCategory?.id || 0,
            searchTerm: searchTerm || ""
        };
    });

    const fetchProducts = useCallback(async (page) => {
        setIsLoading(true);
        try {
            // URL 쿼리 파라미터 구성
            const queryParams = new URLSearchParams({
                page: page,
                size: itemsPerPage,
                sortby: sortBy,
                block: pageBlock,
                categoryid: activeCategory.id
            });

            // 검색어가 있는 경우에만 추가
            if (searchTerm) {
                queryParams.append('keyword', searchTerm);
            }

            // 쿼리스트링을 포함한 URL로 요청
            const response = await axiosInstance.get(`/api/store?${queryParams.toString()}`);

            if (response.data) {
                setProducts(response.data.productList || []);
                setPageInfo({
                    isFirst: response.data.isFirst,
                    isLast: response.data.isLast,
                    hasPrevious: response.data.hasPrevious,
                    hasNext: response.data.hasNext,
                    totalPages: response.data.totalPages,
                    startPage: response.data.startPage,
                    endPage: response.data.endPage
                });

                setCategories([{ id: 0, name: '전체' }, ...response.data.category]);

                if (accessToken) {
                    getWishCartCount('wish');
                    getWishCartCount('cart');
                }

                setCurrentPage(page);
                
                // 현재 상태를 세션스토리지에 저장
                const currentState = {
                    page: page,
                    sortBy: sortBy,
                    categoryId: activeCategory.id,
                    searchTerm: searchTerm
                };
                sessionStorage.setItem('productListState', JSON.stringify(currentState));
                setLastViewedState(currentState);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                console.error("인증 오류:", error);
            } else {
                console.error("상품 목록을 가져오는 중 오류가 발생했습니다:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [sortBy, searchTerm, activeCategory.id, accessToken]);

    const getWishCartCount = async (type) => {
        try {
            const response = await axiosInstance.get(`/api/user/${type}/list`);
            console.log(`${type} 응답 데이터:`, response.data);

            switch (type) {
                case 'wish':
                    setWishItem(response.data?.wishlist?.length || 0);
                    break;
                case 'cart':
                    setCartItem(response.data?.totalItems || 0);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error(`${type} 데이터 가져오기 실패:`, error);
            if (type === 'wish') setWishItem(0);
            if (type === 'cart') setCartItem(0);
        }
    };

    const handleProductClick = useCallback((productId) => {
        // 현재 상태 저장
        const currentState = {
            page: currentPage,
            sortBy: sortBy,
            categoryId: activeCategory.id,
            searchTerm: searchTerm
        };
        sessionStorage.setItem('productListState', JSON.stringify(currentState));
        navigate(`/product-detail/${productId}`);
    }, [navigate, currentPage, sortBy, activeCategory.id, searchTerm]);

    const handleWishClick = useCallback(() => {
        if (accessToken) {
            navigate(`/mypage/wish`);
        } else {
            alert("로그인 후에 이용해주세요.");
        }
    }, [accessToken, navigate]);

    const handleCartClick = useCallback(() => {
        if (accessToken) {
            navigate(`/cart`);
        } else {
            alert("로그인 후에 이용해주세요.");
        }
    }, [accessToken, navigate]);

    // 페이지 상태 복원 효과
    useEffect(() => {
        const savedState = sessionStorage.getItem('productListState');
        if (savedState) {
            const { page, sortBy: savedSortBy, categoryId, searchTerm: savedSearchTerm } = JSON.parse(savedState);
            
            // 이전 상태 모두 복원
            setSortBy(savedSortBy);
            const savedCategory = categories.find(cat => cat.id === categoryId) || categories[0];
            setActiveCategory(savedCategory);
            setSearchTerm(savedSearchTerm);
            
            // 저장된 페이지로 데이터 가져오기
            fetchProducts(page);
        } else {
            fetchProducts(0);
        }
    }, []); // 마운트 시 한 번만 실행

    // 필터 변경 감지 효과
    useEffect(() => {
        const savedState = sessionStorage.getItem('productListState');
        const { sortBy: savedSortBy, categoryId: savedCategoryId, searchTerm: savedSearchTerm } 
            = savedState ? JSON.parse(savedState) : {};

        // 필터가 변경되었을 때만 첫 페이지로 이동
        if ((savedSortBy !== undefined && savedSortBy !== sortBy) || 
            (savedCategoryId !== undefined && savedCategoryId !== activeCategory.id) || 
            (savedSearchTerm !== undefined && savedSearchTerm !== searchTerm)) {
            fetchProducts(0); // 필터 변경 시에만 첫 페이지로 이동
        }
    }, [sortBy, activeCategory.id, searchTerm, fetchProducts]);

    // URL 변경 감지 및 상태 동기화
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        
        // URL에서 파라미터 추출
        const pageParam = parseInt(searchParams.get('page')) || 0;
        const sortParam = searchParams.get('sortby') || 'newest';
        const categoryIdParam = parseInt(searchParams.get('categoryid')) || 0;
        const keywordParam = searchParams.get('keyword') || '';

        // 현재 상태와 URL 파라미터가 다른 경우에만 상태 업데이트
        if (currentPage !== pageParam || 
            sortBy !== sortParam || 
            activeCategory.id !== categoryIdParam || 
            searchTerm !== keywordParam) {
            
            setCurrentPage(pageParam);
            setSortBy(sortParam);
            setSearchTerm(keywordParam);
            
            // 카테고리 설정
            const category = categories.find(cat => cat.id === categoryIdParam) || categories[0];
            setActiveCategory(category);

            // 데이터 다시 불러오기
            fetchProducts(pageParam);
        }
    }, [location.search, currentPage, sortBy, activeCategory.id, searchTerm, categories, fetchProducts]);

    // 페이지 변경 핸들러
    const handlePageChange = useCallback((page) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', page);
        navigate(`${location.pathname}?${searchParams.toString()}`);
        // fetchProducts(page);
    }, [location.search, location.pathname, navigate, fetchProducts]);

    // 검색어 변경 핸들러
    const handleSearchChange = useCallback((value) => {
        const searchParams = new URLSearchParams(location.search);
        if (value) {
            searchParams.set('keyword', value);
        } else {
            searchParams.delete('keyword');
        }
        navigate(`${location.pathname}?${searchParams.toString()}`);
        setSearchTerm(value);
        // fetchProducts(0); // 검색 시 첫 페이지로 이동
    }, [location.search, location.pathname, navigate, fetchProducts]);

    // 카테고리 변경 핸들러
    const handleCategoryChange = useCallback((category) => {
        console.log("category: " + category.id);
        console.log(category);
        
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('categoryid', category.id);
        searchParams.set('page', '0'); // 카테고리 변경 시 첫 페이지로
        navigate(`${location.pathname}?${searchParams.toString()}`);
        setActiveCategory(category);
        // fetchProducts(0);
    }, [location.search, location.pathname, navigate, fetchProducts]);

    // 정렬 변경 핸들러
    const handleSortChange = useCallback((value) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('sortby', value);
        searchParams.set('page', '0'); // 정렬 변경 시 첫 페이지로
        navigate(`${location.pathname}?${searchParams.toString()}`);
        setSortBy(value);
        // fetchProducts(0);
    }, [location.search, location.pathname, navigate, fetchProducts]);

    const value = useMemo(() => ({
        products,
        currentPage,
        pageInfo,
        sortBy,
        setSortBy,
        categories,
        activeCategory,
        setActiveCategory,
        cartItem,
        wishItem,
        searchOpen,
        setSearchOpen,
        searchTerm,
        setSearchTerm,
        isLoading,
        fetchProducts,
        handleProductClick,
        handleWishClick,
        handleCartClick,
        lastViewedState,
        setLastViewedState,
        setCurrentPage,
        setPageInfo,
        setProducts,
        setCartItem,
        setWishItem,
        handlePageChange,
        handleSearchChange,
        handleCategoryChange,
        handleSortChange
    }), [
        products, 
        currentPage, 
        pageInfo, 
        sortBy, 
        categories, 
        activeCategory,
        cartItem, 
        wishItem, 
        searchOpen, 
        searchTerm, 
        isLoading, 
        fetchProducts,
        handleProductClick, 
        handleWishClick, 
        handleCartClick,
        lastViewedState,
        handlePageChange,
        handleSearchChange,
        handleCategoryChange,
        handleSortChange
    ]);

    return (
        <ProListContext.Provider value={value}>
            {children}
        </ProListContext.Provider>
    );
};

ProListProvider.propTypes = {
    children: PropTypes.node.isRequired
};
