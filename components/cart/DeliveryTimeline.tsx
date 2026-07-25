import React from 'react';
import { BadgeCheck, Package, Truck, Star } from 'lucide-react';

interface DeliveryTimelineProps {
  method: 'shipping' | 'pickup';
}

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ method }) => {
  const items = method === 'shipping' ? [
    { icon: <BadgeCheck size={14} />, label: 'Xác nhận đơn hàng', time: 'Trong 30 phút', color: 'text-primary' },
    { icon: <Package size={14} />, label: 'Chuẩn bị hàng & kiểm tra kỹ thuật', time: '1-2 giờ', color: 'text-amber-500' },
    { icon: <Truck size={14} />, label: 'Giao hàng & lắp đặt', time: '24-48 giờ làm việc', color: 'text-emerald-500' },
    { icon: <Star size={14} />, label: 'Bàn giao & nghiệm thu', time: 'Tại công trình', color: 'text-violet-500' },
  ] : [
    { icon: <BadgeCheck size={14} />, label: 'Xác nhận báo giá', time: 'Trong 30 phút', color: 'text-primary' },
    { icon: <Package size={14} />, label: 'Soạn sẵn hàng tại kho Showroom', time: '1 giờ', color: 'text-amber-500' },
    { icon: <Star size={14} />, label: 'Khách kiểm tra & nhận tại showroom', time: 'Linh hoạt', color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-center gap-3 text-xs">
          <div className={`w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 ${it.color}`}>
            {it.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{it.label}</span>
          </div>
          <span className="text-gray-400 text-[11px] whitespace-nowrap">{it.time}</span>
        </div>
      ))}
    </div>
  );
};
