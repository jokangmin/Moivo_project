package com.example.demo.payment.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.payment.dto.PaymentDTO;
import com.example.demo.user.entity.UserEntity;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "payment")
public class PaymentEntity {

    public enum DeliveryStatus { // 배송 상태
        // 결제 완료, 준비중, 배송중, 구매 확정
        PAYMENT_COMPLETED, READY, DELIVERY, CONFIRMED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 결제 고유 키

    // 주문 n건 : 사용자 1명
    @ManyToOne
    @JoinColumn(name = "userid")
    private UserEntity userEntity; // 결제 사용자

    @Column(name = "totalprice", nullable = false)
    private int totalPrice; // 결제 금액 ( = 총 상품 결제 금액 - 할인 금액)

    @Column(name = "discount", nullable = false)
    private int discount = 0; // 할인 금액

    @Column(name = "name", length = 30, nullable = false)
    private String name; // 수령인 이름

    @Column(name = "tel", length = 13, nullable = false)
    private String tel; // 수령인 전화번호 010-0000-0000

    @Column(name = "addr1", length = 100, nullable = false)
    private String addr1; // 수령인 주소 1

    @Column(name = "addr2", length = 100, nullable = false)
    private String addr2; // 수령인 주소 2

    @Column(name = "zipcode", length = 100)
    private String zipcode; // 수령인 우편번호

    @Column(name = "count", nullable = false)
    private int count; // 총 주문 상품 개수

    @Column(name = "paymentdate", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime paymentDate = LocalDateTime.now(); // 결제 요청 일시

    @Column(name = "tosscode", length = 100, nullable = false, unique = true)
    private String tossCode; // 토스 고유 주문 번호 (예시: MC44MjA2MjI3OTQwNjI5)

    @Enumerated(EnumType.STRING)
    @Column(name = "deliverystatus", length = 30)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PAYMENT_COMPLETED; // 배송 상태 (READY, IN_TRANSIT, DELIVERED)

    // 주문 1건 : 상품 n개
    @OneToMany(mappedBy = "paymentEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentDetailEntity> paymentDetailList; // 결제 상세

    // DTO -> Entity

    // 결제 정보 저장
    public static PaymentEntity toSavePaymentEntity(PaymentDTO dto, UserEntity userEntity) {
        // 결제 정보 저장이기 때문에 seq 존재하지 않음.
        PaymentEntity entity = new PaymentEntity();
        entity.setUserEntity(userEntity);
        entity.setTotalPrice(dto.getTotalPrice());
        entity.setDiscount(dto.getDiscount());
        entity.setName(dto.getName());
        entity.setTel(dto.getTel());
        entity.setAddr1(dto.getAddr1());
        entity.setAddr2(dto.getAddr2());
        entity.setZipcode(dto.getZipcode());
        entity.setCount(dto.getCount());
        entity.setTossCode(dto.getTosscode());

        return entity;
    }

}
