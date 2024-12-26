import React from "react";
import singup from '../../assets/css/user_sigup.module.css';
import { Link } from 'react-router-dom';
import Footer from './../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import useUserSignup from '../../contexts/user/User_SignUpContext';

function UserSignup() {
    const {
        formData,
        errors,
        handleChange,
        IdCheckHandleBlur,
        handleBlur,
        handleFindPostalCode,
        handleSubmit,
    } = useUserSignup();

    return (
        <div className={singup.signupContainer}>
            <div className={singup.signbanner}>
                <Banner />
            </div>
            <div className={singup.signheader}></div>
            <div className={singup.pageName}>Sign Up</div>
            <div className={singup.signupDiv}>
                <form className={singup.signupForm} onSubmit={handleSubmit}>
                    {/* ID */}
                    <div className={singup.formRow}>
                        <span>ID</span>
                        <input type="text" name="userId" value={formData.userId} onChange={handleChange} onBlur={IdCheckHandleBlur} />
                        <div className={singup.exception}>{errors.userId}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Password */}
                    <div className={singup.formRow}>
                        <span>PASSWORD</span>
                        <input type="password" name="pwd" placeholder="* 영문, 숫자, 특수문자(!@#$%^&*)를 포함한 8~15자리" value={formData.pwd} onChange={handleChange} onBlur={handleBlur} />
                        <div className={singup.exception}>{errors.pwd}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Confirm Password */}
                    <div className={singup.formRow}>
                        <span>CONFIRM PASSWORD</span>
                        <input type="password" name="confirmPwd" value={formData.confirmPwd} onChange={handleChange} onBlur={handleBlur} />
                        <div className={singup.exception}>{errors.confirmPwd}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Name */}
                    <div className={singup.formRow}>
                        <span>NAME</span>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} />
                        <div className={singup.exception} >{errors.name}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Gender */}
                    <div className={singup.formRow}>
                        <span>GENDER</span>
                        <div className={singup.radioContainer}>
                            <input type="radio" name="gender" value="M" checked={formData.gender === "M"} onChange={handleChange}/> Male
                            <input type="radio" name="gender" value="F" checked={formData.gender === "F"} onChange={handleChange}/> Female
                        </div>
                        <div className={singup.exception}>{errors.gender}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Address */}
                    <div className={singup.formRow}>
                        <span>ADDRESS</span>
                        <div className={singup.addressContainer}>
                            <div className={singup.postalRow}>
                                <input type="text" name="postalCode" placeholder="우편번호" value={formData.postalCode} onChange={handleChange} onBlur={handleBlur} />
                                <button type="button" onClick={handleFindPostalCode} className={singup.findButton}>
                                    우편번호 찾기
                                </button>
                            </div>
                            <div className={singup.detailedAddress}>
                                <input type="text" name="address" placeholder="기본 주소" value={formData.address} onChange={handleChange} onBlur={handleBlur} />
                            </div>
                            <div className={singup.detailedAddress}>
                                <input type="text" name="detailedAddress" placeholder="상세 주소" value={formData.detailedAddress} onChange={handleChange} onBlur={handleBlur} />
                            </div>
                        </div>
                        <div className={singup.exception}>{errors.address}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Phone */}
                    <div className={singup.formRow}>
                        <span>PHONE</span>
                        <div className={singup.phoneRow}>
                            <input type="text" name="phone1" placeholder="010" maxLength="3" value={formData.phone1} onChange={handleChange} onBlur={handleBlur} />
                            <p>-</p>
                            <input type="text" name="phone2" placeholder="0000" maxLength="4" value={formData.phone2} onChange={handleChange} onBlur={handleBlur} />
                            <p>-</p>
                            <input type="text" name="phone3" placeholder="0000" maxLength="4" value={formData.phone3} onChange={handleChange} onBlur={handleBlur} />
                        </div>
                        <div className={singup.exception}>{errors.phone}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Email */}
                    <div className={singup.formRow}>
                        <span>EMAIL</span>
                        <input className={singup.emaildetail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
                        <div className={singup.exception}>{errors.email}</div>
                    </div>
                    <hr className={singup.signupline} />

                    {/* Buttons */}
                    <div className={singup.signupbtn}>
                        <button type="submit" className={singup.submitButton}>회원가입</button>
                        <Link to="/user">
                            <button type="reset" className={singup.submitButton}>취소</button>
                        </Link>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default UserSignup;