package com.example.demo.store.controller;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import com.example.demo.store.dto.ReviewDTO;
import com.example.demo.store.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // 24.12.17 - uj (수정)
    // 리뷰 작성 -> 주문상세 페이지에서 페이지를 따로 띄워서 리뷰 작성 진행.
    @PostMapping("")
    public ResponseEntity<String> insertReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            reviewService.insertReview(reviewDTO);
            return ResponseEntity.ok("리뷰 작성 성공");
        } catch (RuntimeException e) {
            e.printStackTrace();
            if (e.getMessage().toLowerCase().contains("user")) {
                return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
            }
            // 리뷰 중복 작성
            return ResponseEntity.status(HttpStatus.SC_CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_EXPECTATION_FAILED).body(null);
        }
    }

    // 리뷰 조회는 인증 없이 접근 가능하도록
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByPage(
            @PathVariable int productId,
            @PageableDefault(size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<ReviewDTO> reviews = reviewService.getReviewsByProductIdAndPage(productId, pageable);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 특정 사용자 리뷰 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ReviewDTO>> getUserReviews(
            @PathVariable int userId,
            @RequestHeader("Authorization") String token,
            @PageableDefault(size = 10, sort = "reviewDate", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            System.out.println("사용자 리뷰 조회 요청 - userId: " + userId);
            System.out.println("Authorization 토큰: " + token);

            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).build();
            }

            Page<ReviewDTO> reviews = reviewService.getAllUserReviews(userId, pageable);
            System.out.println("조회된 리뷰 수: " + reviews.getContent().size());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body(null);
        }
    }

    // 리뷰 수정 (리뷰 ID 기준)
    @PutMapping("/{reviewId}")
    public ResponseEntity<String> updateReview(
            @PathVariable(name = "reviewId") int reviewId,
            @RequestBody ReviewDTO reviewDTO,
            @RequestHeader(value = "Authorization", required = true) String token) {
        try {
            // Authorization 헤더 검증 로직
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            reviewDTO.validate();
            reviewService.updateReview(reviewId, reviewDTO);
            return ResponseEntity.ok("리뷰가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            System.err.println("리뷰 수정 중 에러 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                    .body("리뷰 수정에 실패했습니다: " + e.getMessage());
        }
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable int reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok("리뷰가 성공적으로 삭제되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }
    }

    // 리뷰 조회
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> getReview(@PathVariable int reviewId) {
        try {
            ReviewDTO review = reviewService.getReview(reviewId);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);
        }
    }

    // 결제상세ID로 리뷰 조회
    @GetMapping("/payment/{paymentDetailId}")
    public ResponseEntity<ReviewDTO> getReviewByPaymentDetailId(
            @PathVariable("paymentDetailId") int paymentDetailId,
            @RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).build();
            }

            ReviewDTO review = reviewService.getReviewByPaymentDetailId(paymentDetailId);
            if (review == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            System.err.println("리뷰 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
