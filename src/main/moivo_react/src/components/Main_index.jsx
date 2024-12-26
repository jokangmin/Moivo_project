import React from 'react';
import styles from '../assets/css/Main_index.module.css';
import video from '../assets/image/main_banner1.mp4';
import Banner from "../components/Banner/banner";
import { Link } from 'react-router-dom';
import Footer from './Footer/Footer';
import { useMainIndex } from '../contexts/MainContext';

const Main_index = () => {
    const {
        animate,
        onStop,
        onRun,
        slides,
        parentDivRef,
        childDivRef,
    } = useMainIndex();

    return (
        <div className={styles.maindiv}>
            <Banner />

            <div className={styles.videoContainer}>
                <video
                    className={styles.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    defaultMuted
                >
                    <source src={video} type="video/mp4" />
                </video>
            </div>

            <div className={styles.stickyContainer}>
                <div
                    className={styles.imageSection}
                    data-aos="fade-right"
                    data-aos-offset="100%"
                    data-aos-delay="500"
                ></div>

                <div
                    className={styles.divider}
                    data-aos="fade-right"
                    data-aos-offset="100%"
                    data-aos-delay="800"
                ></div>

                <div
                    className={styles.textSection}
                    data-aos="fade-up"
                    data-aos-offset="100%"
                    data-aos-delay="1200"
                >
                    <h1 className={styles.title}>Moivo</h1>
                    <p className={styles.text}>
                        Discover elegance redefined. Step into a world where style meets sophistication, crafted exclusively for those who dare to stand out.
                    </p>
                </div>
            </div>

            <div className={styles.stickyContainer2}>
                <div
                    className={styles.textSection2}
                    data-aos="fade-up"
                    data-aos-offset="50%"
                    data-aos-delay="1200"
                >
                    <h1 className={styles.title2}>Moivo</h1>
                    <p className={styles.text2}>
                        Embrace the essence of timeless elegance, where each detail is crafted to captivate. A realm of sophistication awaits, designed for those bold enough to make their mark.
                    </p>
                </div>

                <div
                    className={styles.divider2}
                    data-aos="fade-left"
                    data-aos-offset="100%"
                    data-aos-delay="800"
                ></div>

                <div
                    className={styles.imageSection2}
                    data-aos="fade-left"
                    data-aos-offset="100%"
                    data-aos-delay="500"
                ></div>
            </div>

            <div ref={parentDivRef} className={styles.stickyContainer3}>
                <div ref={childDivRef} className={styles.child_div2}>
                    <div
                        className={styles.textSection3}
                        data-aos="fade-up"
                        data-aos-offset="100%"
                        data-aos-delay="1200"
                    >
                        <h1 className={styles.title3}>Today’s weather, my mood</h1>
                        <p className={styles.text3}>
                            기온에 따라 변하는 나만의 룩, 
                            오늘의 무드에 맞는 스타일을 찾아보세요.
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.slide_container}>
                <ul
                    className={styles.slide_wrapper}
                    onMouseEnter={onStop}
                    onMouseLeave={onRun}
                >
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

                    <div
                        className={`${styles.slide} ${styles.clone} ${
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
                </ul>
                <div className={styles.main4Title}>
                    <p>Moivo 만의 감성과 편안함, <br />
                        그리고 다양한 스타일을 사용자 맞춤으로 추천합니다.</p>
                </div>
            </div>

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

            <Footer />
        </div>
    );
};

export default Main_index;
