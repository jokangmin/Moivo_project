package com.example.demo.jwt.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import com.example.demo.jwt.entity.BlacklistEntity;
import com.example.demo.jwt.prop.JwtProps;
import com.example.demo.jwt.repository.BlacklistRepository;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.access-token-validity}")
    private long accessTokenDate;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenDate;

    @Autowired
    private BlacklistRepository blacklistRepository;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtProps jwtProps;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProps.getSecretKey().getBytes());
    }

    // Access Token 생성
    public String generateAccessToken(String userId, int id, int wishId, int cartId, boolean isAdmin) {
        //payload에 추가하는 것들
        return Jwts.builder()
                .setSubject(userId)
                .claim("id", id)  
                .claim("wishId", wishId)
                .claim("cartId", cartId)
                .claim("isAdmin", isAdmin)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenDate))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성
    public String generateRefreshToken(String userId, int id) {
        String refreshToken = Jwts.builder()
                .setSubject(userId)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenDate))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
        
        // 리프레시 토큰 저장 로직 추가
        return refreshToken;
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // 토큰에서 userId 추출
    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
}

    // 토큰에서 id(PK) 추출
    public int getIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return claims.get("id", Integer.class);
    }

    //토큰에서 isAdmin 추출
    public boolean getIsAdminFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        return claims.get("isAdmin", Boolean.class);
    }

    // 토큰에서 만료 시간 추출
    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }

    // 블랙리스트에 토큰 추가
    public void addTokenToBlacklist(String token) {
        if (validateToken(token)) {
            BlacklistEntity blacklistEntity = new BlacklistEntity();
            blacklistEntity.setToken(token);
            blacklistEntity.setExpiryDate(getExpirationDateFromToken(token));
            blacklistRepository.save(blacklistEntity);
        }
    }

    // 토큰이 블랙리스트에 있는지 확인
    public boolean isTokenBlacklisted(String token) {
        return blacklistRepository.existsByToken(token);
    }

    public String resolveToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
        return bearerToken.substring(7);
    }
    return null;
}

    // Authentication 객체 생성 메서드 추가
    public Authentication getAuthentication(String token, HttpServletRequest request) {
        String userId = getUserIdFromToken(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
        
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
            );
        
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        
        return authentication;
    }
}
