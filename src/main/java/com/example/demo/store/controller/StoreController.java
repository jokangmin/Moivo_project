package com.example.demo.store.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.store.dto.ProductDTO;
import com.example.demo.store.dto.ReviewDTO;
import com.example.demo.store.service.ProductService;
import com.example.demo.store.service.ReviewService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ReviewService reviewService;

    // 상품 리스트, 카테고리별 검색 or 키워드별 검색 후 페이징처리-11/25-tang
    @GetMapping("")
    public ResponseEntity<?> getProductAll(
            @PageableDefault(page = 0, size = 16, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "block", required = false, defaultValue = "3") int block,
            @RequestParam(name = "sortby", required = false, defaultValue = "newest") String sortby,
            @RequestParam(name = "categoryid", required = false, defaultValue = "0") int categoryid,
            @RequestParam(name = "keyword", required = false) String keyword) {

        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("pageable", pageable); // 페이지 처리
        dataMap.put("block", block); // 한 페이지에 보여줄 숫자
        dataMap.put("sortby", sortby); // 정렬 기준
        dataMap.put("categoryid", categoryid); // 카테고리 정렬 기준
        dataMap.put("keyword", keyword); // 검색어

        Map<String, Object> map = productService.getProductList(dataMap);

        // 400 Bad Request: 잘못된 요청
        if (categoryid < 0 || sortby.isEmpty()) {
            return ResponseEntity.status(HttpStatus.SC_BAD_REQUEST).body("400 Bad Request");
        }

        // 401 Unauthorized: 인증되지 않은 사용자
        // 추후 토큰 사용시 사용예정
        // if (token == null || !isValidToken(token)) {
        // return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("401
        // Unauthorized");
        // }

        // 값 존재 X
        if (map == null)
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);

        // 값 존재 O
        return ResponseEntity.ok(map);
    }

    // 24.11.29 - 상품 상세 내용 추출 - uj
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductDetail(@PathVariable("productId") int productId) {
        System.out.println("상품 상세 조회 요청: " + productId);
        Map<String, Object> map = productService.getProduct(productId);
        // 값 존재 X
        if (map == null)
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);

        // 값 존재 O
        return ResponseEntity.ok(map);
    }

    // 상품의 리뷰 목록 조회 (인증 불필요) - 24.12.18
    @GetMapping("/{productId}/reviews")
    public ResponseEntity<?> getProductReviews(
            @PathVariable("productId") int productId,
            @PageableDefault(size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<ReviewDTO> reviews = reviewService.getReviewsByProductIdAndPage(productId, pageable);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 24.12.26 - uj
    // 날씨에 따른 옷 추천
    @GetMapping("/weather")
    public ResponseEntity<?> getWeatherMatchProduct(
            @RequestParam(name = "sortby", required = false, defaultValue = "1") int sortby) {

        try {
            Map<String, List<ProductDTO>> map = productService.getWeatherMatchProduct(sortby);
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);
        }

    }

}