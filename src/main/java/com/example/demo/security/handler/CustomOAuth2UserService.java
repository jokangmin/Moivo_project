package com.example.demo.security.handler;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Primary
@Configuration
@Service
//OAuth2 인증한 사용자 정보
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 부모 클래스(DefaultOAuth2UserService)에서 사용자 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 클라이언트 등록 ID (예: kakao, naver, google)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 사용자 고유 ID가 매핑된 키 (예: sub, id 등)
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        // 사용자 정보 속성
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 사용자 정보를 저장 또는 업데이트
        saveOrUpdate(attributes, registrationId);

        // OAuth2 사용자 객체 반환
        // Spring Secrurity 사용시 ROLE_ 들어가야함
//        return new DefaultOAuth2User(
//                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
//                attributes,
//                userNameAttributeName);

        OAuth2AuthenticationToken authenticationToken = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                userRequest.getClientRegistration().getRegistrationId()
        );

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        System.out.println("CustomOAuth2 authenticationToken = " + authenticationToken);
        return oAuth2User;
    }

    private void saveOrUpdate(Map<String, Object> attributes, String registrationId) {
        // 사용자 정보를 저장하거나 업데이트
        // 예: DB에 저장, 기존 사용자 업데이트 등
        // userRepository.saveOrUpdate(attributes);
    }
}
