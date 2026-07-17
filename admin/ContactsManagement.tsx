import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, CheckCircle, Clock, XCircle, Trash2, Eye, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

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
      const response = await fetch('http://103.161.171.54:4000/api/contact');
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setContacts(data);
      } else if (data && Array.isArray(data.data)) {
        setContacts(data.data);
      } else if (data && Array.isArray(data.contacts)) {
        setContacts(data.contacts);
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
    try {
      const response = await fetch(`http://103.161.171.54:4000/api/contact/${id}/status`, {
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

  const deleteContact = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa liên hệ này?')) return;

    try {
      const response = await fetch(`http://103.161.171.54:4000/api/contact/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Đã xóa liên hệ', 'success');
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Không thể xóa liên hệ', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { label: 'Mới', color: 'bg-blue-100 text-blue-800', icon: <Clock size={14} /> },
      contacted: { label: 'Đã liên hệ', color: 'bg-yellow-100 text-yellow-800', icon: <Phone size={14} /> },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> }
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
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Liên hệ</h1>
          <p className="text-gray-600 mt-1">Danh sách yêu cầu tư vấn từ khách hàng</p>
        </div>
        <button
          onClick={fetchContacts}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mới</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã liên hệ</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.contacted}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Phone className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Lọc:</span>
          <div className="flex gap-2">
            {['all', 'new', 'contacted', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'new' ? 'Mới' : f === 'contacted' ? 'Đã liên hệ' : f === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có liên hệ nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày gửi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact, index) => (
                  <tr key={contact.id || `contact-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          {contact.status === 'new' && (
                            <span className="text-xs text-blue-600 font-semibold">● MỚI</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Phone size={14} />
                          <a href={`tel:${contact.phone}`} className="hover:text-primary">{contact.phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Mail size={14} />
                          <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{contact.service}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Chi tiết liên hệ</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">Thông tin khách hàng</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    <span className="font-medium">{selectedContact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-600" />
                    <a href={`tel:${selectedContact.phone}`} className="text-primary hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-600" />
                    <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Dịch vụ quan tâm</h4>
                <p className="text-gray-700">{selectedContact.service}</p>
              </div>

              {/* Message */}
              {selectedContact.message && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Nội dung</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Cập nhật trạng thái</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { status: 'contacted', label: '📞 Đã liên hệ', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                    { status: 'completed', label: '✅ Hoàn thành', className: 'bg-green-100 text-green-800 hover:bg-green-200' },
                    { status: 'cancelled', label: '❌ Hủy', className: 'bg-red-100 text-red-800 hover:bg-red-200' },
                    { status: 'new', label: '🔄 Đặt lại mới', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' }
                  ].map(({ status, label, className }) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedContact.id, status as any)}
                      className={`px-4 py-3 rounded-lg transition-colors font-medium ${className}`}
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
    </div>
  );
};

export default ContactsManagement;
