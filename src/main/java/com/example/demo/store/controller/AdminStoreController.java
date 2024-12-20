package com.example.demo.store.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.store.dto.ProductCategoryDTO;
import com.example.demo.store.dto.ProductDTO;
import com.example.demo.store.entity.ProductEntity.Gender;
import com.example.demo.store.service.AdminStoreService;
import com.example.demo.store.service.ProductService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/admin/store")
public class AdminStoreController {

    @Autowired
    private ProductService productService;

    @Autowired
    private AdminStoreService adminStoreService;

    // 상품 등록 - uj
    @PostMapping("/product")
    public ResponseEntity<String> saveProduct(
            @ModelAttribute ProductDTO productDTO,
            @RequestPart(name = "layer1") List<MultipartFile> layer1Files,
            @RequestPart(name = "layer2") List<MultipartFile> layer2Files,
            @RequestPart(name = "layer3") List<MultipartFile> layer3Files,
            @RequestPart(name = "layer4") List<MultipartFile> layer4Files,
            @RequestParam(name = "S", defaultValue = "0") int SCount,
            @RequestParam(name = "M", defaultValue = "0") int MCount,
            @RequestParam(name = "L", defaultValue = "0") int LCount,
            @RequestParam(name = "categoryId", defaultValue = "1") int categoryId) {

        // 받을 값
        // 1. ProductDTO 객체 (Category 설정)
        // 2. imgDTO 객체
        // 3. stock 객체

        Map<String, Object> map = new HashMap<>();

        map.put("ProductDTO", productDTO);
        map.put("layer1", layer1Files);
        map.put("layer2", layer2Files);
        map.put("layer3", layer3Files);
        map.put("layer4", layer4Files);
        map.put("S", SCount);
        map.put("M", MCount);
        map.put("L", LCount);
        map.put("categoryId", categoryId);

        adminStoreService.saveProduct(map);
        return ResponseEntity.ok(null);
    }

    // 상품 등록 화면 카테고리 출력 - uj
    @GetMapping("/category")
    public ResponseEntity<List<ProductCategoryDTO>> getCategory() {
        List<ProductCategoryDTO> list = productService.getCategory();
        return ResponseEntity.ok(list);
    }

    // 상품 수정 - 24.11.25, 26, 27 - uj
    @PutMapping("/product")
    public ResponseEntity<String> putProduct(
            @ModelAttribute ProductDTO productDTO,
            @RequestParam(name = "selectImgList", required = false) String selectImgList,
            @RequestPart(name = "layer1", required = false) List<MultipartFile> layer1Files,
            @RequestPart(name = "layer2", required = false) List<MultipartFile> layer2Files,
            @RequestPart(name = "layer3", required = false) List<MultipartFile> layer3Files,
            @RequestPart(name = "layer4", required = false) List<MultipartFile> layer4Files,
            @RequestParam(name = "S", defaultValue = "0", required = false) int SCount,
            @RequestParam(name = "M", defaultValue = "0", required = false) int MCount,
            @RequestParam(name = "L", defaultValue = "0", required = false) int LCount,
            @RequestParam(name = "categoryId", defaultValue = "1", required = false) int categoryId) {
        Map<String, Object> map = new HashMap<>();
        String[] selectImgId = selectImgList.replace("[", "").replace("]", "").split(",");
        System.out.println("putProduct" + productDTO);
        map.put("ProductDTO", productDTO);
        map.put("selectImgId", selectImgId);
        map.put("layer1", layer1Files);
        map.put("layer2", layer2Files);
        map.put("layer3", layer3Files);
        map.put("layer4", layer4Files);
        map.put("S", SCount);
        map.put("M", MCount);
        map.put("L", LCount);
        map.put("categoryId", categoryId);

        try {
            adminStoreService.putProduct(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }

        return ResponseEntity.ok(null);
    }

    // 24.11.29 - uj
    // 상품 성별 리스트 추출
    @GetMapping("/gender")
    public ResponseEntity<List<Gender>> getGenders() {
        List<Gender> list = productService.getGenders();
        return ResponseEntity.ok(list);
    }

    // 상품 삭제 - 24.11.27 - uj
    @DeleteMapping("delete/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable(name = "productId") int productId) {
        System.out.println(productId);
        try {
            adminStoreService.deleteProduct(productId);
            return ResponseEntity.ok("상품 삭제가 완료되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }
    }

    // 삭제된 상품 복구 - 12.11 sumin
    @PostMapping("/restore/{productId}")
    public ResponseEntity<Void> restoreProduct(@PathVariable(name = "productId") int productId) {
        System.out.println("productId = " + productId);

        boolean result = adminStoreService.restoreProduct(productId);
        System.out.println("result = " + result);

        if (result) {
            return ResponseEntity.ok().build(); // 성공 시 200 OK
        } else {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).build(); // 실패 시 404 Not Found
        }
    }

    // 관리자 상품 현황 조회 - 24.12.13 - yjy
    @GetMapping("/product/status")
    public ResponseEntity<?> getProductStatus() {
        try {
            Map<String, Object> map = adminStoreService.getProductStatus();
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }
    }

    // 관리자 상품목록 가져오기, 카테고리 or 키워드별 검색 후 페이징처리 -12/16 17:31 tang
    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllProductList(
            @PageableDefault(page = 0, size = 15, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "block", required = false, defaultValue = "3") int block,
            @RequestParam(name = "sortby", required = false, defaultValue = "0") int sortby,
            @RequestParam(name = "categoryid", required = false, defaultValue = "0") int categoryid,
            @RequestParam(name = "keyword", required = false) String keyword) {
        Map<String, Object> datamap = new HashMap<>();
        datamap.put("pageable", pageable); // 페이지 처리
        datamap.put("block", block); // 한 페이지당 보여줄 숫자
        datamap.put("sortby", sortby); // 정렬 기준
        datamap.put("categoryid", categoryid); // 카테고리 정렬 기준
        datamap.put("keyword", keyword); // 검색어

        Map<String, Object> map = adminStoreService.getAllProductList(datamap);

        // 값 존재 X
        if (map == null) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(null);
        }

        System.out.println("Controller map = " + map);

        // 값 존재 O
        return ResponseEntity.ok(map);
    }
}
