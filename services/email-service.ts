import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'pxmanhctc@gmail.com',
      pass: process.env.EMAIL_PASS || 'wrutbkloiaiejyyx'
    }
  });

  /**
   * Gửi email thông báo khi có yêu cầu tư vấn mới
   */
  static async sendContactNotification(data: ContactFormData): Promise<boolean> {
    try {
      const adminEmail = process.env.EMAIL_USER || 'pxmanhctc@gmail.com';
      
      // Email template cho admin
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: #f4f7fa;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
              background-size: cover;
              opacity: 0.3;
            }
            .bell-icon {
              font-size: 48px;
              margin-bottom: 10px;
              animation: ring 2s ease-in-out infinite;
            }
            @keyframes ring {
              0%, 100% { transform: rotate(0deg); }
              10%, 30% { transform: rotate(-10deg); }
              20%, 40% { transform: rotate(10deg); }
            }
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              margin: 15px 0 10px;
              position: relative;
              z-index: 1;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              position: relative;
              z-index: 1;
            }
            .badge {
              display: inline-block;
              padding: 8px 20px;
              background: #28a745;
              color: white;
              border-radius: 25px;
              font-size: 13px;
              font-weight: bold;
              margin-top: 15px;
              box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
            }
            .info-card {
              margin-bottom: 20px;
              padding: 20px;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border-left: 5px solid #FF6B35;
              border-radius: 10px;
              transition: transform 0.2s;
            }
            .info-card:hover {
              transform: translateX(5px);
            }
            .info-label {
              font-weight: 700;
              color: #FF6B35;
              font-size: 14px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-value {
              color: #2c3e50;
              font-size: 16px;
              font-weight: 500;
            }
            .action-box {
              margin-top: 35px;
              padding: 25px;
              background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
              border-left: 5px solid #ffc107;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
            }
            .action-box strong {
              color: #856404;
              font-size: 16px;
              display: block;
              margin-bottom: 10px;
            }
            .action-box p {
              color: #856404;
              margin: 0;
              line-height: 1.6;
            }
            .footer {
              background: #2c3e50;
              color: #ecf0f1;
              text-align: center;
              padding: 30px;
            }
            .footer p {
              margin: 5px 0;
              font-size: 13px;
              opacity: 0.8;
            }
            .footer .company-name {
              font-weight: bold;
              color: #FF6B35;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent, #ddd, transparent);
              margin: 25px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="bell-icon">🔔</div>
              <h1>Yêu Cầu Tư Vấn Mới</h1>
              <p>Bạn có một yêu cầu tư vấn mới từ website</p>
              <span class="badge">MỚI</span>
            </div>
            
            <div class="content">
              <div class="info-card">
                <div class="info-label">👤 Họ và tên</div>
                <div class="info-value">${data.name}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">📞 Số điện thoại</div>
                <div class="info-value"><a href="tel:${data.phone}" style="color: #FF6B35; text-decoration: none;">${data.phone}</a></div>
              </div>
              
              <div class="info-card">
                <div class="info-label">📧 Email</div>
                <div class="info-value"><a href="mailto:${data.email}" style="color: #FF6B35; text-decoration: none;">${data.email}</a></div>
              </div>
              
              <div class="info-card">
                <div class="info-label">🔧 Dịch vụ quan tâm</div>
                <div class="info-value">${data.service}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">💬 Nội dung</div>
                <div class="info-value">${data.message || '<em style="color: #999;">Không có nội dung</em>'}</div>
              </div>
              
              <div class="action-box">
                <strong>⚡ Hành động cần làm</strong>
                <p>Vui lòng liên hệ lại khách hàng trong vòng <strong>24 giờ</strong> để tư vấn chi tiết và chốt đơn hàng.</p>
              </div>
            </div>
            
            <div class="footer">
              <p class="company-name">⚡ CTC</p>
              <div class="divider"></div>
              <p>Email này được gửi tự động từ hệ thống</p>
              <p>Thời gian: ${new Date().toLocaleString('vi-VN', { 
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin-top: 15px; font-size: 12px;">📍 50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</p>
              <p style="font-size: 12px;">📞 0915 059 666 | 📧 info@ctcdn.vn</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Gửi email cho admin
      await this.transporter.sendMail({
        from: `"CTC" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🔔 Yêu cầu tư vấn mới từ ${data.name}`,
        html: htmlContent
      });

      console.log('✅ Email notification sent successfully to:', adminEmail);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  /**
   * Gửi email xác nhận cho khách hàng
   */
  static async sendCustomerConfirmation(data: ContactFormData): Promise<boolean> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.8;
              color: #333;
              background: #f4f7fa;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 50px 30px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
              background-size: cover;
              opacity: 0.3;
            }
            .check-icon {
              font-size: 64px;
              margin-bottom: 15px;
              animation: scaleIn 0.5s ease-out;
            }
            @keyframes scaleIn {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin: 0;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 45px 35px;
            }
            .greeting {
              font-size: 20px;
              color: #2c3e50;
              margin-bottom: 25px;
              font-weight: 600;
            }
            .message-box {
              background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 5px solid #28a745;
              box-shadow: 0 4px 15px rgba(40, 167, 69, 0.15);
            }
            .message-box p {
              margin: 10px 0;
              color: #2c3e50;
              line-height: 1.8;
            }
            .info-summary {
              background: linear-gradient(135deg, #fff9e6 0%, #ffe69c 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 30px 0;
              border-left: 5px solid #ffc107;
            }
            .info-summary strong {
              color: #856404;
              display: block;
              margin-bottom: 15px;
              font-size: 16px;
            }
            .info-item {
              padding: 8px 0;
              color: #856404;
              font-size: 15px;
            }
            .contact-box {
              background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 30px 0;
              border-left: 5px solid #2196F3;
            }
            .contact-box p {
              margin: 8px 0;
              color: #1565c0;
              font-size: 15px;
            }
            .contact-box strong {
              color: #0d47a1;
            }
            .cta-button {
              display: inline-block;
              padding: 15px 35px;
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
              text-decoration: none;
              border-radius: 30px;
              font-weight: bold;
              margin: 25px 0;
              box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .signature {
              margin-top: 35px;
              padding-top: 25px;
              border-top: 2px solid #e9ecef;
              color: #6c757d;
            }
            .signature strong {
              color: #FF6B35;
              font-size: 16px;
            }
            .footer {
              background: #2c3e50;
              color: #ecf0f1;
              text-align: center;
              padding: 35px;
            }
            .footer .company-name {
              font-weight: bold;
              color: #28a745;
              font-size: 18px;
              margin-bottom: 15px;
            }
            .footer p {
              margin: 8px 0;
              font-size: 13px;
              opacity: 0.85;
            }
            .social-links {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            .social-links a {
              color: #28a745;
              text-decoration: none;
              margin: 0 10px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="check-icon">✅</div>
              <h1>Cảm ơn bạn đã liên hệ!</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Xin chào <strong>${data.name}</strong>,</p>
              
              <div class="message-box">
                <p>🎉 <strong>Chúng tôi đã nhận được yêu cầu tư vấn của bạn!</strong></p>
                <p>Cảm ơn bạn đã quan tâm đến dịch vụ <strong>${data.service}</strong> của CTC.</p>
                <p>Đội ngũ chuyên gia của chúng tôi sẽ liên hệ lại với bạn trong vòng <strong style="color: #28a745;">24 giờ</strong> để tư vấn chi tiết và giải đáp mọi thắc mắc.</p>
              </div>
              
              <div class="info-summary">
                <strong>📋 Thông tin bạn đã gửi</strong>
                <div class="info-item">👤 Họ và tên: <strong>${data.name}</strong></div>
                <div class="info-item">📞 Số điện thoại: <strong>${data.phone}</strong></div>
                <div class="info-item">📧 Email: <strong>${data.email}</strong></div>
                <div class="info-item">🔧 Dịch vụ quan tâm: <strong>${data.service}</strong></div>
              </div>
              
              <div class="contact-box">
                <p><strong>⚡ Cần hỗ trợ gấp?</strong></p>
                <p>📞 Hotline: <strong>0915 059 666</strong></p>
                <p>📧 Email: <strong>info@ctcdn.vn</strong></p>
                <p>🏢 Địa chỉ: <strong>50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</strong></p>
                <p>🕒 Thời gian làm việc: <strong>Thứ 2 - Thứ 7: 8:00 - 17:30</strong></p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://ctcdn.vn" class="cta-button">🌐 Tìm hiểu thêm về chúng tôi</a>
              </div>
              
              <div class="signature">
                <p>Trân trọng,</p>
                <p><strong>⚡ CTC Team</strong></p>
                <p style="font-size: 13px; color: #999; margin-top: 10px;">Giải pháp EPC và Năng lượng tái tạo hàng đầu Việt Nam</p>
              </div>
            </div>
            
            <div class="footer">
              <p class="company-name">⚡ CTC</p>
              <p>Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)</p>
              <p>MST: 0400458940</p>
              <p style="margin-top: 15px;">📍 50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</p>
              <p>📞 0915 059 666 | 📧 info@ctcdn.vn</p>
              <div class="social-links">
                <a href="#">Facebook</a> | 
                <a href="#">Instagram</a> | 
                <a href="#">YouTube</a>
              </div>
              <p style="margin-top: 20px; font-size: 11px; opacity: 0.6;">© 2024 CTC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Gửi email cho khách hàng
      await this.transporter.sendMail({
        from: `"CTC" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: '✅ Xác nhận yêu cầu tư vấn - CTC',
        html: htmlContent
      });

      console.log('✅ Confirmation email sent to customer:', data.email);
      return true;
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return false;
    }
  }

  /**
   * Gửi email chào mừng cho newsletter subscriber
   */
  static async sendNewsletterWelcome(email: string): Promise<boolean> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.8;
              color: #333;
              background: #f4f7fa;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 50px 30px;
              text-align: center;
              position: relative;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin: 15px 0;
            }
            .content {
              padding: 45px 35px;
            }
            .welcome-icon {
              font-size: 64px;
              text-align: center;
              margin: 20px 0;
            }
            .highlight-box {
              background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 5px solid #28a745;
            }
            .benefits {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
            }
            .benefit-item {
              padding: 12px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .benefit-item:last-child {
              border-bottom: none;
            }
            .cta-button {
              display: inline-block;
              padding: 15px 35px;
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              color: white;
              text-decoration: none;
              border-radius: 30px;
              font-weight: bold;
              margin: 25px 0;
              box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
            }
            .footer {
              background: #2c3e50;
              color: #ecf0f1;
              text-align: center;
              padding: 35px;
            }
            .footer .company-name {
              font-weight: bold;
              color: #667eea;
              font-size: 18px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="welcome-icon">🎉</div>
              <h1>Chào mừng bạn!</h1>
              <p>Cảm ơn bạn đã đăng ký nhận tin từ CTC</p>
            </div>
            
            <div class="content">
              <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; color: #2c3e50;">
                  <strong>Chúc mừng!</strong> Bạn đã đăng ký thành công nhận bản tin từ CTC.
                </p>
              </div>
              
              <p style="color: #2c3e50; margin: 20px 0;">
                Từ giờ, bạn sẽ nhận được những thông tin mới nhất về:
              </p>
              
              <div class="benefits">
                <div class="benefit-item">
                  ⚡ <strong>Công nghệ năng lượng mặt trời mới nhất</strong>
                </div>
                <div class="benefit-item">
                  💰 <strong>Ưu đãi & Khuyến mãi đặc biệt</strong>
                </div>
                <div class="benefit-item">
                  📊 <strong>Xu hướng thị trường năng lượng</strong>
                </div>
                <div class="benefit-item">
                  🏆 <strong>Dự án tiêu biểu & Case study</strong>
                </div>
                <div class="benefit-item">
                  💡 <strong>Tips tiết kiệm điện hiệu quả</strong>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ctcdn.vn" class="cta-button">
                  🌐 Khám phá sản phẩm
                </a>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 5px solid #ffc107; margin: 25px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>💼 Cần tư vấn ngay?</strong><br>
                  Liên hệ hotline: <strong>0915 059 666</strong> hoặc email: <strong>info@ctcdn.vn</strong>
                </p>
              </div>
              
              <p style="color: #6c757d; font-size: 13px; margin-top: 30px;">
                Nếu bạn không muốn nhận email này nữa, vui lòng <a href="#" style="color: #FF6B35;">hủy đăng ký</a>.
              </p>
            </div>
            
            <div class="footer">
              <p class="company-name">⚡ CTC</p>
              <p>Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)</p>
              <p>MST: 0400458940</p>
              <p style="margin-top: 15px;">📍 50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</p>
              <p>📞 0915 059 666 | 📧 info@ctcdn.vn</p>
              <p style="margin-top: 20px; font-size: 11px; opacity: 0.6;">© 2024 CTC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `"CTC" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Chào mừng bạn đến với CTC!',
        html: htmlContent
      });

      console.log('✅ Newsletter welcome email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending newsletter email:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}
