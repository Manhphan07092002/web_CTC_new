import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, CheckCircle, Clock, XCircle, Trash2, Eye, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  return `${protocol}//${hostname}:4000/api`;
};
const API_BASE = getApiBase();

const ContactsManagement: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'completed' | 'cancelled'>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/contact`);
      const data = await response.json();
      // Ensure data is an array and map id from _id
      const normalize = (list: any[]) => list.map(c => ({
        ...c,
        id: c.id || c._id || String(c._id || '')
      }));

      if (Array.isArray(data)) {
        setContacts(normalize(data));
      } else if (data && Array.isArray(data.data)) {
        setContacts(normalize(data.data));
      } else if (data && Array.isArray(data.contacts)) {
        setContacts(normalize(data.contacts));
      } else {
        setContacts([]);
        console.warn('API response is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast('Không thể tải danh sách liên hệ', 'error');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    if (!id || id === 'undefined') {
      console.warn('updateStatus: Invalid contact ID', id);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        showToast('Cập nhật trạng thái thành công', 'success');
        fetchContacts();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Không thể cập nhật trạng thái', 'error');
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    contact: Contact | null;
  }>({
    isOpen: false,
    contact: null
  });

  const handleDeleteClick = (contact: Contact) => {
    setDeleteConfirm({
      isOpen: true,
      contact
    });
  };

  const handleConfirmDelete = async () => {
    const contact = deleteConfirm.contact;
    if (!contact) return;

    const contactId = contact.id || (contact as any)._id;
    if (!contactId || contactId === 'undefined') {
      console.warn('handleConfirmDelete: Invalid contact ID', contactId);
      setDeleteConfirm({ isOpen: false, contact: null });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/contact/${contactId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Đã xóa yêu cầu liên hệ thành công!', 'success');
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Không thể xóa liên hệ', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, contact: null });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { label: 'Mới', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 dark:border dark:border-blue-800', icon: <Clock size={14} /> },
      contacted: { label: 'Đã liên hệ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border dark:border-yellow-800', icon: <Phone size={14} /> },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 dark:border dark:border-green-800', icon: <CheckCircle size={14} /> },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 dark:border dark:border-red-800', icon: <XCircle size={14} /> }
    };
    const badge = badges[status as keyof typeof badges] || badges.new;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const filteredContacts = contacts.filter(contact => 
    filter === 'all' ? true : contact.status === filter
  );

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    completed: contacts.filter(c => c.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quản lý Liên hệ</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Danh sách yêu cầu tư vấn từ khách hàng</p>
        </div>
        <button
          onClick={fetchContacts}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Mail className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mới</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã liên hệ</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.contacted}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/50 rounded-lg flex items-center justify-center">
              <Phone className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc:</span>
          <div className="flex gap-2">
            {['all', 'new', 'contacted', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'new' ? 'Mới' : f === 'contacted' ? 'Đã liên hệ' : f === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Không có liên hệ nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dịch vụ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày gửi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredContacts.map((contact, index) => (
                  <tr key={contact.id || `contact-${index}`} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</div>
                          {contact.status === 'new' && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">● MỚI</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Phone size={14} className="text-gray-500 dark:text-gray-400" />
                          <a href={`tel:${contact.phone}`} className="hover:text-primary">{contact.phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                          <Mail size={14} />
                          <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{contact.service}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(contact)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-150 dark:border-slate-700/60">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chi tiết liên hệ</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-slate-900/80 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Thông tin khách hàng</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <User size={16} className="text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">{selectedContact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-600 dark:text-gray-400" />
                    <a href={`tel:${selectedContact.phone}`} className="text-primary hover:underline font-medium">
                      {selectedContact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-600 dark:text-gray-400" />
                    <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline font-medium">
                      {selectedContact.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Dịch vụ quan tâm</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedContact.service}</p>
              </div>

              {/* Message */}
              {selectedContact.message && (
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Nội dung</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Cập nhật trạng thái</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { status: 'contacted', label: '📞 Đã liên hệ', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:hover:bg-yellow-900/60 dark:border dark:border-yellow-800/80' },
                    { status: 'completed', label: '✅ Hoàn thành', className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-900/60 dark:border dark:border-green-800/80' },
                    { status: 'cancelled', label: '❌ Hủy', className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/60 dark:border dark:border-red-800/80' },
                    { status: 'new', label: '🔄 Đặt lại mới', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60 dark:border dark:border-blue-800/80' }
                  ].map(({ status, label, className }) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedContact.id || (selectedContact as any)._id, status as any)}
                      className={`px-4 py-3 rounded-lg transition-colors font-medium cursor-pointer ${className}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, contact: null })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa yêu cầu"
        itemName={deleteConfirm.contact?.name}
        description={`Bạn có chắc chắn muốn xóa yêu cầu liên hệ từ "${deleteConfirm.contact?.name}" (${deleteConfirm.contact?.phone})?`}
        warningText="Thông tin liên hệ này sẽ bị xóa khỏi hệ thống."
        confirmText="Đồng ý xóa"
      />
    </div>
  );
};

export default ContactsManagement;
