package com.example.demo.payment.service;

import java.util.Map;

public interface PaymentService {

    public void savePaymentInfo(Map<String, Object> map);

    public void updateUserGradeBasedOnPurchase(int userId);

    public void cancelPayment(String tosscode, int paymentId);
}
