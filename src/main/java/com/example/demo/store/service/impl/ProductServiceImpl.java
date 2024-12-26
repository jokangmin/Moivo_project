package com.example.demo.store.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.demo.store.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.demo.store.entity.ProductCategoryEntity;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ProductImgEntity;
import com.example.demo.store.entity.ProductStockEntity;
import com.example.demo.store.entity.ReviewEntity;
import com.example.demo.store.entity.ProductEntity.Gender;
import com.example.demo.store.repository.ProductCategoryRepository;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.store.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    // 상품 상세 정보 출력 - uj
    @Override
    public Map<String, Object> getProduct(int productId) {
        Map<String, Object> map = new HashMap<>();

        // 1. 상품 정보 추출
        ProductEntity productEntity = productRepository.findById(productId).orElseThrow(null);
        map.put("product", ProductDTO.toGetProductDTO(productEntity));

        // 2. 이미지 추출
        List<ProductImgDTO> imgList = new ArrayList<>();
        for (ProductImgEntity imgEntity : productEntity.getImgList()) {
            ProductImgDTO imgDTO = ProductImgDTO.toGetProductImgDTO(imgEntity);
            imgList.add(imgDTO);

            System.out.println(imgDTO);
        }
        map.put("imgList", imgList);

        // 3. 리뷰 추출
        List<ReviewDTO> reviewList = new ArrayList<>();
        for (ReviewEntity reviewEntity : productEntity.getReviewList()) {
            ReviewDTO reviewDTO = ReviewDTO.toGetReviewDTO(reviewEntity);
            reviewList.add(reviewDTO);
            System.out.println(reviewDTO);
        }
        map.put("reviewList", reviewList);

        // 4. 재고 추출
        List<ProductStockDTO> stockList = new ArrayList<>();
        for (ProductStockEntity stockEntity : productEntity.getStockList()) {
            stockList.add(ProductStockDTO.toGetProductStockDTO(stockEntity));
        }
        map.put("stockList", stockList);

        return map;
    }

    // 상품 리스트, 카테고리별 검색 or 키워드별 검색 후 페이징처리-11/25-tang & 11/27 - 페이징 처리 수정 - uj
    // 24.12.23 - 카테고리 DB 변경으로 수정 - uj
    @Override
    public Map<String, Object> getProductList(Map<String, Object> dataMap) {
        Map<String, Object> map = new HashMap<>();

        // 1. 정보 세팅
        Pageable pageable = (Pageable) dataMap.get("pageable"); // 페이지 처리
        int block = Integer.parseInt(dataMap.get("block").toString()); // 한 페이지에 보여줄 숫자
        String sortby = dataMap.get("sortby").toString(); // 정렬 기준
        int categoryid = Integer.parseInt(dataMap.get("categoryid").toString()); // 카테고리 정렬 기준
        String keyword = null; // 검색어
        if (dataMap.get("keyword") != null)
            keyword = dataMap.get("keyword").toString();

        // 2. 기본 최신순 정렬 설정
        Sort sort = pageable.getSort();
        if (sortby.equals("priceHigh")) {
            // 가격 높은 순
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if (sortby.equals("priceLow")) {
            // 가격 낮은 순
            sort = Sort.by(Sort.Direction.ASC, "price");
        }
        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        // 3. 조건 별 상품 목록 가져오기( 컨트롤러에서 설정한 기본 개수는 15개)
        Page<ProductEntity> pageProductList = null;
        if (categoryid == 0 && keyword == null) {
            // 전체 상품 중 delete = false
            pageProductList = productRepository.findByDeleteFalse(pageable);
        } else if (categoryid != 0 && keyword == null) {
            // 특정 카테고리에서 delete = false
            pageProductList = productRepository.findBycategoryParentId(categoryid, pageable);
        } else if (categoryid == 0 && keyword != null) {
            // 키워드 검색에서 delete = false
            pageProductList = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else if (categoryid != 0 && keyword != null) {
            // 키워드 + 카테고리 검색에서 delete = false
            pageProductList = productRepository.findByNameContainingIgnoreCaseAndCategoryEntity_parentId(keyword,
                    categoryid,
                    pageable);
        }

        // 4. Entity -> DTO 변환
        List<ProductDTO> dtoList = pageProductList.getContent() // Java8 이상 사용시 Entity -> DTO 변환하는 방법
                .stream()
                .map(productEntity -> {
                    System.out.println("Product ID: " + productEntity.getId());
                    System.out.println("Original Image: " + productEntity.getImg());
                    return ProductDTO.toGetProductDTO(productEntity); // DTO로 변환
                })
                .collect(Collectors.toList());

        // 5. 페이징 숫자 처리
        int currentBlock = pageProductList.getNumber() / block;
        int startPage = currentBlock * block;
        int endPage = Math.min(startPage + block, pageProductList.getTotalPages());

        // 6. 결과 담기
        // 페이징 정보
        map.put("startPage", startPage); // 블럭 첫번째 페이지
        map.put("endPage", endPage); // 블럭 마지막 페이지
        map.put("isFirst", pageProductList.isFirst()); // 1 페이지 여부
        map.put("isLast", pageProductList.isLast()); // 마지막 페이지 여부
        map.put("hasPrevious", pageProductList.hasPrevious()); // 이전 페이지 여부
        map.put("hasNext", pageProductList.hasNext()); // 다음 페이지 여부
        map.put("totalPages", pageProductList.getTotalPages()); // 페이지 개수

        // 상품 관련 정보
        map.put("productList", dtoList);
        map.put("category", getParentCategory());
        System.out.println("getProductList: " + dtoList);
        return map;
    }

    // 24.12.23 - uj(수정)
    // 상품 카테고리 추출 - uj
    @Override
    public List<ProductCategoryDTO> getParentCategory() {
        List<ProductCategoryDTO> list = new ArrayList<>();
        Iterable<ProductCategoryEntity> categoryEntityList = categoryRepository.findByParentId(null);

        for (ProductCategoryEntity categoryEntity : categoryEntityList) {
            ProductCategoryDTO categoryDTO = ProductCategoryDTO.getCategoryDTO(categoryEntity);
            System.out.println(categoryDTO);
            list.add(categoryDTO);
        }

        return list;
    }

    // 24.11.29 - uj
    // 상품 성별 리스트 추출
    @Override
    public List<Gender> getGenders() {
        return Arrays.asList(Gender.values());
    }

    // 24.12.26 - uj
    // 날씨에 따른 옷 추천
    @Override
    public Map<String, List<ProductDTO>> getWeatherMatchProduct(int sortby) {
        /*
         * [ sortby ]
         * 1. 5도 이하
         * 패딩, 긴팔, 긴바지
         * 
         * 2. 5~20도
         * 자켓, 긴팔, 긴바지
         * 
         * 3. 20도 이상
         * 반팔, 반바지
         */
        Map<String, List<ProductDTO>> map = new HashMap<>();
        Map<String, Integer> sortByMap = new HashMap<>();
        // List<String> categoryNameList = List.of("outer", "top", "bottom");
        // List<Integer> sortByList = new ArrayList<>();

        // 카테고리 정렬
        switch (sortby) {
            case 1:
                sortByMap.put("outer", 4); // 패딩
                sortByMap.put("top", 7); // 긴팔
                sortByMap.put("bottom", 9); // 긴바지
                break;
            case 2:
                sortByMap.put("outer", 5); // 자켓
                sortByMap.put("top", 7); // 긴팔
                sortByMap.put("bottom", 9); // 긴바지
                break;
            case 3:
                sortByMap.put("top", 6); // 반팔
                sortByMap.put("bottom", 8); // 반바지
                break;
            default:
                break;
        }

        // 상품 추출
        for (String key : sortByMap.keySet()) {
            ProductCategoryEntity categoryEntity = categoryRepository.findById(sortByMap.get(key)).orElseThrow();
            List<ProductEntity> productList = productRepository.findByCategoryEntity(categoryEntity);

            // Entity -> DTO
            List<ProductDTO> dtoList = new ArrayList<>();
            for (ProductEntity entity : productList) {
                dtoList.add(ProductDTO.toGetProductDTO(entity));
            }
            map.put(key, dtoList);
        }

        return map;
    }

}