package com.example.demo.store.service.impl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.payment.entity.PaymentDetailEntity;
import com.example.demo.payment.repository.PaymentDetailRepository;
import com.example.demo.store.dto.ReviewDTO;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ReviewEntity;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.store.repository.ReviewRepository;
import com.example.demo.store.service.ReviewService;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentDetailRepository detailRepository;

    // 24.12.17, 19 - uj (수정)
    // 리뷰 작성
    @Override
    public void insertReview(ReviewDTO reviewDTO) {
        UserEntity userEntity = userRepository.findById(reviewDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentDetailEntity paymentDetailEntity = detailRepository.findById(
                reviewDTO.getPaymentDetailId()).orElseThrow();

        // 리뷰 중복 작성 방지
        System.out.println("리뷰 작성 여부 : " + paymentDetailEntity.isWriteReview());
        if (!paymentDetailEntity.isWriteReview()) {
            ProductEntity productEntity = productRepository.findById(reviewDTO.getProductId()).orElseThrow();

            ReviewEntity entity = ReviewEntity.toSaveReviewEntity(
                    reviewDTO, userEntity,
                    productEntity, paymentDetailEntity);

            // 리뷰 저장
            ReviewEntity reviewEntity = reviewRepository.save(entity);

            // 24.12.19 - DB 구조 변경으로 인해 추가 - uj
            paymentDetailEntity.setReviewEntity(reviewEntity);
            paymentDetailEntity.setWriteReview(true);
            detailRepository.save(paymentDetailEntity);
        } else {
            throw new RuntimeException("결제 상품에 대한 리뷰를 이미 작성하였습니다.");
        }

        System.out.println("리뷰 작성 성공");
    }

    // 리뷰 조회 (페이징 처리)
    @Override
    public Page<ReviewDTO> getReviewsByProductIdAndPage(int productId, Pageable pageable) {
        return reviewRepository.findByProductEntityId(productId, pageable)
                .map(ReviewDTO::toGetReviewDTO);
    }

    // 특정 사용자의 리뷰 조회
    @Override
    public Page<ReviewDTO> getUserReviewsByProductId(int userId, int productId, Pageable pageable) {
        return reviewRepository.findByUserEntityIdAndProductEntityId(userId, productId, pageable)
                .map(ReviewDTO::toGetReviewDTO);
    }

    // 사용자의 모든 리뷰 조회
    @Override
    public Page<ReviewDTO> getAllUserReviews(int userId, Pageable pageable) {
        System.out.println("서비스 레이어 - 사용자 리뷰 조회 시작 - userId: " + userId);
        Page<ReviewDTO> reviews = reviewRepository.findByUserEntityId(userId, pageable)
                .map(ReviewDTO::toGetReviewDTO);
        System.out.println("조회된 리뷰 수: " + reviews.getContent().size());
        return reviews;
    }

    // 리뷰 수정
    @Transactional // 트랜잭션 보장
    @Override
    public void updateReview(int reviewId, ReviewDTO reviewDTO) {
        try {
            ReviewEntity review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다. ID: " + reviewId));

            // 로그 추가 - 수정 전 데이터 확인
            System.out.println("기존 리뷰 내용: " + review.getContent());
            System.out.println("수정 요청 데이터: " + reviewDTO);

            // 리뷰 수정
            review.setRating(reviewDTO.getRating());
            review.setContent(reviewDTO.getContent().trim());
            review.setReviewDate(LocalDateTime.now());

            reviewRepository.save(review); // 수정된 리뷰 저장

            // 로그 추가 - 저장 후 데이터 확인
            System.out.println("수정된 리뷰 내용: " + review.getContent());
        } catch (Exception e) {
            System.err.println("리뷰 수정 중 에러: " + e.getMessage());
            throw new RuntimeException("리뷰 수정에 실패했습니다: " + e.getMessage());
        }
    }

    // 24.12.19 - 리뷰 삭제 - uj
    @Override
    @Transactional
    public void deleteReview(int reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 리뷰 작성 여부 false로 변경
        PaymentDetailEntity paymentDetail = review.getPaymentDetailEntity();
        paymentDetail.setReviewEntity(null);
        paymentDetail.setWriteReview(false);
        detailRepository.save(paymentDetail);
        System.out.println("결제 상세 리뷰 관련 데이터 변경 >> writereview : " +
                paymentDetail.isWriteReview());

        review.setPaymentDetailEntity(null);
        reviewRepository.delete(review);
        System.out.println("리뷰 삭제");
    }

    @Override
    public ReviewDTO getReview(int reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return ReviewDTO.toGetReviewDTO(review);
    }

    @Override
    public ReviewDTO getReviewByPaymentDetailId(int paymentDetailId) {
        if (paymentDetailId <= 0) {
            throw new IllegalArgumentException("유효하지 않은 paymentDetailId입니다: " + paymentDetailId);
        }

        ReviewEntity review = reviewRepository.findByPaymentDetailEntityId(paymentDetailId)
                .orElseThrow(() -> new RuntimeException("해당 결제 상세에 대한 리뷰를 찾을 수 없습니다."));
        return ReviewDTO.toGetReviewDTO(review);
    }

}