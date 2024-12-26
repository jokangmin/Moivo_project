  import React, { useState, useEffect, useRef } from "react";
  import admin_product from "../../assets/css/admins_product.module.css";
  import Admins_side from '../../components/admin_sidebar/admins_side';
  import axiosInstance from '../../utils/axiosConfig';
  import { useNavigate } from "react-router-dom";

  const Admins_ProductAdd = () => {
    const [product, setProduct] = useState({
      name: "",
      price: "",
      content: "",
      categoryId: "",
      gender: ""
    });

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const [genders, setGenders] = useState([]);

    const [stock, setStock] = useState({
      S: 0,
      M: 0,
      L: 0,
    });

    const [files, setFiles] = useState({
      layer1: null,
      layer2: [],
      layer3: [],
      layer4: null,
    });

    // 2024/12/12 이미지 미리보기 장훈
    const [previews, setPreviews] = useState({
      layer1: null,
      layer2: [],
      layer3: [],
      layer4: null,
    });

    const [progress, setProgress] = useState(0);

    useEffect(() => {
      // 카테고리 정보 가져오기
      axiosInstance.get(`/api/admin/store/category`).then((res) => {
        if (Array.isArray(res.data.category)) {
          setCategories(res.data.category);
        } else {
          console.error("카테고리 데이터는 배열이 아닙니다 ? :", res.data);
        }
      });

      // 성별 정보 가져오기
      axiosInstance.get(`/api/admin/store/gender`).then((res) => {
        if (Array.isArray(res.data)) {
          setGenders(res.data);
        }
      });
    }, []);

    //2024/12/26 카테고리 변경 시 세부 카테고리 가져오기 추가 장훈
    const handleCategoryChange = (e) => {
      const mainCategoryId = e.target.value;
      console.log("선택된 메인 categoryId:", mainCategoryId);
      
      // 메인 카테고리 저장
      setSelectedMainCategory(mainCategoryId);
      // 메인 카테고리 변경 시 product의 categoryId는 초기화
      setProduct(prev => ({ ...prev, categoryId: "" }));
  
      if (mainCategoryId) {
        axiosInstance.get("/api/admin/store/category").then((res) => {
          if (res.data.category && res.data[mainCategoryId]) {
            const subCategories = res.data[mainCategoryId];
            if (Array.isArray(subCategories)) {
              console.log("필터된 세부 카테고리:", subCategories);
              setSubCategories(subCategories);
            } else {
              setSubCategories([]);
            }
          } else {
            setSubCategories([]);
          }
        }).catch((error) => {
          console.error("API 요청 실패:", error);
          setSubCategories([]);
        });
      } else {
        setSubCategories([]);
      }
    };
    
    // 2024/12/26 서브카테고리 선택 시, 서브카테고리 값을 categoryId로 업데이트 장훈
    const handleSubCategoryChange = (e) => {
      const subCategoryId = e.target.value;
      console.log("선택된 서브카테고리 ID:", subCategoryId);
      
      // 서브카테고리 ID를 최종 categoryId로 설정
      setProduct(prev => ({
        ...prev,
        categoryId: subCategoryId // 서브카테고리 ID가 최종적으로 DB에 저장될 categoryId가 됨
      }));
    };

    // 상품 정보 입력 핸들러
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProduct((prev) => ({ ...prev, [name]: value }));
    };

    // 재고 입력 핸들러
    const handleStockChange = (size, value) => {
      setStock((prev) => ({ ...prev, [size]: value }));
    };

    // 파일 추가 핸들러 (단일 파일)
    // 2024/12/12 파일 추가 핸들러 수정 장훈
    const handleSingleFileChange = (e, layer) => {
      const file = e.target.files[0];
      setFiles((prev) => ({ ...prev, [layer]: file }));
      setPreviews((prev) => ({
        ...prev,
        [layer]: file ? URL.createObjectURL(file) : null,
      }));
    };

    // 파일 추가 핸들러 (다중 파일)
    // 2024/12/12 파일 추가 핸들러 수정 장훈
    const handleMultipleFileChange = (e, layer) => {
      const filesArray = Array.from(e.target.files);
      setFiles((prev) => ({ ...prev, [layer]: filesArray }));
      setPreviews((prev) => ({
        ...prev,
        [layer]: filesArray.map((file) => URL.createObjectURL(file)),
      }));
    };

    // 드래그 앤 드롭 핸들러
    const handleDragOver = (e) => {
      e.preventDefault();
    };

    // 2024/12/12 드롭 핸들러 수정 장훈
    const handleDrop = (e, layer) => {
      e.preventDefault();
      const filesArray = Array.from(e.dataTransfer.files);
      setFiles((prev) => ({ ...prev, [layer]: filesArray }));
      setPreviews((prev) => ({
        ...prev,
        [layer]: filesArray.map((file) => URL.createObjectURL(file)),
      }));
    };

    // 업로드 핸들러
    const handleUpload = async () => {
      const formData = new FormData();
      console.log("전송되는 데이터:", product);

      if (
        !product.name ||
        !product.price ||
        !product.content ||
        !product.categoryId   
      ) {
        alert("모든 상품 정보를 입력해주세요.");
        return;
      }

      if (!files.layer1 || !files.layer4 || files.layer2.length === 0 || files.layer3.length === 0) {
        alert("모든 레이어의 이미지를 업로드해주세요.");
        return;
      }

      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("content", product.content);
      formData.append("categoryId", product.categoryId);
      formData.append("gender", product.gender);

      // 재고 데이터 추가
      Object.entries(stock).forEach(([size, count]) => {
        formData.append(`${size}`, count);
      });

      // 사용자 파일 추가 (layer 정보와 함께)
      formData.append("layer1", files.layer1); // 단일 파일
      files.layer2.forEach((file) => formData.append("layer2", file)); // 다중 파일
      files.layer3.forEach((file) => formData.append("layer3", file)); // 다중 파일
      formData.append("layer4", files.layer4); // 단일 파일

      try {
        const response = await axiosInstance.post(
          `/api/admin/store/product`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            },
          }
        );

        if (response.status === 200) {
          alert("상품이 성공적으로 등록되었습니다.");
          navigate(`/admin/admin_productList`)
          resetForm();
        }
      } catch (error) {
        console.error("업로드 실패:", error);
        alert("상품 등록에 실패했습니다. 다시 시도해주세요.");
      }
    };

    // 폼 초기화
    const resetForm = () => {
      setProduct({ name: "", price: "", content: "", categoryId: "" });
      setStock({ S: 0, M: 0, L: 0 });
      setFiles({
        layer1: null,
        layer2: [],
        layer3: [],
        layer4: null,
      });
      setProgress(0);
    };

    // 2024/12/13 미리보기 삭제 버튼 핸들러 추가 장훈
    const handleRemovePreview = (layer, index = null) => {
      if (index === null) {
        // 단일 파일
        setPreviews((prev) => ({ ...prev, [layer]: null }));
        setFiles((prev) => ({ ...prev, [layer]: null }));
        // 파일 input 값 리셋
        if (fileInputs[layer]) {
          fileInputs[layer].current.value = "";
        }
      } else {
        // 다중 파일
        setPreviews((prev) => ({
          ...prev,
          [layer]: prev[layer].filter((_, i) => i !== index),
        }));
        setFiles((prev) => ({
          ...prev,
          [layer]: prev[layer].filter((_, i) => i !== index),
        }));
    
        // 파일 input 값 리셋
        if (fileInputs[layer]) {
          const updatedFiles = files[layer].filter((_, i) => i !== index);
          const dataTransfer = new DataTransfer();
          updatedFiles.forEach((file) => dataTransfer.items.add(file));
          fileInputs[layer].current.files = dataTransfer.files;
        }
      }
    };

    //2024-12-13 단일 파일의 input 요소에 ref를 연결 장훈
    const fileInputs = {
      layer1: useRef(null),
      layer2: useRef(null),
      layer3: useRef(null),
      layer4: useRef(null),
    };

    return (
      <div className={admin_product.uploadContainer}>
        <Admins_side/>
        <div className={admin_product.uploadWrapper}>
          <h1 className={admin_product.uploadTitle}>상품 추가</h1>
          <div className={admin_product.form}>
            
            {/* 버튼
            <div className={admin_product.Navi}>
              <Link to="/admins_productadd">
                <button className={admin_product.UploadBtn}>상품 추가</button>
              </Link>
              <Link to="/admins_productUpdate">
                <button className={admin_product.UpdateBtn}>상품 수정</button>
              </Link>
            </div> */}

            <h2 className={admin_product.sectionTitle}>기본 상품 정보</h2>
            <div className={admin_product.basicsection}>
              {/* 상품명 */}
              <div className={admin_product.inputGroup}>
                <label className={admin_product.label}>상품명</label>
                <input className={admin_product.input} type="text" name="name" value={product.name} onChange={handleInputChange} placeholder="상품명을 입력하세요" />
              </div>

              {/* 가격 */}
              <div className={admin_product.inputGroup}>
                <label className={admin_product.label}>가격</label>
                <input className={admin_product.input} type="number" name="price" value={product.price} onChange={handleInputChange} placeholder="가격을 입력하세요" />
              </div>

              {/* 카테고리 */}
              <div className={admin_product.inputGroup}>
                <label className={admin_product.label}>카테고리</label>
                <select className={admin_product.select} value={selectedMainCategory} onChange={handleCategoryChange} >
                  <option value="">카테고리 선택</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 세부 카테고리 */}
              <div className={admin_product.inputGroup}>
                <label className={admin_product.label}>세부 카테고리</label>
                <select className={admin_product.select} value={product.categoryId} onChange={handleSubCategoryChange} >
                  <option value="">세부 카테고리 선택</option>
                  {subCategories && subCategories.length > 0
                    ? subCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              {/* 성별 */}
              <div className={admin_product.inputGroup}>
                <label className={admin_product.label}>성별</label>
                <select className={admin_product.select} name="gender" value={product.gender} onChange={handleInputChange} >
                  <option value="">성별 선택</option>
                  {genders.map((gender, index) => (
                    <option key={index} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={admin_product.accounSection}>
              {/* 상품 설명 */}
              <div className={admin_product.inputGroup}>
              <h2 className={admin_product.sectionTitle}>상품 설명</h2>
                <textarea className={admin_product.textarea} name="content" value={product.content} onChange={handleInputChange} placeholder="상품 설명을 입력하세요" />
              </div>
            </div>

            <div className={admin_product.stockSection}>
              <h2 className={admin_product.sectionTitle}>재고 수량</h2>
              <div className={admin_product.stockGrid}>
                {Object.entries(stock).map(([size, count]) => (
                  <div key={size} className={admin_product.stockItem}>
                    <label className={admin_product.label}>{size} 사이즈</label>
                    <input className={admin_product.input} type="number" value={count} onChange={(e) => handleStockChange(size, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className={admin_product.fileSection}>
              <h2 className={admin_product.sectionTitle}>이미지 업로드</h2>

              <div className={admin_product.inputGroup}>
                <div className={admin_product.layerWrapper}>
                  <div className={admin_product.layer}>
                    <label className={admin_product.label}>Layer 1 (대표 이미지)</label>
                    <div className={admin_product.previewContainer}>
                      {previews.layer1 && (
                        <div className={admin_product.previewWrapper}>
                          <img src={previews.layer1} alt="Layer 1 Preview" className={admin_product.previewImage}/>
                          {/* 2024/12/13 삭제 버튼 추가 장훈 */}
                          <button className={admin_product.removeButton} onClick={() => handleRemovePreview("layer1")} >
                          X
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={admin_product.dropzone}>
                      {/* 2024/12/13 파일 input에 ref 연결 장훈 */}
                      <input className={admin_product.fileInput} type="file" ref={fileInputs.layer1} onChange={(e) => handleSingleFileChange(e, "layer1")} />
                      <p className={admin_product.dropzoneText}>파일을 선택해주세요</p>
                    </div>
                  </div>

                  <div className={admin_product.layer}>
                    <label className={admin_product.label}>Layer 2 (상세 이미지)</label>
                      <div className={admin_product.previewContainer}>
                      {previews.layer2.map((src, index) => (
                        <div className={admin_product.previewWrapper}>
                          <img key={index} src={src} alt={`Layer 2 Preview ${index}`} className={admin_product.previewImage}/>
                          {/* 2024/12/13 삭제 버튼 추가 장훈 */}
                          <button className={admin_product.removeButton} onClick={() => handleRemovePreview("layer2", index)} >
                          X
                          </button>
                        </div>
                      ))}
                      </div>
                    <div className={admin_product.dropzone} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "layer2")}>
                      {/* 2024/12/13 파일 input에 ref 연결 장훈 */}
                      <input type="file" ref={fileInputs.layer2} multiple onChange={(e) => handleMultipleFileChange(e, "layer2")} />
                      <p className={admin_product.dropzoneText}>파일을 선택하거나 드래그해주세요</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={admin_product.inputGroup}>
                <div className={admin_product.layerWrapper}>
                  <div className={admin_product.layer}>
                    <label className={admin_product.label}>Layer 3 (추가 상세 이미지)</label>
                      <div className={admin_product.previewContainer}>
                        {previews.layer3.map((src, index) => (
                          <div className={admin_product.previewWrapper}>
                            <img key={index} src={src} alt={`Layer 3 Preview ${index}`} className={admin_product.previewImage}/>
                            {/* 2024/12/13 삭제 버튼 추가 장훈 */}
                            <button className={admin_product.removeButton} onClick={() => handleRemovePreview("layer3", index)} >
                            X
                            </button>
                          </div>
                        ))}
                        </div>
                    <div className={admin_product.dropzone} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "layer3")}>
                      {/* 2024/12/13 파일 input에 ref 연결 장훈 */}
                      <input type="file" ref={fileInputs.layer3} multiple onChange={(e) => handleMultipleFileChange(e, "layer3")} />
                      <p className={admin_product.dropzoneText}>파일을 선택하거나 드래그해주세요</p>
                    </div>
                  </div>

                  <div className={admin_product.layer}>
                    <label className={admin_product.label}>Layer 4 (상품 정보 이미지)</label>
                    <div className={admin_product.previewContainer}>
                      {previews.layer4 && (
                        <div className={admin_product.previewWrapper}>
                        <img src={previews.layer4} alt="Layer 4 Preview" className={admin_product.previewImage}/>
                          {/* 2024/12/13 삭제 버튼 추가 장훈 */}
                          <button className={admin_product.removeButton} onClick={() => handleRemovePreview("layer4")} >
                          X
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={admin_product.dropzone}>
                    {/* 2024/12/13 파일 input에 ref 연결 장훈 */}
                      <input className={admin_product.fileInput} type="file" ref={fileInputs.layer4} onChange={(e) => handleSingleFileChange(e, "layer4")} />
                      <p className={admin_product.dropzoneText}>파일을 선택해주세요</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>

            <button className={admin_product.uploadButton} onClick={handleUpload}>
              상품 등록하기
            </button>

            {progress > 0 && (
              <div className={admin_product.progressBar}>
                <div className={admin_product.progressFill} style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default Admins_ProductAdd;
