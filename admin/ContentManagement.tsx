import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye, Star, Archive, MoreVertical, Image as ImageIcon, ShieldAlert, X } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { usePermission, PermissionGate } from '../contexts/PermissionContext';
import PriceDisplay from '../components/PriceDisplay';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import FilePickerModal from './FilePickerModal';

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  code?: string;
  price?: string;
  originalPrice?: string;
  contactPrice?: boolean;
  image: string;
  stock?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'contact';
  isFeatured?: boolean;
  isDeleted?: boolean;
  views?: number;
  likes?: number;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  completionDate: string;
  image: string;
  category?: string;
  createdAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category?: string;
  author?: string;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'financial';
  logo: string;
  website?: string;
  createdAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
  createdAt: string;
}

const ContentManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'products';
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete Modal States
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null as Product | null,
    type: 'soft' as 'soft' | 'permanent' | 'restore'
  });

  // Partner Modal States
  const [partnerModal, setPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    type: 'supplier' as 'supplier' | 'financial',
    logo: '',
    website: ''
  });
  const [showPartnerImagePicker, setShowPartnerImagePicker] = useState(false);

  // Testimonial Modal States
  const [testimonialModal, setTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    content: '',
    image: ''
  });
  const [showTestimonialImagePicker, setShowTestimonialImagePicker] = useState(false);

  useEffect(() => {
    loadContent();
  }, [currentTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      switch (currentTab) {
        case 'products':
          const productsData = await api.products.getAll();
          setProducts(productsData.filter((p: Product) => !p.isDeleted));
          break;
        case 'projects':
          const projectsData = await api.projects.getAll();
          setProjects(projectsData);
          break;
        case 'news':
          const newsData = await api.news.getAll();
          setNews(newsData);
          break;
        case 'partners':
          const partnersData = await api.partners.getAll();
          setPartners(partnersData);
          break;
        case 'testimonials':
          const testimonialsData = await api.testimonials.getAll();
          setTestimonials(testimonialsData);
          break;
      }
    } catch (error) {
      console.error('Error loading content:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    }
    setLoading(false);
  };

  const openDeleteModal = (product: Product, type: 'soft' | 'permanent' | 'restore') => {
    setDeleteModal({
      isOpen: true,
      product,
      type
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      product: null,
      type: 'soft'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.product) return;

    const { product, type } = deleteModal;
    
    try {
      if (type === 'soft') {
        // Soft delete - chỉ đánh dấu isDeleted = true
        await api.products.update(product.id, { isDeleted: true, deletedAt: new Date().toISOString() });
        showToast(`Đã chuyển "${product.name}" vào thùng rác`, 'success');
      } else if (type === 'hard') {
        // Hard delete for other content types
        await handleOtherDelete(product.id, product.category, product.name);
        return; // handleOtherDelete already calls loadContent and showToast
      }
      loadContent();
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Lỗi khi xóa', 'error');
    }
  };

  // Open modal for other content types
  const openOtherDeleteModal = (item: any, type: string) => {
    setDeleteModal({
      isOpen: true,
      product: {
        id: item.id,
        name: item.title || item.name,
        image: item.image || item.thumbnail,
        category: type
      },
      type: 'hard'
    });
  };

  // Legacy function for other content types (now called from modal)
  const handleOtherDelete = async (id: string, type: string, name: string) => {
    try {
      switch (type) {
        case 'project':
          await api.projects.delete(id);
          break;
        case 'news':
          await api.news.delete(id);
          break;
        case 'partner':
          await api.partners.delete(id);
          break;
        case 'testimonial':
          await api.testimonials.delete(id);
          break;
      }
      showToast(`Đã xóa "${name}"`, 'success');
      loadContent();
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Lỗi khi xóa', 'error');
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await api.products.update(id, { isFeatured: !isFeatured });
      showToast(isFeatured ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật', 'success');
      loadContent();
    } catch (error) {
      console.error('Error toggling featured:', error);
      showToast('Lỗi khi cập nhật', 'error');
    }
  };

  // Partner handlers
  const handleAddPartner = () => {
    setEditingPartner(null);
    setPartnerForm({ name: '', type: 'supplier', logo: '', website: '' });
    setPartnerModal(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setPartnerForm({
      name: partner.name,
      type: partner.type,
      logo: partner.logo,
      website: partner.website || ''
    });
    setPartnerModal(true);
  };

  const handleSavePartner = async () => {
    if (!partnerForm.name || !partnerForm.logo) {
      showToast('Vui lòng điền tên và logo', 'error');
      return;
    }
    try {
      if (editingPartner) {
        await api.partners.update(editingPartner.id, partnerForm);
        showToast('Cập nhật đối tác thành công!', 'success');
      } else {
        await api.partners.create(partnerForm);
        showToast('Thêm đối tác thành công!', 'success');
      }
      setPartnerModal(false);
      loadContent();
    } catch (error) {
      console.error('Error saving partner:', error);
      showToast('Lỗi khi lưu đối tác', 'error');
    }
  };

  // Testimonial handlers
  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm({ name: '', role: '', content: '', image: '' });
    setTestimonialModal(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      image: testimonial.image
    });
    setTestimonialModal(true);
  };

  const handleSaveTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.role || !testimonialForm.content) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    try {
      if (editingTestimonial) {
        await api.testimonials.update(editingTestimonial.id, testimonialForm);
        showToast('Cập nhật đánh giá thành công!', 'success');
      } else {
        await api.testimonials.create(testimonialForm);
        showToast('Thêm đánh giá thành công!', 'success');
      }
      setTestimonialModal(false);
      loadContent();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      showToast('Lỗi khi lưu đánh giá', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTestimonials = testimonials.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {currentTab === 'products' && 'Quản lý Sản phẩm'}
            {currentTab === 'projects' && 'Quản lý Dự án'}
            {currentTab === 'news' && 'Quản lý Tin tức'}
            {currentTab === 'partners' && 'Quản lý Đối tác'}
            {currentTab === 'testimonials' && 'Quản lý Đánh giá'}
          </h1>
          <p className="text-gray-500 mt-1">
            {currentTab === 'products' && `${filteredProducts.length} sản phẩm`}
            {currentTab === 'projects' && `${filteredProjects.length} dự án`}
            {currentTab === 'news' && `${filteredNews.length} tin tức`}
            {currentTab === 'partners' && `${filteredPartners.length} đối tác`}
            {currentTab === 'testimonials' && `${filteredTestimonials.length} đánh giá`}
          </p>
        </div>
        <div className="flex gap-3">
          {currentTab === 'products' && (
            <button
              onClick={() => navigate('/admin/products/trash')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2"
            >
              <Archive size={18} />
              Thùng rác
            </button>
          )}
          <PermissionGate 
            permission={currentTab === 'products' ? 'create_products' : 
                       currentTab === 'projects' ? 'create_projects' : 
                       currentTab === 'news' ? 'create_news' : 'create_content'}
          >
            <button
              onClick={() => {
                if (currentTab === 'products') navigate('/admin/products/new');
                else if (currentTab === 'projects') navigate('/admin/projects/new');
                else if (currentTab === 'news') navigate('/admin/news/new');
                else if (currentTab === 'partners') handleAddPartner();
                else if (currentTab === 'testimonials') handleAddTestimonial();
              }}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Thêm mới
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* Products */}
          {currentTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <div key={`product-${idx}-${product.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {product.image && product.image.trim() !== '' ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="white" />
                        Nổi bật
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
                      {product.stock !== undefined && (
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 0 ? `${product.stock} có sẵn` : 'Hết hàng'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">{product.categoryLabel || product.category}</p>
                    {product.code && <p className="text-xs text-gray-400 mb-2">📦 Mã: {product.code}</p>}
                    
                    <div className="mb-3">
                      <PriceDisplay 
                        price={product.price || 0}
                        originalPrice={product.originalPrice}
                        contactPrice={product.contactPrice}
                        size="md"
                        layout="vertical"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {product.views || 0} views
                      </span>
                      {product.createdAt && (
                        <span className="flex items-center gap-1">
                          📅 {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <PermissionGate permission="edit_products">
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.isFeatured || false)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            product.isFeatured
                              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={product.isFeatured ? 'Bỏ khỏi sản phẩm nổi bật' : 'Đánh dấu là sản phẩm nổi bật'}
                        >
                          <Star size={14} className="inline mr-1" fill={product.isFeatured ? 'currentColor' : 'none'} />
                          {product.isFeatured ? 'Nổi bật' : 'Đánh dấu'}
                        </button>
                      </PermissionGate>
                      
                      <PermissionGate permission="edit_products">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit size={16} />
                        </button>
                      </PermissionGate>
                      
                      <PermissionGate permission="delete_products">
                        <button
                          onClick={() => openDeleteModal(product, 'soft')}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Chuyển vào thùng rác"
                        >
                          <Trash2 size={16} />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {currentTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => (
                <div key={`project-${idx}-${project.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">📍 {project.location}</p>
                    <p className="text-sm text-gray-500 mb-1">⚡ {project.capacity}</p>
                    <p className="text-sm text-gray-500 mb-3">📅 {project.completionDate}</p>
                    <div className="flex gap-2">
                      <PermissionGate permission="edit_projects">
                        <button
                          onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                        >
                          <Edit size={16} className="inline mr-1" />
                          Sửa
                        </button>
                      </PermissionGate>
                      <PermissionGate permission="delete_projects">
                        <button
                          onClick={() => handleOtherDelete(project.id, 'project', project.title)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* News */}
          {currentTab === 'news' && (
            <div className="space-y-4">
              {filteredNews.map((item, idx) => (
                <div key={`news-${idx}-${item.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex gap-4">
                  <img src={item.image} alt={item.title} className="w-32 h-32 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>📅 {item.date}</span>
                      {item.author && <span>✍️ {item.author}</span>}
                      {item.category && <span>🏷️ {item.category}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <PermissionGate permission="edit_news">
                      <button
                        onClick={() => navigate(`/admin/news/edit/${item.id}`)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Edit size={16} />
                      </button>
                    </PermissionGate>
                    <PermissionGate permission="delete_news">
                      <button
                        onClick={() => openOtherDeleteModal(item, 'news')}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Partners */}
          {currentTab === 'partners' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredPartners.map((partner, idx) => (
                <div key={`partner-${idx}-${partner.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                  <img src={partner.logo} alt={partner.name} className="w-full h-24 object-contain mb-3" />
                  <h3 className="font-bold text-sm text-gray-800 mb-1">{partner.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{partner.type === 'supplier' ? 'Nhà cung cấp' : 'Tài chính'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPartner(partner)}
                      className="flex-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs"
                    >
                      <Edit size={12} className="inline mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleOtherDelete(partner.id, 'partner', partner.name)}
                      className="flex-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs"
                    >
                      <Trash2 size={12} className="inline mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonials */}
          {currentTab === 'testimonials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTestimonials.map((testimonial, idx) => (
                <div key={`testimonial-${idx}-${testimonial.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleOtherDelete(testimonial.id, 'testimonial', testimonial.name)}
                        className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {((currentTab === 'products' && filteredProducts.length === 0) ||
            (currentTab === 'projects' && filteredProjects.length === 0) ||
            (currentTab === 'news' && filteredNews.length === 0) ||
            (currentTab === 'partners' && filteredPartners.length === 0) ||
            (currentTab === 'testimonials' && filteredTestimonials.length === 0)) && (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không có dữ liệu</p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModal.type === 'soft' ? 'Xác nhận xóa sản phẩm' : 'Xác nhận xóa'}
        itemName={deleteModal.product?.name || ''}
        type={deleteModal.type}
        itemImage={deleteModal.product?.image}
        itemPrice={deleteModal.product?.price}
        itemCategory={deleteModal.product?.categoryLabel || deleteModal.product?.category}
        itemType={deleteModal.product?.category === 'news' ? 'news' : 
                 deleteModal.product?.category === 'project' ? 'project' :
                 deleteModal.product?.category === 'partner' ? 'partner' :
                 deleteModal.product?.category === 'testimonial' ? 'testimonial' : 'product'}
      />

      {/* Partner Modal */}
      {partnerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPartner ? 'Sửa đối tác' : 'Thêm đối tác mới'}
              </h2>
              <button onClick={() => setPartnerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đối tác *</label>
                <input
                  type="text"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Nhập tên đối tác"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại đối tác *</label>
                <select
                  value={partnerForm.type}
                  onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value as 'supplier' | 'financial' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="supplier">Nhà cung cấp</option>
                  <option value="financial">Tài chính</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerForm.logo}
                    onChange={(e) => setPartnerForm({ ...partnerForm, logo: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="URL logo"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPartnerImagePicker(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>
                {partnerForm.logo && (
                  <img src={partnerForm.logo} alt="Preview" className="mt-2 h-16 object-contain rounded" />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={partnerForm.website}
                  onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPartnerModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePartner}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium"
              >
                {editingPartner ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {testimonialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTestimonial ? 'Sửa đánh giá' : 'Thêm đánh giá mới'}
              </h2>
              <button onClick={() => setTestimonialModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ *</label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Giám đốc công ty ABC"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testimonialForm.image}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="URL ảnh"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTestimonialImagePicker(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>
                {testimonialForm.image && (
                  <img src={testimonialForm.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded-full" />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá *</label>
                <textarea
                  value={testimonialForm.content}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  placeholder="Nhập nội dung đánh giá của khách hàng..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTestimonialModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTestimonial}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium"
              >
                {editingTestimonial ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Picker Modals */}
      <FilePickerModal
        isOpen={showPartnerImagePicker}
        onClose={() => setShowPartnerImagePicker(false)}
        onSelect={(url) => {
          setPartnerForm({ ...partnerForm, logo: url });
          setShowPartnerImagePicker(false);
        }}
        title="Chọn logo đối tác"
      />
      
      <FilePickerModal
        isOpen={showTestimonialImagePicker}
        onClose={() => setShowTestimonialImagePicker(false)}
        onSelect={(url) => {
          setTestimonialForm({ ...testimonialForm, image: url });
          setShowTestimonialImagePicker(false);
        }}
        title="Chọn ảnh đại diện"
      />
    </div>
  );
};

export default ContentManagement;
