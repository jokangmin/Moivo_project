// src/components/Slider/Slider.jsx
import React, { useEffect, useState } from 'react';
import styles from "../../assets/css/Slider.module.css";

const Slider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    "https://images.unsplash.com/photo-1485518882345-15568b007407?q=80&w=2542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1524275539700-cf51138f679b?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    "https://images.unsplash.com/photo-1608722846479-e388e1b28e3b?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1602517623397-81b2907836a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1605108083603-85696109df99?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzA4fHwlRUQlOEMlQTglRUMlODUlOTglMjAlRUQlOUQlOTElRUIlQjAlQjF8ZW58MHx8MHx8fDA%3D"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselInner} style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {images.map((image, index) => (
          <div key={index} className={`${styles.carouselItem} ${index === activeIndex ? styles.active : ''}`}>
            <img src={image} alt={`Fashion Image ${index + 1}`} className={styles.carouselImage} />
            <div className={styles.carouselCaption}>
              <h2 className={styles.captionTitle}>Discover Your Style</h2>
              <p className={styles.captionText}>Explore the latest fashion trends</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.carouselNav}>
        {images.map((_, index) => (
          <span
            key={index}
            className={`${styles.carouselNavItem} ${index === activeIndex ? styles.active : ''}`}
            onClick={() => setActiveIndex(index)}
          ></span>
        ))}
      </div>
      <button className={styles.carouselControlPrev} onClick={goToPrevious}>
        &#10094;
      </button>
      <button className={styles.carouselControlNext} onClick={goToNext}>
        &#10095;
      </button>
    </div>
  );
};

export default Slider;
