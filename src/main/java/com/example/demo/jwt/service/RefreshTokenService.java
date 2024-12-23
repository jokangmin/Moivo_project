package com.example.demo.jwt.service;

import com.example.demo.jwt.entity.BlacklistEntity;
import com.example.demo.jwt.repository.BlacklistRepository;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {

    @Autowired
    private BlacklistRepository blacklistRepository;

    // 사용자별 활성 토큰 저장 (Redis 사용 권장)
    private Map<String, String> activeTokens = new ConcurrentHashMap<>();

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

    public void saveActiveToken(String userId, String token) {
        activeTokens.put(userId, token);
    }

    public boolean hasActiveToken(String userId) {
        return activeTokens.containsKey(userId);
    }

    public void removeActiveToken(String userId) {
        activeTokens.remove(userId);
    }
}
