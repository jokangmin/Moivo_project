package com.example.demo.qna.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;
import com.example.demo.qna.repository.QuestionRepository;
import com.example.demo.qna.service.AdminManagementService;
import com.example.demo.qna.repository.QuestionCategoryRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminManagementServiceImpl implements AdminManagementService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionCategoryRepository questionCategoryRepository;

    @Override
    public void respondToQuestion(QuestionDTO questionDTO) {
        QuestionEntity questionEntity = questionRepository.findById(questionDTO.getId())
                .orElseThrow(() -> new RuntimeException("문의가 존재하지 않습니다."));
        questionEntity.setResponse(questionDTO.getResponse());
        questionEntity.setResponseDate(LocalDateTime.now());
        questionRepository.save(questionEntity);
    }

    @Override
    public void addFAQ(QuestionDTO questionDTO) {
        QuestionEntity questionEntity = new QuestionEntity();
        questionEntity.setTitle(questionDTO.getTitle());
        questionEntity.setContent(questionDTO.getContent());
        questionEntity.setCategoryEntity(questionCategoryRepository.findById(questionDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리가 존재하지 않습니다.")));
        questionRepository.save(questionEntity);
    }

    @Override
    public List<QuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream()
                .filter(question -> question.getSecret() == null || !question.getSecret().equals("true"))
                .map(question -> new QuestionDTO(
                        question.getId(),
                        question.getCategoryEntity().getId(),
                        question.getUserEntity().getId(),
                        question.getTitle(),
                        question.getContent(),
                        question.getQuestionDate(),
                        question.getResponse(),
                        question.getResponseDate(),
                        question.getSecret(),
                        question.getFixQuestion()
                ))
                .collect(Collectors.toList());
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
                        question.getSecret(),
                        question.getFixQuestion()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public void updateQuestion(Integer id, QuestionDTO questionDTO) {
        questionRepository.updateQuestion(id, questionDTO.getTitle(), questionDTO.getContent());
    }

    @Override
    public void deleteQuestion(Integer id) {
        questionRepository.deleteById(id);
    }


}