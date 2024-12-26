package com.example.demo.store.dto;

import java.time.LocalDateTime;

import com.example.demo.store.entity.ReviewEntity;
import com.example.demo.store.entity.ProductStockEntity.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO { // 리뷰
    private Integer id; // 리뷰 고유 키
    private Integer userId; // 리뷰 작성자 PK
    private String userName; // 리뷰 작성자 Name
    private int productId; // 상품 고유 키
    private Size size; // 구매 상품의 size
    private int paymentDetailId; // 결제 상세 고유 키
    private int rating; // 평점 (1~5)
    private String content; // 리뷰 내용
    private LocalDateTime reviewDate; // 리뷰 작성 일시

    // entity => dto 변환

    // 리뷰 출력
    public static ReviewDTO toGetReviewDTO(ReviewEntity entity) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(entity.getId());
        
        if(entity.getUserEntity() == null) { // 사용자 탈퇴 시
            dto.setUserId(null);
            dto.setUserName("알수없음");
        } else{
            dto.setUserId(entity.getUserEntity().getId());
            dto.setUserName(entity.getUserEntity().getName());
        }    

        dto.setProductId(entity.getProductEntity().getId());
        dto.setSize(entity.getPaymentDetailEntity().getSize());
        dto.setRating(entity.getRating());
        dto.setContent(entity.getContent());
        dto.setReviewDate(entity.getReviewDate());

        return dto;
    }

    // DTO 검증 메서드 추가
    public void validate() {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("별점은 1-5 사이여야 합니다.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 내용은 필수입니다.");
        }
    }

}
