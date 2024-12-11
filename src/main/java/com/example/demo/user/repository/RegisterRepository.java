package com.example.demo.user.repository;

import com.example.demo.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegisterRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByname(String name); //조회
}
