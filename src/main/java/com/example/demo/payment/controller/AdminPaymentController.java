package com.example.demo.payment.controller;

import java.util.Map;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.payment.service.AdminPaymentService;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/admin/payment")
public class AdminPaymentController {

    @Autowired
    private AdminPaymentService adminPaymentService;

    // 24.12.13 - uj
    // 판매 현황
    @GetMapping("")
    public ResponseEntity<?> paymentStatus() {
        try {
            Map<String, Object> map = adminPaymentService.paymentStatus();
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }
    }

    // 24.12.13 - uj
    // 배송송 현황
    @GetMapping("/delivery")
    public ResponseEntity<?> deliveryStatus() {
        try {
            Map<String, Object> map = adminPaymentService.deliveryStatus();
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }
    }

}
