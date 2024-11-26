import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../assets/css/LoadingModal.module.css';

const LoadingModal = ({ isOpen }) => {
  const loadingTexts = ['Loading', 'Please wait', 'Almost there', 'Just a moment'];
  const [currentText, setCurrentText] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentText((prev) => (prev + 1) % loadingTexts.length);
      }, 2000);
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
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className={styles.loadingContainer}>
              <div className={styles.loadingCircles}>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progress}></div>
              </div>
              <motion.div 
                className={styles.loadingText}
                key={currentText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
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