
import React from 'react';
import { Home, TrendingUp, Leaf, CheckCircle, Factory, Building } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const SolutionRooftop: React.FC = () => {
  return (
    <div className="w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Điện Mặt Trời Áp Mái" 
        description="Giải pháp điện mặt trời áp mái cho hộ gia đình và doanh nghiệp. Tiết kiệm chi phí, bảo vệ môi trường. CTC - 0915 059 666"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Lắp đặt điện mặt trời áp mái",
          "description": "Giải pháp điện mặt trời áp mái cho hộ gia đình và doanh nghiệp",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Lắp đặt hệ thống điện mặt trời"
        }}
      />

      {/* Header Hero */}
      <div className="relative h-[400px] bg-gray-900 overflow-hidden">
        <img 
            src="https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?q=80&w=1920&auto=format&fit=crop" 
            alt="Rooftop Solar Hero" 
            className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-corporate/90 to-transparent"></div>
        <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl animate-fade-in-up">
                    <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4 shadow-lg">Rooftop Solar</div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">Điện Mặt Trời <br/>Trên Mái Nhà</h1>
                    <p className="text-lg text-gray-100 leading-relaxed backdrop-blur-sm bg-white dark:bg-gray-800/10 p-4 rounded-lg border border-white/10">
                        Giải pháp tối ưu cho đô thị: Biến mái nhà vô tri thành trạm phát điện xanh, tiết kiệm chi phí và làm mát không gian sống.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="container mx-auto px-4 py-16">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-16">
               
               {/* Section 1: Introduction */}
               <section className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2 prose prose-lg text-gray-600 dark:text-gray-400 text-justify">
                     <h3 className="text-2xl font-bold text-corporate flex items-center gap-2 mb-4"><Home className="text-primary"/> Tổng quan</h3>
                     <p>
                       Do quỹ đất tại các thành phố khá hạn hẹp, việc sử dụng hệ thống điện mặt trời áp mái là giải pháp tối ưu. Hệ thống tận dụng khoảng không sân thượng, mái nhà xưởng để lắp đặt các tấm pin quang điện.
                     </p>
                     <p>
                       Đây là giải pháp "kép": vừa cung cấp điện cho sinh hoạt, sản xuất, vừa giúp cách nhiệt trần nhà, làm mát không gian bên dưới hiệu quả.
                     </p>
                  </div>
                  <div className="md:w-1/2">
                     <img 
                        src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop" 
                        alt="Rooftop Installation" 
                        className="rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-500 w-full h-64 object-cover"
                     />
                  </div>
               </section>

               {/* Section 2: Applications */}
               <section>
                  <h3 className="text-2xl font-bold text-corporate mb-8 text-center">Mô hình áp dụng phổ biến</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group border border-gray-100 dark:border-gray-700">
                        <div className="h-48 overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1632042213320-72260a2d7059?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Factory"/>
                            <div className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-lg"><Factory size={24}/></div>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-2">Nhà máy & Khu công nghiệp</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Những nơi tiêu thụ lượng điện cực lớn. Lắp đặt giúp giảm chi phí vận hành (OpEx), đạt chứng chỉ xanh (LEED) và giảm nhiệt độ nhà xưởng.
                            </p>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group border border-gray-100 dark:border-gray-700">
                        <div className="h-48 overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Home"/>
                            <div className="absolute top-4 left-4 bg-orange-500 text-white p-2 rounded-lg"><Building size={24}/></div>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-2">Hộ gia đình & Văn phòng</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Giảm hóa đơn tiền điện bậc thang cao. Sử dụng thoải mái cho điều hòa, thang máy và các thiết bị văn phòng vào ban ngày.
                            </p>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Section 3: Benefits with Image Background */}
               <section className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-white shadow-2xl">
                  <div className="absolute inset-0">
                      <img src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1920&auto=format&fit=crop" className="w-full h-full object-cover" alt="Benefits BG"/>
                      <div className="absolute inset-0 bg-corporate/90"></div>
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-white/20 pb-4">
                          <Leaf className="text-green-400" size={32}/> Lợi ích vượt trội
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                <div className="bg-white dark:bg-gray-800/20 p-1 rounded-full"><CheckCircle size={16} className="text-green-400"/></div>
                                <span className="text-gray-100"><strong>Giảm tải lưới điện:</strong> Hạn chế tình trạng quá tải cục bộ cho EVN vào giờ cao điểm.</span>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="bg-white dark:bg-gray-800/20 p-1 rounded-full"><CheckCircle size={16} className="text-green-400"/></div>
                                <span className="text-gray-100"><strong>Hiệu quả vùng xa:</strong> Cung cấp điện ổn định cho hải đảo, vùng cao nơi điện lưới chập chờn.</span>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="bg-white dark:bg-gray-800/20 p-1 rounded-full"><CheckCircle size={16} className="text-green-400"/></div>
                                <span className="text-gray-100"><strong>Bảo vệ môi trường:</strong> Giảm phát thải CO2, thay thế cho nhiệt điện than.</span>
                             </li>
                         </ul>
                         <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                <div className="bg-white dark:bg-gray-800/20 p-1 rounded-full"><CheckCircle size={16} className="text-green-400"/></div>
                                <span className="text-gray-100"><strong>Làm mát công trình:</strong> Tấm pin hấp thụ nhiệt, giúp giảm 3-5 độ C cho không gian bên dưới.</span>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="bg-white dark:bg-gray-800/20 p-1 rounded-full"><CheckCircle size={16} className="text-green-400"/></div>
                                <span className="text-gray-100"><strong>Chi phí tối ưu:</strong> Công nghệ phát triển giúp suất đầu tư giảm đáng kể, hoàn vốn nhanh (4-5 năm).</span>
                             </li>
                         </ul>
                      </div>
                  </div>
               </section>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-1 space-y-8">
               <div className="sticky top-24">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
                     <h4 className="font-bold text-lg text-corporate mb-4 border-l-4 border-primary pl-3">Dịch vụ khác</h4>
                     <ul className="space-y-4">
                        <li>
                            <Link to="/solutions/farm" className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=100&auto=format&fit=crop" className="w-12 h-12 rounded-lg object-cover" alt="Farm"/>
                                <span className="text-sm font-medium group-hover:text-primary text-gray-600 dark:text-gray-400">Trang trại điện mặt trời</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/solutions/floating" className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <img src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=100&auto=format&fit=crop" className="w-12 h-12 rounded-lg object-cover" alt="Floating"/>
                                <span className="text-sm font-medium group-hover:text-primary text-gray-600 dark:text-gray-400">Điện mặt trời nổi</span>
                            </Link>
                        </li>
                     </ul>
                  </div>

                  <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                     <TrendingUp size={48} className="mx-auto mb-4 text-white relative z-10"/>
                     <h4 className="font-bold text-xl mb-2 relative z-10">Đầu tư thông minh</h4>
                     <p className="text-sm opacity-90 mb-6 relative z-10">Hoàn vốn chỉ sau 4-5 năm. Hưởng lợi ích miễn phí lên đến 20 năm tiếp theo.</p>
                     <Link to="/contact" className="block w-full bg-white dark:bg-gray-900 text-primary font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-md relative z-10">Nhận tư vấn ngay</Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SolutionRooftop;
