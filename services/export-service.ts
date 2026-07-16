// Export Service for PDF and Excel
export class ExportService {
  // Export to PDF (using browser print)
  static exportToPDF(statistics: any) {
    const reportHTML = this.generateReportHTML(statistics);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  // Generate HTML for PDF report
  private static generateReportHTML(statistics: any): string {
    const date = new Date().toLocaleDateString('vi-VN');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo Dashboard - ${date}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #003B5C;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #003B5C;
            margin: 0;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
          }
          .section {
            margin: 30px 0;
            page-break-inside: avoid;
          }
          .section-title {
            background: #003B5C;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .stat-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #003B5C;
            margin: 10px 0;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #f3f4f6;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 BÁO CÁO DASHBOARD</h1>
          <p>Tran Le Electricity - Solar Energy</p>
          <p>Ngày: ${date}</p>
        </div>

        <div class="section">
          <h2 class="section-title">📈 Tổng quan</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Sản phẩm</div>
              <div class="stat-value">${statistics.totalProducts || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Dự án</div>
              <div class="stat-value">${statistics.totalProjects || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tin tức</div>
              <div class="stat-value">${statistics.totalNews || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Đánh giá</div>
              <div class="stat-value">${statistics.totalTestimonials || 0}</div>
            </div>
          </div>
        </div>

        ${statistics.comparison ? `
        <div class="section">
          <h2 class="section-title">📊 So sánh tháng trước</h2>
          <table>
            <tr>
              <th>Chỉ số</th>
              <th>Tháng này</th>
              <th>Tháng trước</th>
              <th>Thay đổi</th>
            </tr>
            <tr>
              <td>Sản phẩm</td>
              <td>${statistics.comparison.products.current}</td>
              <td>${statistics.comparison.products.previous}</td>
              <td style="color: ${statistics.comparison.products.change >= 0 ? 'green' : 'red'}">
                ${statistics.comparison.products.change > 0 ? '+' : ''}${statistics.comparison.products.change}%
              </td>
            </tr>
            <tr>
              <td>Dự án</td>
              <td>${statistics.comparison.projects.current}</td>
              <td>${statistics.comparison.projects.previous}</td>
              <td style="color: ${statistics.comparison.projects.change >= 0 ? 'green' : 'red'}">
                ${statistics.comparison.projects.change > 0 ? '+' : ''}${statistics.comparison.projects.change}%
              </td>
            </tr>
            <tr>
              <td>Tin tức</td>
              <td>${statistics.comparison.news.current}</td>
              <td>${statistics.comparison.news.previous}</td>
              <td style="color: ${statistics.comparison.news.change >= 0 ? 'green' : 'red'}">
                ${statistics.comparison.news.change > 0 ? '+' : ''}${statistics.comparison.news.change}%
              </td>
            </tr>
          </table>
        </div>
        ` : ''}

        ${statistics.ai?.prediction ? `
        <div class="section">
          <h2 class="section-title">🤖 Dự đoán AI</h2>
          <p><strong>Dự kiến tháng tới:</strong> ${statistics.ai.prediction.nextMonth} hoạt động</p>
          <p><strong>Tăng trưởng:</strong> ${statistics.ai.prediction.growthRate > 0 ? '+' : ''}${statistics.ai.prediction.growthRate}%</p>
          <p><strong>Xu hướng:</strong> ${statistics.ai.prediction.trend === 'increasing' ? '📈 Tăng' : statistics.ai.prediction.trend === 'decreasing' ? '📉 Giảm' : '➡️ Ổn định'}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>© ${new Date().getFullYear()} Tran Le Electricity. All rights reserved.</p>
          <p>Báo cáo được tạo tự động bởi AI Dashboard</p>
        </div>
      </body>
      </html>
    `;
  }

  // Export to Excel (CSV format)
  static exportToExcel(statistics: any) {
    const csvContent = this.generateCSV(statistics);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate CSV content
  private static generateCSV(statistics: any): string {
    const date = new Date().toLocaleDateString('vi-VN');
    let csv = `Báo cáo Dashboard - ${date}\n\n`;
    
    // Summary
    csv += 'TỔNG QUAN\n';
    csv += 'Chỉ số,Giá trị\n';
    csv += `Sản phẩm,${statistics.totalProducts || 0}\n`;
    csv += `Dự án,${statistics.totalProjects || 0}\n`;
    csv += `Tin tức,${statistics.totalNews || 0}\n`;
    csv += `Đánh giá,${statistics.totalTestimonials || 0}\n`;
    csv += `Danh mục,${statistics.totalCategories || 0}\n\n`;
    
    // Comparison
    if (statistics.comparison) {
      csv += 'SO SÁNH THÁNG TRƯỚC\n';
      csv += 'Chỉ số,Tháng này,Tháng trước,Thay đổi (%)\n';
      csv += `Sản phẩm,${statistics.comparison.products.current},${statistics.comparison.products.previous},${statistics.comparison.products.change}\n`;
      csv += `Dự án,${statistics.comparison.projects.current},${statistics.comparison.projects.previous},${statistics.comparison.projects.change}\n`;
      csv += `Tin tức,${statistics.comparison.news.current},${statistics.comparison.news.previous},${statistics.comparison.news.change}\n\n`;
    }
    
    // AI Prediction
    if (statistics.ai?.prediction) {
      csv += 'DỰ ĐOÁN AI\n';
      csv += `Dự kiến tháng tới,${statistics.ai.prediction.nextMonth}\n`;
      csv += `Tăng trưởng (%),${statistics.ai.prediction.growthRate}\n`;
      csv += `Xu hướng,${statistics.ai.prediction.trend}\n`;
      csv += `Độ tin cậy,${statistics.ai.prediction.confidence}\n\n`;
    }
    
    // Recent Projects
    if (statistics.recentProjects && statistics.recentProjects.length > 0) {
      csv += 'DỰ ÁN GẦN ĐÂY\n';
      csv += 'Tên,Địa điểm,Công suất,Ngày tạo\n';
      statistics.recentProjects.forEach((project: any) => {
        csv += `"${project.title}","${project.location}","${project.capacity}","${new Date(project.createdAt).toLocaleDateString('vi-VN')}"\n`;
      });
    }
    
    return csv;
  }
}

export default ExportService;
