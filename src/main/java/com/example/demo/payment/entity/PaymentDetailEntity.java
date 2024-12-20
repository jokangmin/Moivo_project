package com.example.demo.payment.entity;

import com.example.demo.payment.dto.PaymentDetailDTO;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ReviewEntity;
import com.example.demo.store.entity.ProductStockEntity.Size;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "paymentdetail")
public class PaymentDetailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 결제 상세 고유 키

    // 주문상품 n개 : 주문 1개
    @ManyToOne
    @JoinColumn(name = "paymentid", nullable = false)
    private PaymentEntity paymentEntity; // 결제와 연관된 결제 정보

    // 주문상품 n건 : 상품 1개
    @ManyToOne
    @JoinColumn(name = "productid", nullable = false)
    private ProductEntity productEntity; // 상품과 연관된 상품 정보

    // 결제 상품 1개 : 리뷰 1개
    @OneToOne(cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JoinColumn(name = "reviewid", nullable = true)
    private ReviewEntity reviewEntity; // 리뷰 고유 키

    @Column(name = "price", nullable = false)
    private int price; // 상품 가격: 1개 상품 가격 * 상품 수량

    @Column(name = "count", nullable = false)
    private int count; // 상품 수량

    @Enumerated(EnumType.STRING)
    @Column(name = "size", nullable = false)
    private Size size; // 상품 사이즈

    @Column(name = "writereview")
    private boolean isWriteReview = false; // 리뷰 작성 여부

    // DTO -> Entity

    // 결제 정보 저장
    public static PaymentDetailEntity toSavePaymentEntity(
            PaymentDetailDTO dto,
            PaymentEntity paymentEntity,
            ProductEntity productEntity) {
        // 결제 정보 저장이기 때문에 seq 존재하지 않음.
        PaymentDetailEntity entity = new PaymentDetailEntity();
        entity.setPaymentEntity(paymentEntity);
        entity.setProductEntity(productEntity);
        entity.setPrice(dto.getPrice());
        entity.setCount(dto.getCount());
        entity.setSize(dto.getSize());

        return entity;
    }
}
