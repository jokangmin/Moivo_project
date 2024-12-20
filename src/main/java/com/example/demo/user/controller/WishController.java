package com.example.demo.user.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.user.service.WishService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/user/wish")
public class WishController {

    @Autowired
    private WishService wishService;

    @Autowired
    private JwtUtil jwtUtil;

    // wish에 상품 추가
    @GetMapping("/{productId}")
    public ResponseEntity<?> addProduct(@PathVariable(name = "productId") String productId, @RequestHeader("Authorization") String token) {
        System.out.println("productId = " + productId);
        String actualToken = token.substring(7);
        int userId = jwtUtil.getIdFromToken(actualToken);
        try {
            wishService.addProduct(Integer.parseInt(productId), userId);
            return ResponseEntity.status(HttpStatus.CREATED).build(); // 201 Created
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    // 찜한거 출력 - 24.11.25 - yjy
    @GetMapping("/list")
    public ResponseEntity<?> printWish(@RequestParam(name = "userid") int userId) {
        try {
            Map<String, Object> map = wishService.printWish(userId);
            if (map == null || map.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204 No Content
            }
            return ResponseEntity.ok(map); // 200 OK
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    // 찜한거 삭제 - 24.11.25 - yjy
    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable(name = "productId") int productId,
            @RequestParam(name = "userid") int userId) {
        try {
            wishService.deleteProduct(productId, userId);
            return ResponseEntity.ok().build(); // 200 OK
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

}