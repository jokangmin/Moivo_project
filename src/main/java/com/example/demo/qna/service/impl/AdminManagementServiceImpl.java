package com.example.demo.qna.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
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

    // 25.01.03 - 관리자 문의 리스트 - uj
    @Override
    public Map<String, Object> getAllQuestion(Map<String, Object> dataMap) {
        // 1. 정보 세팅
        Pageable pageable = (Pageable) dataMap.get("pageable"); // 페이지 처리
        int categoryid = Integer.parseInt(dataMap.get("categoryid").toString()); // 카테고리 정렬 기준
        String keyword = null; // 검색어
        if (dataMap.get("keyword") != null)
            keyword = dataMap.get("keyword").toString().trim();

        /*
         * 1. 카테고리 정렬
         * 2. 검색
         * 3. 카테고리 + 검색어 정렬
         */

        //  if (categoryid == 0 && keyword == null) {
        //     // 전체 QnA 중 fixquestion = false

        //     pageProductList = productRepository.findByDeleteFalse(pageable);
        // } else if (categoryid != 0 && keyword == null) {
        //     // 특정 카테고리에서 delete = false
        //     pageProductList = productRepository.findBycategoryParentId(categoryid, pageable);
        // } else if (categoryid == 0 && keyword != null) {
        //     // 키워드 검색에서 delete = false
        //     pageProductList = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        // } else if (categoryid != 0 && keyword != null) {
        //     // 키워드 + 카테고리 검색에서 delete = false
        //     pageProductList = productRepository.findByNameContainingIgnoreCaseAndCategoryEntity_parentId(keyword,
        //             categoryid,
        //             pageable);

        Map<String, Object> result = new HashMap<>();
        return result;
    }

}