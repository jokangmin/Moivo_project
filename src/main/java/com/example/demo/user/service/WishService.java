package com.example.demo.user.service;

import java.util.Map;

public interface WishService {

    public void addProduct(int productId, int userId);

    public Map<String, Object> printWish(int userId);

    public void deleteProduct(int productId, int userId);

}
