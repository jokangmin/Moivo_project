package com.example.demo.jwt.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "active_sessions")
public class ActiveSessionEntity {
    @Id
    private String userId;
    private String accessToken;
    private LocalDateTime lastLoginTime;
} 