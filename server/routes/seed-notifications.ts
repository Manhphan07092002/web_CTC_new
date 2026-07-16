import express from 'express';
import { db } from '../../services/db-mongodb';

const router = express.Router();

// Seed sample notifications
router.post('/', async (req, res) => {
  try {
    const sampleNotifications = [
      {
        type: 'success' as const,
        title: 'Sản phẩm mới được thêm',
        message: 'Tấm pin Canadian Solar 450W đã được thêm vào hệ thống thành công.',
        icon: '✅',
        link: '/admin/content?tab=products',
        isRead: false
      },
      {
        type: 'info' as const,
        title: 'Dự án mới',
        message: 'Dự án lắp đặt hệ thống điện mặt trời 10kW tại Đà Nẵng đã được tạo.',
        icon: 'ℹ️',
        link: '/admin/content?tab=projects',
        isRead: false
      },
      {
        type: 'warning' as const,
        title: 'Cảnh báo tồn kho',
        message: 'Danh mục "Inverter" chỉ còn 2 sản phẩm. Nên thêm sản phẩm mới.',
        icon: '⚠️',
        link: '/admin/content?tab=products',
        isRead: false
      },
      {
        type: 'success' as const,
        title: 'Đánh giá mới từ khách hàng',
        message: 'Anh Nguyễn Văn A đã để lại đánh giá 5 sao cho dịch vụ lắp đặt.',
        icon: '⭐',
        link: '/admin/content?tab=testimonials',
        isRead: true
      },
      {
        type: 'info' as const,
        title: 'Tin tức được đăng',
        message: 'Bài viết "Xu hướng năng lượng mặt trời 2025" đã được xuất bản.',
        icon: '📰',
        link: '/admin/content?tab=news',
        isRead: true
      },
      {
        type: 'error' as const,
        title: 'Lỗi upload hình ảnh',
        message: 'Không thể upload hình ảnh cho sản phẩm. Vui lòng thử lại.',
        icon: '❌',
        link: '/admin/files',
        isRead: false
      },
      {
        type: 'success' as const,
        title: 'Backup thành công',
        message: 'Dữ liệu đã được sao lưu tự động lúc 23:00.',
        icon: '💾',
        isRead: true
      },
      {
        type: 'info' as const,
        title: 'Cập nhật hệ thống',
        message: 'Dashboard đã được cập nhật với tính năng AI & Analytics mới.',
        icon: '🚀',
        isRead: false
      }
    ];

    // Create all notifications
    const created = [];
    for (const notification of sampleNotifications) {
      const result = await db.notifications.add(notification as any);
      created.push(result);
    }

    res.json({
      success: true,
      message: `Created ${created.length} sample notifications`,
      notifications: created
    });
  } catch (error) {
    console.error('Error seeding notifications:', error);
    res.status(500).json({ error: 'Failed to seed notifications' });
  }
});

// Clear all notifications
router.delete('/', async (req, res) => {
  try {
    await db.notifications.deleteAll();
    res.json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

export default router;
