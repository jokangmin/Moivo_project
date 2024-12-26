package com.example.demo.user.service.impl;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.coupon.dto.CouponDTO;
import com.example.demo.coupon.dto.UserCouponDTO;
import com.example.demo.coupon.entity.CouponEntity;
import com.example.demo.coupon.entity.UserCouponEntity;
import com.example.demo.coupon.repository.UserCouponRepository;
import com.example.demo.ncp.dto.NCPObjectStorageDTO;
import com.example.demo.payment.dto.PaymentDTO;
import com.example.demo.payment.dto.PaymentDetailDTO;
import com.example.demo.payment.entity.PaymentDetailEntity;
import com.example.demo.payment.entity.PaymentEntity;
import com.example.demo.payment.repository.PaymentDetailRepository;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;
import com.example.demo.qna.repository.QuestionRepository;
import com.example.demo.store.dto.ProductDTO;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.dto.WishDTO;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.entity.WishEntity;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.repository.WishRepository;
import com.example.demo.user.service.MypageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class MypageServiceImpl implements MypageService {
    @Autowired
    private UserRepository userRepository; // 사용자
    // @Autowired
    // private CouponRepository couponRepository;
    @Autowired
    private WishRepository wishRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentDetailRepository paymentDetailRepository;

    @Autowired
    private UserCouponRepository userCouponRepository;

    @Autowired
    private QuestionRepository questionRepository;

    // @Autowired
    // private AttendanceRepository attendanceRepository; // 출석

    // 마이페이지 사용자 정보 가져오기 - sumin
    @Override
    public UserDTO getUserInfo(int userId) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
        System.out.println(totalSpent);

        // 다음 등급까지 남은 금액 계산
        int nextLevelTarget;
        if (totalSpent >= 700000) {
            nextLevelTarget = 0; // 최고 등급
        } else if (totalSpent >= 500000) {
            nextLevelTarget = 700000 - totalSpent;
        } else if (totalSpent >= 300000) {
            nextLevelTarget = 500000 - totalSpent;
        } else if (totalSpent >= 100000) {
            nextLevelTarget = 300000 - totalSpent;
        } else {
            nextLevelTarget = 100000 - totalSpent;
        }

        // UserDTO 변환
        UserDTO userDTO = UserDTO.toGetUserDTO(userEntity);
        userDTO.setTotalSpent(totalSpent);
        userDTO.setNextLevelTarget(nextLevelTarget);
        userDTO.setGrade(userEntity.getGrade());

        // 쿠폰 정보 가져오기
        UserCouponEntity userCouponEntity = userCouponRepository.findByUserEntity_Id(userId);

        // UserCouponDTO 생성 및 조건 처리
        UserCouponDTO userCouponDTO = new UserCouponDTO();
        if (userCouponEntity != null) {
            if (userCouponEntity.getUsed()) {
                userCouponDTO.setCouponName("이미 사용한 쿠폰입니다.");
            } else if (userCouponEntity.getEndDate().isBefore(LocalDateTime.now())) {
                userCouponDTO.setCouponName("유효기간이 지난 쿠폰입니다.");
            } else {
                userCouponDTO = UserCouponDTO.toGUserCouponDTO(userCouponEntity);
            }
        }
            userDTO.setCoupon(userCouponDTO); // 쿠폰 정보 설정

        System.out.println("쿠폰 : " + userCouponDTO);
        System.out.println("누적 구매 금액: " + totalSpent);
        System.out.println("등급: " + userEntity.getGrade());
        System.out.println("다음 등급까지 남은 금액: " + nextLevelTarget);
        return userDTO;
    }

    // 성별에따른 상품 추천 리스트 가져오기 - sumin
    @Override
    public List<ProductDTO> getProductList(int userId) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String gender = userEntity.getGender(); // 사용자 성별 정보

        ProductEntity.Gender productGender;
        if ("M".equals(gender)) {
            productGender = ProductEntity.Gender.MAN; // 성별이 MAN인 경우
        } else if ("F".equals(gender)) {
            productGender = ProductEntity.Gender.WOMAN; // 성별이 WOMAN인 경우
        } else {
            productGender = ProductEntity.Gender.ALL; // 성별이 없거나 ALL인 경우
        }

        List<ProductEntity> productEntity;

        // 성별에 맞는 상품 목록을 가져오기 (삭제되지 않은 상품만 조회)
        if (productGender == ProductEntity.Gender.ALL) {
            productEntity = productRepository.findTop6ByGenderNotAndDeleteFalseOrderByIdDesc(ProductEntity.Gender.ALL); // 최신
                                                                                                                        // 상품
                                                                                                                        // 6개
        } else {
            productEntity = productRepository.findTop6ByGenderAndDeleteFalseOrderByIdDesc(productGender); // 성별에 맞는 최신
                                                                                                          // 상품 6개
        }

        // ProductEntity -> ProductDTO 변환
        List<ProductDTO> productDTOList = productEntity.stream()
                .map(ProductDTO::toGetProductDTO) // ProductEntity를 ProductDTO로 변환
                .collect(Collectors.toList());

        return productDTOList;
    }

    // @Override
    // public List<CouponDTO> getCouponList(int userseq) {
    // List<CouponEntity> couponEntities = couponRepository.findByUserId(userseq);
    // if (couponEntities.isEmpty()) {
    // throw new RuntimeException("No coupons found for the user.");
    // }
    // // map 내부에서 명시적으로 변환 메서드를 호출
    // return couponEntities.stream()
    // .map(entity -> CouponDTO.toGetCouponDTO(entity))
    // .collect(Collectors.toList());
    // }

    @Override
    public List<WishDTO> getWishlist(int id) {
        List<WishEntity> wishEntities = wishRepository.findByUserEntity_Id(id);
        if (wishEntities.isEmpty()) {
            throw new RuntimeException("사용자의 위시리스트가 없습니다.");
        }

        // WishEntity -> WishDTO 변환
        List<WishDTO> wishDTOList = new ArrayList<>();
        for (WishEntity wishEntity : wishEntities) {
            WishDTO wishDTO = WishDTO.toGetWishDTO(wishEntity);
            wishDTOList.add(wishDTO);
        }
        return wishDTOList;
    }

    @Transactional
    @Override
    public Page<PaymentDTO> getOrders(int id, Pageable pageable) {
        Pageable sortedByIdDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "id"));
        Page<PaymentEntity> orderEntities = paymentRepository.findByUserEntity_Id(id, sortedByIdDesc);
        List<PaymentDTO> list = new ArrayList<>();
        NCPObjectStorageDTO ncpDTO = new NCPObjectStorageDTO();

        if (orderEntities == null || orderEntities.isEmpty()) {
            throw new RuntimeException("해당 사용자에 대한 주문 내역이 존재하지 않습니다.");
        }

        for (PaymentEntity paymentEntity : orderEntities) {
            ProductEntity productEntity = paymentEntity.getPaymentDetailList().get(0).getProductEntity();
            PaymentDTO paymentDTO = PaymentDTO.toGetOrderDTO(paymentEntity);
            paymentDTO.setProductImg(ncpDTO.getURL() + productEntity.getImg());
            paymentDTO.setProductName(productEntity.getName());
            list.add(paymentDTO);
        }

        // PaymentEntity를 PaymentDTO로 변환
        return new PageImpl<>(list, pageable, orderEntities.getTotalElements());
    }

    // mypage order detail info 가지고 오기 - 12/17 강민
    @Transactional
    @Override
    public List<PaymentDTO> getOrderInfo(String tosscode) {
        List<PaymentEntity> orderEntities = paymentRepository.findByTossCode(tosscode);
        if (orderEntities == null || orderEntities.isEmpty()) {
            throw new RuntimeException("해당 사용자에 대한 주문 내역이 존재하지 않습니다.");
        }

        // PaymentEntity를 PaymentDTO로 변환
        return orderEntities.stream()
                .map(PaymentDTO::toGetOrderDTO)
                .collect(Collectors.toList());
    }

    // mypage order detail list 가지고 오기 - 12/17 강민
    @Transactional
    @Override
    public List<PaymentDetailDTO> getOrderDetails(int paymentId) {
        List<PaymentDetailEntity> orderDetailEntities = paymentDetailRepository.findByPaymentEntityId(paymentId);
        if (orderDetailEntities == null || orderDetailEntities.isEmpty()) {
            throw new RuntimeException("해당 사용자에 대한 주문 내역이 존재하지 않습니다.");
        }

        // PaymentEntity를 PaymentDTO로 변환
        List<PaymentDetailDTO> paymentDetailDTOList = new ArrayList<>();
        for (PaymentDetailEntity paymentDetailEntity : orderDetailEntities) {
            PaymentDetailDTO paymentDetailDTO = PaymentDetailDTO.toGetOrderDetailDTO(paymentDetailEntity);
            paymentDetailDTOList.add(paymentDetailDTO);
        }
        System.out.println("주문상세내역 = " + paymentDetailDTOList);
        return paymentDetailDTOList;
    }

    // 나의 문의 목록 조회 12/18 작업 - 강민
    @Transactional
    @Override
    public Page<QuestionDTO> getMyQuestion(int id, Pageable pageable) {
        Pageable sortedByIdDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "id"));
        Page<QuestionEntity> questionEntities = questionRepository.findByUserEntity_Id(id, sortedByIdDesc);
        if (questionEntities == null || questionEntities.isEmpty()) {
            throw new RuntimeException("해당 사용자에 대한 주문 내역이 존재하지 않습니다.");
        }

        // PaymentEntity를 PaymentDTO로 변환
        List<QuestionDTO> questionDTOList = new ArrayList<>();
        for (QuestionEntity questionEntity : questionEntities) {
            QuestionDTO questionDTO = QuestionDTO.toGetQuestionDTO(questionEntity);
            questionDTOList.add(questionDTO);
        }

        return new PageImpl<>(questionDTOList, pageable, questionEntities.getTotalElements());
    }

}