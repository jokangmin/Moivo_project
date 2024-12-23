package com.example.demo.faq.service;

import com.example.demo.qna.dto.QuestionDTO;

import java.util.List;

public interface AdminFaqService {

    // FAQ 추가 - 24.12.18 yjy
    public boolean addFaq(QuestionDTO questionDTO);

    // FAQ 목록 조회
    public List<QuestionDTO> getFaqList();

    // FAQ 수정 - 24.12.18 yjy
    public boolean updateFaq(Integer id, QuestionDTO questionDTO);

    // FAQ 삭제 - 24.12.18 yjy
    public boolean deleteFaq(Integer id);

    
}
