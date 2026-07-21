import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import {
  Search as SearchIcon, FileText, ShoppingBag, FolderOpen, Newspaper, ClipboardList,
  ChevronRight, RefreshCw, XCircle, ArrowLeft, Download, Tag, Calendar, MapPin
} from 'lucide-react';

const FILTER_TYPES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'products', label: 'Sản phẩm' },
  { key: 'solutions', label: 'Giải pháp' },
  { key: 'projects', label: 'Dự án' },
  { key: 'resources', label: 'Tài liệu' },
  { key: 'news', label: 'Tin tức' },
  { key: 'orders', label: 'Đơn hàng', authRequired: true }
];

// Highlight helper function for Vietnamese diacritic-insensitive matching
function highlightKeyword(text: string, query: string): React.ReactNode {
  if (!text) return '';
  if (!query || !query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const map: { [key: string]: string } = {
    'a': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'à': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'á': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ả': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ã': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ạ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ă': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ằ': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ắ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ẳ': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ẵ': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ặ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'â': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ầ': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ấ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ẩ': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ẫ': '[aàáảãạăằắẳẵặâầấẩẫậ]', 'ậ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'd': '[dđ]', 'đ': '[dđ]',
    'e': '[eèéẻẽẹêềếểễệ]', 'è': '[eèéẻẽẹêềếểễệ]', 'é': '[eèéẻẽẹêềếểễệ]',
    'ẻ': '[eèéẻẽẹêềếểễệ]', 'ẽ': '[eèéẻẽẹêềếểễệ]', 'ẹ': '[eèéẻẽẹêềếểễệ]',
    'ê': '[eèéẻẽẹêềếểễệ]', 'ề': '[eèéẻẽẹêềếểễệ]', 'ế': '[eèéẻẽẹêềếểễệ]',
    'ể': '[eèéẻẽẹêềếểễệ]', 'ễ': '[eèéẻẽẹêềếểễệ]', 'ệ': '[eèéẻẽẹêềếểễệ]',
    'i': '[iìíỉĩị]', 'ì': '[iìíỉĩị]', 'í': '[iìíỉĩị]', 'ỉ': '[iìíỉĩị]', 'ĩ': '[iìíỉĩị]', 'ị': '[iìíỉĩị]',
    'o': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ò': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ó': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ỏ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'õ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ọ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ô': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ồ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ố': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ổ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ỗ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ộ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ơ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ờ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ớ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ở': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ỡ': '[oòóỏõọôồốổỗộơờớởỡợ]', 'ợ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'u': '[uùúủũụưừứửữự]', 'ù': '[uùúủũụưừứửữự]', 'ú': '[uùúủũụưừứửữự]',
    'ủ': '[uùúủũụưừứửữự]', 'ũ': '[uùúủũụưừứửữự]', 'ụ': '[uùúủũụưừứửữự]',
    'ư': '[uùúủũụưừứửữự]', 'ừ': '[uùúủũụưừứửữự]', 'ứ': '[uùúủũụưừứửữự]',
    'ử': '[uùúủũụưừứửữự]', 'ữ': '[uùúủũụưừứửữự]', 'ự': '[uùúủũụưừứửữự]',
    'y': '[yỳýỷỹỵ]', 'ỳ': '[yỳýỷỹỵ]', 'ý': '[yỳýỷỹỵ]', 'ỷ': '[yỳýỷỹỵ]', 'ỹ': '[yỳýỷỹỵ]', 'ỵ': '[yỳýỷỹỵ]'
  };

  let regexStr = '';
  for (const char of escaped.toLowerCase()) {
    regexStr += map[char] || char;
  }

  try {
    const regex = new RegExp(`(${regexStr})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part)
            ? <mark key={i} className="bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100 px-0.5 rounded font-bold">{part}</mark>
            : part
        )}
      </>
    );
  } catch (e) {
    return text;
  }
}

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1');

  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [searchInput, setSearchInput] = useState(queryParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({
    products: 0,
    projects: 0,
    solutions: 0,
    resources: 0,
    news: 0,
    orders: 0
  });
  const [totalPages, setTotalPages] = useState(1);

  const fetchResults = async () => {
    if (!queryParam.trim()) {
      setResults([]);
      setCounts({ products: 0, projects: 0, solutions: 0, resources: 0, news: 0, orders: 0 });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.search.query(queryParam, typeParam, pageParam, 12);
      if (res.success) {
        setResults(res.data.results);
        setCounts(res.data.counts);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || 'Có lỗi xảy ra khi tải dữ liệu tìm kiếm.');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [queryParam, typeParam, pageParam, isLoggedIn]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), type: 'all', page: '1' });
    }
  };

  const handleFilterChange = (type: string) => {
    setSearchParams({ q: queryParam, type, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: queryParam, type: typeParam, page: newPage.toString() });
  };

  // Grouped render for 'all' preview mode
  const renderAllGroupsPreview = () => {
    const products = results.filter(r => r.searchType === 'products');
    const solutions = results.filter(r => r.searchType === 'solutions');
    const projects = results.filter(r => r.searchType === 'projects');
    const resources = results.filter(r => r.searchType === 'resources');
    const news = results.filter(r => r.searchType === 'news');
    const orders = results.filter(r => r.searchType === 'orders');

    const sections = [
      { key: 'products', label: 'Sản phẩm', count: counts.products, data: products, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { key: 'solutions', label: 'Giải pháp', count: counts.solutions, data: solutions, icon: FolderOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { key: 'projects', label: 'Dự án', count: counts.projects, data: projects, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      { key: 'resources', label: 'Tài liệu', count: counts.resources, data: resources, icon: Tag, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { key: 'news', label: 'Tin tức', count: counts.news, data: news, icon: Newspaper, color: 'text-rose-500', bg: 'bg-rose-500/10' },
      ...(isLoggedIn ? [{ key: 'orders', label: 'Đơn hàng', count: counts.orders, data: orders, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-500/10' }] : [])
    ];

    if (results.length === 0) {
      return (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
          <XCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={50} />
          <h2 className="text-lg font-bold text-gray-850 dark:text-white">Không tìm thấy kết quả nào</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            Hãy thử tìm kiếm với các từ khóa khác hoặc kiểm tra lại chính tả của bạn.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {sections.map(sec => {
          if (sec.count === 0) return null;
          const Icon = sec.icon;
          return (
            <div key={sec.key} className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${sec.bg} ${sec.color}`}>
                    <Icon size={20} />
                  </div>
                  <h2 className="text-base font-bold text-corporate dark:text-white uppercase tracking-wider">
                    {sec.label} ({sec.count})
                  </h2>
                </div>
                {sec.count > 4 && (
                  <button
                    onClick={() => handleFilterChange(sec.key)}
                    className="text-xs font-bold text-primary hover:text-primary/95 flex items-center gap-1 hover:underline transition-all"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {sec.data.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="group relative flex flex-col justify-between bg-slate-50 dark:bg-gray-750/30 rounded-xl overflow-hidden border border-gray-100/70 dark:border-gray-700 p-4 transition-all hover:shadow-md">
                    {/* Render content specific to types */}
                    {sec.key === 'products' && (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <Link to={`/products/${item._id}`}>
                          <img src={item.image} className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-100 dark:border-gray-700" />
                          <h3 className="text-xs font-bold text-gray-850 dark:text-slate-200 group-hover:text-primary truncate">{highlightKeyword(item.name, queryParam)}</h3>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">{item.code || item.category}</p>
                        </Link>
                        <p className="text-xs font-black text-primary mt-2">
                          {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                        </p>
                      </div>
                    )}

                    {sec.key === 'solutions' && (
                      <div className="flex flex-col justify-between flex-1">
                        <Link to={item.path}>
                          <h3 className="text-xs font-bold text-gray-850 dark:text-slate-200 group-hover:text-primary leading-snug">{highlightKeyword(item.title, queryParam)}</h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">{highlightKeyword(item.description, queryParam)}</p>
                        </Link>
                        <Link to={item.path} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-3 hover:underline">
                          Chi tiết <ChevronRight size={10} />
                        </Link>
                      </div>
                    )}

                    {sec.key === 'projects' && (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <Link to={`/projects/${item._id}`}>
                          <img src={item.image} className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-100 dark:border-gray-700" />
                          <h3 className="text-xs font-bold text-gray-850 dark:text-slate-200 group-hover:text-primary truncate">{highlightKeyword(item.title, queryParam)}</h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                          <MapPin size={11} />
                          <span className="truncate">{highlightKeyword(item.location || item.category, queryParam)}</span>
                        </div>
                      </div>
                    )}

                    {sec.key === 'resources' && (
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <FileText className="text-primary/70 mb-2" size={24} />
                          <h3 className="text-xs font-bold text-gray-850 dark:text-slate-200 group-hover:text-primary line-clamp-2 leading-snug">{highlightKeyword(item.title, queryParam)}</h3>
                          {item.description && (
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{highlightKeyword(item.description, queryParam)}</p>
                          )}
                        </div>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-655 text-slate-700 dark:text-slate-200 font-bold text-[10px] py-1.5 px-3 rounded-lg mt-3.5 transition-colors"
                        >
                          <Download size={11} /> Tải tài liệu ({item.size || 'PDF'})
                        </a>
                      </div>
                    )}

                    {sec.key === 'news' && (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <Link to={`/news/${item._id}`}>
                          <img src={item.image} className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-100 dark:border-gray-700" />
                          <h3 className="text-xs font-bold text-gray-850 dark:text-slate-200 group-hover:text-primary line-clamp-2 leading-snug">{highlightKeyword(item.title, queryParam)}</h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-2 font-medium">
                          <Calendar size={11} />
                          <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    )}

                    {sec.key === 'orders' && (
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono font-bold text-[11px] text-primary">{highlightKeyword(item.orderCode, queryParam)}</span>
                            <span className="text-[9px] bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full uppercase">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-800 dark:text-gray-300 font-semibold mt-1">KH: {highlightKeyword(item.customerName, queryParam)}</p>
                          <p className="text-[10px] text-gray-450 mt-0.5">SĐT: {highlightKeyword(item.phone, queryParam)}</p>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5 mt-3 flex justify-between items-baseline">
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Tổng tiền</span>
                          <span className="text-xs font-extrabold text-primary">
                            {item.totalAmount > 0 ? `${item.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // List view for specific filter mode
  const renderFilteredResultsList = () => {
    if (results.length === 0) {
      return (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
          <XCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={50} />
          <h2 className="text-lg font-bold text-gray-850 dark:text-white">Không tìm thấy kết quả nào</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hãy thử đổi bộ lọc hoặc điều chỉnh từ khóa tìm kiếm của bạn.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {results.map((item, idx) => (
          <div key={idx} className="group bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {/* Thumbnail Image if available */}
            {item.image && (
              <img src={item.image} className="w-full sm:w-28 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-700 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {typeParam}
                </span>
                {item.category && (
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{item.category}</span>
                )}
                {item.orderCode && (
                  <span className="font-mono font-bold text-xs text-primary">{highlightKeyword(item.orderCode, queryParam)}</span>
                )}
              </div>

              <h3 className="text-sm font-bold text-gray-850 dark:text-white group-hover:text-primary transition-colors">
                {item.name && highlightKeyword(item.name, queryParam)}
                {item.title && highlightKeyword(item.title, queryParam)}
                {item.orderCode && <span className="ml-2 font-normal text-xs text-gray-500">Đơn hàng của: {highlightKeyword(item.customerName, queryParam)}</span>}
              </h3>

              {/* Short Descriptions */}
              <p className="text-xs text-gray-450 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {item.shortDescription && highlightKeyword(item.shortDescription, queryParam)}
                {item.description && highlightKeyword(item.description, queryParam)}
                {item.excerpt && highlightKeyword(item.excerpt, queryParam)}
                {item.phone && `Số điện thoại liên hệ: ${item.phone} — Địa chỉ: ${item.address}`}
              </p>

              {/* Pricing, date or document size metadata */}
              <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-2 font-medium">
                {item.price !== undefined && (
                  <span className="text-xs font-extrabold text-primary">
                    {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                  </span>
                )}
                {item.totalAmount !== undefined && (
                  <span className="text-xs font-extrabold text-primary">
                    Tổng tiền: {item.totalAmount > 0 ? `${item.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                  </span>
                )}
                {item.size && <span>Dung lượng: {item.size}</span>}
                {item.date && <span>Ngày đăng: {new Date(item.date).toLocaleDateString('vi-VN')}</span>}
                {item.createdAt && <span>Ngày đặt: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>}
                {item.location && <span className="flex items-center gap-1"><MapPin size={11} /> {highlightKeyword(item.location, queryParam)}</span>}
              </div>
            </div>

            {/* Action buttons */}
            <div className="self-end sm:self-auto flex-shrink-0">
              {typeParam === 'resources' ? (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-655 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition-colors"
                >
                  <Download size={14} /> Tải về
                </a>
              ) : (
                <Link
                  to={item.path || (typeParam === 'products' ? `/products/${item._id}` : typeParam === 'projects' ? `/projects/${item._id}` : typeParam === 'news' ? `/news/${item._id}` : `/track-order?query=${item.orderCode}`)}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight size={13} />
                </Link>
              )}
            </div>
          </div>
        ))}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 text-gray-500 hover:text-primary transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs text-gray-500 font-semibold px-3">
              Trang {pageParam} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 text-gray-500 hover:text-primary transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pt-28 pb-16 px-4 transition-colors duration-300">
      <SEO
        title={`Kết quả tìm kiếm cho "${queryParam}" - CTC`}
        description={`Kết quả tìm kiếm cho từ khóa "${queryParam}" trên toàn hệ thống CTC Solar.`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Main Search Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 sm:p-8 shadow-sm mb-8">
          <h1 className="text-2xl font-extrabold text-corporate dark:text-white mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            {queryParam.trim() ? `Tìm thấy tổng số ${Object.values(counts).reduce((a: any, b: any) => a + b, 0)} kết quả phù hợp với từ khóa "${queryParam}"` : 'Nhập từ khóa bên dưới để bắt đầu tìm kiếm'}
          </p>

          <form onSubmit={handleSearchSubmit} className="relative flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Nhập sản phẩm, giải pháp, dự án..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-xl text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filter Column */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                Bộ lọc kết quả
              </h3>
              <div className="space-y-1.5">
                {FILTER_TYPES.map(filter => {
                  if (filter.authRequired && !isLoggedIn) return null;

                  const count =
                    filter.key === 'all'
                      ? Object.values(counts).reduce((a: any, b: any) => a + b, 0)
                      : counts[filter.key] || 0;

                  const isActive = typeParam === filter.key;

                  return (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                      className={`w-full flex items-center justify-between text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/10 scale-[1.02]'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750/30'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors pl-2"
            >
              <ArrowLeft size={13} /> Quay lại trang chủ
            </Link>
          </div>

          {/* Right Main Content Results Column */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                <RefreshCw className="animate-spin text-primary" size={30} />
                <span className="text-sm font-semibold">Đang tìm kiếm dữ liệu...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center">
                <XCircle className="mx-auto text-red-500 dark:text-red-400 mb-3" size={36} />
                <p className="text-red-700 dark:text-red-300 font-bold text-sm">{error}</p>
                <button
                  onClick={fetchResults}
                  className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 font-bold text-xs py-2 px-4 rounded-xl mt-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : typeParam === 'all' ? (
              renderAllGroupsPreview()
            ) : (
              renderFilteredResultsList()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
