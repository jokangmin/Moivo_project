package com.example.demo.user.entity;

import java.time.LocalDate;

import com.example.demo.user.dto.UserDTO;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user")
public class UserEntity { // 사용자 & 관리자

    public enum LoginType {
        GOOGLE, KAKAO, MOIVO, ADMIN
    }

    public enum Grade {
        ADMIN, LV1, LV2, LV3, LV4, LV5
        // 관리자, 0, 10, 30, 50, 70
    }

    // 양방향 매핑시킴
    @OneToOne(mappedBy = "userEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private WishEntity wishEntity; // Wish와 연결

    @OneToOne(mappedBy = "userEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private CartEntity cartEntity; // Cart와 연결

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "userid", nullable = false, unique = true)
    private String userId;

    @Column(length = 30)
    private String name;
    private String pwd;

    @Column(length = 50)
    private String email;

    @Column(length = 13)
    private String tel;

    private LocalDate birth;
    private String addr1;
    private String addr2;

    @Column(length = 20)
    private String zipcode;

    @Column(length = 2)
    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoginType loginType = LoginType.MOIVO;

    @Column(name = "isAdmin", nullable = false)
    private boolean admin = false; // 기본값 설정

    // 등급 적용은 매달 1일
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Grade grade = Grade.LV1;
    private double height;
    private double weight;

    // DTO -> Entity

    // 사용자 데이터 출력
    public static UserEntity toGetUserEntity(UserDTO dto) {
        UserEntity entity = new UserEntity();
        entity.setId(dto.getId());
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
        entity.setPwd(dto.getPwd());
        entity.setEmail(dto.getEmail());
        entity.setTel(dto.getTel());
        entity.setBirth(dto.getBirth());
        entity.setAddr1(dto.getAddr1());
        entity.setAddr2(dto.getAddr2());
        entity.setZipcode(dto.getZipcode());
        entity.setGender(dto.getGender());
        entity.setLoginType(dto.getLoginType());
        entity.setAdmin(dto.isAdmin());
        entity.setGender(dto.getGender());
        entity.setHeight(dto.getHeight());
        entity.setWeight(dto.getWeight());

        return entity;
    }

    // 사용자 데이터 저장
    public static UserEntity toSaveUserEntity(UserDTO dto) {
        UserEntity entity = new UserEntity();
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
        entity.setPwd(dto.getPwd());
        entity.setEmail(dto.getEmail());
        entity.setTel(dto.getTel());
        entity.setBirth(dto.getBirth());
        entity.setAddr1(dto.getAddr1());
        entity.setAddr2(dto.getAddr2());
        entity.setZipcode(dto.getZipcode());
        entity.setGender(dto.getGender());
        entity.setLoginType(dto.getLoginType());

        return entity;
    }

    // Kakao 사용자 데이터 저장
    public static UserEntity toSaveKakaoUserEntity(UserDTO dto) {
        UserEntity entity = new UserEntity();

        entity.setUserId(dto.getUserId()); // userid
        entity.setName(dto.getName()); // 닉네임
        entity.setEmail(dto.getEmail()); // 닉네임

        // Kakao 로그인이므로 LoginType 설정
        entity.setLoginType(LoginType.KAKAO);

        return entity;
    }

}