package com.example.demo.user.service.impl;

//import com.example.demo.configuration.OAuthProperties;

import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.security.handler.CustomOAuth2User;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.service.SocialService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;


@Service
@RequiredArgsConstructor
//카카오 소셜
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService implements SocialService, AuthenticationSuccessHandler {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String clientSecret;
    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String redirectUri;

    String tokenUrl = "https://kauth.kakao.com/oauth/token";

    //private final OAuthProperties oAuthProperties; //현재 사용 X 추후 Google, Naver 사용시

    private final OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private JwtUtil jwtUtil;

//    public String getAccessTokenReturn() {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        if (authentication == null || !authentication.isAuthenticated()) {
//            // 인증되지 않은 사용자는 처리하지 않음
//            return "인증되지 않은 사용자입니다.";
//        }
//        System.out.println("getAccessTokenReturn authentication = " + authentication);
//        //받는거보면 getAccessTokenReturn authentication = AnonymousAuthenticationToken [Principal=anonymousUser, Credentials=[PROTECTED], Authenticated=true, Details=WebAuthenticationDetails [RemoteIpAddress=0:0:0:0:0:0:0:1, SessionId=65B989C1CD5A759B513365A16DE2C07F], Granted Authorities=[ROLE_ANONYMOUS]]
//        // Spring Security 쓰려면 Granted Authorities=[ROLE_ANONYMOUS] ROLE_USER 이런식으로 수정필요할듯
//
//        // 인증된 사용자의 액세스 토큰 처리
//        String url = "https://kauth.kakao.com/oauth/token";
//        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
//        return response.getBody();
//    }

    // 인증된 사용자의 액세스 토큰을 가져오는 메서드
    public String getUserAccessToken(Authentication authentication) {
        // 클라이언트 등록 ID (여기서는 kakao), 사용자 ID (authentication.getName())
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                "kakao",  // clientRegistrationId (application.yml에 설정된 이름)
                authentication.getName()  // 현재 인증된 사용자의 이름
        );
        System.out.println("Impl authorizedClient .getAccessToken().getTokenValue() = " + authorizedClient.getAccessToken().getTokenValue());

        // 액세스 토큰이 존재하면 반환
        if (authorizedClient != null) {
            return authorizedClient.getAccessToken().getTokenValue();
        }

        // 액세스 토큰이 없으면 메시지 반환
        return "Access token 없음";
    }

    //사용자가 카카오 계정으로 인증되었음을 증명받음
    //카카오 로그인 코드로 액세스 토큰 요청
    public String getAccessToken(String code, String provider) throws JsonProcessingException {

        // HTTP Header 생성
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // HTTP Body 생성
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("redirect_uri", redirectUri);
        body.add("code", code);

        // HTTP 요청 보내기
//        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(body, headers);
//        System.out.println("카카오 Token API 요청: " + kakaoTokenRequest);
//        RestTemplate rt = new RestTemplate();
//        ResponseEntity<String> response = rt.exchange(
//                "https://kauth.kakao.com/oauth/token",
//                HttpMethod.POST,
//                kakaoTokenRequest,
//                String.class
//        );

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            System.out.println("토큰 성공응답 = " + response.getBody());
        } else {
            System.out.println("에러 응답 = " + response.getBody());
        }

        // HTTP 응답 (JSON) -> 액세스 토큰 파싱
//        String responseBody = response.getBody();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(response.getBody().toString());

        System.out.println("jsonNode = " + jsonNode);
        return jsonNode.get("access_token").asText();
    }

    //카카오 로그인 처리
    public String handleKakaoLogin(String code) throws JsonProcessingException {
        String provider = "kakao";  // 카카오는 provider로 "kakao"를 사용
        // getAccessToken을 호출하여 액세스 토큰을 얻음
        return getAccessToken(code, provider);  // 액세스 토큰을 반환
    }

    public UserEntity handleKakaoUserInfo(String accessToken, String code) throws JsonProcessingException {
        // 액세스 토큰을 사용하여 카카오 사용자 정보를 가져옴
        //UserEntity userEntity = getKakaoEntity(accessToken);
        // 필수 파라미터 로그 출력
        System.out.println("client_id: " + clientId);
        System.out.println("redirect_uri: " + redirectUri);
        System.out.println("access_token: " + accessToken);
        System.out.println("code: " + code);

        // HTTP Header 생성
        HttpHeaders headers = new HttpHeaders();

        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Content-type", "application/json;charset=utf-8"); // JSON 요청

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();

        map.add("client_id", clientId);
        map.add("redirect_uri", redirectUri);
        map.add("accessToken", accessToken);
        map.add("grant_type", "authorization_code");
        map.add("code", "AUTHORIZATION_CODE");

        // HTTP 요청 보내기
        HttpEntity<MultiValueMap<String, String>> kakaoUserEntityRequest = new HttpEntity<>(map, headers);
        System.out.println("카카오 v2/user/me API 요청: " + kakaoUserEntityRequest);
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> response = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.POST,
                kakaoUserEntityRequest,
                String.class
        );

        // 응답 결과 출력
        System.out.println(response.getBody());

        // 응답 확인
        System.out.println("Impl Response Get Code: " + response.getStatusCode()); // 200 OK
        System.out.println("Impl Response Get Body: " + response.getBody()); //유저 정보

        // 만약 401 오류가 발생하면, 액세스 토큰을 갱신해야 함
        if (response.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            System.out.println("Access token expired, requesting a new one.");
            // refresh_token을 사용하여 새 토큰 발급
        } else if (response.getStatusCode() != HttpStatus.OK) {
            System.out.println("Failed to retrieve user info. Error code: " + response.getStatusCode());
        }

        // responseBody에 있는 정보 꺼내기
        String responseBody = response.getBody();
        System.out.println("responseBody = " + responseBody);
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(responseBody);

        //JSON에서 값 추출
        String userid = jsonNode.path("id").asText();
        String nickname = jsonNode.path("properties").path("nickname").asText();
        System.out.println("Impl handleKakaoUserInfo" + nickname);

        //UserEntity 설정
        UserEntity userEntity = new UserEntity();
        userEntity.setUserId(userid);
        userEntity.setName(nickname);

        // UserEntity에는 카카오 로그인 정보가 저장됨
        // JSON 형식으로 수신
        return userEntity;
    }

    public UserEntity loginWithKakao(String code, String provider) throws JsonProcessingException {
        // 1. 인증 코드로 액세스 토큰 발급
        System.out.println("Impl사용자 code = " + code); //ok
        System.out.println("reUrl = " + redirectUri); //http://localhost:5173/api/user/oauth2/callback/kakao
        String accessToken = null;
        try {
            accessToken = handleKakaoLogin(code);
        } catch (HttpClientErrorException e) {
            System.err.println("Login Error Code = " + e.getStackTrace());
            System.err.println("Login Response Body = " + e.getResponseBodyAsString());
            throw e;
        }
        System.out.println("Impl사용자 accessToken = " + accessToken); //Impl사용자 accessToken = mmgFmIy2AuCez6qcA-msAMQTiAmag25EAAAAAQorDKgAAAGTqoku563XznpenZPe

        // 2. 액세스 토큰으로 카카오 사용자 정보 조회
        UserEntity userEntity = handleKakaoUserInfo(accessToken, code);
        System.out.println("Impl사용자 userEntity = " + userEntity); //마지막 담겨있음

        // 3. 사용자 정보 추출
        String username = userEntity.getName();
        String userID = userEntity.getUserId();

        //getAccessTokenReturn();
        // 3. DB에 UserEntity 저장
        // 스프링 시큐리티 합치면 추후엔 ROLE_USER ROLE_KAKAO 이런식으로 바꿔줘야할듯?
        userEntity.setLoginType(UserEntity.LoginType.valueOf("KAKAO"));

        // 4 Security Debug
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            System.out.println("Impl Login Authenticated = " + authentication.getName());
        } else {
            System.out.println("Authentication failed or not set.");
        }
        System.out.println("Impl authentication = " + authentication);
        return userEntity;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void saveOrUpdateUser(UserEntity userEntity) throws ServletException, IOException {
        //사용자 존재여부 확인
        Optional<UserEntity> existingUser = userRepository.findByUserId(userEntity.getUserId());
        System.out.println("existingUser = " + existingUser);

        if (existingUser.isPresent()) {
            // 이미 존재하는 사용자일 경우 업데이트
            UserEntity userToUpdate = existingUser.get();
            userToUpdate.setName(userEntity.getName());
            userToUpdate.setLoginType(userEntity.getLoginType());
            // 필요한 다른 필드들 업데이트
            userRepository.save(userToUpdate);
            System.out.println("사용자 업데이트");
        } else {
            // 새로운 사용자 삽입
            userRepository.save(userEntity);
            System.out.println("사용자 있음");
        }
//        String userId, int id, int wishId, int cartId, boolean isAdmin)
        System.out.println("여기서 accessToken 발급필요");
//        UserEntity user = authenticate(String userId)
//        String accessToken = jwtUtil.generateAccessToken();

        // HttpServletRequest, HttpServletResponse 가져오기
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr != null) {
            HttpServletRequest request = attr.getRequest();
            HttpServletResponse response = attr.getResponse();

            // 로그인 상태로 설정 (세션에 사용자 정보 추가)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                CustomOAuth2User customUser = (CustomOAuth2User) oauthToken.getPrincipal();
                System.out.println("oauthToken = " + oauthToken);
                System.out.println("customUser = " + customUser);

                onAuthenticationSuccess(request, response, authentication);
            }
        }
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 0. OAuth2 인증 후 , Oauth2Auth2AuthenticationToken으로 SercurityContext에 저장
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

        // 1. SecurityContextHolder에 인증 정보 설정
        SecurityContextHolder.getContext().setAuthentication(oauthToken);

        System.out.println("저장하려는 = " + authentication.getPrincipal());
        // 2. 인증 정보를 세션에 저장
        request.getSession().setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        System.out.println("authentication.getName() = " + authentication.getName());
        //response.sendRedirect("redirect:" + "http://localhost:5173" + authentication.getName());

        // 3. 인증 성공 후 추가 작업
        System.out.println("SPRINGSECURITYCONTEXT");
        System.out.println(request.getSession().getAttribute("SPRING_SECURITY_CONTEXT"));

        request.getSession().setAttribute("user", authentication.getPrincipal());


//        super.onAuthenticationSuccess(request, response, authentication);
    }


}