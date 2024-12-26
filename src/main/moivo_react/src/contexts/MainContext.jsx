import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Context 생성 및 export
const MainContext = createContext();
export const useMainIndex = () => useContext(MainContext);

const MainProvider = ({ children }) => {
    const [animate, setAnimate] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const parentDivRef = useRef(null);
    const childDivRef = useRef(null);

    // ES6 import 방식으로 이미지 가져오기
    const slides = [
        { src: new URL('../assets/image/1_outer.jpg', import.meta.url).href },
        { src: new URL('../assets/image/2_outer.jpg', import.meta.url).href },
        { src: new URL('../assets/image/4_outer.jpg', import.meta.url).href },
        { src: new URL('../assets/image/6_outer.jpg', import.meta.url).href },
    ];

    useEffect(() => {
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Italiana&family=Ibarra+Real+Nova&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        AOS.init({
            duration: 2000,
            once: false,
            offset: 0,
        });
        AOS.refresh();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const parentDiv = parentDivRef.current;
            const childDiv = childDivRef.current;
    
            if (!parentDiv || !childDiv) {
                return; // parentDiv나 childDiv가 없으면 함수 종료
            }
    
            const viewportHeight = window.innerHeight;
            const fromViewportToParentHeight = parentDiv.getBoundingClientRect().top;
            const scrollPassedAmount = viewportHeight - fromViewportToParentHeight;
    
            let divHeight = parentDiv.clientHeight > viewportHeight ? viewportHeight : parentDiv.clientHeight;
            let scrollRate = (scrollPassedAmount / divHeight) * 100;
    
            if (scrollRate < 0) {
                scrollRate = 0;
            } else if (scrollRate > 100) {
                scrollRate = 100;
            }
    
            childDiv.style.transform = `scale(${scrollRate / 100})`;
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    

    const onStop = () => setAnimate(false);
    const onRun = () => setAnimate(true);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    return (
        <MainContext.Provider
            value={{
                animate,
                setAnimate,
                onStop,
                onRun,
                menuOpen,
                toggleMenu,
                slides,
                parentDivRef,
                childDivRef,
            }}
        >
            {children}
        </MainContext.Provider>
    );
};

export default MainProvider;
