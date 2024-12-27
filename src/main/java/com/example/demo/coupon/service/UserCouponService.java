package com.example.demo.coupon.service;

public interface UserCouponService {
    public void registerCouponForNewUser(int userId);
    public void updateCouponByUserAndGrade(int userId, String grade);
}
