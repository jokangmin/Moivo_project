package com.example.demo.security.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/session")
public class SessionController {
    
    @Autowired
    private SessionRegistry sessionRegistry;
    
    @PostMapping("/expire")
    public ResponseEntity<?> expireUserSessions(@RequestParam String userId) {
        sessionRegistry.getAllPrincipals().stream()
            .filter(principal -> principal.toString().equals(userId))
            .forEach(principal -> {
                sessionRegistry.getAllSessions(principal, false)
                    .forEach(session -> session.expireNow());
            });
        return ResponseEntity.ok().build();
    }
} 