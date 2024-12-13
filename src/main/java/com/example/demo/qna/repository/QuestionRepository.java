package com.example.demo.qna.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.demo.qna.entity.QuestionEntity;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Integer> {

    // 문의 수정
    @Modifying
    @Query("UPDATE QuestionEntity q SET q.title = :title, q.content = :content WHERE q.id = :id")
    @Transactional
    public void updateQuestion(@Param("id") Integer id, @Param("title") String title, @Param("content") String content);

    // 문의 삭제
    public void deleteById(Integer id);

    // 모든 문의 조회
    public List<QuestionEntity> findAll();

    //문의 카테고리 검색시
    Page<QuestionEntity> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}