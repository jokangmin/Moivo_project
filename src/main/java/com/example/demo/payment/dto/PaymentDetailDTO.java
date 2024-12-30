package com.example.demo.payment.dto;

import com.example.demo.ncp.dto.NCPObjectStorageDTO;
import com.example.demo.payment.entity.PaymentDetailEntity;
import com.example.demo.payment.entity.PaymentEntity;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ProductStockEntity.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDetailDTO {
    private Integer id; // 결제 상세 고유 키
    private Integer paymentId; // 결제와 연관된 결제 정보
    private Integer productId; // 상품과 연관된 상품 정보
    private Integer usercartId; // 상품과 연관된 상품 정보
    private int totalprice;
    private int price; // 상품 가격: 1개 상품 가격 * 상품 수량
    private int discount; // 할인 금액
    private int count; // 상품 수량
    private Size size; // 상품 수량
    private boolean isWriteReview = false; // 리뷰 작성 여부

    // 상품 정보
    private String productImg; // 상품 이미지
    private String productName; // 상품명

    public static PaymentDetailDTO toGetOrderDetailDTO(PaymentDetailEntity entity) {
        PaymentDetailDTO dto = new PaymentDetailDTO();

        NCPObjectStorageDTO ncpDTO = new NCPObjectStorageDTO();

        // 결제 상세 고유 키
        dto.setId(entity.getId());

        // 결제와 연관된 결제 정보 (PaymentEntity의 ID)
        if (entity.getPaymentEntity() != null) {
            dto.setPaymentId(entity.getPaymentEntity().getId());
            dto.setDiscount(entity.getPaymentEntity().getDiscount());
            dto.setPrice(entity.getPaymentEntity().getTotalPrice());
            dto.setTotalprice(dto.getPrice() + dto.getDiscount());
            System.out.println(dto);
        }

        // 상품 정보
        if (entity.getProductEntity() != null) {
            ProductEntity productEntity = entity.getProductEntity(); // 각 결제 상세 항목의 상품 정보
            dto.setProductId(productEntity.getId());
            dto.setProductImg(ncpDTO.getURL() + productEntity.getImg()); // 상품 이미지
            dto.setProductName(productEntity.getName()); // 상품명

        }

        // 기타 필드들
        dto.setPrice(entity.getPrice());
        dto.setCount(entity.getCount());
        dto.setSize(entity.getSize());
        dto.setWriteReview(entity.isWriteReview());
        System.out.println(dto);
        return dto;
    }
}
