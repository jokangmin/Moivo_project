package com.example.demo.user.service;

import java.util.List;

import com.example.demo.payment.dto.PaymentDTO;
import com.example.demo.payment.dto.PaymentDetailDTO;
import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.store.dto.ProductDTO;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.dto.WishDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

public interface MypageService {

    public UserDTO getUserInfo(int id);

    public List<ProductDTO> getProductList(int userId);

    public List<WishDTO> getWishlist(int id);

    public Page<PaymentDTO> getOrders(int id, Pageable pageable);

    public List<PaymentDTO> getOrderInfo(String tosscode);

    public List<PaymentDetailDTO> getOrderDetails(int paymentId);

    public Page<QuestionDTO> getMyQuestion(int id, Pageable pageable);
}
