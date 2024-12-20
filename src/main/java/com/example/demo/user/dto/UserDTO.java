package com.example.demo.user.dto;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.coupon.dto.UserCouponDTO;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.entity.UserEntity.Grade;
import com.example.demo.user.entity.UserEntity.LoginType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO { // 사용자 & 관리자
    private Integer id;
    private String userId;
    private String name;
    private String pwd;
    private String email;
    private String tel;
    private LocalDate birth;
    private String addr1;
    private String addr2;
    private String zipcode;
    private String gender;
    private LoginType loginType = LoginType.MOIVO;
    private boolean admin = false; // 기본값 설정
    private Grade grade = Grade.LV1;
    private double height;
    private double weight;
    private List<UserCouponDTO> coupons;
    private int totalSpent; // 누적 구매 금액
    private int nextLevelTarget; // 다음 등급까지 남은 금액

    // Entity -> DTO 변환
    public static UserDTO toGetUserDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        dto.setPwd(entity.getPwd());
        dto.setEmail(entity.getEmail());
        dto.setTel(entity.getTel());
        dto.setBirth(entity.getBirth());
        dto.setAddr1(entity.getAddr1());
        dto.setAddr2(entity.getAddr2());
        dto.setZipcode(entity.getZipcode());
        dto.setGender(entity.getGender());
        dto.setLoginType(entity.getLoginType());
        dto.setAdmin(entity.isAdmin());
        dto.setGrade(entity.getGrade());
        dto.setHeight(entity.getHeight());
        dto.setWeight(entity.getWeight());
        return dto;
    }

    // 사용자 데이터 저장
    public static UserDTO toSaveUserDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        dto.setPwd(entity.getPwd());
        dto.setEmail(entity.getEmail());
        dto.setTel(entity.getTel());
        dto.setBirth(entity.getBirth());
        dto.setAddr1(entity.getAddr1());
        dto.setAddr2(entity.getAddr2());
        dto.setZipcode(entity.getZipcode());
        dto.setGender(entity.getGender());
        dto.setLoginType(entity.getLoginType());

        return dto;
    }

}
