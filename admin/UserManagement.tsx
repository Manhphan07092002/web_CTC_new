
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, User as UserIcon, Mail, Shield, Search, MoreVertical, Lock, Phone, Eye, EyeOff, Image as ImageIcon, Crown, UserCheck, Users, Key, Check } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import RoleManagement from './RoleManagement';
import UserPermissionManagement from './UserPermissionManagement';

// Role interface
interface Role {
  _id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  level: number;
}

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedUserForPermission, setSelectedUserForPermission] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissionNotes, setPermissionNotes] = useState('');
  const [userPermissions, setUserPermissions] = useState<Record<string, any>>({});
  const { t } = useLanguage();
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    role: 'viewer',
    password: '',
    phone: '',
    avatar: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await api.users.getAll();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { 
    loadUsers(); 
    loadRoles();
    loadUserPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/permissions/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const response = await fetch('/api/permissions/user-permissions');
      const data = await response.json();
      if (data.success) {
        const permMap: Record<string, any> = {};
        data.data.forEach((perm: any) => {
          const uid = perm.userId?._id || perm.userId;
          if (uid) permMap[uid] = perm;
        });
        setUserPermissions(permMap);
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const handleOpenPermissionModal = (user: User) => {
    setSelectedUserForPermission(user);
    const existingPerm = userPermissions[user.id];
    setSelectedRoleId(existingPerm?.roleId?._id || '');
    setPermissionNotes(existingPerm?.notes || '');
    setIsPermissionModalOpen(true);
  };

  const handleAssignPermission = async () => {
    if (!selectedUserForPermission || !selectedRoleId) {
      showToast('Vui lòng chọn vai trò', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/permissions/users/${selectedUserForPermission.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRoleId,
          notes: permissionNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast('Phân quyền thành công!', 'success');
        setIsPermissionModalOpen(false);
        loadUserPermissions();
      } else {
        showToast(data.message || 'Lỗi khi phân quyền', 'error');
      }
    } catch (error) {
      console.error('Error assigning permission:', error);
      showToast('Lỗi khi phân quyền', 'error');
    }
  };

  const getRoleDisplay = (userId: string) => {
    const perm = userPermissions[userId];
    if (perm?.roleId) {
      return {
        name: perm.roleId.displayName || perm.roleId.name,
        color: perm.roleId.color || '#6B7280',
        icon: perm.roleId.icon || 'User'
      };
    }
    return null;
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    // Lấy vai trò RBAC hiện tại của user
    const userPerm = userPermissions[user.id];
    const currentRole = userPerm?.roleId?.name || user.role;
    
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: currentRole, 
      password: '', 
      phone: (user as any).phone || '',
      avatar: (user as any).avatar || ''
    });
    setPasswordError(null);
    setPhoneError(null);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    // Set default role từ danh sách roles (viewer nếu có, hoặc role đầu tiên)
    const defaultRole = roles.find(r => r.name === 'viewer')?.name || roles[0]?.name || 'viewer';
    setFormData({ name: '', email: '', role: defaultRole, password: '', phone: '', avatar: '' });
    setPasswordError(null);
    setPhoneError(null);
    setIsModalOpen(true);
  };

  const handleImageSelect = (url: string) => {
    setFormData({ ...formData, avatar: url });
    setShowImagePicker(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if(confirm(`Bạn có chắc muốn xóa người dùng "${name}"?\n\nHành động này không thể hoàn tác.`)) {
      try {
        await api.users.delete(id);
        showToast(`✓ Đã xóa ${name}`, 'success');
        loadUsers();
      } catch (e) {
        console.error('Error deleting user:', e);
        showToast('✗ Không thể xóa người dùng', 'error');
      }
    }
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return null;
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường';
    if (!/[0-9]/.test(password)) return 'Mật khẩu phải có ít nhất 1 số';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null;
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Số điện thoại không hợp lệ (VD: 0123456789 hoặc +84123456789)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (!editingUser && formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        showToast(passwordError, 'error');
        return;
      }
    }
    
    if (editingUser && formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        showToast(passwordError, 'error');
        return;
      }
    }
    
    // Validate phone
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        showToast(phoneError, 'error');
        return;
      }
    }
    
    try {
        // Prepare data for submission
        const submitData = { ...formData };
        
        // Remove password if empty when editing
        if (editingUser && !submitData.password) {
          delete submitData.password;
        }
        
        // Remove empty phone
        if (!submitData.phone) {
          delete submitData.phone;
        }
        
        // Remove empty avatar
        if (!submitData.avatar) {
          delete submitData.avatar;
        }
        
        let userId: string;
        
        if(editingUser) {
            console.log('Updating user:', editingUser.id, submitData);
            await api.users.update(editingUser.id, submitData);
            userId = editingUser.id;
            showToast(`✓ Đã cập nhật ${formData.name}`, 'success');
        } else {
            console.log('Creating user:', submitData);
            const newUser = await api.users.add(submitData);
            userId = newUser.id || newUser._id;
            showToast(`✓ Đã thêm ${formData.name}`, 'success');
        }
        
        // Gán vai trò RBAC cho user
        if (formData.role && userId) {
          const selectedRole = roles.find(r => r.name === formData.role);
          if (selectedRole) {
            try {
              const response = await fetch(`/api/permissions/users/${userId}/role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roleId: selectedRole._id,
                  notes: editingUser ? 'Cập nhật vai trò qua form chỉnh sửa' : 'Gán vai trò khi tạo user mới'
                }),
              });
              const data = await response.json();
              if (data.success) {
                console.log('Role assigned successfully');
                loadUserPermissions(); // Reload permissions
              }
            } catch (err) {
              console.error('Error assigning role:', err);
            }
          }
        }
        
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'viewer', password: '', phone: '', avatar: '' });
        loadUsers();
    } catch (e) {
        console.error('Error saving user:', e);
        const errorMsg = (e as Error).message || 'Có lỗi xảy ra';
        showToast(`✗ ${errorMsg}`, 'error');
    }
  };

  if(loading) return <div className="p-12 text-center"><div className="animate-spin inline-block w-8 h-8 border-2 border-primary rounded-full border-r-transparent"></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Quản lý Tài khoản & Phân quyền</h2>
            <p className="text-gray-500 text-sm mt-1">Quản lý người dùng, vai trò và phân quyền hệ thống</p>
         </div>
         {activeTab === 'users' && (
           <button 
              onClick={handleAdd}
              className="bg-corporate hover:bg-primary text-white px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 font-bold transform hover:-translate-y-1"
           >
              <Plus size={20} /> {t('common.add')} User
           </button>
         )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'users', label: 'Quản lý Người dùng', icon: Users },
          { id: 'roles', label: 'Quản lý Vai trò', icon: Crown },
          { id: 'permissions', label: 'Phân quyền Người dùng', icon: UserCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
               <input type="text" placeholder="Tìm kiếm người dùng..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"/>
            </div>
         </div>

         <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">User Info</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">{t('common.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {(u as any).avatar ? (
                      <img 
                        src={(u as any).avatar} 
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                         {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                       <div className="font-bold text-gray-800">{u.name}</div>
                       <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const roleDisplay = getRoleDisplay(u.id);
                    if (roleDisplay) {
                      return (
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                          style={{ 
                            backgroundColor: roleDisplay.color + '15', 
                            color: roleDisplay.color,
                            borderColor: roleDisplay.color + '30'
                          }}
                        >
                          {roleDisplay.icon === 'Crown' && <Crown size={12}/>}
                          {roleDisplay.icon === 'Shield' && <Shield size={12}/>}
                          {roleDisplay.name}
                        </span>
                      );
                    }
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                        u.role === 'editor' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {u.role === 'admin' && <Shield size={12}/>}
                        {u.role}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                     <button 
                       onClick={() => handleOpenPermissionModal(u)} 
                       className="p-2 hover:bg-orange-50 text-gray-500 hover:text-orange-600 rounded-lg transition-colors"
                       title="Phân quyền"
                     >
                       <Key size={18} />
                     </button>
                     <button 
                       onClick={() => handleEdit(u)} 
                       className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                       title="Sửa"
                     >
                       <Edit size={18} />
                     </button>
                     <button 
                       onClick={() => handleDelete(u.id, u.name)} 
                       className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
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

      {/* Role Management Tab */}
      {activeTab === 'roles' && (
        <RoleManagement />
      )}

      {/* User Permission Management Tab */}
      {activeTab === 'permissions' && (
        <UserPermissionManagement />
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col animate-fade-in-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingUser ? `${t('common.edit')} User` : `${t('common.add')} User`}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                 {/* Avatar */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Avatar</label>
                   <div className="flex items-center gap-4">
                     {formData.avatar ? (
                       <img 
                         src={formData.avatar} 
                         alt="Avatar"
                         className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                       />
                     ) : (
                       <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl">
                         {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                       </div>
                     )}
                     <div className="flex-1">
                       <button
                         type="button"
                         onClick={() => setShowImagePicker(true)}
                         className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-primary font-medium"
                       >
                         <ImageIcon size={18} />
                         {formData.avatar ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                       </button>
                       {formData.avatar && (
                         <button
                           type="button"
                           onClick={() => setFormData({ ...formData, avatar: '' })}
                           className="w-full mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                         >
                           Xóa ảnh
                         </button>
                       )}
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('common.name')}</label>
                   <div className="relative">
                     <input 
                       required
                       type="text" 
                       className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                     <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('contact.email')}</label>
                   <div className="relative">
                     <input 
                       required
                       type="email" 
                       className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                     <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">
                     Mật khẩu {editingUser && <span className="text-xs text-gray-500 font-normal">(Để trống nếu không đổi)</span>}
                   </label>
                   <div className="relative">
                     <input 
                       required={!editingUser}
                       type={showPassword ? 'text' : 'password'}
                       className={`w-full border rounded-xl pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                         passwordError ? 'border-red-500' : 'border-gray-300'
                       }`}
                       value={formData.password}
                       onChange={e => {
                         const value = e.target.value;
                         setFormData({...formData, password: value});
                         if (value) {
                           setPasswordError(validatePassword(value));
                         } else {
                           setPasswordError(null);
                         }
                       }}
                       placeholder={editingUser ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu...'}
                       minLength={editingUser ? 0 : 6}
                     />
                     <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                       title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                     >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                   </div>
                   {passwordError ? (
                     <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                       <span className="font-bold">✗</span> {passwordError}
                     </p>
                   ) : !editingUser ? (
                     <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                       <p className="flex items-center gap-1">
                         <span className={formData.password.length >= 6 ? 'text-green-600 font-bold' : 'text-gray-400'}>
                           {formData.password.length >= 6 ? '✓' : '○'}
                         </span> Tối thiểu 6 ký tự
                       </p>
                       <p className="flex items-center gap-1">
                         <span className={/[A-Z]/.test(formData.password) ? 'text-green-600 font-bold' : 'text-gray-400'}>
                           {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                         </span> Có chữ hoa
                       </p>
                       <p className="flex items-center gap-1">
                         <span className={/[a-z]/.test(formData.password) ? 'text-green-600 font-bold' : 'text-gray-400'}>
                           {/[a-z]/.test(formData.password) ? '✓' : '○'}
                         </span> Có chữ thường
                       </p>
                       <p className="flex items-center gap-1">
                         <span className={/[0-9]/.test(formData.password) ? 'text-green-600 font-bold' : 'text-gray-400'}>
                           {/[0-9]/.test(formData.password) ? '✓' : '○'}
                         </span> Có số
                       </p>
                     </div>
                   ) : null}
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                   <div className="relative">
                     <input 
                       type="tel" 
                       className={`w-full border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                         phoneError ? 'border-red-500' : 'border-gray-300'
                       }`}
                       value={formData.phone}
                       onChange={e => {
                         const value = e.target.value;
                         setFormData({...formData, phone: value});
                         if (value) {
                           setPhoneError(validatePhone(value));
                         } else {
                           setPhoneError(null);
                         }
                       }}
                       placeholder="0123456789 hoặc +84123456789"
                     />
                     <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                   </div>
                   {phoneError ? (
                     <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                       <span className="font-bold">✗</span> {phoneError}
                     </p>
                   ) : formData.phone && !phoneError ? (
                     <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                       <span className="font-bold">✓</span> Số điện thoại hợp lệ
                     </p>
                   ) : (
                     <p className="text-xs text-gray-500 mt-1">VD: 0123456789 hoặc +84123456789</p>
                   )}
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">
                     Vai trò (RBAC) <span className="text-red-500">*</span>
                   </label>
                   <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
                     {roles.length > 0 ? roles.map(role => (
                       <label
                         key={role._id}
                         className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                           formData.role === role.name 
                             ? 'bg-primary/10 border-2 border-primary' 
                             : 'hover:bg-gray-50 border-2 border-transparent'
                         }`}
                       >
                         <input
                           type="radio"
                           name="userRole"
                           value={role.name}
                           checked={formData.role === role.name}
                           onChange={() => setFormData({...formData, role: role.name as any})}
                           className="hidden"
                         />
                         <div 
                           className="w-8 h-8 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: role.color + '20', color: role.color }}
                         >
                           {role.icon === 'Crown' && <Crown size={16} />}
                           {role.icon === 'Shield' && <Shield size={16} />}
                           {role.icon === 'Edit' && <Edit size={16} />}
                           {role.icon === 'Eye' && <Eye size={16} />}
                           {!['Crown', 'Shield', 'Edit', 'Eye'].includes(role.icon) && <UserIcon size={16} />}
                         </div>
                         <div className="flex-1">
                           <div className="font-medium text-sm text-gray-800">{role.displayName}</div>
                           <div className="text-xs text-gray-500">Level {role.level}</div>
                         </div>
                         {formData.role === role.name && (
                           <Check size={16} className="text-primary" />
                         )}
                       </label>
                     )) : (
                       <div className="text-center py-4 text-gray-500 text-sm">
                         <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                         <p>Chưa có vai trò. Vui lòng tạo vai trò trước.</p>
                       </div>
                     )}
                   </div>
                   {roles.length > 0 && !formData.role && (
                     <p className="text-xs text-orange-600 mt-1">Vui lòng chọn vai trò cho người dùng</p>
                   )}
                 </div>

                 <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors">{t('common.cancel')}</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-secondary shadow-md transition-all">{t('common.save')}</button>
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

      {/* Permission Assignment Modal */}
      {isPermissionModalOpen && selectedUserForPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPermissionModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Phân quyền người dùng</h3>
                    <p className="text-white/80 text-sm">{selectedUserForPermission.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsPermissionModalOpen(false)} className="text-white/80 hover:text-white">
                  <X size={24}/>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
                  {selectedUserForPermission.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{selectedUserForPermission.name}</div>
                  <div className="text-sm text-gray-500">{selectedUserForPermission.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Role hiện tại: <span className="font-medium text-gray-600">{selectedUserForPermission.role}</span>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Chọn vai trò <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {roles.map(role => (
                    <label
                      key={role._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRoleId === role._id 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role._id}
                        checked={selectedRoleId === role._id}
                        onChange={() => setSelectedRoleId(role._id)}
                        className="hidden"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: role.color + '20', color: role.color }}
                      >
                        {role.icon === 'Crown' && <Crown size={20} />}
                        {role.icon === 'Shield' && <Shield size={20} />}
                        {role.icon === 'Edit' && <Edit size={20} />}
                        {role.icon === 'Eye' && <Eye size={20} />}
                        {!['Crown', 'Shield', 'Edit', 'Eye'].includes(role.icon) && <UserIcon size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{role.displayName}</div>
                        <div className="text-xs text-gray-500">Level {role.level}</div>
                      </div>
                      {selectedRoleId === role._id && (
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {roles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có vai trò nào</p>
                    <p className="text-sm">Vui lòng tạo vai trò trong tab "Quản lý Vai trò"</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={permissionNotes}
                  onChange={(e) => setPermissionNotes(e.target.value)}
                  placeholder="Ghi chú về việc phân quyền (không bắt buộc)..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAssignPermission}
                  disabled={!selectedRoleId}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check size={18} />
                  Xác nhận phân quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
