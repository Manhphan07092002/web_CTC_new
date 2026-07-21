import express from 'express';
import { Order, OrderItem, Notification } from '../../models';
import { EmailService } from '../../services/email-service';

const router = express.Router();

// Generate unique order code (e.g., CTC-ORD-162810)
function generateOrderCode() {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `CTC-ORD-${randNum}`;
}

// Get all orders (Admin only)
router.get('/', async (req: any, res) => {
  try {
    const { status, search } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Get pending orders count
router.get('/pending-count', async (req, res) => {
  try {
    const count = await Order.countDocuments({ status: 'pending' });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error counting pending orders:', error);
    res.status(500).json({ success: false, error: 'Failed to count pending orders' });
  }
});

// ============================================================
// Public: Track order by a single query (code, phone, or name)
// ============================================================
router.get('/track', async (req: any, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.toString().trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp mã đơn hàng hoặc số điện thoại.' });
    }

    const searchVal = query.toString().trim();

    // Look for case-insensitive matches in orderCode and phone
    const orders = await Order.find({
      $or: [
        { orderCode: { $regex: searchVal, $options: 'i' } },
        { phone: { $regex: searchVal, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng nào khớp với thông tin cung cấp.' });
    }

    const data = [];
    for (const order of orders) {
      const items = await OrderItem.find({ orderId: order._id });
      data.push({
        orderCode: order.orderCode,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        note: order.note,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: items.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.subtotal
        }))
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, error: 'Lỗi hệ thống, vui lòng thử lại.' });
  }
});

// Get order details by ID
router.get('/:id', async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = await OrderItem.find({ orderId: order._id });

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
});

// Create new order (Public check-out)
router.post('/', async (req: any, res) => {
  try {
    const { customerName, phone, email, address, note, items } = req.body;

    if (!customerName || !phone || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Required fields are missing' });
    }

    // Generate unique order code
    let orderCode = generateOrderCode();
    // Ensure uniqueness
    let exists = await Order.findOne({ orderCode });
    while (exists) {
      orderCode = generateOrderCode();
      exists = await Order.findOne({ orderCode });
    }

    // Calculate total amount
    let totalAmount = 0;
    const itemsToSave = [];

    for (const item of items) {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const subtotal = price * quantity;
      totalAmount += subtotal;

      itemsToSave.push({
        productId: item.product_id,
        productName: item.product_name,
        price,
        quantity,
        subtotal
      });
    }

    // Create and save Order
    const order = new Order({
      orderCode,
      customerName,
      phone,
      email,
      address,
      note: note || '',
      totalAmount,
      status: 'pending'
    });

    await order.save();

    // Create and save OrderItems
    const savedItems = [];
    for (const itemData of itemsToSave) {
      const orderItem = new OrderItem({
        ...itemData,
        orderId: order._id
      });
      await orderItem.save();
      savedItems.push(orderItem);
    }

    // Create system notification for Admin
    try {
      await Notification.create({
        type: 'info',
        title: 'Đơn hàng mới',
        message: `Đơn hàng ${orderCode} được đặt bởi ${customerName} (${phone}). Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}đ`,
        icon: '🛒',
        link: '/admin/orders',
        isRead: false
      });
    } catch (notifError) {
      console.error('Failed to create order notification:', notifError);
    }

    // Send email notifications (fire-and-forget, don't block response)
    const emailOrderData = {
      customerName,
      email,
      phone,
      address,
      orderCode,
      totalAmount,
      items: savedItems.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      note: note || ''
    };
    Promise.all([
      EmailService.sendOrderConfirmation(emailOrderData),
      EmailService.sendNewOrderNotification(emailOrderData)
    ]).catch(err => console.error('Failed to send order emails:', err));

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order: {
        id: order._id,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to place order' });
  }
});



// Admin: Resend confirmation email for an order
router.post('/:id/resend-email', async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = await OrderItem.find({ orderId: order._id });

    const emailOrderData = {
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      orderCode: order.orderCode,
      totalAmount: order.totalAmount,
      items: items.map((i: any) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal
      })),
      note: order.note || ''
    };

    const sent = await EmailService.sendOrderConfirmation(emailOrderData);

    if (sent) {
      res.json({ success: true, message: 'Email đã được gửi lại thành công.' });
    } else {
      res.status(500).json({ success: false, error: 'Không thể gửi email. Kiểm tra cấu hình SMTP.' });
    }
  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({ success: false, error: 'Failed to resend email' });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', async (req: any, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled'];
    
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// Delete order (Admin only)
router.delete('/:id', async (req: any, res) => {
  try {
    const orderId = req.params.id;
    await OrderItem.deleteMany({ orderId });
    const result = await Order.findByIdAndDelete(orderId);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
});

export default router;
