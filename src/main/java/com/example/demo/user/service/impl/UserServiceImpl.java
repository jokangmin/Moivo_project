package com.example.demo.user.service.impl;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.coupon.repository.UserCouponRepository;
import com.example.demo.coupon.service.UserCouponService;
import com.example.demo.jwt.prop.JwtProps;
import com.example.demo.jwt.service.BlacklistService;
import com.example.demo.jwt.service.RefreshTokenService;
import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.payment.entity.PaymentEntity;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.entity.CartEntity;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.entity.WishEntity;
import com.example.demo.user.entity.UserEntity.LoginType;
import com.example.demo.user.repository.CartRepository;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.repository.WishRepository;
import com.example.demo.user.service.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Transactional
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserCouponRepository userCouponRepository;
    @Autowired
    private WishRepository wishRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserCouponService userCouponService;

    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private BlacklistService blacklistService;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JwtProps jwtProps;

    // 24-12-16 - uj - 중복 부분 함수 처리 (수정)
    @Override
    public int insert(UserDTO userDTO) {
        //회원가입시 중복 ID 확인
        if (userRepository.existsByUserId(userDTO.getUserId())) {
            System.out.println("중복된 ID 있음. 가입불가");
            return 1;
        } else {
            //중복 ID 없음. 가입 로직 실행

            // DTO -> Entity 변환
            UserEntity userEntity = null;
            userDTO.setLoginType(LoginType.MOIVO);
            userEntity = UserEntity.toSaveUserEntity(userDTO);
            userEntity.setPwd(passwordEncoder.encode(userDTO.getPwd()));

            // 회원 가입 시, 초기화
            // 1. Wish & Cart 엔티티 생성 사용자 저장
            // 2. 사용자 정보 DB 저장
            // 3. 쿠폰 발급
            userEntity = insertInit(userEntity);

            return userEntity.getId();
        }
    }

    // 24.12.16 - uj (소셜 & Moivo 로그인 공통 사용, 함수처리)
    // 회원 가입 시, 초기화
    public UserEntity insertInit(UserEntity userEntity) {

        // Cart 엔티티 생성 및 연관관계 설정
        CartEntity cartEntity = new CartEntity();
        cartEntity.setUserEntity(userEntity);
        userEntity.setCartEntity(cartEntity); // 양방향 관계 설정

        // Wish 엔티티 생성 및 연관관계 설정
        WishEntity wishEntity = new WishEntity();
        wishEntity.setUserEntity(userEntity);
        userEntity.setWishEntity(wishEntity); // 양방향 관계 설정

        // 사용자 저장 getUserId추가
        UserEntity savedUser = userRepository.save(userEntity);
        System.out.println("신규 회원 데이터 저장 성공 >> " + savedUser.getUserId());

        // 회원가입 후, LV1 쿠폰 발급 2024.11.25 sumin
        System.out.println("쿠폰 발급 시도");
        userCouponService.updateCouponByUserAndGrade(savedUser.getId(), "LV1"); // LV1 쿠폰 발급
        System.out.println("회원가입 후 LV1 쿠폰 발급 완료");

        return userEntity;
    }
    /*
     * @Override
     * public Map<String, Object> login(String userId, String pwd) {
     * // 사용자 인증
     * UserEntity userEntity = authenticate(userId, pwd);
     *
     * // Wish와 Cart 정보 조회
     * WishEntity wishEntity =
     * wishRepository.findByUserEntity_Id(userEntity.getId())
     * .stream()
     * .findFirst()
     * .orElseGet(() -> {
     * WishEntity newWish = new WishEntity();
     * newWish.setUserEntity(userEntity);
     * return wishRepository.save(newWish);
     * });
     *
     * CartEntity cartEntity =
     * cartRepository.findByUserEntity_Id(userEntity.getId())
     * .orElseGet(() -> {
     * CartEntity newCart = new CartEntity();
     * newCart.setUserEntity(userEntity);
     * return cartRepository.save(newCart);
     * });
     *
     * // JWT 토큰 생성 (JwtUtil 사용)
     * String accessToken = jwtUtil.generateAccessToken(
     * userEntity.getUserId(),
     * userEntity.getId(),
     * wishEntity.getId(),
     * cartEntity.getId()
     * );
     *
     * String refreshToken = jwtUtil.generateRefreshToken(
     * userEntity.getUserId(),
     * userEntity.getId()
     * );
     *
     * // 결과 맵 생성
     * Map<String, Object> result = new HashMap<>();
     * result.put("accessToken", accessToken);
     * result.put("refreshToken", refreshToken);
     * result.put("id", userEntity.getId());
     * result.put("wishId", wishEntity.getId());
     * result.put("cartId", cartEntity.getId());
     *
     * return result;
     * }
     */

    // 24.12.16 - uj (소셜 & Moivo 로그인 공통 사용, 함수처리)
    // JWT 토큰 생성 & 응답 데이터
    public Map<String, Object> loginResponseData(UserEntity user) {
        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(user.getUserId(), user.getId(), user.isAdmin());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getId());

        // 응답 데이터
        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken); // 컨트롤러에서 제거될 예정
        result.put("userId", user.getUserId());
        result.put("id", user.getId());
        result.put("isAdmin", user.isAdmin());

        return result;
    }

    @Override
    public int idCheck(String userid) {
        if (userRepository.existsByUserId(userid)) {
            System.out.println("중복된 ID 있음. 가입불가");
            return 1;
        }
        return 0;
    }

    @Override
    public Map<String, Object> login(String userId, String pwd) {
        // 사용자 인증 로직
        UserEntity user = authenticate(userId, pwd);

        if (user == null) {
            throw new RuntimeException("Invalid credentials");
        }

        // 24.12.16 - uj (수정, 함수 처리)
        // JWT 토큰 생성 & 응답 데이터
        Map<String, Object> result = loginResponseData(user);
        return result;
    }

    @Override
    public void logout(String accessToken, String refreshToken) {
        // 토큰에서 Bearer 제거
        if (accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        // RefreshTokenService를 통해 refresh 토큰을 블랙리스트에 추가
        refreshTokenService.addTokenToBlacklist(refreshToken);

        // BlacklistService를 통해 access 토큰을 블랙리스트에 추가
        Date expiryDate = jwtUtil.getExpirationDateFromToken(accessToken);
        blacklistService.addToBlacklist(accessToken, expiryDate);
    }

    @Override
    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::toGetUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void updateUserGrade(int userId, String grade) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        userEntity.setGrade(UserEntity.Grade.valueOf(grade)); // 등급 업데이트
        userRepository.save(userEntity);
    }

    // 결제 후 등급 업데이트
    // userService.updateUserGradeBasedOnPurchase(paymentEntity.getUserEntity().getId());
    // 추후 결제 시스템 코드 구현 후 추가하기

    // 결제에 따른 등급 업데이트
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
        double totalPurchaseAmount = payments.stream()
                .mapToDouble(PaymentEntity::getTotalPrice)
                .sum();

        // 결제 금액에 따른 등급 변경
        UserEntity.Grade newGrade = determineGradeBasedOnAmount(totalPurchaseAmount);
        userEntity.setGrade(newGrade);

        // 업데이트된 사용자 정보 저장
        userRepository.save(userEntity);
    }

    // 결제 금액에 따른 등급 결정
    private UserEntity.Grade determineGradeBasedOnAmount(double totalAmount) {
        if (totalAmount >= 700000) {
            return UserEntity.Grade.LV5;
        } else if (totalAmount >= 500000) {
            return UserEntity.Grade.LV4;
        } else if (totalAmount >= 300000) {
            return UserEntity.Grade.LV3;
        } else if (totalAmount >= 100000) {
            return UserEntity.Grade.LV2;
        } else {
            return UserEntity.Grade.LV1; // LV1: 일반회원
        }
    }

    // 토큰 검사 _241126_sc
    @Override
    public boolean validateToken(String token) {
        try {
            // JWT 토큰 검증
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtProps.getSecretKey().getBytes()))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            System.out.println("토큰 검증 실패: " + e.getMessage());
            return false;
        }
    }

    // 토큰에서 사용자 데이터 추출 _241127_sc
    @Override
    public Map<String, Object> getUserDataFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtProps.getSecretKey().getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", claims.get("userId"));
            userData.put("roles", claims.get("roles"));
            return userData;
        } catch (Exception e) {
            throw new RuntimeException("토큰에서 사용자 정보를 추출할 수 없습니다.");
        }
    }

    // 사용자 토큰 갱신 _241127_sc
    @Override
    public Map<String, Object> refreshUserToken(String userId) {
        UserEntity userEntity = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // Wish와 Cart 정보 가져오기
        WishEntity wishEntity = wishRepository.findByUserEntity_Id(userEntity.getId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Wish 정보를 찾을 수 없습니다."));

        CartEntity cartEntity = cartRepository.findByUserEntity_Id(userEntity.getId())
                .orElseThrow(() -> new RuntimeException("Cart 정보를 찾을 수 없습니다."));

        // 새 토큰 생성
        byte[] signingKey = jwtProps.getSecretKey().getBytes();
        String jwt = Jwts.builder()
                .setSubject(String.valueOf(userEntity.getId()))
                .claim("userId", userEntity.getUserId())
                .claim("roles", userEntity.isAdmin() ? "ROLE_ADMIN" : "ROLE_USER")
                .signWith(Keys.hmacShaKeyFor(signingKey), SignatureAlgorithm.HS512)
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .compact();

        Map<String, Object> result = new HashMap<>();
        result.put("jwt", jwt);
        result.put("id", userEntity.getId());
        result.put("wishId", wishEntity.getId());
        result.put("cartId", cartEntity.getId());

        return result;
    }

    @Override
    public UserEntity authenticate(String userId, String password) {
        Optional<UserEntity> userOptional = userRepository.findByUserId(userId);

        // 사용자가 없거나 비밀번호가 일치하지 않는 경우
        if (userOptional.isEmpty() ||
                !passwordEncoder.matches(password, userOptional.get().getPwd())) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        return userOptional.get();
    }

    public UserDTO findUserById(String userId) {
        // 사용자 정보 조회
        UserEntity userEntity = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // Entity -> DTO 변환하여 반환
        return UserDTO.toGetUserDTO(userEntity);
    }

    // 회원정보 수정 - sumin (2024.12.12)
    @Override
    public void updateUserInfo(UserDTO userDTO) {
        UserEntity userEntity = userRepository.findByUserId(userDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 업데이트할 필드들 설정
        userEntity.setName(userDTO.getName());
        userEntity.setGender(userDTO.getGender());
        userEntity.setAddr1(userDTO.getAddr1());
        userEntity.setAddr2(userDTO.getAddr2());
        userEntity.setZipcode(userDTO.getZipcode());
        userEntity.setTel(userDTO.getTel());
        userEntity.setBirth(userDTO.getBirth());
        userEntity.setEmail(userDTO.getEmail());
        userEntity.setHeight(userDTO.getHeight());
        userEntity.setWeight(userDTO.getWeight());

        // 비밀번호 변경 (옵션)
        if (userDTO.getPwd() != null && !userDTO.getPwd().isEmpty()) {
            userEntity.setPwd(passwordEncoder.encode(userDTO.getPwd()));
        }

        // 변경사항 저장
        userRepository.save(userEntity);
    }

    // 회원정보 삭제 전 비밀번호 확인 - sumin (2024.12.12)
    public boolean checkPassword(int userId, String password) {
        // 사용자 정보 조회
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 비밀번호가 일치하는지 확인 (BCrypt 비밀번호 암호화 확인)
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encodedPassword = passwordEncoder.encode("mySecretPassword");
        System.out.println("Encoded password: " + encodedPassword);
        if (!passwordEncoder.matches(password, userEntity.getPwd())) {
            return false;
        }

        return true;
    }

    // 회원정보 삭제 - sumin (2024.12.12)
    public void deleteUser(int userId) {
        // 사용자 정보 조회
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 연관된 데이터 삭제
        // 1. UserEntity와 관련된 DB 삭제
        if (userEntity.getWishEntity() != null) {
            // WishEntity 삭제
            userEntity.getWishEntity().setUserEntity(null); // 양방향 관계 해제
        }
        if (userEntity.getCartEntity() != null) {
            // CartEntity 삭제
            userEntity.getCartEntity().setUserEntity(null); // 양방향 관계 해제
        }

        // UserCouponEntity 삭제
        userCouponRepository.deleteByUserEntity_Id(userId);

        // 3. 사용자 삭제
        userRepository.delete(userEntity);
    }

    @Override
    public boolean isUserAdmin(int id) {
        UserEntity userEntity = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return userEntity.isAdmin();
    }

}
