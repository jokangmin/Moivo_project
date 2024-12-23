import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axiosInstance from '../../utils/axiosConfig';

export const ProListContext = createContext();

export function ProListProvider({ children }) {
    const { token } = useContext(AuthContext);
    const accessToken = localStorage.getItem('accessToken');
    const [products, setProducts] = useState([]); 
    const [currentPage, setCurrentPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({
        "isFirst": false,
        "isLast": false,
        "hasPrevious": false,
        "hasNext": false,
        "totalPages": 0,
        "startPage": 0,
        "endPage": 0
    });
    const pageBlock = 3;
    const itemsPerPage = 15;
    const [sortBy, setSortBy] = useState("newest");
    const [categories, setCategories] = useState([{ id: 0, name: '전체' }]);
    const [activeCategory, setActiveCategory] = useState({ id: 0, name: '전체' });
    const [cartItem, setCartItem] = useState(0);
    const [wishItem, setWishItem] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async (page) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/api/store', {
                params: {
                    page: page,
                    size: itemsPerPage,
                    sortby: sortBy,
                    keyword: searchTerm,
                    block: pageBlock,
                    categoryid: activeCategory.id
                }
            });

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
        navigate(`/product-detail/${productId}`);
    }, [navigate]);

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
        handleCartClick
    }), [products, currentPage, pageInfo, sortBy, categories, activeCategory, 
        cartItem, wishItem, searchOpen, searchTerm, isLoading, fetchProducts,
        handleProductClick, handleWishClick, handleCartClick]);

    return (
        <ProListContext.Provider value={value}>
            {children}
        </ProListContext.Provider>
    );
}
