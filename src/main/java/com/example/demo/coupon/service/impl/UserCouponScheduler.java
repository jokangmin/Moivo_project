package com.example.demo.coupon.service.impl;
import com.example.demo.coupon.entity.UserCouponEntity;
import com.example.demo.coupon.repository.UserCouponRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class UserCouponScheduler {

    private final UserCouponRepository userCouponRepository;

    public UserCouponScheduler(UserCouponRepository userCouponRepository) {
        this.userCouponRepository = userCouponRepository;
    }

    @Scheduled(cron = "0 0 1 * * *") // 매일 오전 1시에 실행
    public void deleteExpiredCoupons() {
        // 현재 시간보다 endDate가 지난 UserCouponEntity를 찾아 삭제
        LocalDateTime now = LocalDateTime.now();
        List<UserCouponEntity> expiredCoupons = userCouponRepository.findByEndDateBeforeAndUsedFalse(now);

        if (!expiredCoupons.isEmpty()) {
            for (UserCouponEntity expiredCoupon : expiredCoupons) {
                userCouponRepository.delete(expiredCoupon);
            }
            System.out.println("삭제된 쿠폰 수: " + expiredCoupons.size());
        } else {
            System.out.println("만료된 쿠폰 없음.");
        }
    }
}