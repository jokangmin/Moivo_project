package com.example.demo.coupon.service.impl;

import com.example.demo.coupon.dto.CouponDTO;
import com.example.demo.coupon.entity.CouponEntity;
import com.example.demo.coupon.entity.UserCouponEntity;
import com.example.demo.coupon.repository.UserCouponRepository;
import com.example.demo.coupon.service.CouponService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
public class CouponServiceImpl implements CouponService {

        @Autowired
        private UserCouponRepository userCouponRepository;

        @Override
        public CouponDTO getUserCoupons(int id) {
                UserCouponEntity userCoupon = userCouponRepository.findByUserEntity_Id(id);

                CouponEntity coupon = userCoupon.getCouponEntity(); // 쿠폰 정보만 가져오기
                return new CouponDTO(
                                coupon.getId(),
                                coupon.getName(),
                                coupon.getGrade(),
                                coupon.getDiscountType(),
                                coupon.getDiscountValue(),
                                coupon.getMinOrderPrice(),
                                coupon.getActive());
        }

}
