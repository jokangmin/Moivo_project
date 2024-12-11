package com.example.demo.user.service;

import com.example.demo.user.entity.UserEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;

import java.io.IOException;

public interface SocialService {

    UserEntity loginWithKakao(String code, String provider) throws JsonProcessingException;

    public void saveOrUpdateUser(UserEntity userEntity) throws ServletException, IOException;

    public String getUserAccessToken(Authentication authentication);
}