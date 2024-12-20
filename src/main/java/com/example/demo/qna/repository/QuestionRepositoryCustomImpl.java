package com.example.demo.qna.repository;

import java.util.List;

import com.example.demo.qna.entity.QuestionEntity;

public class QuestionRepositoryCustomImpl implements QuestionRepositoryCustom{
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Override
    public void removeUserAssociationFromQuestion(int userId) {
        // 리뷰 엔티티에서 해당 사용자의 리뷰들을 찾아 userEntity를 null로 설정
        List<QuestionEntity> questions = entityManager.createQuery(
            "SELECT r FROM QuestionEntity r WHERE r.userEntity.id = :userId", QuestionEntity.class)
            .setParameter("userId", userId)
            .getResultList();

        for (QuestionEntity question : questions) {
            question.setUserEntity(null); // userEntity를 null로 설정
            entityManager.merge(question); // 변경된 리뷰 엔티티를 저장
        }
    }
}
