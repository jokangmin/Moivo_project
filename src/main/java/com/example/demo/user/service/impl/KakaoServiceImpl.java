package com.example.demo.user.service.impl;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.demo.configuration.SocialConfiguration;
import com.example.demo.user.dto.KakaoTokenDTO;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.entity.UserEntity.LoginType;
import com.example.demo.user.service.KakaoService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Service
public class KakaoServiceImpl implements KakaoService {

    // 24.12.16 - uj
    // Access Token 요청
    @Override
    public KakaoTokenDTO getToken(String code, SocialConfiguration socialConfig) {
        System.out.println("[KakaoServiceImpl] getToken() 호출");
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        // Http Response Body 객체 생성
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code"); // 카카오 공식문서 기준 authorization_code 로 고정
        params.add("client_id", socialConfig.getKakaoClientId());
        params.add("redirect_uri", socialConfig.getKakaoRedirectUri());
        params.add("code", code);
        params.add("client_secret", socialConfig.getKakaoClientSecret());

        // 헤더와 바디 합치기 위해 Http Entity 객체 생성
        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);

        // 카카오로부터 Access token 받아오기
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> accessTokenResponse = rt.exchange(
                socialConfig.getKakaoTokenUri(), // "https://kauth.kakao.com/oauth/token"
                HttpMethod.POST,
                kakaoTokenRequest,
                String.class);

        // JSON Parsing (-> KakaoTokenDTO)
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        KakaoTokenDTO kakaoTokenDTO = null;
        try {
            kakaoTokenDTO = objectMapper.readValue(accessTokenResponse.getBody(), KakaoTokenDTO.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return kakaoTokenDTO;
    }

    // 24.12.16 - uj
    // 사용자 정보 요청
    @Override
    public UserDTO getUserInfo(String kakaoAccessToken, String kakaoUserInfoUri) {
        System.out.println("[KakaoServiceImpl] getUserInfo() 호출");

        // 카카오로부터 사용자 정보 받아오기
        RestTemplate rt = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + kakaoAccessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> accountInfoRequest = new HttpEntity<>(headers);

        ResponseEntity<String> accountInfoResponse = rt.exchange(
                kakaoUserInfoUri, // "https://kapi.kakao.com/v2/user/me"
                HttpMethod.POST,
                accountInfoRequest,
                String.class);

        // JSON -> UserDTO
        UserDTO userDTO = new UserDTO();
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(accountInfoResponse.getBody());

            // 사용자 정보 저장
            System.out.println("Kakao 제공 Json: " + jsonNode);

            // 사용자 pk & loginType & name & email
            userDTO.setLoginType(LoginType.KAKAO);
            userDTO.setUserId(jsonNode.get("id").toString().replaceAll("\"", "")); // 사용자 Id
            JsonNode kakaoAccountNode = jsonNode.get("kakao_account");
            userDTO.setName(kakaoAccountNode.get("profile")
                    .get("nickname")
                    .toString().replaceAll("\"", ""));
            userDTO.setEmail(kakaoAccountNode.get("email").toString().replaceAll("\"", ""));

            System.out.println("userDTO: " + userDTO);

            return userDTO;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }

    }

}
