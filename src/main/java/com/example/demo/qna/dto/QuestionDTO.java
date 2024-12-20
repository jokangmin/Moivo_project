package com.example.demo.qna.dto;

import java.time.LocalDateTime;

import com.example.demo.qna.entity.QuestionEntity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Integer id; // 문의 고유 키
    private Integer categoryId; // 문의 카테고리
    private Integer userId; // 문의 작성
    private String title; // 문의글 제목 (추가)
    private String content; // 문의 내용
    private LocalDateTime questionDate; // 문의 작성 일시
    private String response; // 관리자 응답 (NULL이면 미응답)
    private LocalDateTime responseDate; // 응답 일시 (NULL이면 미응답)
    private String privatePwd; // 비밀글 비밀번호 (추가)
    private Boolean fixQuestion; // 수정 문의 (추가)
    private String name;
//    private Boolean isQuestionView; //Access 토큰에서 자기 id값만 확인해서

    // entity => dto 변환
    public static QuestionDTO toGetQuestionDTO(QuestionEntity entity) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setResponse(entity.getResponse());
        dto.setResponseDate(entity.getResponseDate());
        dto.setQuestionDate(entity.getQuestionDate());
        dto.setTitle(entity.getTitle());
        dto.setUserId(entity.getUserEntity().getId());
        dto.setCategoryId(entity.getCategoryEntity().getId());
        dto.setName(entity.getUserEntity().getName());
//        dto.setPrivatePwd(entity.getPrivatePwd()); //프론트에 보내주지 않기 위함
        dto.setFixQuestion(entity.getFixQuestion());
        return dto;
    }

}