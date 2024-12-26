/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import PropTypes from 'prop-types';

const ReviewContext = createContext();

export const useReview = () => {
    const context = useContext(ReviewContext);
    if (!context) {
        throw new Error('useReview must be used within a ReviewProvider');
    }
    return context;
};

export const ReviewProvider = ({ children }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [existingReview, setExistingReview] = useState(null);
    
    const maxLength = 1000;

    const loadExistingReview = useCallback(async (isReviewComplete, paymentDetailId) => {
        if (isReviewComplete && paymentDetailId) {
            try {
                const response = await axiosInstance.get(`/api/user/review/payment/${paymentDetailId}`);
                
                if (response.data) {
                    setRating(response.data.rating);
                    setContent(response.data.content);
                    setIsEdit(true);
                    setExistingReview({
                        ...response.data,
                        id: response.data.id
                    });
                }
            } catch (err) {
                console.error('리뷰 로딩 에러:', err);
                setError('리뷰를 불러오는데 실패했습니다.');
            }
        }
    }, []);

    const handleSubmit = useCallback(async (reviewData, navigate) => {
        try {
            if (isEdit && existingReview?.id) {
                const response = await axiosInstance.put(
                    `/api/user/review/${existingReview.id}`,
                    {
                        id: existingReview.id,
                        ...reviewData
                    }
                );
                if (response.status === 200) {
                    alert('리뷰가 성공적으로 수정되었습니다.');
                    navigate('/mypage/order');
                }
            } else {
                const response = await axiosInstance.post(`/api/user/review`, reviewData);
                if (response.status === 200) {
                    alert('리뷰가 성공적으로 작성되었습니다.');
                    navigate('/mypage/order');
                }
            }
        } catch (err) {
            console.error('에러 발생:', err);
            setError(err.response?.data || '리뷰 수정에 실패했습니다.');
        }
    }, [isEdit, existingReview]);

    const handleDelete = useCallback(async (navigate) => {
        if (!window.confirm('리뷰를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(
                `/api/user/review/${existingReview.id}`
            );

            if (response.status === 200) {
                alert('리뷰가 성공적으로 삭제되었습니다.');
                navigate('/mypage/order');
            }
        } catch (err) {
            console.error('리뷰 삭제 중 에러:', err);
            setError('리뷰 삭제에 실패했습니다.');
        }
    }, [existingReview]);

    const handleStarClick = useCallback((selectedRating) => {
        setRating(selectedRating);
    }, []);

    const getCharacterCountClass = useCallback((content) => {
        const remaining = maxLength - content.length;
        if (remaining < 50) return 'danger';
        if (remaining < 200) return 'warning';
        return '';
    }, []);

    const createReviewData = useCallback((reviewInfo) => {
        const {
            existingReview,
            userId,
            userName,
            productId,
            size,
            paymentDetailId,
            rating,
            content
        } = reviewInfo;

        return {
            userId: existingReview ? existingReview.userId : userId,
            userName,
            productId,
            size: size ? size.toUpperCase() : "UNKNOWN",
            paymentDetailId,
            rating: parseInt(rating, 10),
            content: content.trim(),
            reviewDate: new Date().toISOString(),
        };
    }, []);

    const onSubmit = useCallback(async (e, reviewInfo, navigate) => {
        e.preventDefault();
        const reviewData = createReviewData(reviewInfo);
        await handleSubmit(reviewData, navigate);
    }, [handleSubmit, createReviewData]);

    const onDelete = useCallback((navigate) => {
        handleDelete(navigate);
    }, [handleDelete]);

    const value = useMemo(() => ({
        isEdit,
        rating,
        content,
        error,
        existingReview,
        maxLength,
        setContent,
        loadExistingReview,
        handleSubmit,
        handleDelete,
        handleStarClick,
        getCharacterCountClass,
        onSubmit,
        onDelete,
    }), [
        isEdit,
        rating,
        content,
        error,
        existingReview,
        loadExistingReview,
        handleSubmit,
        handleDelete,
        handleStarClick,
        getCharacterCountClass,
        onSubmit,
        onDelete,
    ]);

    return (
        <ReviewContext.Provider value={value}>
            {children}
        </ReviewContext.Provider>
    );
};

ReviewProvider.propTypes = {
    children: PropTypes.node.isRequired
};
