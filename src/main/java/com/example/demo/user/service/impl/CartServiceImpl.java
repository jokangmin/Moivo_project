package com.example.demo.user.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.store.dto.ProductDTO;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ProductStockEntity;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.store.repository.ProductStockRepository;
import com.example.demo.user.dto.UserCartDTO;
import com.example.demo.user.entity.CartEntity;
import com.example.demo.user.entity.UserCartEntity;
import com.example.demo.user.repository.CartRepository;
import com.example.demo.user.repository.UserCartRepository;
import com.example.demo.user.service.CartService;

import jakarta.transaction.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserCartRepository userCartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductStockRepository productStockRepository;

    // 24.12.17 - 장바구니에 상품 중복 저장으로 인한 수정 - uj (수정)
    // 장바구니에 상품 추가
    @Override
    public boolean addProductCart(int productId, int userId, int count, String size) {
        // 사용 변수 - uj (수정)
        UserCartEntity userCartEntity = null;
        ProductStockEntity.Size sizeEnum = ProductStockEntity.Size.valueOf(size.toUpperCase()); // 입력된 사이즈를 Enum으로 변환
        boolean isSuccess = false; // 반환값

        // 사용자 장바구니 가져오기
        CartEntity cartEntity = cartRepository.findByUserEntity_Id(userId)
                .orElseThrow(() -> new RuntimeException("사용자의 장바구니가 없습니다."));

        // 사용자 장바구니에 중복된 상품인지 확인 - uj (수정)
        for (UserCartEntity item : cartEntity.getUserCartList()) {
            // 장바구니 상품 PK & 사이즈
            if (item.getProductEntity().getId() == productId
                    && item.getSize().equals(sizeEnum)) {

                System.out.println("기존 장바구니 상품(" + productId + "), 사이즈 : " + size);
                userCartEntity = updateUserCartEntity(item, count, size, true);
                userCartRepository.save(userCartEntity);
                isSuccess = true;
            }
        }

        // UserCart에 상품 추가
        if (!isSuccess) {
            // 상품 정보 가져오기
            ProductEntity productEntity = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("해당 상품이 없습니다."));

            // 장바구니에 추가
            userCartEntity = new UserCartEntity();
            userCartEntity.setCartEntity(cartEntity);
            userCartEntity.setProductEntity(productEntity);
            userCartEntity.setCount(count);
            userCartEntity.setSize(sizeEnum);
            userCartRepository.save(userCartEntity);

            isSuccess = true;
        }

        return isSuccess;
    }

    // 장바구니 상품 출력
    @Override
    public Map<String, Object> printCart(int userId) {
        System.out.println("CartService - printCart 호출됨. userId: " + userId);

        Map<String, Object> cartMap = new HashMap<>();

        try {
            // 사용자의 장바구니 조회
            CartEntity cartEntity = cartRepository.findByUserEntity_Id(userId)
                    .orElseThrow(() -> new RuntimeException("사용자의 장바구니가 없습니다."));

            System.out.println("CartEntity 조회됨: " + cartEntity.getId());

            // 장바구니에 담긴 상품 목록 조회
            List<UserCartEntity> userCartList = cartEntity.getUserCartList();
            System.out.println("장바구니 상품 수: " + userCartList.size());

            // 장바구니 상품 필터링 및 DTO 변환
            List<UserCartDTO> cartList = userCartList.stream()
                    .filter(userCart -> !Boolean.TRUE.equals(userCart.getProductEntity().getDelete())) // 삭제된 상품 제외
                    .map(userCart -> {
                        ProductEntity product = userCart.getProductEntity();
                        ProductDTO productDTO = ProductDTO.toGetProductDTO(product);

                        // 재고 확인
                        ProductStockEntity stock = productStockRepository.findByProductEntityAndSize(
                                product,
                                userCart.getSize());

                        int stockCount = (stock != null) ? stock.getCount() : 0;

                        return new UserCartDTO(
                                userCart.getId(),
                                cartEntity.getId(),
                                productDTO,
                                userCart.getSize().name(),
                                userCart.getCount(),
                                stockCount,
                                stockCount <= 0);
                    })
                    .collect(Collectors.toList());

            cartMap.put("cartItems", cartList);
            cartMap.put("totalItems", cartList.size());

            System.out.println("반환되는 장바구니 아이템 수: " + cartList.size());

        } catch (Exception e) {
            System.err.println("장바구니 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("장바구니 조회 중 오류가 발생했습니다.", e);
        }

        return cartMap;
    }

    // 장바구니에서 상품 삭제
    @Override
    public void deleteProduct(int userCartId, int userId) {
        CartEntity cartEntity = cartRepository.findByUserEntity_Id(userId)
                .orElseThrow(() -> new RuntimeException("사용자의 장바구니가 없습니다."));

        UserCartEntity userCartEntity = cartEntity.getUserCartList().stream()
                .filter(userCart -> userCart.getId() == userCartId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("해당 상품이 장바구니에 없습니다."));

        // 삭제 처리
        cartEntity.getUserCartList().remove(userCartEntity);
        userCartRepository.delete(userCartEntity);
    }

    // 장바구니 상품 업데이트 11.28 sumin
    // 24.12.17 - 중복 부분 함수 처리: updateUserCartEntity() - uj (수정)
    @Override
    public UserCartDTO updateCartItem(int userCartId, Integer count, String size) {
        // 장바구니 항목 확인
        UserCartEntity userCartEntity = userCartRepository.findById(userCartId)
                .orElseThrow(() -> new RuntimeException("해당 장바구니 항목이 없습니다."));

        // 사이즈 업데이트 & 수량 업데이트 - uj(수정, 함수 처리)
        userCartEntity = updateUserCartEntity(userCartEntity, count, size, false);
        // // 사이즈 업데이트
        // if (size != null) {
        // ProductStockEntity.Size sizeEnum =
        // ProductStockEntity.Size.valueOf(size.toUpperCase());
        // ProductStockEntity stockEntity =
        // productStockRepository.findByProductEntityAndSize(
        // userCartEntity.getProductEntity(), sizeEnum);

        // if (stockEntity == null || stockEntity.getCount() < (count != null ? count :
        // userCartEntity.getCount())) {
        // throw new RuntimeException("해당 사이즈의 재고가 부족합니다.");
        // }
        // userCartEntity.setSize(sizeEnum);
        // }

        // // 수량 업데이트
        // if (count != null) {
        // if (userCartEntity.getSize() != null) {
        // ProductStockEntity stockEntity =
        // productStockRepository.findByProductEntityAndSize(
        // userCartEntity.getProductEntity(), userCartEntity.getSize());
        // if (stockEntity.getCount() < count) {
        // throw new RuntimeException("재고가 부족합니다.");
        // }
        // }
        // userCartEntity.setCount(count);
        // }

        // 업데이트된 데이터 저장
        userCartRepository.save(userCartEntity);

        // 재고 수량 계산
        int stockCount = 0;
        for (ProductStockEntity stock : userCartEntity.getProductEntity().getStockList()) {
            if (stock.getSize().equals(userCartEntity.getSize())) {
                stockCount = stock.getCount();
                break;
            }
        }

        // DTO 생성
        ProductDTO productDTO = ProductDTO.toGetProductDTO(userCartEntity.getProductEntity());
        return new UserCartDTO(
                userCartEntity.getId(),
                userCartEntity.getCartEntity().getId(),
                productDTO,
                userCartEntity.getSize().name(),
                userCartEntity.getCount(),
                stockCount,
                stockCount <= 0 // 품절 여부
        );
    }

    // 24.12.17 - uj
    // 장바구니 화면에서 수량 변경 & 상품 상세 화면에서 장바구니 담기
    public UserCartEntity updateUserCartEntity(
            UserCartEntity userCartEntity,
            int count, String size,
            boolean isUpdate) {

        if (size != null && count > 0) {
            System.out.println(
                    "기존 장바구니 상품(" + userCartEntity.getProductEntity().getId() + ") 수량 변경\n"
                            + "기존 수량: " + userCartEntity.getCount());

            // 특정 상품의 특정 사이즈에 해당하는 stockEntity 추출
            ProductStockEntity.Size sizeEnum = ProductStockEntity.Size.valueOf(size.toUpperCase());
            ProductStockEntity stockEntity = productStockRepository.findByProductEntityAndSize(
                    userCartEntity.getProductEntity(), sizeEnum);

            // 사이즈 업데이트
            // stockEntity 존재 X or 재고 수량 < 선택 수량
            if (stockEntity == null || stockEntity.getCount() < (count > 0 ? count : userCartEntity.getCount())) {
                throw new RuntimeException("해당 사이즈의 재고가 부족합니다.");
            }
            userCartEntity.setSize(sizeEnum);

            // 상품 수량 업데이트
            if (isUpdate) { // 상품 상세 화면에서 장바구니 담기
                // count가 상품 수량을 넘어가지 않도록

                // 기존 장바구니 수량 + 추가 수량
                count = stockEntity.getCount() < userCartEntity.getCount() + count ? stockEntity.getCount()
                        : userCartEntity.getCount() + count;
            }
            userCartEntity.setCount(count);

            System.out.println(
                    "기존 장바구니 상품(" + userCartEntity.getProductEntity().getId() + ") 수량 변경\n"
                            + "수정된 수량: " + userCartEntity.getCount());
        }

        // 수량 업데이트
        // if (count > 0) {
        // if (userCartEntity.getSize() != null) {
        // // 특정 상품의 특정 사이즈에 해당하는 stockEntity 추출
        // ProductStockEntity stockEntity =
        // productStockRepository.findByProductEntityAndSize(
        // userCartEntity.getProductEntity(), userCartEntity.getSize());

        // //
        // if (stockEntity.getCount() < count) {
        // throw new RuntimeException("재고가 부족합니다.");
        // }
        // }

        // System.out.println(
        // "기존 장바구니 상품(" + userCartEntity.getProductEntity().getId() + ") 수량 변경\n"
        // + "기존 수량: " + userCartEntity.getCount());
        // if (isUpdate) {
        // // 상품 상세 화면에서 장바구니 담기
        // // 기존 장바구니 수량 + 추가 수량
        // userCartEntity.setCount(userCartEntity.getCount() + count);
        // } else {
        // // 장바구니 화면에서 수량 변경
        // userCartEntity.setCount(count);
        // }
        // System.out.println("수정된 수량: " + userCartEntity.getCount());
        // }

        return userCartEntity;
    }
}