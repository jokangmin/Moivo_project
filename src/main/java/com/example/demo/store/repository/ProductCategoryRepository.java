package com.example.demo.store.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.store.entity.ProductCategoryEntity;

@Repository
public interface ProductCategoryRepository extends CrudRepository<ProductCategoryEntity, Integer> {

    // 24.12.23 - ParentId 기준으로 카테고리 추출 - uj
    List<ProductCategoryEntity> findByParentId(Integer parentId);

}