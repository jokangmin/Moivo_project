package com.example.demo.user.controller;

import java.util.Map;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.user.service.SocialService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("api/user/social")
public class SocialController {

    @Autowired
    private SocialService socialService;

    // 24.12.16 - uj
    // 카카오 승인 URI 요청
    @GetMapping("/kakao")
    public ResponseEntity<?> getKakaoURI() {
        try {
            String kakaoURI = socialService.getKakaoURI();
            return ResponseEntity.ok(kakaoURI);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_EXPECTATION_FAILED).body(null);
        }
    }

    // 24.12.16 - uj
    // 카카오 로그인 or 회원가입
    @GetMapping("/kakao/login")
    public ResponseEntity<?> getKakaoLogin(@RequestParam(name = "code") String code, HttpServletResponse response) {
        try {
            System.out.println("Get & api/user/social/kakao/login & code=" + code);
            Map<String, Object> loginResult = socialService.getKakaoLogin(code);

            Cookie refreshTokenCookie = new Cookie("refreshToken",
                    (String) loginResult.get("refreshToken"));
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
            response.addCookie(refreshTokenCookie);

            // Refresh Token은 응답 바디에서 제거
            loginResult.remove("refreshToken");
            System.out.println("로그인 성공!!");

            return ResponseEntity.ok(loginResult);
        } catch (NullPointerException e) {
            // 카카오 서버에서 회원 정보 추출 실패
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        } catch (RuntimeException e) {
            // 인증 및 인가 예외 처리
            System.out.println("로그인 실패: " + e.getMessage()); // 디버깅
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_EXPECTATION_FAILED).body(null);
        }
    }

}
