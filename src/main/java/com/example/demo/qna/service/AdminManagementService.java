package com.example.demo.qna.service;

import java.util.List;
import java.util.Map;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.dto.QuestionCategoryDTO;

public interface AdminManagementService {
    public void addFAQ(QuestionDTO questionDTO); // 자주 묻는 질문 추가 메서드

    public List<QuestionDTO> getAllQuestions(); // 모든 문의 조회 메서드

    public List<QuestionDTO> getAllQuestionsIncludingSecret(); // 비밀글 포함 모든 문의 조회 메서드

    public List<QuestionCategoryDTO> getAllCategories(); // 모든 카테고리 조회 메서드

    public void respondToQuestion(Integer questionId, String response); // 문의에 대한 답변 등록 메서드

    public void updateResponse(Integer questionId, String response); // 문의 답변 수정 메서드

    public void deleteResponse(Integer questionId); // 문의 답변 삭제 메서드

    // 대시보드
    public List<QuestionDTO> getAnsweredQuestions(); // 답변된 문의 조회

    public List<QuestionDTO> getUnansweredQuestions(); // 미답변 문의 조회

    public Map<String, Integer> getQuestionStatus(); // 관리자 대시보드 데이터 가져옴

    public Map<String, Object> getAllQuestion(Map<String, Object> dataMap); // 25.01.03 - 관리자 문의 리스트 - uj
}