package com.example.demo.qna.controller;

import com.example.demo.qna.dto.QuestionDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.qna.service.AnswerService;

@RestController
@RequestMapping("/api/admin/answer")
public class AnswerController {
    @Autowired
    private AnswerService answerService;
    // 답변 작성
    @PostMapping("/create")
    public ResponseEntity<String> createAnswer(@RequestBody QuestionDTO questionDTO){
        answerService.addAnswer(questionDTO);
        return ResponseEntity.ok("201");
    }

    // 답변 수정
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateAnswer(@PathVariable int id, @RequestBody QuestionDTO questionDTO){
        answerService.updateAnswer(id, questionDTO);
        return ResponseEntity.ok("201");
    }

}