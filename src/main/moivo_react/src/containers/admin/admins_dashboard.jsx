import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import admin_dashboard from '../../assets/css/admins_dashboard.module.css';
import Admins_side from '../../components/admin_sidebar/admins_side';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
//
const Admins_dashboard = () => {  // 24.12.13 백, 프론트 연결 - yjy , 12/19 프론트 작성 - km
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const deliveryCanvasRef = useRef(null);
  const QnaCanvasRef = useRef(null);
  const productCanvasRef = useRef(null);
  const salaesCanvasRef = useRef(null);
  const { isAdmin, getAccessToken, refreshAccessToken } = useAuth();
  const navigate = useNavigate();
  const [selectedProductStatus, setSelectedProductStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [deliveryStatus, setDeliveryStatus] = useState({});
  const [productStatus, setProductStatus] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [userStatus, setUserStatus] = useState({
    totalUsers: 0,
    gradeStats: {
      LV1: 0,
      LV2: 0,
      LV3: 0,
      LV4: 0,
      LV5: 0
    }
  });

  const handleCardClick = (statusType) => {
    setSelectedProductStatus(statusType);
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const paymentRes = await axiosInstance.get('/api/admin/payment');
        setPaymentStatus(paymentRes.data);

        const deliveryRes = await axiosInstance.get('/api/admin/payment/delivery');
        setDeliveryStatus(deliveryRes.data);

        const productRes = await axiosInstance.get('/api/admin/store/product/status');
        setProductStatus(productRes.data);

        const questionRes = await axiosInstance.get('/api/admin/qna/management/questions/status');
        setQuestionStatus(questionRes.data);

        const userRes = await axiosInstance.get('/api/admin/users/states');
        const gradeRes = await axiosInstance.get('/api/admin/users/states/grade');
        
        setUserStatus(prev => ({
          totalUsers: userRes.data.totalUsers,
          gradeStats: gradeRes.data
        }));

      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
        if (error.response?.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            fetchDashboardData();
          } else {
            navigate('/user');
          }
        }
      }
    };

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, navigate, refreshAccessToken]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {

      const ctx = canvas.getContext('2d');

      const data = [
        userStatus?.gradeStats?.LV1 || 0,
        userStatus?.gradeStats?.LV2 || 0,
        userStatus?.gradeStats?.LV3 || 0,
        userStatus?.gradeStats?.LV4 || 0,
        userStatus?.gradeStats?.LV5 || 0
      ]; // 데이터 값
      const labels = ['LV1', 'LV2', 'LV3', 'LV4', 'LV5']; // 라벨 값
      const colors = ['#225577', '#e56e24', '#ffbcc5', '#bcddb3', '#1150af'];
      const barWidth = 40;
      const gap = 20;
      const maxHeight = Math.max(...data);

      // 캔버스 초기화
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      data.forEach((value, index) => {
        const x = index * (barWidth + gap) + gap;
        const y = canvas.height - (value / maxHeight) * canvas.height;
        const height = (value / maxHeight) * canvas.height;

        // 막대 그리기
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, height);

        // 라벨 추가
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 5);
      });
    }
  }, [canvasRef,userStatus]);
    
    useEffect(() => {
      setIsLoading(true); // 데이터를 로딩 중임을 나타냅니다.
      const canvas = QnaCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
    
        // 원그래프 데이터
        const totalQuestions = questionStatus.totalQuestions;
        const unanswered = questionStatus.unansweredQuestions;
        const answered = questionStatus.answeredQuestions;
    
        const answeredPercentage = (answered / totalQuestions) * 100;
        const unansweredPercentage = (unanswered / totalQuestions) * 100;
    
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // 원그래프 그리기
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
    
        // 미답변 비율 (작은 부분)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          0,
          (answeredPercentage / 100) * 2 * Math.PI
        );
        ctx.closePath();
        ctx.fillStyle = '#f2850d'; 
        ctx.fill();
    
        // 답변 완료 비율 (큰 부분)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          (answeredPercentage / 100) * 2 * Math.PI,
          2 * Math.PI
        );
        ctx.closePath();
        ctx.fillStyle = '#007BFF'; 
        ctx.fill();
    
        // 라벨 추가
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Arial';
    
        // 미답변 완료 퍼센트
        ctx.fillText(
          `${answeredPercentage.toFixed(1)}%`,
          centerX + radius / 2,
          centerY + radius / answeredPercentage.toFixed(1) * 4
        );
    
        // 답변 퍼센트
        ctx.fillText(
          `${unansweredPercentage.toFixed(1)}%`,
          centerX - radius / 2,
          centerY - radius / unansweredPercentage.toFixed(1) * 4
        );
      }
      setIsLoading(false);
    }, [QnaCanvasRef, questionStatus]);
  

    useEffect(() => {
      setIsLoading(true); // 데이터를 로딩 중임을 나타냅니다.
      const canvas = deliveryCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
    
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
        // 막대 그래프 데이터 설정
        const labels = ['배송준비', '배송중', '배송완료'];
        const data = [
          deliveryStatus.readyDelivery || 0,
          deliveryStatus.delivering || 0,
          deliveryStatus.delivered || 0,
        ];
    
        const maxDataValue = Math.max(...data);
        const barHeight = 40; // 막대의 높이
        const barSpacing = 30; // 막대 간 간격
        const chartPadding = 50; // 차트 내부 여백
        const labelWidth = 80; // 라벨이 차지할 공간
        const barColor = ['#1E90FF', '#1E90FF', '#1E90FF']; // 막대 색상 (통일)
    
        // 차트 영역 계산
        const chartWidth = canvasWidth - chartPadding * 2 - labelWidth;
        const chartHeight =
          data.length * barHeight + (data.length - 1) * barSpacing;
    
        // 그래프 그리기
        data.forEach((value, index) => {
          const x = chartPadding + labelWidth; // 막대 시작 x좌표
          const y =
            chartPadding +
            index * (barHeight + barSpacing); // 막대 시작 y좌표
          const barWidth = (value / maxDataValue) * chartWidth;
    
          // 라벨 그리기
          ctx.fillStyle = '#000';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.font = '14px Arial';
          ctx.fillText(labels[index], chartPadding + labelWidth - 10, y + barHeight / 2);
    
          // 막대 그리기
          ctx.fillStyle = barColor[index];
          ctx.fillRect(x, y, barWidth, barHeight);
    
          // 데이터 값 텍스트
          ctx.fillStyle = '#000';
          ctx.textAlign = 'left';
          ctx.fillText(`${value.toFixed(0)}명`, x + barWidth + 10, y + barHeight / 2);
        });
    
        // x축 그리기
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartPadding + labelWidth, chartPadding + chartHeight);
        ctx.lineTo(chartPadding + labelWidth + chartWidth, chartPadding + chartHeight);
        ctx.stroke();
      }
      setIsLoading(false);
    }, [deliveryCanvasRef, deliveryStatus]);
    
    
    useEffect(() => {
      setIsLoading(true);
      const canvas = salaesCanvasRef.current;
    
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
    
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
        // 데이터 설정
        const totalValue = paymentStatus.totalPrice || 0;
        const todayValue = paymentStatus.todayPrice || 0;
        const completedCount = paymentStatus.completedCount || 0;
    
        const totalHeight = canvasHeight * 0.6; // 전체 막대 높이를 캔버스 높이의 60%로 설정
        const todayRatio = totalValue > 0 ? todayValue / totalValue : 0; // 오늘 매출 비율
        const todayBarHeight = totalHeight * todayRatio + 15; // 오늘 매출 막대 높이
        const totalBarHeight = totalHeight; // 총매출 막대 높이
    
        const barWidth = canvasWidth * 0.4; // 막대 폭
        const barX = (canvasWidth - barWidth) / 2; // 막대 X 좌표
        const barY = canvasHeight - totalHeight - 30; // 막대 Y 시작점 (30은 여백)
    
        // 막대 그리기
        ctx.fillStyle = '#28a745'; // 총매출 색상
        ctx.fillRect(barX, barY, barWidth, totalBarHeight);
    
        ctx.fillStyle = '#85c744'; // 오늘 매출 색상
        ctx.fillRect(barX, barY + (totalHeight - todayBarHeight), barWidth, todayBarHeight);
    
        // 텍스트 설정
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
    
        // 완료된 결제 수
        ctx.fillText(`결제 완료: ${completedCount}`, canvasWidth / 2, barY - 10);
    
        // 오늘 매출
        ctx.fillStyle = '#fff';
        ctx.fillText(
          `오늘: ${((todayValue / totalValue) * 100).toFixed(1)}% (${todayValue.toLocaleString()}원)`,
          canvasWidth / 2,
          barY + totalHeight - todayBarHeight / 2
        );
    
        // 총매출
        ctx.fillStyle = '#fff';
        ctx.fillText(
          `총매출: ${totalValue.toLocaleString()}원`,
          canvasWidth / 2,
          barY + totalHeight / 2
        );
    
        // 하단 X축 라벨
        ctx.fillStyle = '#000';
        ctx.fillText(`매출`, canvasWidth / 2, canvasHeight - 10);
    
        // X축 그리기
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, canvasHeight - 30);
        ctx.lineTo(canvasWidth - 10, canvasHeight - 30);
        ctx.stroke();
      }
    
      setIsLoading(false);
    }, [salaesCanvasRef, paymentStatus]);
    
    
    useEffect(() => {
      setIsLoading(true); // 데이터를 로딩 중임을 나타냅니다.
      const canvas = productCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
    
        // 원그래프 데이터
        const basicProduct = productStatus['판매 상품'] || 0;
        const soldoutProduct = productStatus['품절 상품'] || 0;
        const deleteProduct = productStatus['삭제된 상품'] || 0;
    
        const total = basicProduct + soldoutProduct + deleteProduct;
    
        // 비율 계산
        const basicProductPercentage = (basicProduct / total) * 100;
        const soldoutProductPercentage = (soldoutProduct / total) * 100;
        const deleteProductPercentage = (deleteProduct / total) * 100;
    
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // 원그래프 그리기
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
    
        let startAngle = 0;
    
        // 일반 판매 중 상품
        const basicEndAngle = startAngle + (basicProductPercentage / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, basicEndAngle);
        ctx.closePath();
        ctx.fillStyle = '#f2850d'; // 일반 판매 중 상품 색상
        ctx.fill();
        startAngle = basicEndAngle;
    
        // 품절 상품
        const soldoutEndAngle = startAngle + (soldoutProductPercentage / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, soldoutEndAngle);
        ctx.closePath();
        ctx.fillStyle = '#007BFF'; // 품절 상품 색상
        ctx.fill();
        startAngle = soldoutEndAngle;
    
        // 삭제 상품
        const deleteEndAngle = startAngle + (deleteProductPercentage / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, deleteEndAngle);
        ctx.closePath();
        ctx.fillStyle = '#FF0000'; // 삭제 상품 색상
        ctx.fill();
    
        // 라벨 추가
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px Arial';
    
        // 일반 판매 중 상품 라벨
        const basicLabelAngle = (basicEndAngle - (basicEndAngle - 0) / 2);
        ctx.fillText(
          `${basicProductPercentage.toFixed(1)}%`,
          centerX + Math.cos(basicLabelAngle) * (radius / 1.5),
          centerY + Math.sin(basicLabelAngle) * (radius / 1.5)
        );
    
        // 품절 상품 라벨
        const soldoutLabelAngle = (soldoutEndAngle - (soldoutEndAngle - basicEndAngle) / 2);
        ctx.fillText(
          `${soldoutProductPercentage.toFixed(1)}%`,
          centerX + Math.cos(soldoutLabelAngle) * (radius / 1.5),
          centerY + Math.sin(soldoutLabelAngle) * (radius / 1.5)
        );
    
        // 삭제 상품 라벨
        const deleteLabelAngle = (deleteEndAngle - (deleteEndAngle - soldoutEndAngle) / 2);
        ctx.fillText(
          `${deleteProductPercentage.toFixed(1)}%`,
          centerX + Math.cos(deleteLabelAngle) * (radius / 1.5),
          centerY + Math.sin(deleteLabelAngle) * (radius / 1.5)
        );
      }
      setIsLoading(false);
    }, [productCanvasRef, productStatus]);
    
    

  return (
    <div className={admin_dashboard.container}>
      {/* Sidebar 영역 */}
      <div className={admin_dashboard.sidebar}>
        <Admins_side />
      </div>

      <div className={admin_dashboard.mainContent}>
        {/* 1번 섹션 - 판매 현황 */}
        <section className={admin_dashboard.section1}>
          <div className={admin_dashboard.cardContainer}>
            {/* 판매 현황 */}
            <div className={admin_dashboard.card}>
              <h3 className={admin_dashboard.cardTitle}>판매 현황</h3>
                {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    <>
                      <canvas className={admin_dashboard.canvas4} ref={salaesCanvasRef} width={400} height={300} />
                    </>
                  )}
            </div>

            {/* 처리 현황 */}
            <div className={admin_dashboard.card}>
              <h3 className={admin_dashboard.cardTitle}>처리 현황</h3>
              <div className={admin_dashboard.cardList}>
                {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    <>
                      <canvas className={admin_dashboard.canvas} ref={deliveryCanvasRef} width={400} height={300} />
                    </>
                  )}
              </div>
            </div>

            {/* 상품 현황 */}
            <div className={admin_dashboard.card}>
              <h3 className={admin_dashboard.cardTitle}>상품 현황</h3>
              <div className={admin_dashboard.cardList}>
                <div className={admin_dashboard.canvas3}>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    <>
                      <canvas className={admin_dashboard.canvas} ref={productCanvasRef} width={400} height={300} />
                    </>
                  )}
                  <div className={admin_dashboard.QuestioncardList}>
                    <Link to="/admin/admin_productList" className={`${admin_dashboard.cardItem} ${admin_dashboard.Questionclickable2}`}>
                      판매 상품 :
                      <span className={admin_dashboard.cardNumber}>{productStatus['판매 상품'] }</span>
                    </Link>
                    <Link to="" className={`${admin_dashboard.cardItem} ${admin_dashboard.Questionclickable2}`}>
                      품절 상품 :
                      <span className={admin_dashboard.cardNumber}>{productStatus['품절 상품']}</span>
                    </Link>
                    <Link to="" className={`${admin_dashboard.cardItem} ${admin_dashboard.Questionclickable2}`}>
                        삭제된 상품 :
                      <span className={admin_dashboard.cardNumber}>{productStatus['삭제된 상품']}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            </div>
        </section>

        {/* 2번 섹션 */}
        <section className={admin_dashboard.section2}>
          <div className={admin_dashboard.cardContainer}>
            {/* 문의 현황 */}
            <div className={admin_dashboard.card}>
              <h3 className={admin_dashboard.cardTitle}>문의 현황</h3>
              <div className={admin_dashboard.canvas5}>
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    <canvas className={admin_dashboard.canvas} ref={QnaCanvasRef} width={400} height={300} />
                  </>
                )}
                <div className={admin_dashboard.QuestioncardList}>
                  <Link 
                    to="/admins_qnaboard?filter=ALL" 
                    className={`${admin_dashboard.cardItem} ${admin_dashboard.Questionclickable}`}
                  >
                    전체 문의 :
                    <span className={admin_dashboard.cardNumber}>{questionStatus.totalQuestions}</span>
                  </Link>
                  <Link 
                    to="/admins_qnaboard?filter=WAITING" 
                    className={`${admin_dashboard.cardItem} ${admin_dashboard.Questionclickable}`}
                  >
                    🟧 미 답변 :
                    <span className={admin_dashboard.cardNumber}>{questionStatus.unansweredQuestions}</span>
                  </Link>
                  <Link 
                    to="/admins_qnaboard?filter=ANSWERED" 
                    className={`${admin_dashboard.cardItem} ${admin_dashboard.Questionclickable}`}
                  >
                    🟦 답변 완료 :
                    <span className={admin_dashboard.cardNumber}>{questionStatus.answeredQuestions}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 유저 현황 */}
            <div className={admin_dashboard.card}>
              <h3 className={admin_dashboard.cardTitle}>유저 현황</h3>
              <div className={admin_dashboard.chart_container}>
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    <canvas className={admin_dashboard.canvas} ref={canvasRef} width={400} height={300} />
                  </>
                )}
                <div>
                  <p>총 회원수 : <span className={admin_dashboard.cardNumber}>{userStatus.totalUsers}</span></p>
                  <p>LV 1 : <span className={admin_dashboard.cardNumber}>{userStatus?.gradeStats?.LV1 || 0} 명</span></p>
                  <p>LV 2 : <span className={admin_dashboard.cardNumber}>{userStatus?.gradeStats?.LV2 || 0} 명</span></p>
                  <p>LV 3 : <span className={admin_dashboard.cardNumber}>{userStatus?.gradeStats?.LV3 || 0} 명</span></p>
                  <p>LV 4 : <span className={admin_dashboard.cardNumber}>{userStatus?.gradeStats?.LV4 || 0} 명</span></p>
                  <p>LV 5 : <span className={admin_dashboard.cardNumber}>{userStatus?.gradeStats?.LV5 || 0} 명</span></p>
                </div>
              </div>
            </div>
            
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admins_dashboard;
