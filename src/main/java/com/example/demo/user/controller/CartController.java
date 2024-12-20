package com.example.demo.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.user.service.CartService;


import java.util.Map;

@RestController
@RequestMapping("/api/user/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @Autowired
    private JwtUtil jwtUtil;

    // 장바구니에 상품 추가 11.26 - yjy (포스트맨 성공) ,, 12.11 - sc 수정
    // 24.12.17 - 장바구니에 상품 중복 저장으로 인한 수정 - uj(수정정)
    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addProductCart(
            @PathVariable(name = "productId") int productId,
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "count") int count,
            @RequestParam(name = "size") String size) {

        try {
            String actualToken = token.substring(7);
            int userId = jwtUtil.getIdFromToken(actualToken);

            System.out.println("장바구니 추가 요청 - productId: " + productId
                    + ", userId: " + userId
                    + ", count: " + count
                    + ", size: " + size);

            boolean isSuccess = cartService.addProductCart(productId, userId, count, size);

            if (isSuccess) {
                return ResponseEntity.ok(null);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("장바구니 추가 실패");
            }
        } catch (Exception e) {
            System.err.println("장바구니 추가 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
        }
    }

    // 장바구니 출력 11.26 - yjy (포스트맨 성공)
    @GetMapping("/list")
    public ResponseEntity<?> printCart(@RequestHeader("Authorization") String token) {
        try {
            String actualToken = token.substring(7);
            int userId = jwtUtil.getIdFromToken(actualToken);
            Map<String, Object> cartInfo = cartService.printCart(userId);
            return ResponseEntity.ok(cartInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 장바구니에서 상품 삭제 11.26 - yjy (포스트맨 성공)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable(name = "id") int userCartId,
            @RequestHeader("Authorization") String token) {

        try {
            String actualToken = token.substring(7);
            int userId = jwtUtil.getIdFromToken(actualToken);
            cartService.deleteProduct(userCartId, userId);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 장바구니 수량&사이즈 수정 11.28 sumin
    @PutMapping("/update/{cartId}")
    public ResponseEntity<Void> updateCartItem(
            @PathVariable(name = "cartId") int cartid,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> updates) {

        System.out.println(cartid);
        System.out.println(updates);

        try {
            String actualToken = token.substring(7);
            int userId = jwtUtil.getIdFromToken(actualToken);
            Integer count = (Integer) updates.get("count");
            String size = (String) updates.get("size");
            cartService.updateCartItem(cartid, count, size);

            return ResponseEntity.ok().build(); // 200
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }
}