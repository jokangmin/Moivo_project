import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../assets/css/Mypage_profile.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { useMypageProfileContext } from "../../contexts/mypageCon/MypageProfileContext";
import Modal from 'react-modal'; // Import the Modal component

const MypageProfile = () => {
    const {
        userInfo,
        formData,
        errors,
        setFormData,
        handleSubmit,
        handleDeleteAccount,
        handleDeletePasswordChange,
        handleChange,
        handleBlur,
        handleFindPostalCode,
        handleMouseEnter,
        handleMouseLeave,
        handleOpenModal,
        handleCloseModal,
        handleCancel,
        showTooltip,
        showModal,
        deletePassword,
        validatePassword,
        validateForm,
        loadDaumPostcodeScript,
        splitPhoneNumber,
    } = useMypageProfileContext();

    return (
            <div>
                <Banner />
                <div className={styles.profileContainer}>      
                    <div className={styles.pageName}>PROFILE</div>
                    <button className={styles.deleteButton} onClick={handleOpenModal}>
                        회원 탈퇴
                    </button>
                           {/* 멤버십 박스 */}
                    <div className={styles.membershipBox}>
                    <div className={styles.membershipImage}>
                        <img src="../image/level5.png" alt="Profile" />
                    </div>
                    <div>
                        <div className={styles.membershipInfo}>
                        {userInfo ? (
                            <>
                                <p>{userInfo.name}님의 멤버십 등급은 <strong>[ {userInfo.grade} ]</strong>입니다.</p>
                                {userInfo && userInfo.nextLevelTarget !== undefined ? (
                                    <p>
                                        다음 등급까지 남은 구매금액은 
                                        <strong>KRW {userInfo.nextLevelTarget.toLocaleString()}원</strong>입니다.
                                    </p>
                                ) : (
                                    <strong><p>다음 등급 정보가 없습니다.</p></strong>
                                )}

                                <p>
                                키: <strong>{userInfo.height}cm</strong> &nbsp;
                                몸무게: <strong>{userInfo.weight}kg</strong>
                                </p>
                            </>
                            ) : (
                            "사용자 정보를 불러오는 중입니다..."
                            )}
                        </div>
                        <div className={styles.couponSection}>
                            <div className={styles.coupon}>
                                COUPON: &nbsp;
                                {userInfo && userInfo.coupons ? (
                                userInfo.coupons.map((coupon, index) => (
                                    <strong key={index}>{coupon.couponName}</strong>
                                ))
                                ) : (
                                "쿠폰 정보를 불러오는 중입니다..."
                                )}
                            </div>
                        </div>
                    </div>
                    <Modal 
                        isOpen={showModal} 
                        onRequestClose={handleCloseModal}
                        contentLabel="회원 탈퇴 확인"
                        className={styles.modal}
                        overlayClassName={styles.overlay}
                    >
                        <div className={styles.modalContent}>
                            <h2>회원 탈퇴</h2>
                            <p>회원 탈퇴를 위해 비밀번호를 입력해 주세요.</p>
                            <input 
                                type="password" 
                                value={deletePassword || ""} 
                                onChange={handleDeletePasswordChange} 
                                placeholder="비밀번호" 
                                className={styles.inputtext}
                            />
                            <div className={styles.modalButtons}>
                                <button onClick={handleDeleteAccount} className={styles.confirmButton}>탈퇴</button>
                                <button onClick={handleCloseModal} className={styles.cancelButton2}>취소</button>
                            </div>
                        </div>
                    </Modal>
                        </div>
                            {/* 아이콘 영역 (우측 상단에 배치) */}
                            <div 
                            className={styles.tooltipIcon} 
                            onMouseEnter={handleMouseEnter} 
                            onMouseLeave={handleMouseLeave}
                            >
                            <img src="../image/info.png" alt="Info Icon"/>
                            {showTooltip && (
                                <div className={styles.tooltip}>
                                <p>
                                    LV 1 : 일반회원<br />
                                    LV 2: 월 구매 10만원 이상<br />
                                    LV 3: 월 구매 30만원 이상<br />
                                    LV 4: 월 구매 50만원 이상<br />
                                    LV 5: 월 구매 70만원 이상<br /><br/>
                                    <strong>LV 2 혜택:</strong> LV2 전용 15% 할인 쿠폰<br />
                                    <strong>LV 3 혜택:</strong> LV3 전용 20% 할인 쿠폰<br />
                                    <strong>LV 4 혜택:</strong> LV4 전용 25% 할인 쿠폰<br />
                                    <strong>LV 5 혜택:</strong> LV5 전용 30% 할인 쿠폰<br />
                                
                                </p>
                                </div>
                            )}
                        </div>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    {/* ID */}
                    <div className={styles.formRow}>
                        <span>ID</span>
                        <input type="text" name="userId" value={formData.userId || ""} readOnly/>
                    </div>
                    <hr className={styles.signupline} />

                    {/* Password */}
                    <div className={styles.formRow}>
                        <span>PASSWORD</span>
                        <input type="password" name="pwd" value={formData.pwd || ""} onChange={handleChange} />
                    </div>
                    {errors.pwd && <p className={styles.errorText}>{errors.pwd}</p>}
                    <hr className={styles.signupline} />

                    {/* Confirm Password */}
                    <div className={styles.formRow}>
                        <span>CONFIRM PASSWORD</span>
                        <input type="password" name="confirmPwd" value={formData.confirmPwd || ""} onChange={handleChange} />
                    </div>
                    {errors.confirmPwd && <p className={styles.errorText}>{errors.confirmPwd}</p>}
                    <hr className={styles.signupline} />

                    {/* Name */}
                    <div className={styles.formRow}>
                        <span>NAME</span>
                        <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
                    </div>
                    {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                    <hr className={styles.signupline} />

                    {/* Gender */}
                    <div className={styles.formRow}>
                        <span>GENDER</span>
                        <div className={styles.radioContainer}>
                            <input type="radio" name="gender" value="M" checked={formData.gender === "M"} onChange={handleChange} /> Male
                            <input type="radio" name="gender" value="F" checked={formData.gender === "F"} onChange={handleChange} /> Female
                        </div>
                    </div>
                    <hr className={styles.signupline} />

                    {/* Address */}
                    <div className={styles.formRow}>
                        <span>ADDRESS</span>
                        <div className={styles.addressContainer}>
                            <div className={styles.postalRow}>
                                <input type="text" name="zipcode" placeholder="우편번호" value={formData.zipcode || ""} onChange={handleChange} required/>
                                <button type="button" onClick={handleFindPostalCode} className={styles.findButton}>우편번호 찾기</button>
                            </div>
                            <input type="text" name="addr1" placeholder="기본 주소" value={formData.addr1 || ""} onChange={handleChange} required/>
                            <input type="text" name="addr2" placeholder="상세 주소" value={formData.addr2 || ""} onChange={handleChange} />
                        </div>
                    </div>
                    <hr className={styles.signupline} />

                    {/* Phone */}
                    <div className={styles.formRow}>
                        <span>PHONE</span>
                        <div className={styles.phoneRow}>
                            <input type="text" name="phone1" maxLength="3" value={formData.phone1 || ""} onChange={handleChange} />
                            <p>-</p>
                            <input type="text" name="phone2" maxLength="4" value={formData.phone2 || ""} onChange={handleChange} />
                            <p>-</p>
                            <input type="text" name="phone3" maxLength="4" value={formData.phone3 || ""} onChange={handleChange} />
                        </div>
                    </div>
                    {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
                    <hr className={styles.signupline} />

                    {/* Email */}
                    <div className={styles.formRow}>
                        <span>EMAIL</span>
                        <input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                    </div>
                    {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    <hr className={styles.signupline} />

                    {/* BIRTH */}
                    <div className={styles.formRow}>
                        <span>BIRTH</span>
                        <div className={styles.birthRow}>
                            <input
                                className={styles.inputtext}
                                type="date"
                                name="birth"
                                value={formData.birth || ""}
                                onChange={handleChange}
                            />  
                        </div>               
                    </div>
                    <hr className={styles.signupline} />
                    {/* HEIGHT */}
                    <div className={styles.formRow}>
                        <span>HEIGHT (cm):</span>
                        <div className={styles.weightRow}>
                            <input
                                className={styles.inputtext2}
                                type="number"
                                id="height"
                                name="height"
                                value={formData.height || ""}
                                placeholder="예: 170"
                                onChange={handleChange}
                            />
                        </div>
                    </div>  
                     <hr className={styles.signupline} />
                     {/* WEIGHT */}
                     <div className={styles.formRow}>
                        <span>WEIGHT (kg):</span>
                        <div className={styles.weightRow}>
                            <input
                                className={styles.inputtext2}
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight || ""}
                                placeholder="예: 100"
                                onChange={handleChange}
                            />
                        </div>
                    </div>         
                    <hr className={styles.signupline} />
                    
                    {/* Buttons */}
                    <div className={styles.buttonRow}>
                        <button type="submit" className={styles.submitButton}>회원정보 수정</button>
                        <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                        취소
                        </button>
                    </div>
                </form>

                <div className={styles.bottomBar}></div>
                <Link to="/mypage" className={styles.backLink}>Go Back to MyPage</Link>
            </div>
            <Footer />
        </div>
    );
};

export default MypageProfile;