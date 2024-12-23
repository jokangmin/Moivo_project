package com.example.demo.faq.service.impl;

import com.example.demo.faq.service.AdminFaqService;
import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionCategoryEntity;
import com.example.demo.qna.entity.QuestionEntity;
import com.example.demo.qna.repository.QuestionRepository;
import com.example.demo.user.entity.UserEntity;
import com.example.demo.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminFaqServiceImpl implements AdminFaqService {

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private UserRepository userRepository;

    // FAQ 목록 조회 - 24.12.18 yjy
    @Override
    public List<QuestionDTO> getFaqList() {
        List<QuestionEntity> faqEntities = questionRepository.findByFixQuestionTrueOrderByQuestionDateDesc();
        return faqEntities.stream()
                .map(QuestionDTO::toGetQuestionDTO)
                .collect(Collectors.toList());
    }

    // FAQ 추가 - 24.12.18 yjy
    @Override
    public boolean addFaq(QuestionDTO questionDTO) {
        try {
            QuestionEntity questionEntity = new QuestionEntity();
            questionEntity.setTitle(questionDTO.getTitle());
            questionEntity.setContent(questionDTO.getContent());
            questionEntity.setFixQuestion(true);
            questionEntity.setQuestionDate(LocalDateTime.now());
            
            // 카테고리 설정 추가 (ALL 카테고리)
            QuestionCategoryEntity categoryEntity = new QuestionCategoryEntity();
            categoryEntity.setId(5); // ALL 카테고리 ID
            questionEntity.setCategoryEntity(categoryEntity);
            
            // 현재 로그인한 관리자 정보로 설정
            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            UserEntity adminUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("관리자 계정을 찾을 수 없습니다."));
            questionEntity.setUserEntity(adminUser);
            
            QuestionEntity savedEntity = questionRepository.save(questionEntity);
            
            return savedEntity != null && savedEntity.getId() != null;
        } catch (Exception e) {
            System.err.println("FAQ 저장 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // FAQ 수정
    @Override
    public boolean updateFaq(Integer id, QuestionDTO questionDTO) {
        try {
            QuestionEntity questionEntity = questionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("FAQ를 찾을 수 없습니다."));
            
            questionEntity.setTitle(questionDTO.getTitle());
            questionEntity.setContent(questionDTO.getContent());
            questionRepository.save(questionEntity);
            
            return true;
        } catch (Exception e) {
            System.err.println("FAQ 수정 중 에러 발생: " + e.getMessage());
            return false;
        }
    }

    // FAQ 삭제 - 24.12.18 yjy
    @Override
    public boolean deleteFaq(Integer id) {
        try {
            QuestionEntity questionEntity = questionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("FAQ를 찾을 수 없습니다."));
            
            questionRepository.delete(questionEntity);
            return true;
        } catch (Exception e) {
            System.err.println("FAQ 삭제 중 에러 발생: " + e.getMessage());
            return false;
        }
    }

}
