package com.example.demo.qna.service;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;

public interface AnswerService {

    void addAnswer(QuestionDTO questionDTO);

    void updateAnswer(int id, QuestionDTO questionDTO);
}
