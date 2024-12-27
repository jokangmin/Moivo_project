package com.example.demo.jwt.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.jwt.util.JwtUtil;

import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.io.IOException;

@Service
public class LoginSessionService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final BlacklistService blacklistService;
    private final JwtUtil jwtUtil;
    
    public LoginSessionService(@Qualifier("redisTemplate") RedisTemplate<String, String> redisTemplate, BlacklistService blacklistService, JwtUtil jwtUtil) {
        this.redisTemplate = redisTemplate;
        this.blacklistService = blacklistService;
        this.jwtUtil = jwtUtil;
    }
    
    // 사용자의 현재 세션 토큰 저장
    public void saveLoginSession(String userId, String accessToken, String refreshToken) {
        // 이전 토큰들 조회
        String prevAccessToken = redisTemplate.opsForValue().get("AT:" + userId);
        String prevRefreshToken = redisTemplate.opsForValue().get("RT:" + userId);
        
        // 이전 토큰이 있다면 블랙리스트에 추가
        if (prevAccessToken != null) {
            Date expiry = jwtUtil.getExpirationDateFromToken(prevAccessToken);
            blacklistService.addToBlacklist(prevAccessToken, expiry);
            redisTemplate.delete("AT:" + userId);
            redisTemplate.delete(prevAccessToken);
        }
        
        if (prevRefreshToken != null) {
            redisTemplate.delete("RT:" + userId);
            redisTemplate.delete(prevRefreshToken);
        }
        
        // 새로운 토큰 저장 - 토큰을 키로 사용
        redisTemplate.opsForValue().set(accessToken, userId, 1, TimeUnit.HOURS);
        redisTemplate.opsForValue().set(refreshToken, userId, 7, TimeUnit.DAYS);
        
        // userId로도 토큰 조회 가능하도록 저장
        redisTemplate.opsForValue().set("AT:" + userId, accessToken, 1, TimeUnit.HOURS);
        redisTemplate.opsForValue().set("RT:" + userId, refreshToken, 7, TimeUnit.DAYS);
    }
    
    // 사용자의 현재 세션 토큰 확인
    public boolean isValidSession(String userId, String accessToken) {
        String storedUserId = redisTemplate.opsForValue().get(accessToken);
        return userId.equals(storedUserId);
    }
    
    // 로그아웃 시 세션 삭제
    public void removeLoginSession(String userId) {
        String accessToken = redisTemplate.opsForValue().get("AT:" + userId);
        String refreshToken = redisTemplate.opsForValue().get("RT:" + userId);
        
        if (accessToken != null) {
            redisTemplate.delete(accessToken);
            redisTemplate.delete("AT:" + userId);
        }
        
        if (refreshToken != null) {
            // Refresh Token만 블랙리스트에 추가
            Date refreshTokenExpiry = jwtUtil.getExpirationDateFromToken(refreshToken);
            blacklistService.addToBlacklist(refreshToken, refreshTokenExpiry);
            redisTemplate.delete(refreshToken);
            redisTemplate.delete("RT:" + userId);
        }
    }
    
    public void handleDuplicateLogin(String userId, String prevRefreshToken) throws IOException {
        if (prevRefreshToken != null) {
            // 기존 Refresh Token을 블랙리스트에 추가
            Date refreshTokenExpiry = jwtUtil.getExpirationDateFromToken(prevRefreshToken);
            blacklistService.addToBlacklist(prevRefreshToken, refreshTokenExpiry);
            
            // Redis에서 기존 토큰 정보 삭제
            redisTemplate.delete(prevRefreshToken);
            redisTemplate.delete("RT:" + userId);
            redisTemplate.delete("AT:" + userId);
        }
    }
}
