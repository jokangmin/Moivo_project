import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../assets/css/admin_productList.module.css";
import Admins_side from "../../components/admin_sidebar/admins_side";
import { PATH } from '../../../scripts/path';

const ProductList = () => {
  const [sortBy, setSortBy] = useState(1); // 기본 정렬값: 전체
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 0,
    hasNext: false,
    hasPrevious: false,
    startPage: 0,
    endPage: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get("status");

  useEffect(() => {
    console.log("statusFilter:", statusFilter);
    fetchProducts(0); // 페이지 0부터 시작하여 로드
  }, [sortBy, statusFilter]);

  useEffect(() => {
    console.log("Pagination State:", pagination);
  }, [pagination]);

  const fetchProducts = async (page = 0) => {
    try {
      console.log("status 확인:", statusFilter);
  
      const response = await axiosInstance.get(
        `${PATH.SERVER}/api/admin/store/list`,
        {
          params: {
            page: page, // 현재 페이지 (0부터 시작)
            size: 10, // 페이지 크기
            sortby: sortBy, // 정렬 방식
            status: statusFilter,  // 필터링 상태
          },
        }
      );
  
      const { productList, ...pageInfo } = response.data;
      const formattedProducts = productList.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        count: product.allcount,
        status: mapProductStatus(product.status),
        stock: product.stock,
      }));
      console.log("응답 데이터 :", response.data);
  
      setProducts(formattedProducts);
  
      // 페이지 정보 반영 (currentPage 값을 1-based로 수정)
      setPagination({
        totalPages: pageInfo.totalPages,
        currentPage: pageInfo.currentPage + 1, 
        hasPrevious: pageInfo.hasPrevious,
        hasNext: pageInfo.hasNext,
        startPage: 1,
        endPage: pageInfo.totalPages,
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };
  
  const handlePageChange = (page) => {
    fetchProducts(page - 1); 

    setCurrentPage(page);
    console.log(page);
    console.log(currentPage);
  };
  console.log(pagination);
  
  const mapProductStatus = (status) => {
    switch (status) {
      case "EXIST":
        return "정상";
      case "SOMESOLDOUT":
        return "일부 품절";
      case "SOLDOUT":
        return "전체 품절";
      case "DELETED":
        return "삭제된 상품";
      default:
        return "기타";
    }
  };

  
  const handleSortChange = (newSort) => setSortBy(newSort);

  // 상품 삭제 처리 함수
  const handleDelete = async (productId) => {
    console.log(productId);
    try {
      await axiosInstance.delete(
        `${PATH.SERVER}/api/admin/store/delete/${productId}`
      );
      fetchProducts(currentPage - 1); // 삭제 후 데이터 갱신
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };
  
  const handleUpdate = async (productId) => {
    navigate(`/admins_productupdate/${productId}`);
  }

  const handleRestore = async (productId) => {
    try {
      await axiosInstance.post(
        `${PATH.SERVER}/api/admin/store/restore/${productId}`
      );
      fetchProducts(pagination.currentPage - 1); // 복구 후 데이터 갱신
    } catch (error) {
      console.error("Failed to restore product:", error);
    }
  };



  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Admins_side />
      </div>
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>상품 관리</h1>
          <button
            className={styles.addButton}
            onClick={() => navigate("/admins_productadd")}
          >
            상품 추가
          </button>
        </div>
        <div className={styles.sortButtons}>
          <button onClick={() => handleSortChange(1)} className={sortBy === 1 ? styles.active : ""}>전체</button>
          <button onClick={() => handleSortChange(2)} className={sortBy === 2 ? styles.active : ""}>품절</button>
          <button onClick={() => handleSortChange(3)} className={sortBy === 3 ? styles.active : ""}>정상</button>
          <button onClick={() => handleSortChange(4)} className={sortBy === 4 ? styles.active : ""}>삭제된 상품</button>
        </div>
        <div className={styles.productTable}>
          <div className={styles.tableHeader}>
            <div>ID</div>
            <div>이름</div>
            <div>가격</div>
            <div>수량</div>
            <div>상태</div>
            <div>관리</div>
          </div>
          {products.map((product) => (
            <div className={styles.tableRow} key={product.id}>
              <div>{product.id}</div>
              <div>{product.name}</div>
              <div>{product.price.toLocaleString()}원</div>
              <div>{product.count}</div>
              <div>{product.status}</div>
              <div className={styles.actionButtons}>
                <button onClick={() => handleUpdate(product.id)}>수정</button>
                {product.status === "삭제된 상품" ? (
                  <button className={styles.restore} onClick={() => handleRestore(product.id)}>복구</button>
                ) : (
                  <button onClick={() => handleDelete(product.id)}>삭제</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.pagination}>
          {pagination.hasPrevious && (
            <button onClick={() => handlePageChange(currentPage - 1)}>이전</button>
          )}
          {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              className={currentPage === page ? styles.activePage : ""}
              onClick={() => handlePageChange(page)}  
            >
              {page}
            </button>
            )
          )}
          {pagination.hasNext && (
            <button onClick={() => handlePageChange(currentPage + 1)}>다음</button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductList;