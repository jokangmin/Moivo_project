package com.example.demo.email.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.email.dto.EmailDTO;
import com.example.demo.email.dto.OrderDetails;
import com.example.demo.email.service.EmailService;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/mail")
@RestController
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private static final String FROM_ADDRESS = "jomin5151@gmail.com";
    //private static final String toAddress = "jomin5151@gmail.com";

    @PostMapping("/success")
    public ResponseEntity<String> sendPaymentSuccessMail(@RequestBody OrderDetails orderDetails) {
        try {
            String mailSubject = "결제가 완료되었습니다! 상품을 안전히 배송해드릴게요.";
            String mailContent = String.format(
                "<html>" +
                "<body style='font-family: Italiana, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;'>" +
                "<div style='background-color: #988C73; color: white; text-align: center; padding: 10px;'>" +
                "    <h1 style='margin: 0;'>주문 확인</h1>" +
                "</div>" +
                "<div style='margin: 50px auto; padding: 20px; width: 70%%; background: #F6F2EE; border: 1px solid #988C73; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);'>" +
                "    <h2 style='color: #2c3e50; text-align: center;'>안녕하세요, %s님!</h2>" +
                "    <table style='width: 100%%; border-collapse: collapse; margin: 20px 0;'>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>주문 번호</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>결제자</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>상품 이름</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>결제 금액</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s 원</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c;'>배송지</th>" +
                "            <td style='padding: 10px;'>%s</td>" +
                "        </tr>" +
                "    </table>" +
                "    <p style='text-align: center; color: #16a085; font-weight: bold;'>배송 상태: %s</p>" +
                "    <p style='text-align: center; margin-top: 20px;'>감사합니다.</p>" +
                "</div>" +
                "</body>" +
                "</html>",
                orderDetails.getCustomerName(),
                orderDetails.getOrderId(),
                orderDetails.getCustomerName(),
                orderDetails.getOrderName(),
                orderDetails.getAmount(),
                orderDetails.getAddr(),
                orderDetails.getDeliverystatus()
            );

            emailService.sendMail(new EmailDTO(orderDetails.getToAddress(), FROM_ADDRESS, mailSubject, mailContent, true));

            return ResponseEntity.ok("Email sent successfully.");
        } catch (Exception e) {
            logger.error("Failed to send email", e);
            return ResponseEntity.status(500).body("Failed to send email.");
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> sendCancelMail(@RequestBody OrderDetails orderDetails) {
        logger.info("Cancel mail endpoint called with data: {}", orderDetails);
        try {
            String mailSubject = "주문 취소가 완료되었습니다..";
            String mailContent = String.format(
                "<html>" +
                "<body style='font-family: Italiana, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;'>" +
                "<div style='background-color: #988C73; color: white; text-align: center; padding: 10px;'>" +
                "    <h1 style='margin: 0;'>주문 취소 확인 이메일</h1>" +
                "</div>" +
                "<div style='margin: 50px auto; padding: 20px; width: 70%%; background: #F6F2EE; border: 1px solid #988C73; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);'>" +
                "    <h2 style='color: #2c3e50; text-align: center;'>안녕하세요, %s님</h2>" +
                "    <table style='width: 100%%; border-collapse: collapse; margin: 20px 0;'>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>주문 번호</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>결제자</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>상품 이름</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s 및 상품</td>" +
                "        </tr>" +
                "        <tr>" +
                "            <th style='text-align: left; padding: 10px; background: #F6F2EE; color: #2f2e2c; border-bottom: 1px solid #988C73;'>결제 금액</th>" +
                "            <td style='padding: 10px; border-bottom: 1px solid #988C73;'>%s 원</td>" +
                "        </tr>" +
                "    </table>" +
                "    <p style='text-align: center; color: #16a085; font-weight: bold;'>배송 상태: 주문 취소</p>" +
                "    <p style='text-align: center; margin-top: 20px;'>주문 취소 상태를 확인해주세요.</p>" +
                "</div>" +
                "</body>" +
                "</html>",
                orderDetails.getCustomerName(),
                orderDetails.getOrderId(),
                orderDetails.getCustomerName(),
                orderDetails.getOrderName(),
                orderDetails.getAmount()
            );

            emailService.sendMail(new EmailDTO(orderDetails.getToAddress(), FROM_ADDRESS, mailSubject, mailContent, true));

            return ResponseEntity.ok("Email sent successfully.");
        } catch (Exception e) {
            logger.error("Failed to send email", e);
            return ResponseEntity.status(500).body("Failed to send email.");
        }
    }
}
