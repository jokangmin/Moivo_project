import { useState } from "react";
import axios from "axios";
import { PATH } from "../../../scripts/path";
import { useNavigate } from "react-router-dom";

const useUserSignup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        pwd: "",
        confirmPwd: "",
        name: "",
        postalCode: "",
        address: "",
        detailedAddress: "",
        phone1: "010",
        phone2: "",
        phone3: "",
        email: "",
        gender:"",
    });

    const [errors, setErrors] = useState({
        userId: "",
        pwd: "",
        confirmPwd: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        gender:"",
    });

    // 동적 스크립트 로드 함수
    const loadDaumPostcodeScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById("daum-postcode-script")) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.id = "daum-postcode-script";
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.onload = resolve;
            document.body.appendChild(script);
        });
    };

    // 우편번호 찾기 함수
    const handleFindPostalCode = async () => {
        try {
            await loadDaumPostcodeScript();

            new window.daum.Postcode({
                oncomplete: function (data) {
                    setFormData((prevData) => ({
                        ...prevData,
                        postalCode: data.zonecode,
                        address: data.roadAddress,
                    }));
                },
            }).open();
        } catch (error) {
            console.error("우편번호 찾기 스크립트 로드 실패:", error);
        }
    };

    // 입력값 변경 처리 함수
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    // 포커스 아웃 시 검증
    const handleBlur = (e) => {
        const { name } = e.target;

        // 휴대폰 번호 검증
        if (name === "phone1" || name === "phone2" || name === "phone3") {
            // phone1, phone2, phone3 모두 입력되었는지 확인
            if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    phone: "전화번호를 모두 입력해주세요.",
                }));
            } else {
                // phone2와 phone3이 정확히 4자리 숫자인지 확인
                const phonePattern = /^\d{4}$/;
                if (!phonePattern.test(formData.phone2) || !phonePattern.test(formData.phone3)) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        phone: "전화번호는 숫자 4자리씩 입력해야 합니다.",
                    }));
                } else {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        phone: "",
                    }));
                }
            }
        } else if (name === "postalCode" || name === "address" || name === "detailedAddress") {
            // 주소 필드 검증
            if (!formData.postalCode || !formData.address || !formData.detailedAddress) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    address: "주소를 모두 입력해주세요.",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    address: "",
                }));
            }
        } else {
            // 다른 필드들에 대한 검증
            validateField(name);
        }
    };

    // ID 중복 체크 포커스 아웃시 검증
    const IdCheckHandleBlur = async (e) => {
        const {name} = e.target;

        //ID 중복 체크
        if (name === "userId") {
            if (!formData.userId) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userId: "아이디를 입력해주세요.",
                }));
                return;
            }
            try {
                // 서버로 GET 요청 전송
                const response = await axios.get(`${PATH.SERVER}/api/user/idCheck`, {
                    params: {userId: formData.userId}, // GET 요청 파라미터
                });
                console.log(response.status);
                if (response.status === 201) {
                    // 성공적으로 사용 가능한 아이디인 경우
                    console.log("status = " + response.status); // 201 Created 상태 코드 확인
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        userId: "사용 가능한 아이디입니다.",
                        userIdStatus: "success"
                    }));
                }
            } catch (error) {
                if (error.response.status === 409) {
                    console.log(error.response.status)
                    // 중복된 아이디인 경우 (409 Conflict)
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        userId: "이미 사용 중인 아이디입니다.",
                        userIdStatus: "error"
                    }));
                } else {
                    // 기타 에러
                    console.error("아이디 중복 확인 실패:", error);
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        userId: "아이디 중복 확인에 실패했습니다.",
                        userIdStatus: "error"
                    }));
                }
            }
        }
    }
    // ID 중복 체크 포커스 아웃시 검증

    // 필드별 검증 함수
    const validateField = (fieldName) => {
        let newError = '';
        let value = formData[fieldName];

        switch (fieldName) {
            case "userId":
                newError = value ? "" : "아이디를 입력해주세요.";
                break;
            case "pwd":
                if (!value) {
                    newError = "비밀번호를 입력해주세요.";
                } else {
                    // 비밀번호 정규식 패턴 추가
                    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
                    if (!passwordPattern.test(value)) {
                        newError = "비밀번호는 영문, 숫자, 특수문자를 포함한 8~15자리여야 합니다.";
                    }
                }
                break;
            case "confirmPwd":
                newError = formData.pwd !== formData.confirmPwd ? "비밀번호가 일치하지 않습니다." : "";
                break;
            case "name":
                newError = value ? "" : "이름을 입력해주세요.";
                break;
                case "gender":
                    newError = value ? "" : "성별을 선택해주세요.";
                    break;
            case "address":
                newError = formData.postalCode && formData.address && formData.detailedAddress ? "" : "주소를 모두 입력해주세요.";
                break;
            case "phone1":
            case "phone2":
            case "phone3":
                if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
                    newError = "전화번호를 모두 입력해주세요.";
                } else {
                    const phone2Pattern = /^\d{4}$/; // phone2는 반드시 4자리
                    const phone3Pattern = /^\d{4}$/; // phone3는 반드시 4자리
                    if (!phone2Pattern.test(formData.phone2)) {
                        newError = "2번째 전화번호를 숫자 4자리로 입력해주세요.";
                    } else if (!phone3Pattern.test(formData.phone3)) {
                        newError = "3번째 전화번호를 숫자 4자리로 입력해주세요.";
                    } else {
                        newError = "";
                    }
                }
                break;
            case "email":
                newError = value ? "" : "이메일을 입력해주세요.";
                break;
            default:
                break;
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: newError, // 개별 필드의 오류 메시지만 업데이트
        }));

        return newError; // 오류 메시지를 반환
    };

    // 폼 검증 함수
    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        // 각 필드에 대해 검증 , 오류면 isValid를 false로 설정
        Object.keys(formData).forEach((field) => {
            if (field === "phone1" || field === "phone2" || field === "phone3") {
                // 전화번호 전체를 검증
                const phoneError = validateField("phone1") || validateField("phone2") || validateField("phone3");
                if (phoneError) {
                    newErrors.phone = phoneError; // phone에 대한 공통 에러 설정
                    isValid = false;
                }
            } else {
                const error = validateField(field);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        setErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return isValid;
    };

    // 폼 제출 처리 함수
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // 2024-12-12 phoneNuber 합치기 장훈
            const fullPhoneNumber = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
            await axios.post(`${PATH.SERVER}/api/user/join`, {
                userId: formData.userId,
                pwd: formData.pwd,
                name: formData.name,
                email: formData.email,
                gender: formData.gender,
                zipcode: formData.postalCode,
                addr1: formData.address,
                addr2: formData.detailedAddress,
                tel: fullPhoneNumber
            });
            alert("회원가입 성공!");
            navigate("/user");
        } catch (error) {
            console.error("회원가입 실패:", error);
            alert("회원가입에 실패했습니다.");
        }
    };

    return {
        formData,
        errors,
        handleChange,
        IdCheckHandleBlur,
        handleBlur,
        handleFindPostalCode,
        handleSubmit,
    };
};

export default useUserSignup;