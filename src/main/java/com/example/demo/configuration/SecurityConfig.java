package com.example.demo.configuration;

import com.example.demo.jwt.filter.JwtAuthenticationFilter;
import com.example.demo.security.handler.CustomAuthenticationSuccessHandler;

import java.util.Arrays;

import com.example.demo.security.handler.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod; // HTTP 메서드 사용
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    //OAuth2UserService 설정
    private final DefaultOAuth2UserService oAuth2UserService;

    public SecurityConfig(DefaultOAuth2UserService oAuth2UserService) {
        this.oAuth2UserService = oAuth2UserService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        http
                //OAuth2 소셜로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .clientRegistrationRepository(clientRegistrationRepository)
                        .authorizedClientRepository(authorizedClientRepository())
                        .userInfoEndpoint(endpoint -> endpoint.userService(oAuth2UserService))
                        .successHandler(successHandler()))
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 카카오 로그인 관련 엔드포인트 추가
                        .requestMatchers(
                                "/api/user/login",
                                "/api/user/join",
                                "/api/auth/token/refresh",
                                "/login/oauth2/code/**",
                                "/oauth2/authorization/**",
                                "/oauth/callback/**",
                                "/api/oauth/kakao/**",
                                "/api/user/kakao-login",
                                "/api/store/**",
                                "/api/user/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) // JWT 필터 추가
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );


        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "https://kauth.kakao.com",
                "https://kapi.kakao.com",
                "http://localhost:8080"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));  // 모든 헤더 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    //Kakao 로그인 설정(자동설정이 안되서 임시로 수동 삽입, 스프링부트 2.0이상에선 자동생성이 안될수도 있다고함)
    //import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
    //현재 위 import로 생성가능 yml설정과 동일.
//    @Bean
//    public ClientRegistrationRepository clientRegistrationRepository() {
//        // Kakao ClientRegistration 설정
//        ClientRegistration kakao = ClientRegistration.withRegistrationId("kakao")
//                .clientId("714a575754949434c7f9e10bb527da9a")
//                .clientSecret("zAQRGb72z0JexxUESus4CMGV90BYP4Rs")
//                .redirectUri("http://localhost:8080/api/user/oauth2/callback/kakao")
//                .authorizationUri("https://kauth.kakao.com/oauth/authorize")
//                .tokenUri("https://kauth.kakao.com/oauth/token")
//                .userInfoUri("https://kapi.kakao.com/v2/user/me")
//                .userNameAttributeName("id")
//                .clientName("Kakao")
//                .authorizationGrantType(new AuthorizationGrantType("authorization_code"))
//                .scope("profile_nickname", "profile_image")
//                .build();
//
//        ClientRegistration google = ClientRegistration.withRegistrationId("google")
//                .clientId("679990079220-prfchh4nd9k9oit85na1guc84jk6pjje.apps.googleusercontent.com")
//                .clientSecret("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")
//                .redirectUri("http://localhost:8080/api/user/oauth2/callback/google")
//                .authorizationUri("https://accounts.google.com/o/oauth2/auth")
//                .authorizationGrantType(new AuthorizationGrantType("authorization_code"))
//                .tokenUri("https://oauth2.googleapis.com/token")
//                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
//                .scope("profile", "email")
//                .build();
//
//        return new InMemoryClientRegistrationRepository(kakao, google);
//    }

    //OAuth2 인증 후 사용자 정보를 저장할 메서드
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService(@Qualifier("OAuth2UserServiceImpl") DefaultOAuth2UserService oAuth2UserService) {
        return new CustomOAuth2UserService();
    }

    //클라이언트 인증 정보를 세션에 저장
    @Bean
    public OAuth2AuthorizedClientRepository authorizedClientRepository() {
        return new HttpSessionOAuth2AuthorizedClientRepository();
    }

    //로그인 성공시 호출 SecurityContext 저장관련
    @Bean
    public AuthenticationSuccessHandler successHandler() {
        return new CustomAuthenticationSuccessHandler();  // Custom handler에서 SecurityContext 설정
    }

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}