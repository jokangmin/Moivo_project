package com.example.demo.coupon.entity;

import java.time.LocalDateTime;

import com.example.demo.user.entity.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "usercoupon")
public class UserCouponEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 사용자 쿠폰 고유 ID

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userid") // 사용자 정보와 연결
    private UserEntity userEntity; // 한 명의 사용자는 자신의 등급에 맞는 하나의 쿠폰만 가질 수 있음 (근데 일단은 ManyToOne으로 함.)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "couponid") // 쿠폰 정보와 연결
    private CouponEntity couponEntity; // 하나의 쿠폰은 여러 명의 사용자에게 발급될 수 있음

    @Column(name = "startdate")
    private LocalDateTime startDate; // 쿠폰 발급 시작 일자

    @Column(name = "enddate")
    private LocalDateTime endDate; // 쿠폰 발급 종료 일자

    @Column(name = "isused")
    private Boolean used; // 쿠폰 사용 여부
}
