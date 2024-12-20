package com.example.demo.security.handler;

import org.springframework.context.ApplicationListener;
import org.springframework.security.core.session.SessionDestroyedEvent;
import org.springframework.stereotype.Component;

@Component
public class SessionEventHandler implements ApplicationListener<SessionDestroyedEvent> {
    
    @Override
    public void onApplicationEvent(SessionDestroyedEvent event) {
        // 세션이 만료될 때의 처리
        System.out.println("Session destroyed: " + event.getId());
    }
} 