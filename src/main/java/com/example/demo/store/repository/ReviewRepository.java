package com.example.demo.store.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.store.entity.ReviewEntity;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Integer> {
    
    public Page<ReviewEntity> findByProductEntityId(int productId, Pageable pageable);
    
    // 특정 사용자의 리뷰 조회
    public Page<ReviewEntity> findByUserEntityIdAndProductEntityId(int userId, int productId, Pageable pageable);
    
    // 사용자의 모든 리뷰 조회 메서드 추가
    public Page<ReviewEntity> findByUserEntityId(int userId, Pageable pageable);
    
    // 결제상세ID로 리뷰 찾기
    public Optional<ReviewEntity> findByPaymentDetailEntityId(int paymentDetailId);
    
    // 회원 탈퇴 시 리뷰 상태 변경
    @Modifying
    @Query("UPDATE ReviewEntity r SET r.userEntity = NULL WHERE r.userEntity.id = :userId")
    @Transactional
    void updateUserStatusToDeleted(@Param("userId") Integer userId);
}
