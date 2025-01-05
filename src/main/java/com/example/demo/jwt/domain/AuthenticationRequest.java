package com.example.demo.jwt.domain;

import lombok.Data;

@Data
public class AuthenticationRequest {
    
    private String userId;
    private String pwd;
}