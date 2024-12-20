package com.example.demo.store.repository;

import com.example.demo.store.entity.ReviewEntity;

import java.util.List;

public class ReviewRepositoryCustomImpl implements ReviewRepositoryCustom {

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Override
    public void removeUserAssociationFromReview(int userId) {
        // 리뷰 엔티티에서 해당 사용자의 리뷰들을 찾아 userEntity를 null로 설정
        List<ReviewEntity> reviews = entityManager.createQuery(
            "SELECT r FROM ReviewEntity r WHERE r.userEntity.id = :userId", ReviewEntity.class)
            .setParameter("userId", userId)
            .getResultList();

        for (ReviewEntity review : reviews) {
            review.setUserEntity(null); // userEntity를 null로 설정
            entityManager.merge(review); // 변경된 리뷰 엔티티를 저장
        }
    }
}
