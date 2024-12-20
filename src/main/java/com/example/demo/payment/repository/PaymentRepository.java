package com.example.demo.payment.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.demo.payment.entity.PaymentEntity;
import com.example.demo.payment.entity.PaymentEntity.DeliveryStatus;

// import feign.Param; 오류 import
import org.springframework.data.repository.query.Param; // 추가수정 12.18 14:56 성찬
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Integer> {
        // 특정 User의 orders를 조회
        public Page<PaymentEntity> findByUserEntity_Id(Integer userId, Pageable pageable);

        // 12/17 tosscode 값으로 PaymentEntity 조회 - km
        public List<PaymentEntity> findByTossCode(String tossCode);

        // 특정 User의 Payment 조회 (특정 월에 대한 데이터)
        public List<PaymentEntity> findByUserEntity_IdAndPaymentDateBetween(int userId, LocalDateTime startDate,
                        LocalDateTime endDate);

        // 24.12.13 - 배송 현황에 따른 개수 - uj
        public long countByDeliveryStatus(PaymentEntity.DeliveryStatus paymentCompleted);

        // 2024.12.15 - 사용자 누적 금액 계산 - sumin
        // 특정 사용자의 월별 총 결제 금액 조회
        @Query("SELECT SUM(p.totalPrice) FROM PaymentEntity p WHERE p.userEntity.id = :userid")
        public long sumTotalPriceByUserId(@Param("userid") Integer userid);

        // 24.12.13 - 날짜별 매출액 - uj
        @Query("SELECT SUM(p.totalPrice) FROM PaymentEntity p WHERE p.paymentDate BETWEEN :startOfDay AND :endOfDay")
        Long sumTotalPriceByPaymentDate(
                        @Param("startOfDay") LocalDateTime startOfDay,
                        @Param("endOfDay") LocalDateTime endOfDay);

        // 24.12.13 - 총 매출액 - uj
        @Query("SELECT SUM(p.totalPrice) FROM PaymentEntity p")
        public long sumTotalPrice();

        List<PaymentEntity> findByDeliveryStatusNotAndPaymentDateBefore(
                        DeliveryStatus status, LocalDateTime dateTime);

        boolean existsByTossCode(String tossCode);

        public PaymentEntity findByIdAndTossCode(int id, String tossCode);
}
