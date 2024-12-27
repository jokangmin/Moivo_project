package com.example.demo.user.service.impl;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.configuration.SocialConfiguration;
import com.example.demo.user.dto.KakaoTokenDTO;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.service.KakaoService;
import com.example.demo.user.service.SocialService;
import com.example.demo.user.service.UserService;

import jakarta.transaction.Transactional;

@Service
public class SocialServiceImpl implements SocialService {

    @Autowired
    private SocialConfiguration socialConfig;

    @Autowired
    private KakaoService kakaoService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // 24.12.16 - uj
    // 카카오 승인 URI 반환
    @Override
    public String getKakaoURI() {
        System.out.println(socialConfig.getKakaoAuthorizationUri());
        return socialConfig.getKakaoAuthorizationUri();
    }

    // 24.12.16 - uj
    // 카카오 인가코드로 토큰 요청
    @Transactional
    @Override
    public Map<String, Object> getKakaoLogin(String code) {
        System.out.println("[SocialServiceImpl] getKakaoLogin() 호출");

        // 1. Access Token 요청
        KakaoTokenDTO kakaoTokenDTO = kakaoService.getToken(code, socialConfig);

        // 2. 사용자 정보 요청
        UserDTO userKakaoInfoDTO = kakaoService.getUserInfo(kakaoTokenDTO.getAccess_token(),
                socialConfig.getKakaoUserInfoUri());
        if (userKakaoInfoDTO == null) {
            throw new NullPointerException("카카오 서버에서 사용자 정보 추출 실패");
        }

        // 3. 신규 회원 vs 기존 회원
        Optional<UserEntity> checkUserOptional = userRepository.findByUserId(userKakaoInfoDTO.getUserId());
        UserEntity userKakaoEntity = new UserEntity();
        if (checkUserOptional == null || checkUserOptional.isEmpty()) {
            // 신규 회원 >> 회원가입 진행
            userKakaoEntity = userService.insertInit(UserEntity.toSaveKakaoUserEntity(userKakaoInfoDTO));
            System.out.println("신규 회원 >> pk: " + userKakaoEntity.getId() +
                    " & userid: " + userKakaoEntity.getUserId());
        } else {
            // 기존 회원 >> 로그인 성공
            System.out.println("기존 회원 >> pk: " + checkUserOptional.get().getId() +
                    " & userid: " + checkUserOptional.get().getUserId());
            userKakaoEntity = checkUserOptional.get();
        }

        // 4. Moivo JWT Token 발급
        Map<String, Object> loginResult = userService.loginResponseData(userKakaoEntity);
        return loginResult;
    }

}
