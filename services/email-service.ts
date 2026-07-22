import nodemailer from 'nodemailer';
import dns from 'dns';

// Fix Node.js DNS lookup timeout (ETIMEOUT) on local network / ISP DNS for smtp.gmail.com
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore DNS config error if restricted
}

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

const getEmailConfig = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    user,
    pass,
    from: process.env.EMAIL_FROM || user || 'no-reply@ctcdn.vn',
    recipient: process.env.CONTACT_RECIPIENT || 'contac@ctcdn.vn'
  };
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getCompanyEmailFooterHtml = () => `
  <div style="background:#1e293b;color:#ecf0f1;text-align:left;padding:28px 24px;border-top:4px solid #FF6B35;font-family:'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:580px;margin:0 auto;">
      <h3 style="margin:0 0 6px;color:#FF6B35;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
        ⚡ CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC)
      </h3>
      <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;font-weight:600;font-style:italic;">
        Khẩu hiệu: "CTC – Niềm tin, Chất lượng" | 32+ Năm Kinh Nghiệm (Thành lập 2004 - MST: 0400458940)
      </p>
      <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:14px 18px;margin-bottom:14px;font-size:12px;color:#cbd5e1;line-height:1.7;">
        <p style="margin:2px 0;">📍 <strong>Địa chỉ đăng ký:</strong> 50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</p>
        <p style="margin:2px 0;">☎️ <strong>Điện thoại cố định:</strong> 0236 374 5555 | 📱 <strong>Hotline Zalo:</strong> <a href="tel:0915059666" style="color:#38bdf8;font-weight:bold;text-decoration:none;">0915 059 666</a></p>
        <p style="margin:2px 0;">🏛️ <strong>Đại diện pháp luật:</strong> NGUYỄN VĂN DUY (Tổng Giám đốc) | 📧 <strong>Email hỗ trợ:</strong> <a href="mailto:pxmanhctc@gmail.com" style="color:#38bdf8;text-decoration:none;">pxmanhctc@gmail.com</a></p>
      </div>
      <div style="text-align:center;font-size:11px;color:#64748b;margin-top:10px;">
        <p style="margin:0;">© 2026 CTC Joint-Stock Company. All rights reserved.</p>
        <p style="margin:3px 0 0;font-style:italic;">Hạ tầng Viễn thông - Năng lượng tái tạo (Điện gió & Mặt trời) - Tổng thầu EPC Công nghiệp</p>
      </div>
    </div>
  </div>
`;

// Custom DNS lookup with 1.5s fallback to direct Google SMTP IPv4 (bypasses ISP DNS ETIMEOUT)
const gmailCustomLookup = (hostname: string, options: any, callback: any) => {
  if (hostname === 'smtp.gmail.com') {
    let called = false;
    const timer = setTimeout(() => {
      if (!called) {
        called = true;
        console.log('⚡ DNS lookup for smtp.gmail.com timed out, using direct IPv4 fallback (142.250.157.108)');
        callback(null, '142.250.157.108', 4);
      }
    }, 1500);

    dns.lookup(hostname, options, (err, address, family) => {
      if (!called) {
        called = true;
        clearTimeout(timer);
        if (err || !address) {
          console.log('⚡ DNS lookup failed, using direct IPv4 fallback (142.250.157.108)');
          callback(null, '142.250.157.108', 4);
        } else {
          callback(null, address, family);
        }
      }
    });
    return;
  }
  return dns.lookup(hostname, options, callback);
};

export class EmailService {
  private static transporter: any = null;

  private static getTransporter() {
    if (!this.transporter) {
      const config = getEmailConfig();
      const isGmail = config.host.includes('gmail');
      
      const transportOptions: any = {
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
        lookup: gmailCustomLookup,
        tls: {
          servername: 'smtp.gmail.com',
          rejectUnauthorized: false
        }
      };

      if (isGmail) {
        transportOptions.service = 'gmail';
      }

      this.transporter = nodemailer.createTransport(transportOptions);
    }
    return this.transporter;
  }

  /**
   * Gửi email thông báo khi có yêu cầu tư vấn mới
   */
  static async sendContactNotification(data: ContactFormData): Promise<boolean> {
    try {
      const emailConfig = getEmailConfig();
      const adminEmail = emailConfig.recipient;
      
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
                <div class="info-value">${escapeHtml(data.name)}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">📞 Số điện thoại</div>
                <div class="info-value"><a href="tel:${escapeHtml(data.phone)}" style="color: #FF6B35; text-decoration: none;">${escapeHtml(data.phone)}</a></div>
              </div>
              
              <div class="info-card">
                <div class="info-label">📧 Email</div>
                <div class="info-value"><a href="mailto:${escapeHtml(data.email)}" style="color: #FF6B35; text-decoration: none;">${escapeHtml(data.email)}</a></div>
              </div>
              
              <div class="info-card">
                <div class="info-label">🔧 Dịch vụ quan tâm</div>
                <div class="info-value">${escapeHtml(data.service)}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">💬 Nội dung</div>
                <div class="info-value">${data.message ? escapeHtml(data.message) : '<em style="color: #999;">Không có nội dung</em>'}</div>
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
      await this.getTransporter().sendMail({
        from: `"CTC" <${emailConfig.from}>`,
        to: adminEmail,
        replyTo: data.email,
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
      const emailConfig = getEmailConfig();
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
              <p class="greeting">Xin chào <strong>${escapeHtml(data.name)}</strong>,</p>
              
              <div class="message-box">
                <p>🎉 <strong>Chúng tôi đã nhận được yêu cầu tư vấn của bạn!</strong></p>
                <p>Cảm ơn bạn đã quan tâm đến dịch vụ <strong>${escapeHtml(data.service)}</strong> của CTC.</p>
                <p>Đội ngũ chuyên gia của chúng tôi sẽ liên hệ lại với bạn trong vòng <strong style="color: #28a745;">24 giờ</strong> để tư vấn chi tiết và giải đáp mọi thắc mắc.</p>
              </div>
              
              <div class="info-summary">
                <strong>📋 Thông tin bạn đã gửi</strong>
                <div class="info-item">👤 Họ và tên: <strong>${escapeHtml(data.name)}</strong></div>
                <div class="info-item">📞 Số điện thoại: <strong>${escapeHtml(data.phone)}</strong></div>
                <div class="info-item">📧 Email: <strong>${escapeHtml(data.email)}</strong></div>
                <div class="info-item">🔧 Dịch vụ quan tâm: <strong>${escapeHtml(data.service)}</strong></div>
              </div>
              
              <div class="contact-box">
                <p><strong>⚡ Cần hỗ trợ gấp?</strong></p>
                <p>📞 Hotline: <strong>0915 059 666</strong></p>
                <p>📧 Email: <strong>info@ctcdn.vn</strong></p>
                <p>🏢 Địa chỉ: <strong>50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</strong></p>
                <p>🕒 Giờ làm việc: <strong>Thứ 2 - Thứ 6 (08:00 - 17:30)</strong></p>
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
            
            ${getCompanyEmailFooterHtml()}
          </div>
        </body>
        </html>
      `;

      // Gửi email cho khách hàng
      await this.getTransporter().sendMail({
        from: `"CTC" <${emailConfig.from}>`,
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

      await this.getTransporter().sendMail({
        from: `"CTC" <${getEmailConfig().from}>`,
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
   * Gửi email xác nhận đơn hàng cho khách hàng
   */
  static async sendOrderConfirmation(orderData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    orderCode: string;
    totalAmount: number;
    items: Array<{ productName: string; quantity: number; price: number; subtotal: number }>;
    note?: string;
  }): Promise<boolean> {
    try {
      const emailConfig = getEmailConfig();
      const now = new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });

      const itemsRows = orderData.items.map(item => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 16px; color: #2c3e50; font-size: 14px;">${escapeHtml(item.productName)}</td>
          <td style="padding: 12px 16px; text-align: center; color: #555; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 12px 16px; text-align: right; color: #555; font-size: 14px;">${item.price > 0 ? item.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</td>
          <td style="padding: 12px 16px; text-align: right; font-weight: bold; color: #2c3e50; font-size: 14px;">${item.price > 0 ? item.subtotal.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
          <div style="max-width:650px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1a5276 0%,#2980b9 100%);color:white;padding:45px 30px;text-align:center;">
              <div style="font-size:56px;margin-bottom:12px;">🛒</div>
              <h1 style="margin:0 0 10px;font-size:28px;font-weight:700;">Đặt Hàng Thành Công!</h1>
              <p style="margin:0;font-size:15px;opacity:0.9;">Cảm ơn bạn đã tin tưởng sử dụng sản phẩm của CTC</p>
              <div style="display:inline-block;margin-top:16px;padding:8px 24px;background:rgba(255,255,255,0.2);border-radius:25px;font-size:13px;font-weight:bold;letter-spacing:1px;">
                Mã đơn: ${escapeHtml(orderData.orderCode)}
              </div>
            </div>

            <!-- Content -->
            <div style="padding:40px 35px;">
              <p style="font-size:17px;color:#2c3e50;margin:0 0 25px;">
                Xin chào <strong>${escapeHtml(orderData.customerName)}</strong>,
              </p>

              <!-- Success Box -->
              <div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);padding:22px 25px;border-radius:12px;border-left:5px solid #28a745;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:15px;color:#1b5e20;">
                  ✅ <strong>Yêu cầu báo giá của bạn đã được ghi nhận!</strong>
                </p>
                <p style="margin:0;font-size:14px;color:#2e7d32;line-height:1.7;">
                  Đội ngũ kỹ sư tư vấn của CTC sẽ liên hệ lại với bạn trong vòng <strong>24 giờ</strong> để xác nhận thông tin và báo giá ưu đãi tốt nhất.
                </p>
              </div>

              <!-- Order Details -->
              <div style="background:#f8f9fa;border-radius:12px;padding:22px 25px;margin-bottom:28px;border:1px solid #e9ecef;">
                <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">📋 Thông tin đơn hàng</h3>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:6px 0;color:#6c757d;width:130px;">Mã đơn hàng:</td><td style="padding:6px 0;font-weight:bold;color:#1a5276;font-family:monospace;">${escapeHtml(orderData.orderCode)}</td></tr>
                  <tr><td style="padding:6px 0;color:#6c757d;">Ngày đặt:</td><td style="padding:6px 0;font-weight:600;color:#2c3e50;">${now}</td></tr>
                  <tr><td style="padding:6px 0;color:#6c757d;">Số điện thoại:</td><td style="padding:6px 0;font-weight:600;color:#2c3e50;">${escapeHtml(orderData.phone)}</td></tr>
                  <tr><td style="padding:6px 0;color:#6c757d;">Địa chỉ:</td><td style="padding:6px 0;font-weight:600;color:#2c3e50;">${escapeHtml(orderData.address)}</td></tr>
                  ${orderData.note ? `<tr><td style="padding:6px 0;color:#6c757d;vertical-align:top;">Ghi chú:</td><td style="padding:6px 0;color:#555;font-style:italic;">${escapeHtml(orderData.note)}</td></tr>` : ''}
                </table>
              </div>

              <!-- Items Table -->
              <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">🛍️ Danh sách sản phẩm</h3>
              <table style="width:100%;border-collapse:collapse;border:1px solid #e9ecef;border-radius:12px;overflow:hidden;margin-bottom:20px;">
                <thead>
                  <tr style="background:linear-gradient(135deg,#1a5276,#2980b9);color:white;">
                    <th style="padding:12px 16px;text-align:left;font-size:13px;font-weight:600;">Sản phẩm</th>
                    <th style="padding:12px 16px;text-align:center;font-size:13px;font-weight:600;">SL</th>
                    <th style="padding:12px 16px;text-align:right;font-size:13px;font-weight:600;">Đơn giá</th>
                    <th style="padding:12px 16px;text-align:right;font-size:13px;font-weight:600;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
                <tfoot>
                  <tr style="background:#f8f9fa;">
                    <td colspan="3" style="padding:14px 16px;font-weight:700;color:#495057;font-size:14px;">Tổng tiền dự kiến:</td>
                    <td style="padding:14px 16px;text-align:right;font-weight:800;font-size:18px;color:#1a5276;">${orderData.totalAmount > 0 ? orderData.totalAmount.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</td>
                  </tr>
                </tfoot>
              </table>
              <p style="font-size:12px;color:#999;font-style:italic;margin:0 0 28px;">* Giá dự kiến, kỹ sư sẽ báo giá chính xác sau khi khảo sát.</p>

              <!-- Hotline -->
              <div style="background:linear-gradient(135deg,#fff3cd,#ffe69c);padding:22px 25px;border-radius:12px;border-left:5px solid #ffc107;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-weight:700;color:#856404;font-size:15px;">⚡ Cần hỗ trợ gấp?</p>
                <p style="margin:0;color:#856404;font-size:14px;line-height:1.7;">
                  📞 Hotline: <strong>0915 059 666</strong><br>
                  📧 Email: <strong>info@ctcdn.vn</strong><br>
                  🕒 Thứ 2 - Thứ 7: 8:00 - 17:30
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:20px;">
                <a href="http://localhost:3000/#/track-order" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF6B35,#F7931E);color:white;text-decoration:none;border-radius:30px;font-weight:bold;font-size:15px;box-shadow:0 6px 20px rgba(255,107,53,0.4);">
                  🔍 Tra cứu trạng thái đơn hàng
                </a>
              </div>
            </div>

            ${getCompanyEmailFooterHtml()}
          </div>
        </body>
        </html>
      `;

      await this.getTransporter().sendMail({
        from: `"CTC Solar" <${emailConfig.from}>`,
        to: orderData.email,
        subject: `✅ Xác nhận đặt hàng ${orderData.orderCode} - CTC`,
        html: htmlContent
      });

      console.log('✅ Order confirmation email sent to:', orderData.email);
      return true;
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      return false;
    }
  }

  /**
   * Gửi email thông báo đơn hàng mới cho Admin
   */
  static async sendNewOrderNotification(orderData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    orderCode: string;
    totalAmount: number;
    items: Array<{ productName: string; quantity: number; price: number; subtotal: number }>;
    note?: string;
  }): Promise<boolean> {
    try {
      const emailConfig = getEmailConfig();
      const adminEmail = emailConfig.recipient;
      const now = new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });

      const itemsList = orderData.items.map(item =>
        `<li style="padding:6px 0;font-size:14px;color:#2c3e50;border-bottom:1px solid #f0f0f0;">
          <strong>${escapeHtml(item.productName)}</strong> — SL: ${item.quantity} — ${item.price > 0 ? item.subtotal.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
        </li>`
      ).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
          <div style="max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#e74c3c 0%,#c0392b 100%);color:white;padding:35px 30px;text-align:center;">
              <div style="font-size:50px;margin-bottom:10px;">🔔</div>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;">Đơn Hàng Mới!</h1>
              <p style="margin:0;opacity:0.9;font-size:14px;">Nhận lúc: ${now}</p>
              <div style="display:inline-block;margin-top:14px;padding:7px 22px;background:rgba(255,255,255,0.25);border-radius:20px;font-weight:bold;letter-spacing:1px;font-size:13px;">
                ${escapeHtml(orderData.orderCode)}
              </div>
            </div>

            <!-- Content -->
            <div style="padding:35px;">
              
              <!-- Customer Info -->
              <div style="background:#f8f9fa;border-radius:12px;padding:22px;margin-bottom:24px;border-left:5px solid #e74c3c;">
                <h3 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#e74c3c;text-transform:uppercase;letter-spacing:0.5px;">👤 Thông tin khách hàng</h3>
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                  <tr><td style="padding:5px 0;color:#6c757d;width:120px;">Họ tên:</td><td style="padding:5px 0;font-weight:700;color:#2c3e50;">${escapeHtml(orderData.customerName)}</td></tr>
                  <tr><td style="padding:5px 0;color:#6c757d;">SĐT:</td><td style="padding:5px 0;font-weight:700;color:#e74c3c;"><a href="tel:${escapeHtml(orderData.phone)}" style="color:#e74c3c;text-decoration:none;">${escapeHtml(orderData.phone)}</a></td></tr>
                  <tr><td style="padding:5px 0;color:#6c757d;">Email:</td><td style="padding:5px 0;font-weight:600;"><a href="mailto:${escapeHtml(orderData.email)}" style="color:#2980b9;text-decoration:none;">${escapeHtml(orderData.email)}</a></td></tr>
                  <tr><td style="padding:5px 0;color:#6c757d;">Địa chỉ:</td><td style="padding:5px 0;color:#2c3e50;">${escapeHtml(orderData.address)}</td></tr>
                  ${orderData.note ? `<tr><td style="padding:5px 0;color:#6c757d;vertical-align:top;">Ghi chú:</td><td style="padding:5px 0;color:#555;font-style:italic;">${escapeHtml(orderData.note)}</td></tr>` : ''}
                </table>
              </div>

              <!-- Items -->
              <div style="margin-bottom:24px;">
                <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">🛒 Sản phẩm yêu cầu</h3>
                <ul style="margin:0;padding:0 0 0 0;list-style:none;background:#f8f9fa;border-radius:12px;padding:16px 20px;">
                  ${itemsList}
                </ul>
              </div>

              <!-- Total -->
              <div style="background:linear-gradient(135deg,#1a5276,#2980b9);color:white;border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <span style="font-size:15px;font-weight:600;">Tổng tiền dự kiến:</span>
                <span style="font-size:24px;font-weight:800;">${orderData.totalAmount > 0 ? orderData.totalAmount.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</span>
              </div>

              <!-- Action box -->
              <div style="background:linear-gradient(135deg,#fff3cd,#ffe69c);padding:20px;border-radius:12px;border-left:5px solid #ffc107;">
                <p style="margin:0 0 8px;font-weight:700;color:#856404;font-size:15px;">⚡ Hành động cần làm ngay</p>
                <p style="margin:0;color:#856404;font-size:14px;line-height:1.7;">
                  Liên hệ lại khách hàng trong vòng <strong>24 giờ</strong> để xác nhận thông tin và báo giá chính xác.<br>
                  <a href="http://localhost:4000/admin/orders" style="color:#856404;font-weight:bold;">→ Xem đơn hàng trong Admin</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#2c3e50;color:#ecf0f1;text-align:center;padding:25px;">
              <p style="font-weight:bold;color:#3498db;font-size:15px;margin:0 0 5px;">⚡ CTC Admin System</p>
              <p style="font-size:12px;margin:0;opacity:0.6;">Email tự động - không cần trả lời</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.getTransporter().sendMail({
        from: `"CTC System" <${emailConfig.from}>`,
        to: adminEmail,
        replyTo: orderData.email,
        subject: `🔔 Đơn hàng mới #${orderData.orderCode} từ ${orderData.customerName}`,
        html: htmlContent
      });

      console.log('✅ New order notification sent to admin:', adminEmail);
      return true;
    } catch (error) {
      console.error('❌ Error sending new order notification:', error);
      return false;
    }
  }

  /**
   * Gửi email thông báo cập nhật trạng thái đơn hàng cho khách hàng
   */
  static async sendOrderStatusUpdate(orderData: {
    customerName: string;
    email: string;
    orderCode: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';
    shippingProvider?: string;
    trackingCode?: string;
    estimatedDeliveryDate?: Date | string;
    cancelledReason?: string;
    note?: string;
  }): Promise<boolean> {
    try {
      const emailConfig = getEmailConfig();

      const statusMap: Record<string, { title: string; color: string; icon: string; message: string }> = {
        confirmed: {
          title: 'Đã Xác Nhận Đơn Hàng',
          color: '#28a745',
          icon: '✅',
          message: 'Đơn hàng của bạn đã được CTC duyệt và xác nhận thành công. Đội ngũ kho vận đang tiến hành kiểm tra thiết bị.'
        },
        processing: {
          title: 'Đang Xử Lý & Đóng Gói',
          color: '#17a2b8',
          icon: '⚙️',
          message: 'Các sản phẩm trong đơn hàng đang được đóng gói cẩn thận và kiểm định chất lượng trước khi bàn giao cho đơn vị vận chuyển.'
        },
        shipping: {
          title: 'Đang Giao Hàng',
          color: '#6f42c1',
          icon: '🚚',
          message: 'Đơn hàng của bạn đã được xuất kho và đang trên đường vận chuyển tới địa chỉ của bạn.'
        },
        completed: {
          title: 'Đơn Hàng Hoàn Thành',
          color: '#28a745',
          icon: '🎉',
          message: 'Đơn hàng đã được giao thành công! Cảm ơn bạn đã tin tưởng lựa chọn sản phẩm và dịch vụ của CTC.'
        },
        cancelled: {
          title: 'Đơn Hàng Đã Hủy',
          color: '#dc3545',
          icon: '❌',
          message: 'Đơn hàng của bạn đã bị hủy trên hệ thống.'
        }
      };

      const info = statusMap[orderData.status] || {
        title: 'Cập Nhật Trạng Thái Đơn Hàng',
        color: '#FF6B35',
        icon: '🔔',
        message: 'Đơn hàng của bạn vừa có cập nhật trạng thái mới.'
      };

      let shippingHtml = '';
      if (orderData.status === 'shipping') {
        shippingHtml = `
          <div style="background:#f3e8ff;border-radius:12px;padding:20px;margin:20px 0;border-left:5px solid #6f42c1;">
            <h4 style="margin:0 0 10px;color:#581c87;font-size:15px;">🚚 Thông tin vận chuyển</h4>
            <p style="margin:4px 0;font-size:14px;color:#3b0764;"><strong>Đơn vị vận chuyển:</strong> ${escapeHtml(orderData.shippingProvider || 'Xe công ty CTC')}</p>
            ${orderData.trackingCode ? `<p style="margin:4px 0;font-size:14px;color:#3b0764;"><strong>Mã vận đơn:</strong> <span style="font-family:monospace;font-weight:bold;background:#fff;padding:2px 8px;border-radius:4px;">${escapeHtml(orderData.trackingCode)}</span></p>` : ''}
            ${orderData.estimatedDeliveryDate ? `<p style="margin:4px 0;font-size:14px;color:#3b0764;"><strong>Dự kiến giao:</strong> ${new Date(orderData.estimatedDeliveryDate).toLocaleDateString('vi-VN')}</p>` : ''}
          </div>
        `;
      }

      let cancelledHtml = '';
      if (orderData.status === 'cancelled' && orderData.cancelledReason) {
        cancelledHtml = `
          <div style="background:#f8d7da;border-radius:12px;padding:20px;margin:20px 0;border-left:5px solid #dc3545;">
            <h4 style="margin:0 0 8px;color:#842029;font-size:15px;">⚠️ Lý do hủy đơn</h4>
            <p style="margin:0;font-size:14px;color:#842029;font-style:italic;">${escapeHtml(orderData.cancelledReason)}</p>
          </div>
        `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
          <div style="max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
            <div style="background:${info.color};color:white;padding:35px 30px;text-align:center;">
              <div style="font-size:48px;margin-bottom:10px;">${info.icon}</div>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;">${info.title}</h1>
              <p style="margin:0;opacity:0.9;font-size:14px;">Mã đơn hàng: <strong>${escapeHtml(orderData.orderCode)}</strong></p>
            </div>

            <div style="padding:35px;">
              <p style="font-size:16px;color:#2c3e50;margin:0 0 20px;">
                Xin chào <strong>${escapeHtml(orderData.customerName)}</strong>,
              </p>

              <div style="background:#f8f9fa;border-radius:12px;padding:20px;border-left:5px solid ${info.color};margin-bottom:20px;">
                <p style="margin:0;font-size:15px;color:#2c3e50;line-height:1.7;">
                  ${info.message}
                </p>
              </div>

              ${shippingHtml}
              ${cancelledHtml}

              ${orderData.note ? `<p style="font-size:13px;color:#666;font-style:italic;">Ghi chú từ quản trị viên: ${escapeHtml(orderData.note)}</p>` : ''}

              <div style="text-align:center;margin-top:30px;">
                <a href="http://localhost:3000/#/track-order?query=${encodeURIComponent(orderData.orderCode)}" style="display:inline-block;padding:12px 28px;background:${info.color};color:white;text-decoration:none;border-radius:25px;font-weight:bold;font-size:14px;">
                  🔍 Tra cứu tiến trình chi tiết
                </a>
              </div>
            </div>

            ${getCompanyEmailFooterHtml()}
          </div>
        </body>
        </html>
      `;

      await this.getTransporter().sendMail({
        from: `"CTC Solar" <${emailConfig.from}>`,
        to: orderData.email,
        subject: `${info.icon} ${info.title} #${orderData.orderCode}`,
        html: htmlContent
      });

      console.log(`✅ Order status update email sent to ${orderData.email} (Status: ${orderData.status})`);
      return true;
    } catch (error) {
      console.error('❌ Error sending order status email:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

