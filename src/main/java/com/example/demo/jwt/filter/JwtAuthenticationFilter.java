package com.example.demo.jwt.filter;

import com.example.demo.jwt.service.BlacklistService;
import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.jwt.service.LoginSessionService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import org.springframework.util.StringUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import java.util.Date;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.AllArgsConstructor;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final BlacklistService blacklistService;
    private final UserDetailsService userDetailsService;
    @Autowired
    private LoginSessionService loginSessionService;
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, BlacklistService blacklistService, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.blacklistService = blacklistService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        if (requestURI.contains("/api/auth/token/refresh") 
            || requestURI.contains("/api/user/login")
            || requestURI.contains("/api/user/join")
            || requestURI.contains("/api/user/idCheck")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = getJwtFromRequest(request);
            
            if (StringUtils.hasText(token)) {
                if (blacklistService.isTokenBlacklisted(token)) {
                    String userId = jwtUtil.getUserIdFromToken(token);
                    sendDuplicateLoginResponse(response, userId);
                    return;
                }

                if (jwtUtil.validateToken(token)) {
                    String userId = jwtUtil.getUserIdFromToken(token);
                    
                    if (!loginSessionService.isValidSession(userId, token)) {
                        sendDuplicateLoginResponse(response, userId);
                        return;
                    }
                    
                    // 4. 인증 처리
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            sendErrorResponse(response, ex.getMessage());
        }
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private void sendDuplicateLoginResponse(HttpServletResponse response, String userId) throws IOException {
    
        String prevRefreshToken = redisTemplate.opsForValue().get("RT:" + userId);
        loginSessionService.handleDuplicateLogin(userId, prevRefreshToken);
        
        //메시지 전송
        sendJsonResponse(response, HttpServletResponse.SC_CONFLICT, //409 상태
            new DuplicateLoginResponse("DuplicateLogin", 
                "이미 다른 기기에서 로그인되어 있습니다.", 
                "SESSION_EXPIRED"));
    }
    
    // 공통 JSON 응답 메서드
    private void sendJsonResponse(HttpServletResponse response, int status, Object body) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(body));
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}

// 응답 DTO 클래스 추가
@Data
@AllArgsConstructor
class DuplicateLoginResponse {
    private String error;
    private String message;
    private String code;
}