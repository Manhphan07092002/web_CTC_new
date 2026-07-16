import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, User as UserIcon, Mail, Phone, Linkedin, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PermissionGate } from '../contexts/PermissionContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  email: string;
  phone: string;
  linkedin?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    email: '',
    phone: '',
    linkedin: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.team.getAll();
      // Sort by order
      const sorted = data.sort((a: TeamMember, b: TeamMember) => a.order - b.order);
      setMembers(sorted);
    } catch (error) {
      console.error('Error loading team members:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      image: '',
      email: '',
      phone: '',
      linkedin: '',
      order: members.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image,
      email: member.email,
      phone: member.phone,
      linkedin: member.linkedin || '',
      order: member.order,
      isActive: member.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa thành viên "${name}"?`)) return;

    try {
      await api.team.delete(id);
      showToast(`Đã xóa ${name}`, 'success');
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      showToast('Lỗi khi xóa', 'error');
    }
  };

  const handleImageSelect = (url: string) => {
    setFormData({ ...formData, image: url });
    setShowImagePicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.email || !formData.phone || !formData.image) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    try {
      if (editingMember) {
        await api.team.update(editingMember.id, formData);
        showToast('Cập nhật thành viên thành công!', 'success');
      } else {
        await api.team.create(formData);
        showToast('Thêm thành viên thành công!', 'success');
      }
      setIsModalOpen(false);
      loadMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      showToast('Lỗi khi lưu', 'error');
    }
  };

  const handleMoveUp = async (member: TeamMember) => {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (currentIndex === 0) return;

    const prevMember = members[currentIndex - 1];
    
    try {
      await api.team.update(member.id, { order: prevMember.order });
      await api.team.update(prevMember.id, { order: member.order });
      loadMembers();
    } catch (error) {
      console.error('Error reordering:', error);
      showToast('Lỗi khi sắp xếp', 'error');
    }
  };

  const handleMoveDown = async (member: TeamMember) => {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (currentIndex === members.length - 1) return;

    const nextMember = members[currentIndex + 1];
    
    try {
      await api.team.update(member.id, { order: nextMember.order });
      await api.team.update(nextMember.id, { order: member.order });
      loadMembers();
    } catch (error) {
      console.error('Error reordering:', error);
      showToast('Lỗi khi sắp xếp', 'error');
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      await api.team.update(member.id, { isActive: !member.isActive });
      showToast(member.isActive ? 'Đã ẩn thành viên' : 'Đã hiển thị thành viên', 'success');
      loadMembers();
    } catch (error) {
      console.error('Error toggling active:', error);
      showToast('Lỗi khi cập nhật', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Đội ngũ</h1>
          <p className="text-gray-500 mt-1">{members.length} thành viên</p>
        </div>
        <PermissionGate permission="view_users" minRoleLevel={50}>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm thành viên
          </button>
        </PermissionGate>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có thành viên nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <div
              key={member.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
                !member.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(member)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Di chuyển lên"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(member)}
                      disabled={index === members.length - 1}
                      className="p-1 text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} />
                  <a href={`mailto:${member.email}`} className="hover:text-primary">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <a href={`tel:${member.phone}`} className="hover:text-primary">
                    {member.phone}
                  </a>
                </div>
                {member.linkedin && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Linkedin size={14} />
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(member)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    member.isActive
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {member.isActive ? 'Ẩn' : 'Hiện'}
                </button>
                <button
                  onClick={() => handleEdit(member)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">
                {editingMember ? 'Chỉnh sửa Thành viên' : 'Thêm Thành viên mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ảnh đại diện <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 items-center">
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    <ImageIcon size={18} />
                    Chọn ảnh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Chức vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="VD: Giám đốc Kỹ thuật"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Hiển thị trên website</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium"
                >
                  {editingMember ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      <FilePickerModal
        isOpen={showImagePicker}
        onSelect={handleImageSelect}
        onClose={() => setShowImagePicker(false)}
      />
    </div>
  );
};

export default TeamManagement;
