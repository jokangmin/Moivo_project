package com.example.demo.payment.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.coupon.service.UserCouponService;
import com.example.demo.payment.entity.PaymentEntity;
import com.example.demo.payment.entity.PaymentEntity.DeliveryStatus;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.UserRepository;

@Service
public class PaymentScheduler {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentServiceImpl paymentService; // 기존 PaymentServiceImpl 주입

    @Autowired
    private UserCouponService userCouponService;

    
    /**
     * 스케줄러는 5분마다 실행된다. DeliveryStatus가 CONFIRMED가 아닌 데이터 중
     * 결제 후 30분이 지난 데이터를 업데이트하기
     */
    @Transactional
    @Scheduled(fixedRate = 30000) // 5분마다 실행
    public void updateDeliveryStatus() {
        // 현재 시간 기준으로 30분 이상 경과한 데이터만 조회
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(1);

        List<PaymentEntity> payments = paymentRepository.findByDeliveryStatusNotAndPaymentDateBefore(
            DeliveryStatus.CONFIRMED, cutoffTime
        );

        // 상태 변경하고 저장하기
        for (PaymentEntity payment : payments) {
            DeliveryStatus currentStatus = payment.getDeliveryStatus();
            DeliveryStatus newStatus = getNextDeliveryStatus(currentStatus);
            System.out.println("현재 배송상태 : " + currentStatus);
            System.out.println("다음 배송상태 : " + newStatus);

            if (newStatus != null && newStatus != currentStatus) {
                payment.setDeliveryStatus(newStatus);
                paymentRepository.save(payment); // 상태가 변경된 경우만 저장
                System.out.println("Payment ID " + payment.getId() + " 상태 변경: " 
                    + currentStatus + " → " + newStatus);

                // CONFIRMED 상태로 변경되면 등급 업데이트 및 쿠폰 발급 로직 호출
                if (newStatus == DeliveryStatus.CONFIRMED) {
                    updateUserGradeAndIssueCoupon(payment.getUserEntity().getId());
                }
            }
        }
    }

    // 현재 상태에 따라 다음 상태 반환
    private DeliveryStatus getNextDeliveryStatus(DeliveryStatus currentStatus) {
        switch (currentStatus) {
            case PAYMENT_COMPLETED:
                return DeliveryStatus.READY;
            case READY:
                return DeliveryStatus.DELIVERY;
            case DELIVERY:
                return DeliveryStatus.CONFIRMED;
            default:
                return null; // CONFIRMED 상태는 더 이상 변경하지 않음
        }
    }

    // 등급 업데이트 및 쿠폰 발급 로직
    private void updateUserGradeAndIssueCoupon(int userId) {
        // 등급 업데이트
        paymentService.updateUserGradeBasedOnPurchase(userId);

        // 사용자 정보 조회
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 등급에 따라 쿠폰 발급
        String grade = userEntity.getGrade().name(); // 현재 사용자의 등급
        userCouponService.updateCouponByUserAndGrade(userId, grade);

        System.out.println("사용자 ID " + userId + "의 등급이 업데이트되고 쿠폰이 발급되었습니다.");
    }
}

