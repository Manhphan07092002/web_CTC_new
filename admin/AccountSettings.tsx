/**
 * Account Settings Page
 * Trang quản lý thông tin tài khoản cá nhân
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Camera, Save, Shield, Key, Clock, 
  CheckCircle, AlertCircle, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../contexts/PermissionContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import FilePickerModal from './FilePickerModal';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, roleLevel, permissions } = usePermission();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      
      try {
        const userData = await api.users.getByEmail(user.email);
        setProfile(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          avatar: userData.avatar || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Không thể tải thông tin tài khoản', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.email]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?._id) return;
    
    setSaving(true);
    try {
      await api.users.update(profile._id, {
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar
      });
      
      showToast('Cập nhật thông tin thành công!', 'success');
      
      // Update local profile
      setProfile(prev => prev ? { ...prev, ...formData } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Lỗi khi cập nhật thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('Mật khẩu mới phải có ít nhất 8 ký tự!', 'error');
      return;
    }
    
    if (!profile?._id) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${profile._id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Đổi mật khẩu thành công!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.message || 'Lỗi khi đổi mật khẩu', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Lỗi khi đổi mật khẩu', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Generate avatar from name
  const generateAvatar = () => {
    const name = formData.name || 'User';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;
    setFormData(prev => ({ ...prev, avatar: avatarUrl }));
  };

  // Handle file selection from FilePickerModal
  const handleFileSelect = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
          <p className="text-gray-500 text-sm">Cập nhật thông tin cá nhân và bảo mật</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary to-corporate h-32"></div>
        <div className="px-8 pb-6 -mt-16">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <img 
                src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random&size=200`}
                alt={formData.name}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button 
                  onClick={() => setShowFilePicker(true)}
                  className="p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors"
                  title="Chọn ảnh từ thư viện"
                >
                  <Camera size={16} />
                </button>
                <button 
                  onClick={generateAvatar}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="Tạo avatar tự động"
                >
                  <User size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{profile?.name}</h2>
              <p className="text-gray-500">{profile?.email}</p>
              {role && (
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.displayName}
                  </span>
                  <span className="text-sm text-gray-400">Level {roleLevel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'profile', label: 'Thông tin cá nhân', icon: User },
          { id: 'security', label: 'Bảo mật', icon: Shield },
          { id: 'activity', label: 'Hoạt động', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera size={16} className="inline mr-2" />
                  Avatar
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={e => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://... hoặc chọn từ thư viện"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilePicker(true)}
                    className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                    title="Chọn ảnh từ thư viện"
                  >
                    <Camera size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={generateAvatar}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                    title="Tạo avatar tự động"
                  >
                    <User size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Change Password */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Key size={20} />
                Đổi mật khẩu
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Key size={18} />
                  {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>

            {/* Role & Permissions Info */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} />
                Vai trò & Quyền hạn
              </h3>
              
              {role ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.displayName}
                    </span>
                    <span className="text-sm text-gray-500">Level {roleLevel}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bạn có <strong>{permissions.length}</strong> quyền trong hệ thống.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {permissions.slice(0, 10).map(perm => (
                      <span key={perm} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border">
                        {perm}
                      </span>
                    ))}
                    {permissions.length > 10 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                        +{permissions.length - 10} quyền khác
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Chưa được phân quyền trong hệ thống RBAC</p>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Thông tin hoạt động
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Ngày tạo tài khoản</div>
                <div className="font-medium text-gray-800">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Không xác định'
                  }
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Đăng nhập lần cuối</div>
                <div className="font-medium text-gray-800">
                  {profile?.lastLogin 
                    ? new Date(profile.lastLogin).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Vừa xong'
                  }
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">ID tài khoản</div>
                <div className="font-mono text-sm text-gray-800">{profile?._id}</div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="font-medium text-green-600">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Picker Modal */}
      <FilePickerModal
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelect={handleFileSelect}
      />
    </div>
  );
};

export default AccountSettings;
