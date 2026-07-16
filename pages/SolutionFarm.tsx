
import React from 'react';
import { Sun, Battery, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const SolutionFarm: React.FC = () => {
  return (
    <div className="w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Trang Trại Điện Mặt Trời" 
        description="Giải pháp đầu tư trang trại năng lượng mặt trời quy mô lớn (Solar Farm). Kết nối lưới điện quốc gia. CTC - 0236 656 2020"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Trang trại điện mặt trời (Solar Farm)",
          "description": "Giải pháp đầu tư trang trại năng lượng mặt trời quy mô lớn, kết nối lưới điện quốc gia",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Tư vấn và xây dựng trang trại điện mặt trời"
        }}
      />

      {/* Header Parallax */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden attachment-fixed">
         <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1920&auto=format&fit=crop" className="w-full h-full object-cover fixed-bg" alt="Solar Farm Hero"/>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
         </div>
         <div className="relative z-10 text-center text-white px-4 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-md border border-yellow-400/50 px-6 py-2 rounded-full text-yellow-300 font-bold text-sm mb-6">
               <Sun size={18}/> Quy mô công nghiệp
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">Trang Trại <br/>Năng Lượng Mặt Trời</h1>
            <p className="text-xl md:text-2xl text-gray-100 font-light max-w-3xl mx-auto drop-shadow-md">
                Đóng góp to lớn vào an ninh năng lượng quốc gia và phát triển kinh tế bền vững.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
             {/* Main Content */}
             <div className="lg:col-span-2 space-y-16">
                
                {/* Definition Block */}
                <section className="flex flex-col md:flex-row gap-8 items-center">
                   <div className="flex-1 prose prose-lg max-w-none text-gray-600 dark:text-gray-400 text-justify">
                      <h3 className="text-3xl font-bold text-corporate mb-4">Định nghĩa & Vai trò</h3>
                      <p className="text-lg leading-relaxed">
                         Trang trại năng lượng mặt trời (Solar Farm) là nhà máy quang điện tập trung số lượng lớn các tấm pin tại khu vực có bức xạ cao. Sản phẩm điện được hòa vào lưới điện quốc gia 110kV/220kV hoặc 500kV.
                      </p>
                      <p className="text-sm bg-gray-50 p-4 rounded-lg border-l-4 border-primary italic">
                         Khác với quy mô hộ gia đình, Solar Farm được thiết kế để tạo ra hàng triệu kWh điện, hoạt động như các nhà máy điện truyền thống nhưng không phát thải và tiết kiệm nước.
                      </p>
                   </div>
                   <div className="md:w-5/12">
                      <img src="https://images.unsplash.com/photo-1566093097221-ac2335b09e70?q=80&w=600&auto=format&fit=crop" className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 w-full h-auto object-cover" alt="Solar Grid"/>
                   </div>
                </section>

                {/* Factors Grid */}
                <section>
                    <h3 className="text-2xl font-bold text-corporate mb-8 text-center">Yếu tố cốt lõi để thành công</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group">
                           <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Globe size={24}/></div>
                           <h4 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-4">Điều kiện tự nhiên</h4>
                           <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                              <li className="flex gap-2">✓ Bức xạ mặt trời cao quanh năm.</li>
                              <li className="flex gap-2">✓ Quỹ đất rộng, bằng phẳng.</li>
                              <li className="flex gap-2">✓ Ít chịu ảnh hưởng thiên tai.</li>
                           </ul>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group">
                           <div className="w-12 h-12 bg-blue-100 text-corporate rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><BarChart3 size={24}/></div>
                           <h4 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-4">Kỹ thuật & Tài chính</h4>
                           <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                              <li className="flex gap-2">✓ Tối ưu hóa CAPEX & OPEX.</li>
                              <li className="flex gap-2">✓ Hạ tầng truyền tải đủ năng lực.</li>
                              <li className="flex gap-2">✓ Chính sách giá điện (FIT/DPPA).</li>
                           </ul>
                        </div>
                    </div>
                </section>

                {/* Full width image break */}
                <div className="w-full h-80 rounded-3xl overflow-hidden relative shadow-inner">
                    <img src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" alt="Solar Sunset"/>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
                        <h4 className="text-white text-2xl font-bold">Vận hành & Giám sát 24/7</h4>
                        <p className="text-gray-300">Hệ thống SCADA hiện đại giúp kiểm soát mọi thông số kỹ thuật.</p>
                    </div>
                </div>

                {/* Technology Section */}
                <section className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-700">
                   <h3 className="text-2xl font-bold text-corporate mb-6">Công nghệ tích hợp tương lai</h3>
                   <div className="flex flex-col gap-8">
                      <div className="flex items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                         <div className="p-3 bg-green-100 rounded-full text-green-600 flex-shrink-0"><Battery size={28}/></div>
                         <div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Lưu trữ năng lượng (BESS)</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400 text-justify leading-relaxed">
                                Chìa khóa để duy trì sự cân bằng giữa sản lượng điện và nhu cầu tiêu thụ vào ban đêm. Hệ thống pin Lithium công nghiệp giúp san bằng phụ tải và ổn định tần số lưới điện.
                             </p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                         <div className="p-3 bg-blue-100 rounded-full text-corporate flex-shrink-0"><ShieldCheck size={28}/></div>
                         <div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Smart Grid & Inverter</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400 text-justify leading-relaxed">
                                Sử dụng các biến tần thông minh và hệ thống điều khiển thời gian thực giúp lưới điện "khỏe" hơn, phản ứng nhanh với các sự cố như sụt áp hay mất pha.
                             </p>
                         </div>
                      </div>
                   </div>
                </section>
             </div>

             {/* Sidebar */}
             <div className="lg:col-span-1 space-y-8 sticky top-24 h-fit">
                <div className="bg-corporate text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary rounded-full opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                   <h4 className="font-bold text-2xl mb-4 relative z-10">Nhà đầu tư?</h4>
                   <p className="text-sm text-gray-300 mb-8 relative z-10 leading-relaxed">
                      Đầu tư Solar Farm đòi hỏi kế hoạch kỹ thuật và tài chính chi tiết. TLEC có kinh nghiệm triển khai các dự án quy mô MWp với tỷ suất hoàn vốn (IRR) hấp dẫn.
                   </p>
                   <Link to="/contact" className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-corporate px-6 py-3 rounded-xl font-bold transition-all hover:bg-gray-100 w-full justify-center relative z-10 shadow-lg">
                      <Zap size={18}/> Liên hệ EPC
                   </Link>
                </div>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
                    <h5 className="font-bold text-corporate mb-4 flex items-center gap-2"><span className="w-2 h-6 bg-primary rounded-full"></span> Thư viện ảnh</h5>
                    <div className="grid grid-cols-2 gap-3">
                       <img src="https://images.unsplash.com/photo-1559302504-64aae6ca6b6f?q=80&w=300&auto=format&fit=crop" className="rounded-lg h-28 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" alt="Farm 1"/>
                       <img src="https://images.unsplash.com/photo-1624397640148-949b1732bb0a?q=80&w=300&auto=format&fit=crop" className="rounded-lg h-28 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" alt="Farm 2"/>
                       <img src="https://images.unsplash.com/photo-1545208942-e1c9c9a6561e?q=80&w=300&auto=format&fit=crop" className="rounded-lg h-28 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" alt="Farm 3"/>
                       <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=300&auto=format&fit=crop" className="rounded-lg h-28 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" alt="Farm 4"/>
                    </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default SolutionFarm;
