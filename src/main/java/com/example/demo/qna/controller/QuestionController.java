package com.example.demo.qna.controller;

import com.example.demo.qna.dto.QuestionDTO;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.qna.service.QuestionService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/question")
public class QuestionController {
    @Autowired
    private QuestionService questionsService;

    //문의 작성
    @PostMapping("/create")
    public ResponseEntity<String> createQuestion(@RequestBody QuestionDTO questionDTO) {
        questionsService.addQuestion(questionDTO);
        return ResponseEntity.ok("200 Ok");
    }

    //문의 수정
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateQuestion(@RequestBody QuestionDTO questionDTO, @PathVariable int id) {
        questionsService.updateQuestion(id, questionDTO);
        return ResponseEntity.ok("200 Ok");
    }

    //문의 리스트 출력
//    @GetMapping("")
//    public ResponseEntity<?> getQuestionAll(
//            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
//            @RequestParam(name = "block", required = false, defaultValue = "10") int block,
//            @RequestParam(name = "categoryid", required = false) Integer categoryid) {
//        Map<String, Object> datemap = new HashMap<>();
//        datemap.put("pageable", pageable);
//        datemap.put("block", block);
//        datemap.put("categoryid", categoryid);
//
//        Map<String, Object> map = questionsService.getQuestionList(datemap);
//        // 값 존재 X
//        if (map == null || map.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);
//        }
//
//        // 값 존재 O
//        return ResponseEntity.ok(map);
//    }

    //문의사항 검색 아직 진행중 전체출력만됌
    @GetMapping("")
    public ResponseEntity<?> searchQuestion(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "block", required = false, defaultValue = "10") int block,
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "sortby", required = false, defaultValue = "questiondate")String sortby) {
        Map<String, Object> datamap = new HashMap<>();
        datamap.put("pageable", pageable);
        datamap.put("block", block);
        datamap.put("sortby",sortby);
        datamap.put("title", title);

        Map<String, Object> map = questionsService.getQuestionList(datamap);

        // 값 존재 X
        if (map == null || map.isEmpty()) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);
        }

        // 값 존재 O
        return ResponseEntity.ok(map);
    }

    // 문의 삭제
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable int id) {
     questionsService.deleteQuestion(id);
     return ResponseEntity.ok("200 Ok");

    }

}
