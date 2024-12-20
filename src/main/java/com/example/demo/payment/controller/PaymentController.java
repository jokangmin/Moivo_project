package com.example.demo.payment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.amazonaws.services.kms.model.NotFoundException;
import com.example.demo.payment.service.PaymentService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/user/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    // 24.12.11 ~ 13 - uj
    // Toss 결제 후, 테이블에 주문 내역 저장
    @PostMapping("")
    public ResponseEntity<?> savePaymentInfo(@RequestBody Map<String, Object> requestData) {
        try {
            System.out.println(requestData);
            paymentService.savePaymentInfo(requestData);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage()); // 중복 오류 메시지 반환
        }

    }

    // 24.12.20 - uj
    // 주문 취소 - 결제 완료 & 준비 중일 경우에만 가능
    @DeleteMapping("")
    public ResponseEntity<?> cancelPayment(
            @RequestParam(name = "Tosscode") String tosscode,
            @RequestParam(name = "orderCancelId") int paymentId) {
        try {
            System.out.println("결제 취소 DeleteMapping >>tosscode: " + tosscode + " & paymentId : " + paymentId);
            paymentService.cancelPayment(tosscode, paymentId);
        } catch (NotFoundException e) {

        } catch (Exception e) {

        }
        return null;
    }

}
