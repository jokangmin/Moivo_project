package com.example.demo.store.service;

import java.util.List;
import java.util.Map;

import com.example.demo.store.dto.ProductCategoryDTO;
import com.example.demo.store.entity.ProductEntity.Gender;

public interface ProductService {

    public Map<String, Object> getProduct(int productId);

    public Map<String, Object> getProductList(Map<String, Object> dataMap);

    public List<ProductCategoryDTO> getCategory();

    public List<Gender> getGenders();

}