import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductSalesPage = () => {
  const [biddingChartData, setBiddingChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Số lượt đặt giá',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Giá trung bình (VNĐ)',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  });

  const [biddingSuccessChartData, setBiddingSuccessChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Tổng số tiền đã đấu giá thành công (VNĐ)',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Admin nhận 2% (VNĐ)',
        data: [],
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    // Gọi API thống kê số lượt đặt giá
    axios.get('http://localhost:8080/api/bidding/statistics')
      .then(response => {
        const data = response.data;
        const labels = Object.keys(data);
        const bidCounts = labels.map(key => data[key].count);
        const avgPrices = labels.map(key => data[key].avgPrice);

        setBiddingChartData({
          labels: labels,
          datasets: [
            {
              label: 'Số lượt đặt giá',
              data: bidCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Giá trung bình (VNĐ)',
              data: avgPrices,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Lỗi khi lấy dữ liệu:', error));

    // Gọi API thống kê tổng số tiền đấu giá thành công
    axios.get('http://localhost:8080/api/bidding/successful-bidding')
      .then(response => {
        const data = response.data;
        const labels = Object.keys(data);
        const totalBiddingAmount = labels.map(key => data[key].totalBiddingAmount);
        const adminEarnings = labels.map(key => data[key].adminEarnings);

        setBiddingSuccessChartData({
          labels: labels,
          datasets: [
            {
              label: 'Tổng số tiền đã đấu giá thành công (VNĐ)',
              data: totalBiddingAmount,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: 'Admin nhận 2% (VNĐ)',
              data: adminEarnings,
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Lỗi khi lấy dữ liệu:', error));
  }, []);

  const [totalAdminEarnings, setTotalAdminEarnings] = useState(0);

  useEffect(() => {
    // Gọi API lấy tổng tiền admin nhận được
    axios.get('http://localhost:8080/api/bidding/admin-earnings')
      .then(response => {
        setTotalAdminEarnings(response.data.totalAdminEarnings);
      })
      .catch(error => console.error('Lỗi khi lấy dữ liệu:', error));
  }, []);

  return (
    <div className="product-sales">
      <h1>Thống kê Đấu Giá</h1>

      {/* Biểu đồ số lượt đặt giá */}
      <Bar 
        data={biddingChartData} 
        options={{ 
          responsive: true,
          plugins: {
            title: { display: true, text: 'Số lượt đặt giá & Giá trung bình' }
          }
        }} 
      />

      {/* Biểu đồ tổng số tiền đấu giá thành công */}
      <h2>Thống kê Tiền Đấu Giá Thành Công</h2>
      <Bar 
        data={biddingSuccessChartData} 
        options={{ 
          responsive: true,
          plugins: {
            title: { display: true, text: 'Tổng số tiền đấu giá & 2% phí admin' }
          }
        }} 
      />
        <div className="product-sales">
      <h1>Thống kê Đấu Giá</h1>

      {/* Hiển thị tổng số tiền admin nhận được */}
      <div className="admin-earnings">
        <h2>Tổng số tiền Admin đã nhận được:</h2>
        <p><strong>{totalAdminEarnings.toLocaleString()} VNĐ</strong></p>
      </div>
    </div>
    </div>
  );
};

export default ProductSalesPage;
