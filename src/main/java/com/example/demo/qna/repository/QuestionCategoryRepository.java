package com.example.demo.qna.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.qna.entity.QuestionCategoryEntity;

@Repository
public interface QuestionCategoryRepository extends JpaRepository<QuestionCategoryEntity, Integer> {
    
}
