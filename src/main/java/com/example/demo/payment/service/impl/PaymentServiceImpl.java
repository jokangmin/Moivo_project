package com.example.demo.payment.service.impl;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.amazonaws.services.kms.model.NotFoundException;
import com.example.demo.coupon.entity.UserCouponEntity;
import com.example.demo.coupon.repository.UserCouponRepository;
import com.example.demo.coupon.service.UserCouponService;
import com.example.demo.payment.dto.PaymentDTO;
import com.example.demo.payment.dto.PaymentDetailDTO;
import com.example.demo.payment.entity.PaymentDetailEntity;
import com.example.demo.payment.entity.PaymentEntity;
import com.example.demo.payment.repository.PaymentDetailRepository;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.payment.service.PaymentService;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ProductStockEntity;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.user.entity.CartEntity;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.CartRepository;
import com.example.demo.user.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class PaymentServiceImpl implements PaymentService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentDetailRepository detailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserCouponRepository userCouponRepository;

    @Autowired
    private UserCouponService userCouponService;

    // 24.12.19 - 상품 테이블에 재고 상태 변경 - uj (수정)
    // 24.12.12 - uj
    // 결제 정보 저장
    @Override
    @Transactional
    public void savePaymentInfo(Map<String, Object> map) {

        // 0. Data 추출
        // 0-1. Json -> PaymentDTO 변환
        System.out.println(map.get("payment"));
        PaymentDTO paymentDTO = convertToPaymentDTO(
                map.get("payment").toString(),
                map.get("tosscode").toString(),
                map.get("userId").toString());

        // 0-2. Json -> List<PaymentDetailDTO> 변환
        System.out.println(map.get("paymentDetail").toString());
        List<PaymentDetailDTO> detailDTOList = convertToPaymentDetailDTOList(map.get("paymentDetail").toString());

        // 0-3. Json -> isCartItem 변환
        Boolean isCartItem = Boolean.parseBoolean(map.get("isCartItem").toString());
        System.out.println("Json -> isCartItem: " + isCartItem);

        // 중복된 TOSS 코드 검사
        if (paymentRepository.existsByTossCode(paymentDTO.getTosscode())) {
            throw new RuntimeException("이미 처리된 결제 정보가 존재합니다. TOSS 코드: " + paymentDTO.getTosscode());
        }

        // 1, 필요한 Entity 추출
        UserEntity userEntity = userRepository.findById(paymentDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자 ID " + paymentDTO.getUserId() + "에 해당하는 사용자가 존재하지 않습니다."));
        CartEntity cartEntity = cartRepository.findByUserEntity_Id(userEntity.getId())
                .orElseThrow(() -> new RuntimeException("사용자 ID " + userEntity.getId() + "에 해당하는 장바구니가 존재하지 않습니다."));

        // 2. payment 저장
        paymentDTO.setCount(detailDTOList.size());
        PaymentEntity paymentEntity = paymentRepository.save(PaymentEntity.toSavePaymentEntity(paymentDTO,
                userEntity));

        // 3. paymentDetail 저장 & 장바구니에서 아이템 삭제 & 재고 수정
        for (PaymentDetailDTO detailDTO : detailDTOList) {
            // 3-1. paymentDetail 저장
            ProductEntity productEntity = productRepository.findById(detailDTO.getProductId()).orElseThrow();
            PaymentDetailEntity detailEntity = PaymentDetailEntity.toSavePaymentEntity(
                    detailDTO,
                    paymentEntity,
                    productEntity);
            detailRepository.save(detailEntity);

            // 3-2. 재고 수정
            int soldoutCount = 0;
            List<ProductStockEntity> stockEntiyList = productEntity.getStockList();
            for (ProductStockEntity stockEntity : stockEntiyList) {
                if (stockEntity.getSize() == detailDTO.getSize()) {
                    int stockCount = stockEntity.getCount() - detailDTO.getCount();
                    stockEntity.setCount(stockCount < 0 ? 0 : stockCount); // 재고 수정
                    soldoutCount += stockEntity.getCount() == 0 ? 1 : 0; // 사이즈 별 재고 0인것 개수 구하기
                }
            }

            // 3-3. 재고 상태 설정
            if (soldoutCount == 0) { // 모든 사이즈 재고: 0 이상
                productEntity.setStatus(ProductEntity.ProductStatus.EXIST);
            } else if (soldoutCount < stockEntiyList.size()) { // 일부 사이즈 재고 : 0
                productEntity.setStatus(ProductEntity.ProductStatus.SOMESOLDOUT);
            } else if (soldoutCount == stockEntiyList.size()) { // 모든 사이즈 재고 : 0
                productEntity.setStatus(ProductEntity.ProductStatus.SOLDOUT);
            }

            // 3-4. 재고 DB 반영
            productRepository.save(productEntity);
        }

        // 4. 장바구니에서 상품 삭제
        if (isCartItem) {
            cartEntity.getUserCartList() // 상품 리스트 가져오기
                    // removeIf : True인 원소 제거
                    .removeIf(userCartEntity -> detailDTOList.stream() // Stream : 데이터 읽기만 함.
                            // List에서 원소가 제거되어도 끝까지 읽음.
                            // anyMatch(조건) : 조건에 해당하면 True
                            .anyMatch(detailDTO -> userCartEntity.getId() == detailDTO.getUsercartId()));
        }

        // 4-1. 장바구니 DB에 반영
        cartRepository.save(cartEntity);

        // 5. 쿠폰 사용 여부 저장
        if (paymentDTO.getDiscount() > 0) {
            // 사용자에 해당하는 쿠폰 목록을 가져옵니다.
            List<UserCouponEntity> couponEntityList = userCouponRepository.findByUserEntity_Id(paymentDTO.getUserId());

            if (!couponEntityList.isEmpty()) {
                // 첫 번째 쿠폰을 가져와서 사용된 것으로 표시
                UserCouponEntity userCoupon = couponEntityList.get(0); // 쿠폰 하나만 사용되므로 첫 번째 쿠폰을 사용

                // 쿠폰이 아직 사용되지 않았고 유효하다면
                if (!userCoupon.getUsed()) {
                    userCoupon.setUsed(true); // 사용된 것으로 표시

                    // 영속성 컨텍스트에 저장
                    userCouponRepository.save(userCoupon); // 변경 사항 저장
                    System.out.println("Coupon used status updated to: " + userCoupon.getUsed());
                }
            }
        }

        // 6. 결제 후 등급 업데이트 - sumin (2024.12.16)
        updateUserGradeBasedOnPurchase(paymentDTO.getUserId());

        // 7. 결제 후 등급에 맞는 쿠폰 발급 - sumin (2024.12.16)
        String grade = userEntity.getGrade().name(); // 현재 사용자의 등급을 가져오기기
        userCouponService.updateCouponByUserAndGrade(paymentDTO.getUserId(), grade);
    }

    // 결제에 따른 등급 업데이트 - sumin (2024.12.16)
    @Override
    public void updateUserGradeBasedOnPurchase(int userId) {
        // 사용자 정보 조회
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 현재 날짜를 기준으로 해당 월의 결제 금액을 계산
        LocalDateTime now = LocalDateTime.now();
        YearMonth yearMonth = YearMonth.from(now);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay(); // 해당 월의 첫날 00:00
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59); // 해당 월의 마지막날 23:59

        // 해당 월에 해당하는 결제 금액 계산
        List<PaymentEntity> payments = paymentRepository.findByUserEntity_IdAndPaymentDateBetween(userId, startDate,
                endDate);
        int totalSpent = payments.stream()
                .mapToInt(payment -> (int) payment.getTotalPrice())
                .sum();

        // 결제 금액에 따른 등급 변경
        UserEntity.Grade newGrade = determineGradeBasedOnAmount(totalSpent);
        userEntity.setGrade(newGrade);

        System.out.println(newGrade);

        // 업데이트된 사용자 정보 저장
        userRepository.save(userEntity);
    }

    // 결제 금액에 따른 등급 결정
    private UserEntity.Grade determineGradeBasedOnAmount(int totalSpent) {
        if (totalSpent >= 700000) {
            return UserEntity.Grade.LV5;
        } else if (totalSpent >= 500000) {
            return UserEntity.Grade.LV4;
        } else if (totalSpent >= 300000) {
            return UserEntity.Grade.LV3;
        } else if (totalSpent >= 100000) {
            return UserEntity.Grade.LV2;
        } else {
            return UserEntity.Grade.LV1; // LV1: 일반회원
        }
    }

    // Json -> PaymentDTO
    public PaymentDTO convertToPaymentDTO(String json, String tossCode, String userId) {
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // JSON 문자열을 PaymentDTO로 변환
            PaymentDTO paymentDTO = objectMapper.readValue(json, PaymentDTO.class);

            paymentDTO.setTosscode(tossCode);
            paymentDTO.setUserId(Integer.parseInt(userId));

            // 결과 확인
            System.out.println("Json -> paymentDTO: " + paymentDTO);

            return paymentDTO; // 변환된 객체 반환
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("PaymentDTO 변환 중 오류 발생: ", e);
        }
    }

    // Json -> List<PaymentDetailDTO>
    public List<PaymentDetailDTO> convertToPaymentDetailDTOList(String paymentDetailJson) {
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // JSON 문자열을 List<PaymentDetailDTO>로 변환
            List<PaymentDetailDTO> paymentDetailList = objectMapper.readValue(
                    paymentDetailJson,
                    new TypeReference<List<PaymentDetailDTO>>() {
                    });

            // 결과 확인
            System.out.println(
                    "Json -> List<PaymentDetailDTO>: " + paymentDetailList + "\n Size: " + paymentDetailList.size());

            return paymentDetailList; // 변환된 리스트 반환
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("PaymentDetailDTO 변환 중 오류 발생", e);
        }
    }

    // 24.12.20 - uj
    // 주문 취소 - 결제 완료 & 준비 중일 경우에만 가능
    @Override
    public void cancelPayment(String tosscode, int paymentId) {
        PaymentEntity paymentEntity = paymentRepository.findByIdAndTossCode(paymentId, tosscode);

        if (paymentEntity == null)
            throw new NotFoundException(
                    "tosscode: " + tosscode + " & paymentId: " + paymentId + "에 해당하는 결제 내역을 찾지 못했습니다.");

        // 1. 재고 반영
        List<PaymentDetailEntity> detailEntitnyList = paymentEntity.getPaymentDetailList();
        for (PaymentDetailEntity detailEntity : detailEntitnyList) {
            // 구매 상품의 재고 리스트
            List<ProductStockEntity> paymentstockEntityList = detailEntity.getProductEntity().getStockList();
            for (ProductStockEntity stockEntity : paymentstockEntityList) {
                if (detailEntity.getSize().equals(stockEntity.getSize())) {
                    System.out.println("재고 반영 전 >> 상품 번호: " + stockEntity.getProductEntity().getId() +
                            "사이즈: " + stockEntity.getSize() +
                            "재고: " + stockEntity.getCount());
                    System.out.println("재고 반영 할 값 >> " +
                            "사이즈: " + stockEntity.getSize() +
                            "재고: " + stockEntity.getCount());

                    stockEntity.setCount(stockEntity.getCount() + detailEntity.getCount());

                    System.out.println("재고 반영 후 >> 상품 번호: " + stockEntity.getProductEntity().getId() +
                            "사이즈: " + stockEntity.getSize() +
                            "재고: " + stockEntity.getCount());
                    break;
                }
            }
        }

        // 2. 쿠폰 사용 시, 쿠폰 돌려주기
        List<UserCouponEntity> userCouponEntity = userCouponRepository
                .findByUserEntity_Id(paymentEntity.getUserEntity().getId());
        if (userCouponEntity.size() == 0) {
            throw new NotFoundException("사용자 (" + paymentEntity.getUserEntity().getId() + ") 의 쿠폰 정보를 찾을 수 없습니다.");
        }

        if (paymentEntity.getDiscount() > 0 && userCouponEntity.get(0).getUsed()) {
            userCouponEntity.get(0).setUsed(false);
            userCouponRepository.save(userCouponEntity.get(0));
            System.out.println("사용자 (" +
                    paymentEntity.getUserEntity().getId() + ") 의 쿠폰 (" +
                    userCouponEntity.get(0).getId() +
                    ") 사용 값을 변경하였습니다. >> " +
                    userCouponEntity.get(0).getUsed());
        }

        // 3. 결제 내역 & 결제 상세 내역 삭제
        paymentRepository.delete(paymentEntity);
        System.out.println("결제를 취소하였습니다. ");
    }

}
