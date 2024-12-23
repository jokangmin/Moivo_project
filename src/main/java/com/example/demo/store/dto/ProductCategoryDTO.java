package com.example.demo.store.dto;

import com.example.demo.store.entity.ProductCategoryEntity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductCategoryDTO {
    private Integer id;
    private String name;
    private Integer parentId; 

    public static ProductCategoryDTO getCategoryDTO(ProductCategoryEntity entity) {
        ProductCategoryDTO dto = new ProductCategoryDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setParentId(entity.getParentId());

        return dto;
    }
}
