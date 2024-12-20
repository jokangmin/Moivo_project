package com.example.demo.coupon.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {

    private Integer id; // 쿠폰 고유 ID
    private String name; // 쿠폰 이름
    private String grade; // 쿠폰의 등급
    private String discountType; // 할인 타입
    private BigDecimal discountValue; // 할인 금액
    private BigDecimal minOrderPrice; // 최소 주문 금액
    private Boolean active; // 쿠폰 활성화 여부

}
