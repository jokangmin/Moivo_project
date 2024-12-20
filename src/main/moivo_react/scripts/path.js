/* eslint-disable no-undef */
export const PATH = {
    SERVER: process.env.NODE_ENV === 'production' 
        ? 'http://211.188.63.191:8080' // 배포 환경
        : 'http://localhost:8080',    // 로컬 개발 환경
    CLIENT: process.env.NODE_ENV === 'production' 
        ? 'http://211.188.63.191:5173' // 배포 환경
        : 'http://localhost:5173',    // 로컬 개발 환경
};
