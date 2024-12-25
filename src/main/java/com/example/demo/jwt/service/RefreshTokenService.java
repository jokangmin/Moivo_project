package com.example.demo.jwt.service;

import com.example.demo.jwt.entity.BlacklistEntity;
import com.example.demo.jwt.entity.ActiveSessionEntity;
import com.example.demo.jwt.repository.ActiveSessionRepository;
import com.example.demo.jwt.repository.BlacklistRepository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RefreshTokenService {

    @Autowired
    private BlacklistRepository blacklistRepository;

    @Autowired
    private ActiveSessionRepository activeSessionRepository;

    // 사용자별 활성 토큰 저장
    private Map<String, String> activeTokens = new ConcurrentHashMap<>();

    // 사용자의 활성 토큰 존재 여부 확인
    public boolean hasActiveToken(String userId) {
        return activeSessionRepository.findByUserId(userId).isPresent();
    }

    // 사용자의 활성 토큰 조회
    public String getActiveToken(String userId) {
        return activeSessionRepository.findByUserId(userId)
                .map(ActiveSessionEntity::getAccessToken)
                .orElse(null);
    }

    // 토큰이 해당 사용자의 현재 유효한 토큰인지 확인
    public boolean isValidActiveToken(String userId, String token) {
        String storedToken = activeTokens.get(userId);
        return storedToken != null && storedToken.equals(token);
    }

    // 새로운 토큰 저장 (기존 토큰은 블랙리스트에 추가)
    @Transactional
    public void saveActiveToken(String userId, String token) {
        // 기존 세션 찾기
        Optional<ActiveSessionEntity> existingSession = activeSessionRepository.findByUserId(userId);
        
        // 기존 세션이 있으면 삭제하고 블랙리스트에 추가
        existingSession.ifPresent(session -> {
            addTokenToBlacklist(session.getAccessToken());
            activeSessionRepository.delete(session);
            activeSessionRepository.flush();  // 즉시 DB 반영
        });

        // 새 세션 저장
        ActiveSessionEntity newSession = new ActiveSessionEntity();
        newSession.setUserId(userId);
        newSession.setAccessToken(token);
        newSession.setLastLoginTime(LocalDateTime.now());
        
        activeSessionRepository.saveAndFlush(newSession);  // 즉시 DB 반영
        
        // 저장 확인
        System.out.println("Saved token for user: " + userId);
        System.out.println("Token: " + token);
    }

    // 토큰을 블랙리스트에 추가
    @Transactional
    public void addTokenToBlacklist(String token) {
        if (token != null && !isTokenBlacklisted(token)) {
            BlacklistEntity blacklistEntity = new BlacklistEntity();
            blacklistEntity.setToken(token);
            blacklistEntity.setExpiryDate(new Date());
            blacklistRepository.save(blacklistEntity);
        }
    }

    // 토큰이 블랙리스트에 있는지 확인
    public boolean isTokenBlacklisted(String token) {
        return blacklistRepository.existsByToken(token);
    }

    // 사용자의 활성 토큰 제거 (로그아웃 시 사용)
    @Transactional
    public void removeActiveToken(String userId) {
        activeSessionRepository.findByUserId(userId).ifPresent(session -> {
            addTokenToBlacklist(session.getAccessToken());
            activeSessionRepository.delete(session);
        });
    }

    // 블랙리스트에서 만료된 토큰 정리
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정에 실행
    public void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistRepository.deleteByExpiryDateLessThan(now);
    }
}