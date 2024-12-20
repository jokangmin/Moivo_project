package com.example.demo.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.user.entity.WishEntity;

@Repository
public interface WishRepository extends JpaRepository<WishEntity, Integer> {
    // 특정 User의 Wish를 조회
    List<WishEntity> findByUserEntity_Id(Integer id);
    // userId로 WishEntity 검색
    //Optional<WishEntity> findByUserId(String userId); 

    // 특정 User의 첫 번째 Wish 조회
    Optional<WishEntity> findFirstByUserEntity_Id(Integer id);
    
}
