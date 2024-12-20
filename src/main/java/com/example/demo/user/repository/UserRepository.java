package com.example.demo.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.user.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByUserId(String userId); // 사용자 계정 Userid

    // 회원 현황 통계 조회 - 24.12.13 _ yjy
    long countByAdminFalse(); // is_admin=0인 회원만 카운트
    int countByGrade(UserEntity.Grade grade); // 등급별 회원 수 조회

    //회원가입시 중복 ID 확인
    boolean existsByUserId(String userId);
}
