package com.example.demo.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.store.entity.ProductEntity;
import com.example.demo.user.entity.UserWishEntity;
import com.example.demo.user.entity.WishEntity;

@Repository
public interface UserWishRepository extends JpaRepository<UserWishEntity, Integer> {
    Optional<UserWishEntity> findByWishEntityAndProductEntity(WishEntity wishEntity, ProductEntity productEntity);

    // 특정 WishEntity에 연관된 UserWish 삭제
    void deleteByWishEntity(WishEntity wish);

    
}
