import React, { useEffect, useState, useRef } from 'react';
import styles from '../assets/css/Main_index.module.css';
import video from '../assets/image/main_banner1.mp4';
import Banner from "../components/Banner/banner";
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../contexts/AuthContext';
import Modal from 'react-modal';
//확인하기 위해 아래 사용 NCP 연동 시 수정 및 삭제
import image1 from "../assets/image/1_outer.jpg";
import image2 from "../assets/image/2_outer.jpg";
import image3 from "../assets/image/4_outer.jpg";
import image4 from "../assets/image/6_outer.jpg";
import Footer from './Footer/Footer';


const Main_index = () => {
    const [animate, setAnimate] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    //2024/12/23 팝업 상태 관리 추가 장훈
    const [isModalOpen, setIsModalOpen] = useState(false);

    //2024/12/23 날짜 형식 변환 추가 장훈
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    //확인하기 위해 아래 사용 NCP 연동 시 수정 및 삭제
    const slides = [
        { src: image1 },
        { src: image2 },
        { src: image3 },
        { src: image4 },
    ];

    const onStop = () => setAnimate(false);
    const onRun = () => setAnimate(true);

     const toggleMenu = () => {
          setMenuOpen(!menuOpen); // 메뉴 상태 토글
      };

    useEffect(() => {
        // AOS 초기화
        AOS.init({
            duration: 2000,   // 애니메이션 지속 시간
            once: false,      // 한번만 애니메이션 실행 여부
            offset: 0,        // 애니메이션 트리거 위치
        });
        AOS.refresh();

        // 2024/12/23 "오늘 하루 안 보기" 확인 추가 장훈
        const hidePopup = localStorage.getItem('hidePopup');
        const today = getTodayDate();
        if (hidePopup !== today) {
            console.log(`모달 표시: 저장된 날짜(${hidePopup})와 오늘(${today})가 다릅니다.`);
            setIsModalOpen(true);
        } else {
            console.log(`모달 숨김: 저장된 날짜(${hidePopup})가 오늘(${today})과 같습니다.`);
        }
    }, []);

    const parentDivRef = useRef(null);
    const childDivRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const parentDiv = parentDivRef.current;
            const viewportHeight = window.innerHeight;
            const fromViewportToParentHeight = parentDiv.getBoundingClientRect().top;
            const scrollPassedAmount = viewportHeight - fromViewportToParentHeight;

            // Determine div height
            let divHeight = parentDiv.clientHeight > viewportHeight ? viewportHeight : parentDiv.clientHeight;
            let scrollRate = (scrollPassedAmount / divHeight) * 100;

            // Clamp scrollRate to [0, 100] range
            if (scrollRate < 0) {
                scrollRate = 0;
            } else if (scrollRate > 100) {
                scrollRate = 100;
            }

            // Apply style
            const childDiv = childDivRef.current;
            childDiv.style.transform = `scale(${scrollRate / 100})`;
        };

        // Attach scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
    };

    //2024/12/23 모달 취소 핸들러 추가 장훈
    const closeModal = () => {
        setIsModalOpen(false);
    };

    //2024/12/23 로컬 스토리지 날짜 저장 추가 장훈
    const hideForToday = () => {
        const today = getTodayDate();
        localStorage.setItem('hidePopup', today);
        console.log(`로컬스토리지에 저장된 날짜: ${today}`);
        setIsModalOpen(false); // 모달 닫기
    };

    return (
        <div className={styles.maindiv}>
            <Banner/>
            {/* banner */}

            {/* 2024/12/23 모달 추가 장훈 */}
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className={styles.modal} overlayClassName={styles.overlay} ariaHideApp={false} >
                <div className={styles.modalContent}>
                    <h2>이벤트 안내</h2>
                    <p>Moivo에서 진행하는 새로운 이벤트를 확인하세요!</p>
                    <div className={styles.modalButtons}>
                        <button onClick={closeModal} className={styles.closeButton}>
                            닫기
                        </button>
                        <button onClick={hideForToday} className={styles.todayButton}>
                            오늘 하루 안 보기
                        </button>
                    </div>
                </div>
            </Modal>

            <div className={styles.videoContainer}>
                <video className={styles.video} autoPlay muted loop>
                    <source src={video} type="video/mp4" />
                </video>
            </div>

            {/* main_part1 */}
            <div className={styles.stickyContainer}>
                {/* 이미지 섹션 */}
                <div 
                    className={styles.imageSection} 
                    data-aos="fade-right" 
                    data-aos-offset="100%"  // 화면 중앙에서 트리거
                    data-aos-delay="500"   // 지연 시간 500ms
                ></div>

                {/* 구분선 */}
                <div 
                    className={styles.divider} 
                    data-aos="fade-right" 
                    data-aos-offset="100%"  // 화면 중앙에서 트리거
                    data-aos-delay="800"   // 지연 시간 800ms
                ></div>

                {/* 텍스트 섹션 */}
                <div 
                    className={styles.textSection} 
                    data-aos="fade-up" 
                    data-aos-offset="100%"  // 화면 중앙에서 트리거
                    data-aos-delay="1200"   // 지연 시간 1200ms
                >
                    <h1 className={styles.title}>Moivo</h1>
                    <p className={styles.text}>
                        Discover elegance redefined. Step into a world where style meets sophistication, crafted exclusively for those who dare to stand out.
                    </p>
                </div>
            </div>

           {/* main_part2 */}
            <div className={styles.stickyContainer2}>
                {/* 텍스트 섹션 */}
                <div 
                    className={styles.textSection2} 
                    data-aos="fade-up" 
                    data-aos-offset="50%"  // 화면 중앙에서 트리거
                    data-aos-delay="1200"   // 지연 시간 1200ms
                >
                    <h1 className={styles.title2}>Moivo</h1>
                    <p className={styles.text2}>
                        Embrace the essence of timeless elegance, where each detail is crafted to captivate. A realm of sophistication awaits, designed for those bold enough to make their mark.
                    </p>
                </div>
                {/* 구분선 */}
                <div 
                    className={styles.divider2} 
                    data-aos="fade-left" 
                    data-aos-offset="100%"  // 화면 중앙에서 트리거
                    data-aos-delay="800"   // 지연 시간 800ms
                ></div>
                {/* 이미지 섹션 */}
                <div 
                    className={styles.imageSection2} 
                    data-aos="fade-left" 
                    data-aos-offset="100%"  // 화면 중앙에서 트리거
                    data-aos-delay="500"   // 지연 시간 500ms
                ></div>
            </div>

            {/* main_part3 */}
            <div ref={parentDivRef} className={styles.stickyContainer3}>
                <div ref={childDivRef} className={styles.child_div2}>
                    <div 
                        className={styles.textSection3} 
                        data-aos="fade-up" 
                        data-aos-offset="100%"  
                        data-aos-delay="1200"   
                    ><h1 className={styles.title3}>Today’s weather, my mood</h1>
                    <p className={styles.text3}>
                        기온에 따라 변하는 나만의 룩, 
                        오늘의 무드에 맞는 스타일을 찾아보세요.
                    </p>
                    </div>
                </div>
            </div>

            {/* main_part4 */}
            <div className={styles.slide_container}>
                <ul
                    className={styles.slide_wrapper}
                    onMouseEnter={onStop}
                    onMouseLeave={onRun}
                >
                    {/* Original 슬라이드 */}
                    <div
                        className={`${styles.slide} ${styles.original} ${
                            !animate ? styles.stop : ""
                        }`}
                    >
                        {slides.map((s, i) => (
                            <Link to="/product-list" key={i}>
                                <li className={styles.slide_list}>
                                    
                                        <img
                                            src={s.src}
                                            alt={`Slide ${i + 1}`}
                                            className={styles.item}
                                        />
                                    
                                </li>
                            </Link>
                        ))}
                    </div>
                    {/* Clone 슬라이드 */}
                    <div
                        className={`${styles.slide} ${styles.clone} ${
                            !animate ? styles.stop : ""
                        }`}
                    >
                        {slides.map((s, i) => (
                            <Link to="/product-list"  key={i}>
                                <li className={styles.slide_list}>
                                        <img
                                            src={s.src}
                                            alt={`Slide ${i + 1}`}
                                            className={styles.item}
                                        />
                                </li>
                            </Link>
                        ))}
                    </div>
                </ul>
                <div className={styles.main4Title}>
                    <p>Moivo 만의 감성과 편안함, <br/>
                        그리고 다양한 스타일을 사용자 맞춤으로 추천합니다.</p>
                </div>
            </div>
            {/* main_part4 end */}


            {/* main_part5 */}
            <div className={styles.book}>
                <section className={styles.pageSection}>
                    <div className={styles.page1}>
                    <h2>Moivo</h2>
                    <span>f/w 최대 90% Sale</span>
                    </div>
                    <Link to="/product-list">
                        <div className={styles.page2}>
                        <h2>Sale Product</h2>
                        <span>This is second page...</span>
                        </div>
                    </Link>
                </section>
            </div>


            {/* Footer */}
            <Footer />
        </div>
        
    );
};

export default Main_index;