package com.example.demo.qna.service.impl;

import com.example.demo.store.dto.ProductCategoryDTO;
import com.example.demo.store.dto.ProductDTO;
import com.example.demo.store.dto.ProductStockDTO;
import com.example.demo.store.entity.ProductCategoryEntity;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ProductStockEntity;
import com.example.demo.store.repository.ProductCategoryRepository;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.store.repository.ProductStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.demo.qna.dto.QuestionCategoryDTO;
import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;
import com.example.demo.qna.repository.QuestionRepository;
import com.example.demo.qna.service.AdminManagementService;
import com.example.demo.user.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.example.demo.qna.repository.QuestionCategoryRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AdminManagementServiceImpl implements AdminManagementService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionCategoryRepository questionCategoryRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    @Autowired
    private ProductStockRepository productStockRepository;

    @Override
    public void addFAQ(QuestionDTO questionDTO) {
        QuestionEntity questionEntity = new QuestionEntity();
        questionEntity.setTitle(questionDTO.getTitle());
        questionEntity.setContent(questionDTO.getContent());
        questionEntity.setCategoryEntity(questionCategoryRepository.findById(questionDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리가 존재하지 않습니다.")));
        questionEntity.setUserEntity(userRepository.findById(questionDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다.")));
        questionRepository.save(questionEntity);
    }

    @Override
    public List<QuestionDTO> getAllQuestions() {
        try {
            List<QuestionEntity> entities = questionRepository.findAll();
            if (entities.isEmpty()) {
                System.out.println("No questions found in database");
                return new ArrayList<>();
            }
            return entities.stream()
                    .filter(entity -> entity != null && entity.getUserEntity() != null
                            && entity.getCategoryEntity() != null)
                    .map(entity -> {
                        try {
                            return QuestionDTO.toGetQuestionDTO(entity);
                        } catch (Exception e) {
                            System.out
                                    .println("Error mapping entity: " + entity.getId() + ", Error: " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error fetching questions: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch questions", e);
        }
    }

    @Override
    public List<QuestionDTO> getAllQuestionsIncludingSecret() {
        return questionRepository.findAll().stream()
                .map(question -> new QuestionDTO(
                        question.getId(),
                        question.getCategoryEntity().getId(),
                        question.getUserEntity().getId(),
                        question.getTitle(),
                        question.getContent(),
                        question.getQuestionDate(),
                        question.getResponse(),
                        question.getResponseDate(),
                        question.getPrivatePwd(),
                        question.getFixQuestion(),
                        question.getUserEntity().getName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void respondToQuestion(Integer questionId, String response) {
        try {
            QuestionEntity question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));

            System.out.println("Question found: " + question.getId());
            System.out.println("Setting response: " + response);

            question.setResponse(response);
            question.setResponseDate(LocalDateTime.now());

            QuestionEntity savedQuestion = questionRepository.save(question);
            System.out.println("Response saved: " + savedQuestion.getResponse());
        } catch (Exception e) {
            System.err.println("Error in respondToQuestion: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void updateResponse(Integer questionId, String response) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setResponse(response);
        question.setResponseDate(LocalDateTime.now());
        questionRepository.save(question);
    }

    @Override
    public void deleteResponse(Integer questionId) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setResponse(null);
        question.setResponseDate(null);
        questionRepository.save(question);
    }

    @Override
    public List<QuestionCategoryDTO> getAllCategories() {
        return questionCategoryRepository.findAll().stream()
                .map(category -> new QuestionCategoryDTO(category.getId(), category.getName().toString()))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDTO> getAnsweredQuestions() {
        return questionRepository.findAllWithResponse().stream()
                .map(QuestionDTO::toGetQuestionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDTO> getUnansweredQuestions() {
        return questionRepository.findAllWithoutResponse().stream()
                .map(QuestionDTO::toGetQuestionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Integer> getQuestionStatus() {
        Map<String, Integer> status = new HashMap<>();

        // 전체 문의 수 조회
        int totalQuestions = (int) questionRepository.count();
        status.put("totalQuestions", totalQuestions);

        // 미답변 문의 수 조회
        int unansweredQuestions = questionRepository.countByResponseIsNull();
        status.put("unansweredQuestions", unansweredQuestions);

        // 답변 완료 문의 수 조회
        int answeredQuestions = questionRepository.countByResponseIsNotNull();
        status.put("answeredQuestions", answeredQuestions);

        return status;
    }

}