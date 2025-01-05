import React, { useState, useEffect } from "react";
import admin_productupdate from "../../assets/css/admins_productupdate.module.css";
import Admins_side from '../../components/admin_sidebar/admins_side';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

const Admins_productupdate = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    id: 0,
    name: "",
    price: "",
    content: "",
    categoryId: 0,
    gender: "",
  });

  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);

  const [stock, setStock] = useState({
    S: 0,
    M: 0,
    L: 0,
  });

  const [serverFiles, setServerFiles] = useState({
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  });

  const [files, setFiles] = useState({
    layer1: null,
    layer2: [],
    layer3: [],
    layer4: null,
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      alert('관리자 로그인이 필요합니다.');
      navigate('/user');
      return;
    }

    axiosInstance.get(`/api/admin/store/category`).then((res) => {
      if (Array.isArray(res.data.category)) {
        setCategories(res.data.category);
        console.log(res.data.category);
      } else {
        console.error("카테고리 데이터는 배열이 아닙니다 ? :", res.data);
      }

      // 성별 정보 가져오기
      axiosInstance.get(`/api/admin/store/gender`).then((res) => {
        if (Array.isArray(res.data)) {
          setGenders(res.data);
        }
      });
    });

    axiosInstance.get(`/api/store/${productId}`).then((res) => {
      console.log(res.data);
      // 상품 정보 설정
      setProduct({
        ...product,
        id: res.data.product.id,
        name: res.data.product.name,
        price: res.data.product.price,
        content: res.data.product.content,
        categoryId: res.data.product.categoryId,
        gender: res.data.product.gender,
      });

      // 2024/12/27 메인 카테고리 설정 장훈
      if (res.data.product.categoryId) {
        // API를 호출하여 해당 카테고리의 상위 카테고리 ID를 가져옴
        axiosInstance.get(`/api/admin/store/category`).then((categoryRes) => {
          // 현재 카테고리의 상위 카테고리를 찾아 설정
          const mainCategory = Object.keys(categoryRes.data).find(key => 
            categoryRes.data[key].some(subCat => subCat.id === res.data.product.categoryId)
          );
          if (mainCategory) {
            setSelectedMainCategory(mainCategory);
            // 서브 카테고리 목록도 함께 설정
            setSubCategories(categoryRes.data[mainCategory] || []);
          }
        });
      }

      // 이미지 설정
      var l1 = [];
      var l2 = [];
      var l3 = [];
      var l4 = [];

      for (let i = 0; i < res.data.imgList.length; i++) {
        switch (res.data.imgList[i].layer) {
          case 1:
            l1.push(res.data.imgList[i]);
            break;
          case 2:
            l2.push(res.data.imgList[i]);
            break;
          case 3:
            l3.push(res.data.imgList[i]);
            break;
          case 4:
            l4.push(res.data.imgList[i]);
            break;
          default:
            break;
        }
      }

      setServerFiles({
        ...serverFiles,
        layer1: l1,
        layer2: l2,
        layer3: l3,
        layer4: l4,
      });
      console.log(l1);

      // 재고 설정
      res.data.stockList.forEach((s) => {
        setStock((prevStock) => ({
          ...prevStock,
          [s.size]: s.count,
        }));
      });
      console.log(stock);
    });
  }, [isAuthenticated, isAdmin, navigate, productId]);

    // 2024/12/27 메인 카테고리 변경 핸들러 추가 장훈
    const handleMainCategoryChange = (e) => {
      const mainCategoryId = e.target.value;
      setSelectedMainCategory(mainCategoryId);
      
      // 메인 카테고리 변경 시 하위 카테고리 초기화
      setProduct(prev => ({ ...prev, categoryId: "" }));
      
      if (mainCategoryId) {
        axiosInstance.get("/api/admin/store/category").then((res) => {
          if (res.data.category && res.data[mainCategoryId]) {
            const subCategories = res.data[mainCategoryId];
            if (Array.isArray(subCategories)) {
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
  
    // 2024/12/27 서브 카테고리 변경 핸들러 추가 장훈
    const handleSubCategoryChange = (e) => {
      const subCategoryId = e.target.value;
      setProduct(prev => ({
        ...prev,
        categoryId: subCategoryId
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
  const handleSingleFileChange = (e, layer) => {
    setFiles((prev) => ({ ...prev, [layer]: e.target.files[0] }));
  };

  // 파일 추가 핸들러 (다중 파일)
  const handleMultipleFileChange = (e, layer) => {
    setFiles((prev) => ({ ...prev, [layer]: Array.from(e.target.files) }));
  };

  // 화면에서 이미지 삭제
  const cancelImg = (e, layer, img) => {
    e.preventDefault(); // 기본 동작 방지 (옵션)

    // 레이어에 해당하는 이미지를 찾아 삭제
    setServerFiles((prevFiles) => {
      // 각 레이어별로 해당 이미지 제거
      const updatedLayer = prevFiles[layer].filter(
        (item) => item.fileName !== img.fileName
      );

      return {
        ...prevFiles,
        [layer]: updatedLayer, // 해당 레이어만 업데이트
      };
    });

    console.log(files);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, layer) => {
    e.preventDefault();
    setFiles((prev) => ({ ...prev, [layer]: Array.from(e.dataTransfer.files) }));
  };

  // 업로드 핸들러
  const handleUpload = async () => {
    if (!product.name || !product.price || !product.content || !product.categoryId) {
      alert("모든 상품 정보를 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("id", product.id);
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("content", product.content);
    formData.append("categoryId", product.categoryId);
    formData.append("gender", product.gender);
    console.log(product.categoryId);
    console.log("------------");

    // 재고 데이터 추가
    Object.entries(stock).forEach(([size, count]) => {
      formData.append(size, count); // "S", "M", "L"라는 키로 전송
    });

    // 서버 파일 삭제하지 않을 id
    var selectImgList = [];
    serverFiles.layer1.forEach((file) => {
      console.log(file.id);
      selectImgList.push(file.id);
    });

    serverFiles.layer2.forEach((file) => {
      console.log(file.id);
      selectImgList.push(file.id);
    });

    serverFiles.layer3.forEach((file) => {
      console.log(file.id);
      selectImgList.push(file.id);
    });

    serverFiles.layer4.forEach((file) => {
      console.log(file.id);
      selectImgList.push(file.id);
    });

    // 배열을 JSON 문자열로 변환하여 추가
    formData.append("selectImgList", JSON.stringify(selectImgList));

    // 사용자 파일 추가 (layer 정보와 함께)
    formData.append("layer1", files.layer1); // 단일 파일
    files.layer2.forEach((file) => formData.append("layer2", file)); // 다중 파일
    files.layer3.forEach((file) => formData.append("layer3", file)); // 다중 파일
    formData.append("layer4", files.layer4); // 단일 파일

    console.log(formData);
    try {
      const response = await axiosInstance.put(
        `/api/admin/store/product`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      alert("상품 업로드가 완료되었습니다.");
      navigate(`/admin/admin_productList`)
      resetForm();
    } catch (error) {
      console.error("업로드 실패:", error.response.data);
      alert(`업로드에 실패했습니다: ${error.response.data.message}`);
    }
  };

  return (
    <div className={admin_productupdate.uploadContainer}>
        <Admins_side/>
        <div className={admin_productupdate.uploadWrapper}>
            <h1 className={admin_productupdate.uploadTitle}>상품 수정</h1>
            <div className={admin_productupdate.form}>

                {/* 버튼
                <div className={admin_productupdate.Navi}>
                    <Link to="/admins_productadd">
                        <button className={admin_productupdate.UploadBtn}>상품 추가</button>
                    </Link>
                    <Link to="/admins_productUpdate">
                        <button className={admin_productupdate.UpdateBtn}>상품 수정</button>
                    </Link>
                </div> */}

            <h2 className={admin_productupdate.sectionTitle}>기본 상품 정보</h2>
            <div className={admin_productupdate.basicsection}>
            {/* 상품명, 가격, 설명 입력 */}
            <div className={admin_productupdate.inputGroup}>
                <label className={admin_productupdate.label}>상품명</label>
                <input className={admin_productupdate.input} type="text" name="name" value={product.name} onChange={handleInputChange} placeholder="상품명을 입력하세요." />
            </div>

            <div className={admin_productupdate.inputGroup}>
                <label className={admin_productupdate.label}>가격</label>
                <input className={admin_productupdate.input} type="number" name="price" value={product.price} onChange={handleInputChange} placeholder="가격을 입력하세요." />
            </div>

            {/* 메인 카테고리 선택 */}
            <div className={admin_productupdate.inputGroup}>
              <label className={admin_productupdate.label}>카테고리</label>
              <select className={admin_productupdate.select} value={selectedMainCategory} onChange={handleMainCategoryChange} >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 서브 카테고리 선택 */}
            <div className={admin_productupdate.inputGroup}>
              <label className={admin_productupdate.label}>세부 카테고리</label>
              <select className={admin_productupdate.select} value={product.categoryId} onChange={handleSubCategoryChange} >
                <option value="">세부 카테고리 선택</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 성별 선택 */}
            <div className={admin_productupdate.inputGroup}>
                <label className={admin_productupdate.label}>성별</label>
                <select className={admin_productupdate.select} name="gender" value={product.gender} onChange={handleInputChange} >
                <option value="">성별 선택</option>
                {genders.map((gender, index) => (
                    <option key={index} value={gender}>
                    {gender}
                    </option>
                ))}
                </select>
            </div>
            </div>
            <div className={admin_productupdate.accounSection}>
                <div className={admin_productupdate.inputGroup}>
                    <h2 className={admin_productupdate.sectionTitle}>상품 설명</h2>
                    <textarea className={admin_productupdate.textarea} name="content" value={product.content} onChange={handleInputChange} placeholder="상품 설명을 입력하세요." />
                </div>
            </div>

            {/* 재고 입력 */}
            <div className={admin_productupdate.stockSection}>
                <h2 className={admin_productupdate.sectionTitle}>재고 수량</h2>
                <div className={admin_productupdate.stockGrid}>
                {Object.entries(stock).map(([size, count]) => (
                    <div key={size} className={admin_productupdate.stockItem}>
                    <label className={admin_productupdate.label}>{size} 사이즈</label>
                    <input className={admin_productupdate.input} type="number" value={count} onChange={(e) => handleStockChange(size, e.target.value)} />
                    </div>
                ))}
                </div>
            </div>

            {/* 이미지 업로드 */}
            <div className={admin_productupdate.fileSection}>
                <h2 className={admin_productupdate.sectionTitle}>이미지 업로드</h2>
                
                <div className={admin_productupdate.inputGroup}>
                    <div className={admin_productupdate.layerWrapper}>
                        <div className={admin_productupdate.layer}>
                            <label className={admin_productupdate.label}>Layer 1 (대표 이미지)</label>
                            <div className={admin_productupdate.parentContainer}>
                                {serverFiles.layer1.map((img, index) => (
                                <div key={index} className={admin_productupdate.productImgDiv}>
                                    <img className={admin_productupdate.productImg} src={img.fileName} alt={img.fileName} />
                                    <button className={admin_productupdate.cancelBtn} onClick={(e) => cancelImg(e, "layer1", img)} >
                                    X
                                    </button>
                                </div>
                                ))}
                            </div>
                            <div className={admin_productupdate.dropzone}>
                                <input type="file" onChange={(e) => handleSingleFileChange(e, "layer1")} />
                                <p className={admin_productupdate.dropzoneText}>
                                    파일을 선택해주세요
                                </p>
                            </div>
                        </div>

                        <div className={admin_productupdate.layer}>
                            <label className={admin_productupdate.label}>Layer 2 (상세 이미지)</label>
                            <div className={admin_productupdate.parentContainer}>
                                {
                                serverFiles.layer2.map((img, index) => (
                                    <>
                                    <div className={admin_productupdate.productImgDiv}>
                                        <img className={admin_productupdate.productImg} key={index} src={img.fileName} alt={img.fileName} />
                                        <button className={admin_productupdate.cancelBtn} onClick={(e) => cancelImg(e, "layer2", img)}>X</button>
                                    </div>
                                    </>
                                ))
                                }
                            </div>
                            <div className={admin_productupdate.dropzone} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "layer2")} >
                                <input type="file" multiple onChange={(e) => handleMultipleFileChange(e, "layer2")} />
                                <p className={admin_productupdate.dropzoneText}>
                                파일을 선택하거나 드래그해주세요
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={admin_productupdate.inputGroup}>
                    <div className={admin_productupdate.layerWrapper}>
                        <div className={admin_productupdate.layer}>
                            <label className={admin_productupdate.label}>Layer 3 (추가 상세 이미지)</label>
                            <div className={admin_productupdate.parentContainer}>
                                {
                                serverFiles.layer3.map((img, index) => (
                                    <>
                                    <div className={admin_productupdate.productImgDiv}>
                                        <img className={admin_productupdate.productImg} key={index} src={img.fileName} alt={img.fileName} />
                                        <button className={admin_productupdate.cancelBtn} onClick={(e) => cancelImg(e, "layer3", img)}>X</button>
                                    </div>
                                    </>
                                ))
                                }
                            </div>
                            <div className={admin_productupdate.dropzone} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "layer3")} >
                                <input type="file" multiple onChange={(e) => handleMultipleFileChange(e, "layer3")} />
                                <p className={admin_productupdate.dropzoneText}>
                                파일을 선택하거나 드래그해주세요
                                </p>
                            </div>
                        </div>

                        <div className={admin_productupdate.layer}>
                            <label className={admin_productupdate.label}>Layer 4 (상품 정보 이미지)</label>
                            <div className={admin_productupdate.parentContainer}>
                                <div className={admin_productupdate.parentContainer}>
                                    {
                                    serverFiles.layer4.map((img, index) => (
                                        <>
                                        <div className={admin_productupdate.productImgDiv}>
                                            <img className={admin_productupdate.productImg} key={index} src={img.fileName} alt={img.fileName} />
                                            <button className={admin_productupdate.cancelBtn} onClick={(e) => cancelImg(e, "layer4", img)}>X</button>
                                        </div>
                                        </>
                                    ))
                                    }
                                </div>
                            </div>
                            <div className={admin_productupdate.dropzone}>
                            <input type="file" onChange={(e) => handleSingleFileChange(e, "layer4")} />
                            <p className={admin_productupdate.dropzoneText}>
                            파일을 선택해주세요
                            </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className={admin_productupdate.uploadButton} onClick={handleUpload}>
                상품 수정하기
            </button>

            {progress > 0 && (
                <div className={admin_productupdate.progressBar}>
                <div className={admin_productupdate.progressFill} style={{ width: `${progress}%` }} />
                </div>
            )}
            </div>
        </div>
    </div>
  );
};

export default Admins_productupdate;
