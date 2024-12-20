package com.example.demo.qna.entity;

import java.time.LocalDateTime;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.user.entity.UserEntity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "question")
@ToString(exclude = {"categoryEntity", "userEntity"})  // toString 순환 참조 방지 _ 24.12.18_yjy
public class QuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 문의 고유 키

    // 문의 n개 : 카테고리 1개
    @ManyToOne
    @JoinColumn(name = "categoryid", nullable = false) // 카테고리와 연결
    private QuestionCategoryEntity categoryEntity; // 문의 카테고리

    // 문의 n개 : 사용자 1개
    @ManyToOne
    @JoinColumn(name = "userid")
    private UserEntity userEntity; // 문의 작성

    @Column(name = "title", nullable = false)
    private String title; // 문의 제목

    @Column(name = "content", nullable = false)
    private String content; // 문의 내용

    @Column(name = "questiondate", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime questionDate = LocalDateTime.now(); // 문의 작성 일시

    @Column(name = "response", columnDefinition = "TEXT")
    private String response; // 관리자 응답 (NULL이면 미응답)

    @Column(name = "responsedate")
    private LocalDateTime responseDate; // 응답 일시 (NULL이면 미응답)

    @Column(name = "privatepwd")
    private String privatePwd; // 비밀 글 비밀번호, 일반글이면 null

    @Column(name = "fixquestion", nullable = false)
    private Boolean fixQuestion = false; // 고정 글일 경우, True

//    @PrePersist // JPA에선 자동으로 시간추가가 안됌 /  2안으로는 questionDate = LocalDateTime.now(); 넣어줘도 됌
//    protected void onCreate() {
//        this.questionDate = LocalDateTime.now(); // 현재 시간을 설정
//    }

    // DTO -> Entity 변환
    public static QuestionEntity tosaveQuestionEntity(QuestionDTO questionDTO, QuestionCategoryEntity questionCategoryEntity, UserEntity userEntity){
        QuestionEntity questionEntity = new QuestionEntity();
        questionEntity.setPrivatePwd(questionDTO.getPrivatePwd());
        questionEntity.setTitle(questionDTO.getTitle()); //제목
        questionEntity.setContent(questionDTO.getContent()); //내용
        questionEntity.setCategoryEntity(questionCategoryEntity); //문의 카테고리
        questionEntity.setUserEntity(userEntity); //userId 받아온거로 userRepository에서 찾아서 questionEntity의 UserEntity에 셋팅
        return questionEntity;
    }
}