package com.example.demo.coupon.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.demo.coupon.entity.UserCouponEntity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCouponDTO {

    private Integer id; // 사용자 쿠폰 고유 ID
    private int userId; // 사용자 정보
    private String userName; // 사용자 정보
    private String couponName; // 쿠폰 정보
    private LocalDateTime startDate; // 쿠폰 발급 시작 일자
    private LocalDateTime endDate; // 쿠폰 발급 종료 일자
    private Boolean used; // 쿠폰 사용 여부
    private BigDecimal discountValue;  // 쿠폰 할인율
    private BigDecimal minOrderPrice; 

    public static UserCouponDTO toGUserCouponDTO(UserCouponEntity entity) {
        UserCouponDTO dto = new UserCouponDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserEntity().getId());
        dto.setUserName(entity.getUserEntity().getName());
        dto.setCouponName(entity.getCouponEntity().getName());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setUsed(entity.getUsed());
        dto.setDiscountValue(entity.getCouponEntity().getDiscountValue());
        dto.setMinOrderPrice(entity.getCouponEntity().getMinOrderPrice());

        return dto;
    }
}