package com.example.demo.coupon.repository;

import com.example.demo.coupon.entity.UserCouponEntity;

import feign.Param;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;


@Repository
public interface UserCouponRepository extends JpaRepository<UserCouponEntity, Long> {
  // 특정 사용자 ID로 쿠폰을 조회
  public List<UserCouponEntity> findByUserEntity_Id(int userid);
  
}
