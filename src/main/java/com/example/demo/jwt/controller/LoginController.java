package com.example.demo.jwt.controller;

import com.example.demo.jwt.service.BlacklistService;
import com.example.demo.jwt.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BlacklistService blacklistService;

    // Access 토큰 재발급 API
    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request) {
        // HTTP-only 쿠키에서 리프레시 토큰 추출
        Cookie[] cookies = request.getCookies();
        String refreshToken = null;
        System.out.println("리프레시 토큰 재발급 요청 받음" + cookies);
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        // 리프레시 토큰이 없는 경우
        if (refreshToken == null) {
            return ResponseEntity.status(401).body("리프레시 토큰이 없습니다.");
        }

        // 토큰 유효성 검사
        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body("토큰이 유효하지 않습니다.");
        }

        // 블랙리스트 체크
        if (blacklistService.isTokenBlacklisted(refreshToken)) {
            return ResponseEntity.status(401).body("블랙리스트에 등록된 토큰입니다.");
        }

        String userId = jwtUtil.getUserIdFromToken(refreshToken);
        int id = jwtUtil.getIdFromToken(refreshToken);
        boolean isAdmin = jwtUtil.getIsAdminFromToken(refreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(userId, id, isAdmin);

        return ResponseEntity.ok(Map.of(
                "newAccessToken", newAccessToken,
                "isAdmin", isAdmin));
    }

}