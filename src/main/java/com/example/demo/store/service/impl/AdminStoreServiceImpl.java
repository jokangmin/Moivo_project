package com.example.demo.store.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.store.repository.ProductCategoryRepository;
import com.example.demo.store.repository.ProductImgRepository;
import com.example.demo.store.repository.ProductRepository;
import com.example.demo.store.repository.ProductStockRepository;
import com.example.demo.store.service.AdminStoreService;

import jakarta.transaction.Transactional;

import com.amazonaws.services.kms.model.NotFoundException;
import com.example.demo.ncp.dto.NCPObjectStorageDTO;
import com.example.demo.ncp.service.NCPObjectStorageService;
import com.example.demo.store.dto.AdminProductDTO;
import com.example.demo.store.dto.ProductDTO;
import com.example.demo.store.dto.ProductStockDTO;
import com.example.demo.store.entity.ProductCategoryEntity;
import com.example.demo.store.entity.ProductEntity;
import com.example.demo.store.entity.ProductImgEntity;
import com.example.demo.store.entity.ProductStockEntity;
import com.example.demo.store.entity.ProductStockEntity.Size;

// 24.12.13 파일 생성 - yjy
@Service
public class AdminStoreServiceImpl implements AdminStoreService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductStockRepository stockRepository;

    @Autowired
    private ProductImgRepository imgRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private NCPObjectStorageService ncpObjectStorageService;

    // 24.12.13 - 상품 현황 조회 - yjy
    @Override
    public Map<String, Object> getProductStatus() {
        Map<String, Object> result = new HashMap<>();

        // 전체 상품 수
        long totalProducts = productRepository.count();

        // 판매 중인 상품 수 (삭제되지 않은 상품)
        long activeProducts = productRepository.countByDeleteFalse();

        // 품절 상품 수 (재고가 0인 상품, 사이즈별로 체크)
        long soldOutProducts = 0;

        // 판매 중인 상품을 가져와서 사이즈별 재고를 체크
        for (ProductEntity product : productRepository.findAll()) {
            boolean isSoldOut = false;

            // 해당 상품의 모든 사이즈별 재고를 가져와서 체크
            for (ProductStockEntity.Size size : ProductStockEntity.Size.values()) {
                ProductStockEntity stock = stockRepository.findByProductEntityAndSize(product, size);
                if (stock != null && stock.getCount() == 0) {
                    isSoldOut = true; // 하나라도 품절이면 품절로 처리
                    break;
                }
            }
            if (isSoldOut) {
                soldOutProducts++;
            }
        }

        // 재고 10개 이하 상품 수
        long lowStockProducts = stockRepository.countByCountLessThanEqual(10);

        // 삭제 상품 수 - sumin 12.18
        long inactiveProducts = productRepository.countByDeleteTrue();

        result.put("전체 상품", totalProducts);
        result.put("판매 상품", activeProducts);
        result.put("품절 상품", soldOutProducts);
        result.put("재고 10 이하", lowStockProducts);
        result.put("삭제된 상품", inactiveProducts);

        return result;
    }

    // 상품 등록 - uj
    @Override
    @SuppressWarnings("unchecked")
    public void saveProduct(Map<String, Object> map) {

        // 1. 상품 DTO => Entity
        ProductEntity productEntity = ProductEntity.toSaveProductEntity((ProductDTO) map.get("ProductDTO"));
        // 1-1. 카테고리 Entity 가져와서 저장
        ProductCategoryEntity categoryEntity = categoryRepository
                .findById(Integer.parseInt(map.get("categoryId").toString())).orElse(null);
        productEntity.setCategoryEntity(categoryEntity);

        // 1-2. 상품 테이블에 저장
        int productId = productRepository.save(productEntity).getId(); // DB에 저장된 기본키 반환
        System.out.println("saveProduct: " + productId);

        // 2. NCP & DB에 이미지 저장
        for (int i = 1; i < 4; i++) {
            List<MultipartFile> files = (List<MultipartFile>) map.get("layer" + i);
            saveImgFiles(files, productEntity, i);
        }

        // 3. 재고 저장
        // 사이즈 S, M, L
        for (String size : new String[] { "S", "M", "L" }) {
            ProductStockDTO stockDTO = new ProductStockDTO();
            stockDTO.setSize(size);
            stockDTO.setCount(Integer.parseInt(map.get(size).toString()));
            ProductStockEntity stockEntity = ProductStockEntity.toSaveStockEntity(stockDTO, productEntity);

            stockRepository.save(stockEntity);
        }

    }

    // NCP 업로드 & 이미지 테이블에 Data 저장 (메인 Img ProductEntity에 설정) - uj
    private void saveImgFiles(List<MultipartFile> files, ProductEntity product, int layer) {
        for (MultipartFile file : files) {
            try {
                NCPObjectStorageDTO ncpDTO = new NCPObjectStorageDTO();
                // NCP Object Storage 업로드
                String fileName = ncpObjectStorageService.uploadFile(
                        ncpDTO.getBUCKETNAME(), ncpDTO.getPRODUCTDIRECTORY(), file);

                // ProductEntity에 메인 이미지 저장
                if (layer == 1) {
                    product.setImg(fileName);
                    productRepository.save(product);
                }

                // 데이터베이스에 저장할 ProductImgEntity 생성
                ProductImgEntity imgEntity = new ProductImgEntity();
                imgEntity.setProductEntity(product);
                imgEntity.setFileName(fileName);
                imgEntity.setOriginalFileName(file.getOriginalFilename());
                imgEntity.setLayer(layer); // 레이어 값 설정

                // ProductImgRepository에 저장
                imgRepository.save(imgEntity);

                // 로그 출력
                System.out.println("Saved image for layer " + layer + ": " + fileName);
            } catch (Exception e) {
                System.err.println("File upload failed for layer " + layer + ": " + e.getMessage());
            }
        }
    }

    // 상품 수정 - 24.11.25, 26, 27 - uj
    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public void putProduct(Map<String, Object> map) {
        NCPObjectStorageDTO ncpDTO = new NCPObjectStorageDTO();

        // 1. DB에서 상품 조회
        ProductDTO productDTO = (ProductDTO) map.get("ProductDTO");
        ProductEntity productEntity = productRepository.findById(productDTO.getId()).orElseThrow(
                () -> new NotFoundException("해당 상품(" + productDTO.getId() + ")이 조회되지 않습니다."));

        // 1-1. 사용자 입력 데이터
        productEntity.setName(productDTO.getName());
        productEntity.setContent(productDTO.getContent());
        productEntity.setPrice(productDTO.getPrice());
        productEntity.setGender(productDTO.getGender());

        // 2. 카테고리 Entity 추출
        ProductCategoryEntity categoryEntity = categoryRepository
                .findById(Integer.parseInt(map.get("categoryId").toString()))
                .orElseThrow(
                        () -> new NotFoundException("해당 카테고리(" + map.get("categoryId").toString() + ")가 조회되지 않습니다."));
        productEntity.setCategoryEntity(categoryEntity);

        // 3. 이미지(NCP) 수정
        // 이미지 Id
        String[] selectImgId = (String[]) map.get("selectImgId"); // 존재할 상품 이미지 Id
        List<ProductImgEntity> imgEntityList = productEntity.getImgList(); // 상품 이미지 Entity
        List<ProductImgEntity> selectimgEntityList = new ArrayList<>(); // DB에 저장할 Img Entity

        // 3-1. 이미지 삭제 (NCP & DB)
        for (ProductImgEntity imgEntity : imgEntityList) {
            boolean isDelete = true;

            for (String imgIdStr : selectImgId) {
                int imgId = Integer.parseInt(imgIdStr);
                // DB에 남길 Img Entity
                if (imgId == imgEntity.getId()) {
                    selectimgEntityList.add(imgEntity);
                    isDelete = false;
                    break;
                }
            }

            // NCP에서 삭제
            if (isDelete) {
                ncpObjectStorageService.deleteFile(
                        ncpDTO.getBUCKETNAME(),
                        ncpDTO.getPRODUCTDIRECTORY(),
                        imgEntity.getFileName());

                System.out.println("삭제 Img Entity Id: " + imgEntity.getId());
            }
        }

        // DB 에서 삭제
        productEntity.getImgList().clear(); // 기존 컬렉션 초기화
        productEntity.getImgList().addAll(selectimgEntityList); // 새 값 추가

        // 3-2. 이미지 업로드 (NCP & DB)
        for (int i = 1; i < 5; i++) {
            if (map.get("layer" + i) != null) {
                List<MultipartFile> files = (List<MultipartFile>) map.get("layer" + i);
                saveImgFiles(files, productEntity, i);
            }
        }

        // 4. 재고 수정
        int soldoutCount = 0;
        List<ProductStockEntity> stockEntiyList = productEntity.getStockList();
        for (ProductStockEntity stockEntity : stockEntiyList) {
            switch (stockEntity.getSize()) {
                case S:
                    stockEntity.setCount(Integer.parseInt(map.get("S").toString()));
                    break;
                case M:
                    stockEntity.setCount(Integer.parseInt(map.get("M").toString()));
                    break;
                case L:
                    stockEntity.setCount(Integer.parseInt(map.get("L").toString()));
                    break;
                default:
                    break;
            }

            soldoutCount += stockEntity.getCount() == 0 ? 1 : 0; // 사이즈 별 재고 0인것 개수 구하기
        }

        // 4-1. 재고 상태 설정
        if (soldoutCount == 0) { // 모든 사이즈 재고: 0 이상
            productEntity.setStatus(ProductEntity.ProductStatus.EXIST);
        } else if (soldoutCount < stockEntiyList.size()) { // 일부 사이즈 재고 : 0
            productEntity.setStatus(ProductEntity.ProductStatus.SOMESOLDOUT);
        } else if (soldoutCount == stockEntiyList.size()) { // 모든 사이즈 재고 : 0
            productEntity.setStatus(ProductEntity.ProductStatus.SOLDOUT);
        }

        productRepository.save(productEntity);
    }

    // 관리자 상품목록 가져오기, 카테고리 or 키워드별 검색 후 페이징처리 - 12/16 17:31 tang
    // 24.12.18 - 반환 데이터 수정 - uj
    @Override
    public Map<String, Object> getAllProductList(Map<String, Object> dataMap) {
        Map<String, Object> products = new HashMap<>();
        List<AdminProductDTO> productList = new ArrayList<>();

        // 데이터 추출
        Pageable pageable = (Pageable) dataMap.get("pageable"); // 페이지 처리
        int block = Integer.parseInt(dataMap.get("block").toString()); // 한 페이지당 보여줄 숫자
        int sortby = Integer.parseInt(dataMap.get("sortby").toString()); // 정렬 기준 현재 없음

        // 조건별 상품 목록 가져오기
        Page<ProductEntity> pageProductList = null;
        List<ProductEntity.ProductStatus> statusList = new ArrayList<>();
        if (sortby == 1) {
            // 전체 상품
            pageProductList = productRepository.findAll(pageable);
            System.out.println("delete = false 상품 추출 >> " + pageProductList.getSize() + "개");
        } else if (sortby == 2) {
            // 일부 품절 또는 전체 품절
            statusList.add(ProductEntity.ProductStatus.SOLDOUT);
            statusList.add(ProductEntity.ProductStatus.SOMESOLDOUT);
            pageProductList = productRepository.findByStatuses(statusList, pageable);
            System.out.println("일부 품절 & 전체 품절 상품 추출 >> " + pageProductList.getSize() + "개");
        } else if (sortby == 3) {
            // 정상 상태(EXIST("")만 포함)
            statusList.add(ProductEntity.ProductStatus.EXIST);
            pageProductList = productRepository.findByStatuses(statusList, pageable);
            System.out.println("정상 상품(EXIST) 추출 >> " + pageProductList.getSize() + "개");
        } else if (sortby == 4) {
            // 삭제된 상품
            statusList.add(ProductEntity.ProductStatus.DELETED);
            pageProductList = productRepository.findByStatuses(statusList, pageable);
            System.out.println("임시 삭제(복구 대상) 상품 추출 >> " + pageProductList.getSize() + "개");
        }

        // Entity -> DTO & 상품 재고 추출
        for (ProductEntity entity : pageProductList) {
            // 사이즈에 따른 재고 추출
            Map<Size, Integer> stockMap = new HashMap<>();
            for (ProductStockEntity stock : entity.getStockList()) {
                stockMap.put(stock.getSize(), stock.getCount());
            }
            productList.add(AdminProductDTO.toGetAdminProductDTO(entity, stockMap));
        }

        int currentBlock = pageProductList.getNumber() / block;
        int startPage = currentBlock * block;
        int engPage = Math.min(startPage + block, pageProductList.getTotalPages());

        System.out.println("productList = " + productList);
        System.out.println("currentBlock = " + currentBlock);
        System.out.println("startPage = " + startPage);
        System.out.println("engPage = " + engPage);
        System.out.println("pageProductList.getTotalPages() = " + pageProductList.getTotalPages());

        // 페이징 정보 결과 담기
        products.put("startPage", startPage); // 블럭 첫번째 페이지
        products.put("engPage", engPage); // 블럭 마지막 페이지
        products.put("isFirst", pageProductList.isFirst()); // 1페이지 여부
        products.put("isLast", pageProductList.isLast()); // 마지막 페이지 여부
        products.put("hasPrevious", pageProductList.hasPrevious()); // 이전 페이지 여부
        products.put("hasNext", pageProductList.hasNext()); // 다음 페이지 여부
        products.put("totalPages", pageProductList.getTotalPages()); // 페이지 개수

        // 상품 관련 정보 담기
        products.put("productList", productList);
        // products.put("category", productService.getCategory());

        return products;
    }

    // 24.12.11 - 상품 삭제 - sumin
    @Override
    public void deleteProduct(int productId) {
        // productId에 해당하는 상품 조회
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("해당 상품이 존재하지 않습니다."));
        System.out.println("상품 번호: " + productId);
        // delete 변수 true로 설정
        product.setDelete(true);
        product.setStatus(ProductEntity.ProductStatus.DELETED);

        // 변경 사항 저장
        productRepository.save(product);

        System.out.println("상품 삭제 완료 상품 ID: " + productId);
    }

    // 24.12.11 - 상품 복구 - sumin
    @Override
    public boolean restoreProduct(int productId) {
        Optional<ProductEntity> productEntity = productRepository.findById(productId);

        if (productEntity.isPresent()) {
            ProductEntity product = productEntity.get();

            // 이미 삭제 상태인 경우만 복구
            if (product.getDelete()) {
                // 재고 상태에 따른 상품 상태 설정
                boolean isAllOutOfStock = true; // 전체 품절 상태
                boolean isPartialOutOfStock = false; // 일부 품절 상태

                // 각 사이즈별 재고를 확인
                for (ProductStockEntity stockEntity : product.getStockList()) {
                    if (stockEntity.getCount() > 0) {
                        isAllOutOfStock = false; // 재고가 있는 사이즈가 있으면 전체 품절이 아님
                    } else {
                        isPartialOutOfStock = true; // 품절인 사이즈가 있으면 일부 품절
                    }
                }

                // 상태 업데이트
                if (isAllOutOfStock && isPartialOutOfStock) {
                    product.setStatus(ProductEntity.ProductStatus.SOLDOUT); // 전체품절
                } else if (isPartialOutOfStock) {
                    product.setStatus(ProductEntity.ProductStatus.SOMESOLDOUT); // 일부품절
                } else {
                    product.setStatus(ProductEntity.ProductStatus.EXIST); // 정상
                }

                // 삭제 상태를 false로 변경하여 복구
                product.setDelete(false);
                productRepository.save(product);
                return true; // 복구 성공
            }
        } else {
            throw new NotFoundException("상품번호, " + productId + "가 존재하지 않습니다.");
        }

        return false; // 복구 실패
    }
}
