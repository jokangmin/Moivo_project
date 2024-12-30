package com.example.demo.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import lombok.Getter;

@Getter
@Configuration
public class SocialConfiguration {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;

    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String kakaoClientSecret;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${spring.security.oauth2.client.provider.kakao.authorization-uri}")
    private String kakaoAuthorizationUri;

    @Value("${spring.security.oauth2.client.provider.kakao.token-uri}")
    private String kakaoTokenUri;

    @Value("${spring.security.oauth2.client.provider.kakao.user-info-uri}")
    private String kakaoUserInfoUri;

    // @PostConstruct를 사용하여 값이 주입된 후 URI를 동적으로 수정합니다.
    @PostConstruct
    public void init() {
        // kakaoRedirectUri?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code
        this.kakaoAuthorizationUri = kakaoAuthorizationUri + "?client_id=" + this.kakaoClientId + "&redirect_uri=" + this.kakaoRedirectUri + "&response_type=code";
    }

}
