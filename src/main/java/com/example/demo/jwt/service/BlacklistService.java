package com.example.demo.jwt.service;

import com.example.demo.jwt.entity.BlacklistEntity;
import com.example.demo.jwt.repository.BlacklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class BlacklistService {
    
    @Autowired
    private BlacklistRepository blacklistRepository;
    
    public void addToBlacklist(String token, Date expiryDate) {
        // 토큰이 이미 블랙리스트에 있는지 확인
        if (!isTokenBlacklisted(token)) {
            BlacklistEntity blacklistEntity = new BlacklistEntity();
            blacklistEntity.setToken(token);
            blacklistEntity.setExpiryDate(expiryDate);
            blacklistRepository.save(blacklistEntity);
        }
    }
    
    public boolean isTokenBlacklisted(String token) {
        return blacklistRepository.existsByToken(token);
    }

    // pm 12시에 만료된 토큰 삭제
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistRepository.deleteByExpiryDateLessThan(now);
    }
}