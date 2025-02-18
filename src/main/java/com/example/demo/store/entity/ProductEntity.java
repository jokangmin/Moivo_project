package com.example.demo.store.entity;

import java.util.List;

import com.example.demo.store.dto.ProductDTO;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "product")
public class ProductEntity { // 상품

    public enum Gender {
        ALL, MAN, WOMAN
    }

    public enum ProductStatus {
        EXIST(""), // 모든 재고가 존재
        SOMESOLDOUT("일부 품절"), // 일부 품절
        SOLDOUT("전체 품절"), // 전체 품절
        DELETED("삭제된 상품"); // 삭제된 상품

        private final String description;

        ProductStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String img; // 첫 번째 상품 이미지

    @Column(length = 2000)
    private String content; // 상품 설명

    @Column(nullable = false)
    private int price; // 상품 가격

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private Gender gender; // 성별

    @Column(name = "isdelete", nullable = false)
    private Boolean delete = false; // 상품 삭제 시, true로 변경

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProductStatus status = ProductStatus.EXIST;

    // 상품 n개 : 카테고리 1개
    @ManyToOne
    @JoinColumn(name = "categoryid", nullable = false)
    private ProductCategoryEntity categoryEntity;

    // 상품 1개 : 이미지 n개
    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductImgEntity> imgList;

    // 상품 1개 : 사이즈 3개
    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ProductStockEntity> stockList;

    // 상품 1개 : 리뷰 n개
    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ReviewEntity> reviewList;

    // dto => entity

    // 상품 등록
    public static ProductEntity toSaveProductEntity(ProductDTO dto) {
        // 상품 등록이기 때문에 seq 존재하지 않음.
        ProductEntity entity = new ProductEntity();
        entity.setName(dto.getName());
        entity.setImg(dto.getImg());
        entity.setContent(dto.getContent());
        entity.setPrice(dto.getPrice());
        entity.setGender(dto.getGender());

        return entity;
    }

    // 상품 출력
    public static ProductEntity toGetProductEntity(ProductDTO dto) {
        ProductEntity entity = new ProductEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setImg(dto.getImg());
        entity.setContent(dto.getContent());
        entity.setPrice(dto.getPrice());
        entity.setGender(dto.getGender());
        entity.setStatus(dto.getStatus());

        return entity;
    }
}