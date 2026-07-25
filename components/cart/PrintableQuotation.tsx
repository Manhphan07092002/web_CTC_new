import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

// ─── Number to Vietnamese Words Converter ──────────────────────────────────
export function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const blockNames = ['', ' nghìn', ' triệu', ' tỷ'];

  function readTriple(n: number, isTop: boolean): string {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const unit = n % 10;
    let res = '';
    if (hundred > 0 || !isTop) res += units[hundred] + ' trăm ';
    if (ten > 1) {
      res += units[ten] + ' mươi ';
      if (unit === 1) res += 'mốt ';
      else if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += units[unit] + ' ';
    } else if (ten === 1) {
      res += 'mười ';
      if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += units[unit] + ' ';
    } else if (unit > 0) {
      if (res !== '') res += 'lẻ ';
      res += units[unit] + ' ';
    }
    return res;
  }

  let str = Math.round(num).toString();
  const blocks: number[] = [];
  while (str.length > 0) {
    blocks.push(parseInt(str.slice(-3), 10));
    str = str.slice(0, -3);
  }

  let words = '';
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i] > 0) {
      words += readTriple(blocks[i], i === blocks.length - 1) + blockNames[i] + ' ';
    }
  }
  words = words.trim();
  if (!words) return 'Không đồng';
  return words.charAt(0).toUpperCase() + words.slice(1) + ' đồng';
}

interface PrintableQuotationProps {
  cartItems: any[];
  totalAmount: number;
  appliedDiscount: number;
  finalTotalAmount: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
}

export const PrintableQuotation: React.FC<PrintableQuotationProps> = ({
  cartItems,
  totalAmount,
  appliedDiscount,
  finalTotalAmount,
  customerName,
  phone,
  email,
  address
}) => {
  const { settings } = useSettings();
  const logoSrc = settings?.logoHeader || settings?.logo || '/uploads/images/logo/logodo.png';

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  // VAT calculations (8% VAT)
  const subtotal = Math.max(0, totalAmount - appliedDiscount);
  const vatAmount = Math.round(subtotal * 0.08);
  const totalWithVat = subtotal + vatAmount;

  return (
    <div className="hidden print:block bg-white text-slate-900 p-6 font-sans text-[11px] leading-snug">
      {/* Strict Print CSS Override */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 12mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, footer, nav, aside, iframe,
          .print\\:hidden, div.fixed, a.fixed, button.fixed,
          [class*="Header"], [class*="Footer"], [class*="ChatBox"], [class*="BackToTop"],
          [class*="zalo"], [class*="Notification"], [class*="float"], button, a[href*="zalo"], a[href*="tel"] {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>

      {/* 1. Header: Company Logo & Official Legal Details */}
      <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-900 mb-2">
        <img
          src={logoSrc}
          alt="CTC Logo"
          className="h-16 w-auto object-contain flex-shrink-0"
        />
        <div className="flex-1 text-center space-y-0.5">
          <h1 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
            CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG - CTC
          </h1>
          <p className="text-[10.5px] text-slate-800">
            Địa chỉ: 50B Nguyễn Du, Phường Hải Châu, Thành phố Đà Nẵng, Việt Nam.
          </p>
          <p className="text-[10.5px] text-slate-800">
            Điện thoại: 02363.745.745 - 02363.745.746 &nbsp;|&nbsp; Fax: 0236.3863669
          </p>
          <p className="text-[10.5px] text-slate-800">
            Website: <span className="underline font-semibold text-slate-900">https://ctcdn.vn</span> &nbsp;&nbsp;&nbsp; Email: <span className="underline font-semibold text-slate-900">ctcdanang@gmail.com</span>
          </p>
        </div>
      </div>

      {/* 2. Date Line */}
      <div className="text-right italic text-slate-800 mb-3 text-[11px] font-medium">
        Đà Nẵng, ngày {day} tháng {month} năm {year}
      </div>

      {/* 3. Main Document Title & Salutation */}
      <div className="text-center my-4 space-y-1">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">
          BẢNG CHÀO GIÁ
        </h2>
        <p className="text-xs text-slate-900 font-bold">
          Kính gửi: <span className="underline">{customerName || 'Quý Khách hàng'}</span>
        </p>
        <p className="text-[10.5px] text-slate-900 italic max-w-2xl mx-auto">
          CTC chân thành cảm ơn sự quan tâm của Quý {customerName ? `khách hàng (${customerName})` : 'Khách hàng'} đến sản phẩm Công ty chúng tôi trong thời gian qua.
        </p>
        <p className="text-[10.5px] text-slate-900 italic max-w-2xl mx-auto">
          Theo yêu cầu của Quý {customerName ? `khách hàng` : 'Khách hàng'} về việc báo giá thiết bị, chúng tôi xin trân trọng gửi báo giá chi tiết như sau:
        </p>
      </div>

      {/* 4. Products & Equipment Table */}
      <table className="w-full border-collapse border-2 border-slate-900 my-4 text-[10.5px]">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-extrabold text-center uppercase tracking-wide">
            <th className="p-2 border border-slate-900 w-10 text-center">STT</th>
            <th className="p-2 border border-slate-900 text-center">TÊN HÀNG HÓA<br/><span className="normal-case font-normal text-[9.5px]">(Mã hàng)</span></th>
            <th className="p-2 border border-slate-900 w-12 text-center">ĐVT</th>
            <th className="p-2 border border-slate-900 w-10 text-center">SL</th>
            <th className="p-2 border border-slate-900 w-28 text-center">XUẤT XỨ</th>
            <th className="p-2 border border-slate-900 text-right w-28">ĐƠN GIÁ</th>
            <th className="p-2 border border-slate-900 text-right w-32">THÀNH TIỀN</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, idx) => (
            <tr key={item.product_id} className="text-slate-900">
              <td className="p-2 border border-slate-900 text-center font-medium">{idx + 1}</td>
              <td className="p-2 border border-slate-900 font-bold text-slate-900">
                {item.product_name}
                {item.power && <span className="block text-[9.5px] font-normal text-slate-600">Công suất: {item.power}W</span>}
              </td>
              <td className="p-2 border border-slate-900 text-center">Cái</td>
              <td className="p-2 border border-slate-900 text-center font-bold">{item.quantity}</td>
              <td className="p-2 border border-slate-900 text-center">Việt Nam / Chính hãng</td>
              <td className="p-2 border border-slate-900 text-right font-semibold text-slate-900">
                {item.price > 0 ? item.price.toLocaleString('vi-VN') : 'Liên hệ'}
              </td>
              <td className="p-2 border border-slate-900 text-right font-bold text-slate-900">
                {item.price > 0 ? (item.price * item.quantity).toLocaleString('vi-VN') : 'Liên hệ'}
              </td>
            </tr>
          ))}

          {/* Summary Rows inside table */}
          <tr className="bg-slate-50 font-bold">
            <td colSpan={6} className="p-2 border border-slate-900 text-right uppercase tracking-wide font-bold">
              Cộng trước thuế GTGT:
            </td>
            <td className="p-2 border border-slate-900 text-right font-extrabold">
              {subtotal.toLocaleString('vi-VN')}
            </td>
          </tr>

          {appliedDiscount > 0 && (
            <tr className="bg-slate-50 font-bold text-emerald-800">
              <td colSpan={6} className="p-2 border border-slate-900 text-right uppercase tracking-wide font-bold">
                Chiết khấu Voucher:
              </td>
              <td className="p-2 border border-slate-900 text-right font-extrabold">
                -{appliedDiscount.toLocaleString('vi-VN')}
              </td>
            </tr>
          )}

          <tr className="bg-slate-50 font-bold">
            <td colSpan={6} className="p-2 border border-slate-900 text-right uppercase tracking-wide font-bold">
              VAT 8%:
            </td>
            <td className="p-2 border border-slate-900 text-right font-extrabold">
              {vatAmount.toLocaleString('vi-VN')}
            </td>
          </tr>

          <tr className="bg-slate-100 font-extrabold text-xs">
            <td colSpan={6} className="p-2.5 border border-slate-900 text-right uppercase tracking-wider font-black">
              Tổng tiền sau thuế GTGT:
            </td>
            <td className="p-2.5 border border-slate-900 text-right font-black text-xs">
              {totalWithVat.toLocaleString('vi-VN')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in Words Box */}
      <div className="border-2 border-slate-900 p-2.5 my-3 text-center text-slate-900 italic font-bold text-[11.5px] bg-slate-50/50">
        Bằng chữ: {numberToVietnameseWords(totalWithVat)}.
      </div>

      {/* 5. Official Terms & Conditions */}
      <div className="space-y-1 text-[10px] text-slate-900 font-medium my-4 leading-relaxed">
        <p>* Hàng hóa mới 100%, xuất xứ như biểu giá trên.</p>
        <p>* Tiến độ và địa điểm giao nhận: 15-30 ngày kể từ ngày ký hợp đồng (không tính ngày nghỉ và lễ), địa điểm giao nhận: Tại kho của bên mua.</p>
        <p>* Tiến độ và phương thức thanh toán: 30 ngày, kể từ ngày bàn giao nghiệm thu hàng hóa và bên mua nhận được hóa đơn có thuế GTGT, và các giấy tờ liên quan. Thanh toán bằng chuyển khoản vào tài khoản của bên bán.</p>
        <p>* Số tài khoản giao dịch của bên bán: <strong>5650006625 NH TMCP Đầu tư và Phát triển Việt Nam CN Sông Hàn (BIDV)</strong></p>
        <p>* Thời gian bảo hành: 12 tháng kể từ ngày hàng hóa được nghiệm thu.</p>
        <p>* Hiệu lực báo giá: 30 ngày kể từ ngày ký.</p>
        <p>* Rất mong sự hợp tác của Quý {customerName || 'Khách hàng'}.</p>
        <p className="font-extrabold italic text-slate-900 mt-1 uppercase text-[10.5px]">TRÂN TRỌNG CẢM ƠN!</p>
      </div>

      {/* 6. Legal Representative Signature Block */}
      <div className="flex justify-between items-start text-center mt-8 pt-2">
        <div className="w-64">
          <p className="font-extrabold text-slate-900 uppercase text-xs">ĐẠI DIỆN KHÁCH HÀNG</p>
          <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký & ghi rõ họ tên)</p>
          <div className="h-20" />
          <p className="font-extrabold text-slate-800 text-xs">{customerName || '........................................'}</p>
        </div>

        <div className="w-80">
          <p className="font-extrabold text-slate-900 uppercase text-xs">CÔNG TY CP XÂY LẮP BƯU ĐIỆN MIỀN TRUNG</p>
          <p className="font-extrabold text-slate-900 uppercase text-xs mt-0.5">TỔNG GIÁM ĐỐC</p>
          <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, đóng dấu & ghi rõ họ tên)</p>
          <div className="h-16" />
          <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">NGUYỄN VĂN DUY</p>
        </div>
      </div>
    </div>
  );
};
