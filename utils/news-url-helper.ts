export const createSlug = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const getNewsUrl = (item: { id?: string; _id?: string; slug?: string; title?: string } | null | undefined): string => {
  if (!item) return '/news';
  const idStr = String(item._id || item.id || '');
  const titleSlug = item.slug || createSlug(item.title || 'tin-tuc');
  
  // Chuỗi mã hóa / hash ngắn (8 ký tự cuối ObjectId) để bảo mật chống tấn công quét bài viết
  const shortId = idStr.length >= 8 ? idStr.slice(-8) : (idStr || '1');
  
  return `/news/${titleSlug}-${shortId}.html`;
};
