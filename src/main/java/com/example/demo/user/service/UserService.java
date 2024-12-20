package com.example.demo.user.service;

import java.util.List;
import java.util.Map;

import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.entity.UserEntity;

public interface UserService {
    public int insert(UserDTO user);

    public Map<String, Object> login(String userId, String pwd);

    public void logout(String accesstoken, String refreshToken);

    public List<UserDTO> findAllUsers(); // 모든 사용자 조회

    public void updateUserGrade(int userId, String newGrade); // 사용자 등급 업데이트

    public void updateUserGradeBasedOnPurchase(int userId);

    public boolean validateToken(String token); // 토큰 검사 _241126_sc

    public Map<String, Object> getUserDataFromToken(String token); // 토큰에서 사용자 데이터 추출 _241127_sc

    public Map<String, Object> refreshUserToken(String userId); // 사용자 토큰 갱신 _241127_sc

    public UserEntity authenticate(String userId, String password);

    // public Optional<UserEntity> findUserById(Integer userId);

    // 사용자 정보 조회 메소드 추가
    public UserDTO findUserById(String userId);

    // 회원정보 수정 - sumin (2024.12.12)
    public void updateUserInfo(UserDTO userDTO);

    public boolean checkPassword(int userId, String password);

    public void deleteUser(int userId);


    public boolean isUserAdmin(int id);

    // 24.12.16 - uj
    // 회원 가입 시, 초기화 (소셜 & Moivo 로그인 공통 사용)
    public UserEntity insertInit(UserEntity userEntity);

    // 24.12.16 - uj
    // JWT 토큰 생성 & 응답 데이터
    public Map<String, Object> loginResponseData(UserEntity user);


    int idCheck(String userid);
}
