package com.example.demo.qna.service.impl;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;
import com.example.demo.qna.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.qna.service.AnswerService;

@Service
public class AnswerServiceImpl implements AnswerService {

    @Autowired
    QuestionRepository questionRepository;


    @Override
    public void addAnswer(QuestionDTO questionDTO) {

    }

    @Override
    public void updateAnswer(int id, QuestionDTO questionDTO) {

    }
}
