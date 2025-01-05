import React, { useState, useEffect } from 'react';
import QnA from '../../assets/css/admins_FAQ.module.css';
import Admins_side from '../../components/admin_sidebar/admins_side';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const admins_FAQ = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [faqs, setFaqs] = useState([]);
    // 선택된 FAQ 관리
    const [selectedFaq, setSelectedFaq] = useState(null);
    // 입력 폼 상태 관리
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        fixQuestion: true
    });

    // 수정/추가 모드
    const [mode, setMode] = useState('add');

    // FAQ 목록 조회
    const faqList = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/faq/list');
            if (response.data) {
                console.log('FAQ 목록:', response.data);
                setFaqs(response.data);
            }
        } catch (error) {
            console.error('FAQ 목록 조회 실패:', error);
            if (error.response?.status === 401) {
                alert('관리자 권한이 필요합니다.');
                navigate('/user');
            } else {
                alert('FAQ 목록을 불러오는데 실패했습니다.');
            }
        }
    };

    useEffect(() => {
        // 인증 및 관리자 권한 확인
        if (!isAuthenticated || !isAdmin) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/user');
            return;
        }
        faqList();
    }, [isAuthenticated, isAdmin, navigate]);

    // FAQ 선택 처리
    const handleSelectFaq = (faq) => {
        setSelectedFaq(faq);
        setFormData({
            title: faq.title,
            content: faq.content,
            fixQuestion: true
        });
        setMode('edit');
    };

    // FAQ 입력 변경
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // FAQ 수정
    const faqUpdate = async (e) => {
        e.preventDefault();
        if (!selectedFaq) return;

        // 변경사항이 있는지 확인
        if (selectedFaq.title === formData.title && selectedFaq.content === formData.content) {
            alert('수정된 내용이 없습니다.');
            return;
        }

        try {
            const response = await axiosInstance.put(`/api/admin/faq/update/${selectedFaq.id}`, {
                title: formData.title,
                content: formData.content,
                fixQuestion: true
            });
            
            if (response.status === 200) {
                alert('FAQ가 성공적으로 수정되었습니다.');
                await faqList();
                setMode('add');
                setFormData({
                    title: '',
                    content: '',
                    fixQuestion: true
                });
                setSelectedFaq(null);
            }
        } catch (error) {
            console.error('FAQ 수정 실패:', error);
            alert('FAQ 수정에 실패했습니다.');
        }
    };

    // FAQ 삭제
    const faqDelete = async () => {
        if (!selectedFaq || !window.confirm('정말로 이 FAQ를 삭제하시겠습니까?')) return;

        try {
            const response = await axiosInstance.delete(`/api/admin/faq/delete/${selectedFaq.id}`);
            
            if (response.status === 200) {
                alert('FAQ가 성공적으로 삭제되었습니다.');
                await faqList();
                setMode('add');
                setFormData({
                    title: '',
                    content: '',
                    fixQuestion: true
                });
                setSelectedFaq(null);
            }
        } catch (error) {
            console.error('FAQ 삭제 실패:', error);
            alert('FAQ 삭제에 실패했습니다.');
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        if (mode === 'edit') {
            await faqUpdate(e);
        } else {

            try {
                const response = await axiosInstance.post('/api/admin/faq/add', {
                    title: formData.title,
                    content: formData.content,
                    fixQuestion: true,
                    categoryId: 5
                });
                
                if (response.status === 200) {
                    alert('FAQ가 성공적으로 등록되었습니다.');
                    await faqList();
                    setFormData({
                        title: '',
                        content: '',
                        fixQuestion: true
                    });
                }
            } catch (error) {
                console.error('FAQ 등록 실패:', error);
                alert('FAQ 등록에 실패했습니다.');
            }
        }
    };

    // 추가 모드로 전환
    const handleAddMode = () => {
        setSelectedFaq(null);
        setFormData({ 
            title: '', 
            content: '', 
            fixQuestion: true 
        });
        setMode('add');
    };

    return (
        <div className={QnA.container}>
            {/* Sidebar 영역 */}
            <div className={QnA.sidebar}>
                <Admins_side />
            </div>

            <div className={QnA.mainContent}>
                <div className={QnA.header}>
                    <h1>FAQ 관리</h1>
                </div>
                <div className={QnA.contentRow}>
                    {/* FAQ 목록 (왼쪽) */}
                    <div className={QnA.faqListSection}>
                        <div className={QnA.faqListSectionTitle}> 
                            <span>FAQ 목록</span> 
                        </div>
                        <div className={QnA.faqList}>
                            {Array.isArray(faqs) && faqs.map(faq => (
                                <div key={faq.id} className={`${QnA.faqListItem} ${selectedFaq?.id === faq.id ? QnA.selected : ''}`} onClick={() => handleSelectFaq(faq)} >
                                    <div>{faq.title}</div>
                                    <div>
                                        {new Date(faq.questionDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ 입력/수정 폼 (오른쪽) */}
                    <div className={QnA.faqFormSection}>
                        <div className={QnA.faqListSectionTitle}>
                            <span className={`${QnA.modeTab} ${mode === 'edit' ? QnA.activeTab : ''}`} >
                                FAQ 수정
                            </span>
                            <span className={`${QnA.modeTab} ${mode === 'add' ? QnA.activeTab : ''}`} onClick={handleAddMode} >
                                FAQ 추가
                            </span>
                        </div>
                        <form onSubmit={handleSubmit} className={QnA.faqForm}>
                            <div className={QnA.inputGroup}>
                                <label>제목</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="FAQ 제목을 입력하세요" />
                            </div>
                            <div className={QnA.inputGroup}>
                                <label>내용</label>
                                <textarea name="content" value={formData.content} onChange={handleInputChange} rows="10" placeholder="FAQ 내용을 입력하세요" />
                            </div>
                            <div className={QnA.buttonGroup}>
                                {mode === 'edit' ? (
                                    <>
                                        <button type="submit" className={QnA.editButton}>
                                            수정하기
                                        </button>
                                        <button type="button" className={QnA.delButton} onClick={faqDelete}>
                                            삭제하기
                                        </button>
                                    </>
                                ) : (
                                    <button type="submit" className={QnA.addButton}>
                                        추가하기
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default admins_FAQ;