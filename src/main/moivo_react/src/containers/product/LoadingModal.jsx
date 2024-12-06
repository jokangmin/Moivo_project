import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../assets/css/LoadingModal.module.css';

const LoadingModal = ({ isOpen }) => {
  const loadingTexts = [
    '로딩중...',
    '상품을 가져오고 있어요...',
    '잠시만 기다려 주세요...',
    '곧 준비됩니다...'
  ];
  const [currentText, setCurrentText] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentText((prev) => (prev + 1) % loadingTexts.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.loadingContainer}>
              <div className={styles.spinnerContainer}>
                <div className={styles.spinner}></div>
              </div>
              <motion.div 
                className={styles.loadingText}
                key={currentText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                exit={{ opacity: 0, y: -20 }}
              >
                {loadingTexts[currentText]}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingModal;