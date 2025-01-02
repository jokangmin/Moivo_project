package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // 스케줄러 기능 활성화
@SpringBootApplication
public class MoivoApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoivoApplication.class, args);
	}

}
