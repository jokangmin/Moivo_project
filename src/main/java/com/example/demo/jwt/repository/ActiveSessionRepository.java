package com.example.demo.jwt.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.jwt.entity.ActiveSessionEntity;

@Repository
public interface ActiveSessionRepository extends JpaRepository<ActiveSessionEntity, String> {
    Optional<ActiveSessionEntity> findByUserId(String userId);
    Optional<ActiveSessionEntity> findByAccessToken(String accessToken);
} 