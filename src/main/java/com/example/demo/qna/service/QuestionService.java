package com.example.demo.qna.service;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;

import java.util.Map;

public interface QuestionService {
    public void addQuestion(QuestionDTO questionDTO);

    public void updateQuestion(int id, QuestionDTO questionDTO);

    public void deleteQuestion(int id);

    public Map<String, Object> getQuestionList(Map<String, Object> datemap);

}