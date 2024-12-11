
package com.example.demo.user.controller;

//import com.example.demo.configuration.OAuthProperties;

import com.example.demo.security.handler.CustomOAuth2User;
import com.example.demo.security.utils.SecurityUtils;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.service.SocialService;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collection;

@Controller
@RequestMapping("api/user")
@RequiredArgsConstructor
public class SocialController {

//    private final OAuthProperties oAuthProperties; // 추후 OAuth 구글, 네이버 로그인 추가시 사용

    private final SocialService socialService;
    private SecurityUtils securityUtils; // OAuth 로그인, 일반로그인 체크

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String redirectUri;

    @GetMapping("/kakao")
    public String kakaoLogin() {

        // 소셜 로그인 URL 생성
        String location = "https://kauth." + "kakao" + ".com/oauth/authorize?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri;
        System.out.println("소셜로그인 URL 생성");
        return "redirect:" + location;
    }

    @GetMapping("/oauth2/callback/{provider}")
    public String socialLogin(@PathVariable String provider, @RequestParam String code, HttpServletRequest request) throws IOException, ServletException {

        // 소셜 로그인 처리
        System.out.println("Controller 로그인");
        UserEntity userEntity = socialService.loginWithKakao(code, provider);
        System.out.println("Controller userEntity = " + userEntity);
        userEntity.setAdmin(false);
        // OAuth2 인증 및 사용자 정보 가져오기
        // userEntity는 OAuth2User로 형변환 안돼서 CustomOAuth2User 클래스 생성
        OAuth2User oAuth2User = new CustomOAuth2User(userEntity);

        System.out.println("Controller oAuth2User = " + oAuth2User);

        // 사용자의 권한을 가져옴
        Collection<? extends GrantedAuthority> authorities = oAuth2User.getAuthorities();

        System.out.println("사용자권한 authorities = " + authorities);
        // Authentication 객체 생성
        OAuth2AuthenticationToken oAuth2AuthenticationToken =
//                new OAuth2AuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());
                new OAuth2AuthenticationToken(oAuth2User, authorities, "kakao");

        System.out.println("Controller authentication = " + oAuth2AuthenticationToken);
        // SecurityContext에 설정
        SecurityContextHolder.getContext().setAuthentication(oAuth2AuthenticationToken);
        System.out.println("Controller SecurityContextHolder.getContext().getAuthentication() = " + SecurityContextHolder.getContext().getAuthentication());

        //OAuth2 확인
        if (securityUtils.isOAuthLogin()) {
            System.out.println(securityUtils.isOAuthLogin() + " Oauth 로그인");

        } else {
            System.out.println(securityUtils.isOAuthLogin() + "일반 로그인");
        }

        System.out.println("securityUtils.isOAuthLogin() = " + securityUtils.isOAuthLogin());
        socialService.saveOrUpdateUser(userEntity);
        System.out.println("Controller userEntity = " + userEntity);

        HttpSession session = request.getSession();
        Object user = session.getAttribute("user");
        System.out.println("Controller user = " + user);
        System.out.println("Controller session = " + session);

//        // 로그인 페이지로 리턴
        if (securityUtils.isOAuthLogin()) {
            //true일떄
            System.out.println("정답은 여기야");
            return "redirect:" + "http://localhost:5173";
        } else {
            System.out.println("여기오면 안돼");
            return "redirect:" + "http://localhost:5173/user";
        }
    }


//    @PostMapping("/oauth2/token")
//    public String getAccessToken(Authentication authentication) {
//        return socialService.getUserAccessToken(authentication);
//    }

}


