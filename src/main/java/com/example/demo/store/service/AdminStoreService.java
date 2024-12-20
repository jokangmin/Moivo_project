package com.example.demo.store.service;

import java.util.Map;

public interface AdminStoreService {

    // 상품 등록 - uj
    public void saveProduct(Map<String, Object> map);

    // 상품 수정 - 24.11.25 - uj
    public void putProduct(Map<String, Object> map);

    // 24.12.13 - 상품 현황 조회 - yjy
    public Map<String, Object> getProductStatus();

    // 관리자 상품목록 가져오기, 카테고리 or 키워드별 검색 후 페이징처리 - 12/16 17:31 tang
    public Map<String, Object> getAllProductList(Map<String, Object> datamap);

    // 24.12.11 - 상품 삭제 - sumin
    public void deleteProduct(int productId);

    // 24.12.11 - 상품 복구 - sumin
    public boolean restoreProduct(int productId);

}
