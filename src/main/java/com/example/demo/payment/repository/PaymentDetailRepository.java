package com.example.demo.payment.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.payment.entity.PaymentDetailEntity;

import feign.Param;

public interface PaymentDetailRepository extends JpaRepository<PaymentDetailEntity, Integer> {
    // 12/17 paymentId 값을 기준으로 PaymentEntity 조회 - km
    public List<PaymentDetailEntity> findByPaymentEntityId(int paymentId);

    @Modifying
    @Query("DELETE FROM PaymentDetailEntity p WHERE p.paymentEntity.id = :paymentId")
    void deleteByPaymentEntityId(@Param("paymentId") int paymentId);

    // 결제 ID 목록을 기반으로 결제 상세 데이터를 조회
    List<PaymentDetailEntity> findByPaymentEntityIdIn(List<Integer> paymentIds);
}
