package com.example.demo.qna.service;

import java.util.List;

import com.example.demo.qna.dto.QuestionDTO;

public interface AdminManagementService {
    public void respondToQuestion(QuestionDTO questionDTO); // 문의에 대한 응답 메서드
    public void addFAQ(QuestionDTO questionDTO); // 자주 묻는 질문 추가 메서드
    public List<QuestionDTO> getAllQuestions(); // 모든 문의 조회 메서드
    public List<QuestionDTO> getAllQuestionsIncludingSecret(); // 비밀글 포함 모든 문의 조회 메서드
    public void updateQuestion(Integer id, QuestionDTO questionDTO); // 문의 수정 메서드
    public void deleteQuestion(Integer id); // 문의 삭제 메서드
}