package com.example.demo.qna.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.demo.qna.dto.QuestionDTO;
// 24.12.17 yjy
import com.example.demo.qna.service.AdminFaqService;

@RestController
@RequestMapping("/api/admin/faq")
public class AdminFaqController {

    @Autowired
    private AdminFaqService adminFaqService;

    // FAQ 목록 출력
    @GetMapping("/list")
    public ResponseEntity<List<QuestionDTO>> getFaqList() {
        try {
            List<QuestionDTO> faqList = adminFaqService.getFaqList();
            return ResponseEntity.ok(faqList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //FAQ 추가
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addFaq(@RequestBody QuestionDTO questionDTO) {
        try {
            if (questionDTO.getTitle() == null || questionDTO.getContent() == null) {
                return ResponseEntity.badRequest().body("제목과 내용은 필수 입력 항목입니다.");
            }
            
            // 저장
            boolean isSuccess = adminFaqService.addFaq(questionDTO);
            
            if (isSuccess) {
                return ResponseEntity.ok("FAQ가 성공적으로 등록되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("FAQ 등록에 실패했습니다.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    //FAQ 수정
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateFaq(@PathVariable Integer id, @RequestBody QuestionDTO questionDTO) {
        try {
            boolean isSuccess = adminFaqService.updateFaq(id, questionDTO);
            if (isSuccess) {
                return ResponseEntity.ok("FAQ가 성공적으로 수정되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("FAQ를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    //FAQ 삭제
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteFaq(@PathVariable Integer id) {
        try {
            boolean isSuccess = adminFaqService.deleteFaq(id);
            if (isSuccess) {
                return ResponseEntity.ok("FAQ가 성공적으로 삭제되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("FAQ를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

}
