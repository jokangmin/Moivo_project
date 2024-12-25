package com.example.demo.jwt.filter;

import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.jwt.entity.ActiveSessionEntity;
import com.example.demo.jwt.repository.ActiveSessionRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private ActiveSessionRepository activeSessionRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String bearerToken = request.getHeader("Authorization");
            if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
                String token = bearerToken.substring(7);
                
                if (jwtUtil.validateToken(token)) {
                    String userId = jwtUtil.getUserIdFromToken(token);
                    
                    // 디버깅 메시지 추가
                    System.out.println("토큰 검증 - 사용자: " + userId);
                    
                    // 현재 세션 확인
                    Optional<ActiveSessionEntity> activeSession = activeSessionRepository.findByUserId(userId);
                    
                    // 디버깅 메시지 추가
                    System.out.println("저장된 세션 존재 여부: " + activeSession.isPresent());
                    
                    if (activeSession.isEmpty() || !token.equals(activeSession.get().getAccessToken())) {
                        handleUnauthorized(response, "다른 곳에서 로그인되어 로그아웃됩니다.");
                        return;
                    }
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            handleUnauthorized(response, e.getMessage());
        }
    }
    
    private void handleUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, String> error = new HashMap<>();
        error.put("error", "SESSION_EXPIRED");
        error.put("message", message);
        
        String json = new ObjectMapper().writeValueAsString(error);
        response.getWriter().write(json);
    }
}