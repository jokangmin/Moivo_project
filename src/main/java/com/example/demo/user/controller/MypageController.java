package com.example.demo.user.controller;

import java.util.List;

import com.example.demo.qna.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.example.demo.payment.dto.PaymentDTO;
import com.example.demo.payment.dto.PaymentDetailDTO;
import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.store.dto.ProductDTO;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.dto.WishDTO;
import com.example.demo.user.service.MypageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Controller
@RequestMapping("/api/user/mypage")
public class MypageController {

    @Autowired
    private MypageService mypageService;

    @Autowired
    private QuestionService questionService;

    // 마이페이지 메인
    @GetMapping("")
    public ResponseEntity<String> mypageMain() {
        return ResponseEntity.ok().build();
    }

    // 회원 정보 (포스트맨 테스트 성공)
    @GetMapping("/info/{id}")
    public ResponseEntity<UserDTO> getUserInfo(@PathVariable(name = "id") int id) {
        System.out.println("회원정보 조회 컨트롤러");
        UserDTO userInfo = mypageService.getUserInfo(id);
        System.out.println("userInfo = " + userInfo);
        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<List<ProductDTO>> getProductList(@PathVariable(name = "id") int id) {
        System.out.println("dddd");
        List<ProductDTO> productList = mypageService.getProductList(id);
        return ResponseEntity.ok(productList);
    }

    // // 쿠폰 정보 조회
    // @GetMapping("/coupons/{id}")
    // public ResponseEntity<List<CouponDTO>> getCoupons(@PathVariable int userSeq) {
    //     List<CouponDTO> coupons = mypageService.getCoupons(userSeq);
    //     return ResponseEntity.ok(coupons);

    // }

    // 위시리스트 조회  (포스트맨 테스트 성공)

  /*  @GetMapping("/wishlist/{id}")
    public ResponseEntity<List<WishDTO>> getWishlist(@PathVariable int id) { 

            List<WishDTO> wishlist = mypageService.getWishlist(id);    충돌 난거!!!!!*/

    @GetMapping("/wishlist/{userid}")
    public ResponseEntity<List<WishDTO>> getWishlist(@PathVariable(name = "userid") int userid) {
        System.out.println("여기오나 ?? " + userid);
        List<WishDTO> wishlist = mypageService.getWishlist(userid);

        return ResponseEntity.ok(wishlist);

    }

    // 주문 내역 조회 12/16 완료 - 강민
    @GetMapping("/orders/{id}")
    public ResponseEntity<Page<PaymentDTO>> getOrders(
            @PathVariable(name = "id") int id,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "4") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")); // id 기준 내림차순 정렬 추가
            Page<PaymentDTO> ordersPage = mypageService.getOrders(id, pageable);
            System.out.println("Orders fetched: " + ordersPage);
            return ResponseEntity.ok(ordersPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    // 주문 기본 정보 조회 12/17 작업 - 강민
    @GetMapping("/orders/info/{tosscode}")
    public ResponseEntity<List<PaymentDTO>> getOrderInfo(@PathVariable(name = "tosscode") String tosscode) {
        try {
            List<PaymentDTO> orderInfo = mypageService.getOrderInfo(tosscode);
            System.out.println("Orders Info: " + orderInfo);
            return ResponseEntity.ok(orderInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 주문 디테일 목록 조회 12/17 작업 - 강민
    @GetMapping("/orders/details/{paymentId}")
    public ResponseEntity<List<PaymentDetailDTO>> getOrderDetails(@PathVariable(name = "paymentId") int paymentId) {
        try {
            List<PaymentDetailDTO> orderDetails = mypageService.getOrderDetails(paymentId);
            System.out.println("Orders details: " + orderDetails);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 나의 문의 목록 조회 12/18 작업 - 강민
    @GetMapping("/question/{id}")
    public ResponseEntity<Page<QuestionDTO>> getMyQuestion(
            @PathVariable(name = "id") int id,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "4") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
            Page<QuestionDTO> myQuestion = mypageService.getMyQuestion(id, pageable);
            System.out.println("my question : " + myQuestion);
            return ResponseEntity.ok(myQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //나의 문의 수정
    @PutMapping("/question/update")
    public ResponseEntity<String> updateQuestion(@RequestBody QuestionDTO questionDTO) {
        try {
            questionService.updateQuestion(questionDTO);
            return ResponseEntity.ok("200 Ok");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //나의 문의 삭제
    @DeleteMapping("/question/delete")
    public ResponseEntity<String> deleteQuestion(@RequestBody QuestionDTO questionDTO) {
        try{
        questionService.deleteQuestion(questionDTO);
        return ResponseEntity.ok("200 Ok");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}