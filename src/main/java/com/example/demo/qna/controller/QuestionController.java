package com.example.demo.qna.controller;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.qna.service.QuestionService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/question")
public class QuestionController {
    @Autowired
    private QuestionService questionsService;

    //문의 작성
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addQuestion(@RequestBody QuestionDTO questionDTO) {
        // JWT 파싱
//        Long userId = Jwts.parser()
//                .setSigningKey("your-secret-key") // 비밀키로 서명 검증
//                .parseClaimsJws(token)
//                .getBody()
//                .get("userId", Long.class); // userId 추출
//        System.out.println("로그인한 userId" + userId);
        questionsService.addQuestion(questionDTO);
        Map<String, String> response = new HashMap<>();
        response.put("message", "200ok");
        return ResponseEntity.ok(response);
//        return ResponseEntity.ok("200 Ok");
    }

    //문의 수정
    @PutMapping("/update")
    public ResponseEntity<String> updateQuestion(@RequestBody QuestionDTO questionDTO) {
        questionsService.updateQuestion(questionDTO);
        return ResponseEntity.ok("200 Ok");
    }

    // 문의 삭제
    @DeleteMapping("/delete") //게시글 id
    public ResponseEntity<String> deleteQuestion(@RequestBody QuestionDTO questionDTO) {
        questionsService.deleteQuestion(questionDTO);
        return ResponseEntity.ok("200 Ok");
    }

    //문의 비밀글 조회 12/18 16:47 tang
    @GetMapping("/private")
    public ResponseEntity<Map<String, String>> privateBoardCheck(@RequestParam(name = "privatepwd") String privatepwd, @RequestParam(name = "id") int id) {
        //게시글번호랑 비밀번호 받아옴
        String pwd = questionsService.privateBoardCheck(privatepwd, id);

        Map<String, String> response = new HashMap<>();
        if ("true".equals(pwd)) {
            //비밀번호가 맞으면
            response.put("true", "200ok");
        } else {
            //비밀번호가 틀리면
            response.put("false", "비밀번호가 맞지 않습니다.");
        }
        return ResponseEntity.ok(response);
    }

    //문의 리스트 출력, 페이징처리, 최신순 정렬, 검색 완료 12/12 11:00 tang 12/17 18:30 제목별, 카테고리별 검색 추가 12/18 문의리스트 공지사항 제외
    @GetMapping("")
    public ResponseEntity<?> searchQuestion(
            @PageableDefault(page = 0, size = 6, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "block", required = false, defaultValue = "5") int block,
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "sortby", required = false, defaultValue = "questiondate") String sortby,
            @RequestParam(name = "categoryid", required = false, defaultValue = "0") int categoryid) {
        Map<String, Object> datamap = new HashMap<>();
        datamap.put("pageable", pageable);
        datamap.put("block", block);
        datamap.put("sortby", sortby);
        datamap.put("title", title);
        datamap.put("categoryid", categoryid);

        Map<String, Object> map = questionsService.getQuestionList(datamap);

        // 값 존재 X
        if (map == null || map.isEmpty()) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);
        }

        // 값 존재 O
        System.out.println("map =" +map);
        return ResponseEntity.ok(map);
    }

    // FAQ 목록 조회
    @GetMapping("/faq/list")
    public ResponseEntity<List<QuestionDTO>> getFaqList() {
        try {
            List<QuestionDTO> faqList = questionsService.getFaqList();
            return ResponseEntity.ok(faqList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
        }
    }

}
