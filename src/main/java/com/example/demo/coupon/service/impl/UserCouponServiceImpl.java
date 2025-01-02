package com.example.demo.coupon.service.impl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.coupon.entity.CouponEntity;
import com.example.demo.coupon.entity.UserCouponEntity;
import com.example.demo.coupon.repository.CouponRepository;
import com.example.demo.coupon.repository.UserCouponRepository;
import com.example.demo.coupon.service.UserCouponService;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.UserRepository;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class UserCouponServiceImpl implements UserCouponService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserCouponRepository userCouponRepository;

    @Autowired
    private CouponRepository couponRepository;

    // 신규 가입자 LV1 쿠폰 발급
    @Override
    public void registerCouponForNewUser(int userId) {
        System.out.println("신규 가입자 쿠폰 발급 시작 - userId: " + userId);

        // 1. LV1 등급 쿠폰 조회
        CouponEntity coupon = couponRepository.findByGrade("LV1")
                .orElseThrow(() -> new RuntimeException("LV1 쿠폰이 존재하지 않습니다."));

        // 2. UserEntity 조회
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));

        // 3. UserCouponEntity 생성 및 초기화
        UserCouponEntity userCouponEntity = new UserCouponEntity();
        userCouponEntity.setUserEntity(userEntity);
        userCouponEntity.setCouponEntity(coupon);
        userCouponEntity.setStartDate(LocalDateTime.now());
        userCouponEntity.setEndDate(LocalDateTime.now().plusMonths(1)); // 유효기간 1개월
        userCouponEntity.setUsed(false); // 미사용 상태로 설정

        // 4. 저장
        userCouponRepository.save(userCouponEntity);
        System.out.println("신규 가입자 LV1 쿠폰 발급 완료");
    }

    // 사용자의 쿠폰을 업데이트하거나 새로 발급하는 메서드
    @Override
    public void updateCouponByUserAndGrade(int userId, String grade) {
        System.out.println("쿠폰 업데이트 시작 - userId: " + userId + ", grade: " + grade);
        // userId: 사용자 PK, grade: 변경된 등급

        // 1. 등급에 해당하는 쿠폰 조회
        CouponEntity coupon = couponRepository.findByGrade(grade)
                .orElseThrow(() -> new RuntimeException("해당 등급의 쿠폰을 찾을 수 없습니다."));

        // 2. 해당 사용자의 쿠폰 목록 조회
        UserCouponEntity userCoupons = userCouponRepository.findByUserEntity_Id(userId);

        // 3. 동일 등급의 쿠폰이 이미 있는지 확인
        UserCouponEntity existingCoupon = null;
            if (userCoupons.getCouponEntity().getGrade().equals(grade)) {
                existingCoupon = userCoupons;
            }

        // 4. 동일 등급의 쿠폰이 존재하는 경우
        if (existingCoupon != null) {
            if (existingCoupon.getUsed()) {
                // 4-1. 사용된 쿠폰이라면 재발급 조건 확인
                if (existingCoupon.getEndDate().isBefore(LocalDateTime.now())) {
                    // 유효기간이 지난 경우에만 재발급
                    issueNewCoupon(userId, existingCoupon, coupon);
                } else {
                    // 유효기간 내라면 재발급하지 않음
                    System.out.println("사용된 쿠폰이 있지만 유효기간 내에 있습니다. 재발급하지 않습니다.");
                }
            } else {
                // 4-2. 미사용 상태라면 그대로 유지
                System.out.println("사용 가능한 쿠폰이 이미 존재합니다. 추가 작업을 중단합니다.");
            }
            return; // 기존 쿠폰 처리 완료 후 종료
        }

        // 5. 동일 등급의 쿠폰이 없는 경우 새로 발급
        issueNewCoupon(userId, existingCoupon, coupon);
    }

    // 쿠폰 발급 로직 
    private void issueNewCoupon(int userId, UserCouponEntity existingCoupon, CouponEntity coupon) {
        UserEntity userEntity = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));
    
        UserCouponEntity userCouponEntity = userCouponRepository.findByUserEntity_Id(userId);

        userCouponEntity.setUserEntity(userEntity);
        userCouponEntity.setCouponEntity(coupon);
        userCouponEntity.setStartDate(LocalDateTime.now());
        userCouponEntity.setEndDate(LocalDateTime.now().plusMonths(1)); // 한 달 유효기간
        userCouponEntity.setUsed(false); // 사용 여부 초기화
    
        userCouponRepository.save(userCouponEntity); // 저장
        System.out.println("쿠폰(" + coupon.getGrade() + ")이 발급/갱신되었습니다.");
    }
}