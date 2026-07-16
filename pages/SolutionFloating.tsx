
import React from 'react';
import { Droplets, TrendingUp, AlertTriangle, Globe, MapPin, Anchor } from 'lucide-react';
import SEO from '../components/SEO';

const SolutionFloating: React.FC = () => {
  return (
    <div className="w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20 bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Hệ Thống Năng Lượng Mặt Trời Nổi" 
        description="Công nghệ điện mặt trời nổi trên hồ chứa, đập thủy điện. Xu hướng mới giúp tiết kiệm đất và tăng hiệu suất. TRAN LE Electricity - 0236 656 2020"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Điện mặt trời nổi (Floating Solar)",
          "description": "Công nghệ điện mặt trời nổi trên hồ chứa, đập thủy điện, tiết kiệm đất và tăng hiệu suất",
          "provider": {
            "@type": "Organization",
            "name": "CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ",
            "url": "https://tranle.vn",
            "telephone": "+84-236-656-2020"
          },
          "areaServed": "Vietnam",
          "serviceType": "Lắp đặt hệ thống điện mặt trời nổi"
        }}
      />

      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[600px] overflow-hidden group">
         <img 
            src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=1920&auto=format&fit=crop" 
            alt="Floating Solar System" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-corporate/90 via-corporate/60 to-transparent/20"></div>
         <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 text-white flex items-end h-full">
            <div className="container mx-auto">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md text-blue-100 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6 animate-fade-in-up border border-blue-400/30">
                   <Droplets size={16} className="animate-bounce text-blue-300"/> Xu hướng năng lượng mới
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up delay-100 leading-tight tracking-tight">
                  Điện Mặt Trời Nổi <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">(Floating Solar)</span>
                </h1>
                <p className="max-w-2xl text-lg md:text-xl text-gray-200 font-light animate-fade-in-up delay-200 leading-relaxed pl-6 border-l-4 border-primary">
                   Giải pháp đột phá kết hợp năng lượng tái tạo và bảo vệ tài nguyên nước, mở ra kỷ nguyên mới cho các hồ thủy điện và hồ chứa nước.
                </p>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 py-24">
         {/* Introduction Split */}
         <section className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="prose prose-lg text-gray-600 dark:text-gray-400 text-justify max-w-none">
                <h2 className="text-4xl font-bold text-corporate mb-8 relative inline-block">
                  Hệ mặt trời nổi là gì?
                  <span className="absolute bottom-1 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
                </h2>
                <p className="leading-loose">
                   Được biết đến như một xu hướng mới trong ngành năng lượng, <strong>Hệ thống Điện Mặt trời Nổi</strong> bao gồm các tấm pin quang điện (Solar Panel) được gắn cố định trên hệ phao nổi (Floating mounting system), thay vì lắp trên mặt đất hay mái nhà.
                </p>
                <p className="leading-loose">
                   Vị trí lý tưởng cho các dự án này là vùng nước lặng như hồ nhân tạo, đập thủy điện hoặc hồ xử lý nước. Đây là sự cộng sinh hoàn hảo: nước làm mát pin giúp tăng hiệu suất, và pin che nắng giảm bốc hơi nước.
                </p>
                
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-l-4 border-primary mt-8 hover:shadow-xl transition-shadow">
                   <h4 className="font-bold text-corporate text-lg mb-3 flex items-center gap-3">
                     <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Anchor size={20}/></div>
                     Lịch sử hình thành
                   </h4>
                   <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed">
                      Israel là quốc gia tiên phong trong công nghệ này. Năm 2011, Solar Synergy đã công bố ý tưởng "mô-đun giống Lego" lắp đặt trên mặt nước, giải quyết bài toán khan hiếm đất đai tại các quốc gia phát triển.
                   </p>
                </div>
            </div>
            <div className="relative group">
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
               <div className="absolute -bottom-8 left-20 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
               
               <img 
                 src="https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=800&auto=format&fit=crop" 
                 alt="Floating Solar Concept" 
                 className="relative rounded-[2rem] shadow-2xl w-full h-auto object-cover z-10 border-4 border-white transform group-hover:scale-[1.02] transition-transform duration-500"
               />
            </div>
         </section>

         {/* Pros & Cons Grid with Images */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
            {/* Pros */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
               <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm"><TrendingUp size={24}/></div> 
                  Ưu điểm vượt trội
               </h3>
               <div className="h-56 overflow-hidden rounded-2xl mb-8 shadow-inner">
                 <img src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="Nature benefits"/>
               </div>
               <div className="space-y-6">
                  {[
                    {id: '01', title: 'Tiết kiệm quỹ đất', desc: 'Không chiếm dụng đất nông nghiệp hay rừng. Khai thác không gian mặt nước hồ thủy điện, hồ chứa sẵn có.'},
                    {id: '02', title: 'Tăng hiệu suất (+15%)', desc: 'Nước làm mát tự nhiên cho hệ thống giúp tấm pin hoạt động hiệu quả hơn so với lắp trên mái tôn nóng bức.'},
                    {id: '03', title: 'Bảo vệ nguồn nước', desc: 'Giảm 70% lượng nước bốc hơi tự nhiên. Hạn chế sự phát triển của tảo nhờ che chắn ánh sáng mặt trời.'}
                  ].map(item => (
                    <div key={item.id} className="flex gap-5">
                       <span className="font-black text-green-200 text-4xl leading-none select-none">{item.id}</span>
                       <div>
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-500 text-justify leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Cons */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
               <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm"><AlertTriangle size={24}/></div> 
                  Thách thức triển khai
               </h3>
               <div className="h-56 overflow-hidden rounded-2xl mb-8 shadow-inner">
                 <img src="https://images.unsplash.com/photo-1534274988754-c6a60bf93253?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" alt="Challenges"/>
               </div>
               <div className="space-y-4">
                   <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-red-200 transition-colors">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Chi phí đầu tư ban đầu cao</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Hệ thống phao nổi chuyên dụng, neo đậu phức tạp và dây cáp chịu nước chuẩn IP68 khiến suất đầu tư cao hơn 20-30% so với dự án mặt đất.</p>
                   </div>
                   <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-red-200 transition-colors">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Rủi ro từ thiên nhiên</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Chịu tác động trực tiếp của sóng lớn, gió bão và sự ăn mòn của môi trường nước (đặc biệt là nước mặn ven biển).</p>
                   </div>
                   <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-red-200 transition-colors">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Vận hành & Bảo trì (O&M)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Việc di chuyển, vệ sinh và sửa chữa trên mặt nước đòi hỏi thiết bị chuyên dụng và nhân lực được đào tạo an toàn sông nước.</p>
                   </div>
               </div>
            </div>
         </div>

         {/* Vietnam Potential - Full Width with Overlay */}
         <section className="relative rounded-[3rem] overflow-hidden shadow-2xl min-h-[600px] group">
            <img src="https://images.unsplash.com/photo-1597423244036-ef5020e8d2e9?q=80&w=1920&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="Vietnam Dam"/>
            <div className="absolute inset-0 bg-corporate/90 group-hover:bg-corporate/85 transition-colors duration-500"></div>
            
            <div className="relative z-10 p-10 md:p-20 text-white h-full flex flex-col justify-center">
               <div className="max-w-5xl mx-auto">
                   <div className="text-center mb-16">
                      <div className="inline-block p-3 bg-white dark:bg-gray-800/10 rounded-full mb-6 backdrop-blur-sm border border-white/20 text-primary">
                         <Globe size={40}/>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-6">Tiềm năng phát triển tại Việt Nam</h2>
                      <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-16">
                      <div className="space-y-8">
                         <p className="leading-loose text-blue-100 text-lg text-justify font-light">
                            Việt Nam có hệ thống sông ngòi dày đặc và hàng ngàn hồ chứa thủy điện, thủy lợi. Đây là "mỏ vàng" để phát triển điện mặt trời nổi mà không cần giải phóng mặt bằng tốn kém, tránh xung đột lợi ích với đất nông nghiệp.
                         </p>
                         <div className="bg-white dark:bg-gray-800/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white dark:bg-gray-800/20 transition-colors shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="bg-primary p-3 rounded-xl text-white shadow-md"><MapPin size={24}/></div>
                               <div>
                                  <h4 className="font-bold text-xl">Dự án Đa Mi</h4>
                                  <p className="text-sm text-blue-200">Dự án điện mặt trời nổi đầu tiên</p>
                               </div>
                            </div>
                            <ul className="space-y-4 text-sm">
                               <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                 <span className="opacity-70">Vị trí</span> 
                                 <strong className="text-base">Tánh Linh, Bình Thuận</strong>
                               </li>
                               <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                 <span className="opacity-70">Vận hành</span> 
                                 <strong className="text-base">Tháng 05/2019</strong>
                               </li>
                               <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                 <span className="opacity-70">Công suất</span> 
                                 <strong className="text-base text-yellow-400">47.5 MW</strong>
                               </li>
                               <li className="flex justify-between items-center pt-1">
                                 <span className="opacity-70">Diện tích mặt hồ</span> 
                                 <strong className="text-base">57 ha</strong>
                               </li>
                            </ul>
                         </div>
                      </div>
                      <div className="space-y-8 flex flex-col justify-center">
                         <div className="bg-white dark:bg-gray-800/5 p-6 rounded-2xl border-l-4 border-yellow-400">
                            <h4 className="font-bold text-xl mb-3 text-yellow-400">Định hướng tương lai</h4>
                            <p className="text-gray-200 text-justify leading-relaxed">
                               EVN đang đẩy mạnh nghiên cứu tại các hồ lớn như <strong>Buôn Kuốp</strong> và <strong>Srêpôk</strong> (Đắk Lắk). Tiềm năng kỹ thuật của điện mặt trời nổi tại Việt Nam ước tính lên đến hàng chục GW.
                            </p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                            <div className="relative rounded-2xl overflow-hidden h-40 group/img cursor-pointer">
                               <img src="https://images.unsplash.com/photo-1501959181532-7d2a3c064642?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-500" alt="Dam"/>
                               <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent">
                                  <span className="text-xs font-bold text-white">Hồ Thủy Điện</span>
                               </div>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden h-40 group/img cursor-pointer">
                               <img src="https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-500" alt="Hydro"/>
                               <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent">
                                  <span className="text-xs font-bold text-white">Hạ tầng lưới điện</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};

export default SolutionFloating;
