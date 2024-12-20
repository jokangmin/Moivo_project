package com.example.demo.coupon.repository;

import com.example.demo.coupon.entity.UserCouponEntity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCouponEntity, Long> {
  // 특정 사용자 ID로 쿠폰을 조회
  @Query("SELECT uc FROM UserCouponEntity uc JOIN FETCH uc.couponEntity WHERE uc.userEntity.id = :userId")
  public List<UserCouponEntity> findByUserEntity_Id(int userId);

  public void deleteByUserEntity_Id(int userId);

  List<UserCouponEntity> findByEndDateBeforeAndUsedFalse(LocalDateTime now);
}
