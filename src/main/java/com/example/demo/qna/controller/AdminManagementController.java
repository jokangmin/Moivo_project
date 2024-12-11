package com.example.demo.qna.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.service.AdminManagementService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/qna/management")
public class AdminManagementController {

    @Autowired
    private AdminManagementService adminManagementService;


    // 문의에 대한 응답 작성
    @PostMapping("/response")
    public ResponseEntity<String> respondToQuestion(@RequestBody QuestionDTO questionDTO) {
        adminManagementService.respondToQuestion(questionDTO);
        return ResponseEntity.ok("응답이 성공적으로 등록되었습니다.");
    }

    // 자주 묻는 질문 등록
    @PostMapping("/faq")
    public ResponseEntity<String> addFAQ(@RequestBody QuestionDTO questionDTO) {
        adminManagementService.addFAQ(questionDTO);
        return ResponseEntity.ok("자주 묻는 질문이 성공적으로 등록되었습니다.");
    }

    // 모든 문의 조회 (관리자용)
    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(adminManagementService.getAllQuestions());
    }

    // 비밀글 포함 모든 문의 조회
    @GetMapping("/questions/all")
    public ResponseEntity<List<QuestionDTO>> getAllQuestionsIncludingSecret() {
        return ResponseEntity.ok(adminManagementService.getAllQuestionsIncludingSecret());
    }

    // 문의 수정
    @PutMapping("/questions/{id}")
    public ResponseEntity<String> updateQuestion(@PathVariable Integer id, @RequestBody QuestionDTO questionDTO) {
        adminManagementService.updateQuestion(id, questionDTO);
        return ResponseEntity.ok("문의가 성공적으로 수정되었습니다.");
    }

    // 문의 삭제 !!
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Integer id) {
        adminManagementService.deleteQuestion(id);
        return ResponseEntity.ok("문의가 성공적으로 삭제되었습니다.");
    }


}