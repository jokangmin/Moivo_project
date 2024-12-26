package com.example.demo.jwt.repository;

import com.example.demo.jwt.entity.BlacklistEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface BlacklistRepository extends JpaRepository<BlacklistEntity, Long> {
    Optional<BlacklistEntity> findByToken(String token);
    boolean existsByToken(String token);
    void deleteByExpiryDateLessThan(Date expiryDate);

}
