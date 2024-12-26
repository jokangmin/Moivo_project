package com.example.demo.jwt.service;

import com.example.demo.jwt.entity.BlacklistEntity;
import com.example.demo.jwt.repository.BlacklistRepository;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {

    @Autowired
    private BlacklistRepository blacklistRepository;

    // Refresh 토큰 블랙리스트 여부 확인
    public boolean isTokenBlacklisted(String token) {
        return blacklistRepository.existsByToken(token);
    }

    // Refresh 토큰 블랙리스트에 추가
    public void addTokenToBlacklist(String token) {
        BlacklistEntity blacklistEntity = new BlacklistEntity();
        blacklistEntity.setToken(token);
        blacklistEntity.setExpiryDate(new Date()); // 만료 시간 저장 가능
        blacklistRepository.save(blacklistEntity);
    }
}