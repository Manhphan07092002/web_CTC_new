import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { requireAuth } from '../middleware/auth';
import { logger } from '../../utils/logger';

const router = Router();

const REPORT_TYPE_NAMES: Record<string, string> = {
  financial_statement: 'Báo cáo tài chính',
  annual_report: 'Báo cáo thường niên',
  audit_report: 'Báo cáo kiểm toán',
  tax_confirmation: 'Xác nhận nghĩa vụ thuế',
  governance_report: 'Báo cáo quản trị',
  other: 'Báo cáo khác'
};

// GET /api/financial-reports - Get list of financial reports
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const year = req.query.year as string;
    const reportType = req.query.reportType as string;

    let reports;
    if (isAdmin) {
      const filter: any = { isDeleted: { $ne: true } };
      if (year) filter.year = year;
      if (reportType) filter.reportType = reportType;
      reports = await db.financialReports.getAll(filter);
    } else {
      reports = await db.financialReports.getActive(year, reportType);
    }
    res.json(reports);
  } catch (error: any) {
    logger.error('Error fetching financial reports:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách báo cáo tài chính', error: error.message });
  }
});

// GET /api/financial-reports/:id - Get single report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await db.financialReports.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo tài chính' });
    }
    res.json(report);
  } catch (error: any) {
    logger.error('Error fetching financial report by id:', error);
    res.status(500).json({ message: 'Lỗi khi tải chi tiết báo cáo tài chính', error: error.message });
  }
});

// POST /api/financial-reports - Create a new financial report (Admin)
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { title, year, reportType, reportTypeName, description, fileUrl, fileName, fileSize, thumbnail, status, sortOrder } = req.body;

    if (!title || !fileUrl || !year) {
      return res.status(400).json({ message: 'Tiêu đề, năm báo cáo và File đính kèm là bắt buộc' });
    }

    const typeKey = reportType || 'financial_statement';
    const autoTypeName = reportTypeName || REPORT_TYPE_NAMES[typeKey] || 'Báo cáo tài chính';

    const newReport = await db.financialReports.add({
      title: title.trim(),
      year: String(year).trim(),
      reportType: typeKey,
      reportTypeName: autoTypeName,
      description: description?.trim() || '',
      fileUrl: fileUrl.trim(),
      fileName: fileName?.trim() || '',
      fileSize: Number(fileSize) || 0,
      thumbnail: thumbnail?.trim() || '',
      status: status === 'inactive' ? 'inactive' : 'active',
      sortOrder: Number(sortOrder) || 0,
      publishedAt: new Date(),
      isDeleted: false,
      createdBy: req.user?.email || 'admin'
    });

    res.status(201).json(newReport);
  } catch (error: any) {
    logger.error('Error creating financial report:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mới báo cáo tài chính', error: error.message });
  }
});

// PUT /api/financial-reports/reorder - Update sort orders
router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Danh sách items không hợp lệ' });
    }
    await db.financialReports.reorder(items);
    res.json({ success: true, message: 'Cập nhật thứ tự thành công' });
  } catch (error: any) {
    logger.error('Error reordering financial reports:', error);
    res.status(500).json({ message: 'Lỗi khi sắp xếp thứ tự', error: error.message });
  }
});

// PUT /api/financial-reports/:id - Update financial report
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const { title, year, reportType, reportTypeName, description, fileUrl, fileName, fileSize, thumbnail, status, sortOrder } = req.body;

    const existing = await db.financialReports.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo tài chính cần sửa' });
    }

    const typeKey = reportType || existing.reportType;
    const autoTypeName = reportTypeName || REPORT_TYPE_NAMES[typeKey] || existing.reportTypeName;

    const updated = await db.financialReports.update(req.params.id, {
      ...(title && { title: title.trim() }),
      ...(year && { year: String(year).trim() }),
      ...(reportType && { reportType: typeKey, reportTypeName: autoTypeName }),
      ...(description !== undefined && { description: description.trim() }),
      ...(fileUrl && { fileUrl: fileUrl.trim() }),
      ...(fileName !== undefined && { fileName: fileName.trim() }),
      ...(fileSize !== undefined && { fileSize: Number(fileSize) }),
      ...(thumbnail !== undefined && { thumbnail: thumbnail.trim() }),
      ...(status !== undefined && { status }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      updatedBy: req.user?.email || 'admin'
    });

    res.json(updated);
  } catch (error: any) {
    logger.error('Error updating financial report:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật báo cáo tài chính', error: error.message });
  }
});

// PATCH /api/financial-reports/:id/toggle-status - Toggle active/inactive
router.patch('/:id/toggle-status', requireAuth, async (req, res) => {
  try {
    const updated = await db.financialReports.toggleStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo tài chính' });
    }
    res.json(updated);
  } catch (error: any) {
    logger.error('Error toggling financial report status:', error);
    res.status(500).json({ message: 'Lỗi khi đổi trạng thái', error: error.message });
  }
});

// DELETE /api/financial-reports/:id - Soft delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await db.financialReports.delete(req.params.id, true);
    if (!success) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo tài chính cần xóa' });
    }
    res.json({ success: true, message: 'Đã xóa báo cáo tài chính thành công' });
  } catch (error: any) {
    logger.error('Error deleting financial report:', error);
    res.status(500).json({ message: 'Lỗi khi xóa báo cáo tài chính', error: error.message });
  }
});

export default router;
