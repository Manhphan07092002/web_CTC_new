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

export const getItemSeoUrl = (
  item: { id?: string; _id?: string; slug?: string; title?: string; name?: string } | null | undefined,
  type: 'news' | 'product' | 'project' | 'solution' | 'resource' = 'news'
): string => {
  if (!item) return `/${type}s`;
  const idStr = String(item._id || item.id || '');
  const titleText = item.name || item.title || type;
  const titleSlug = item.slug || createSlug(titleText);
  
  // Chuỗi mã hóa / hash ngắn (8 ký tự cuối ObjectId) để bảo mật chống tấn công quét dữ liệu
  const shortId = idStr.length >= 8 ? idStr.slice(-8) : (idStr || '1');
  
  const basePath = type === 'news' ? 'news' : `${type}s`;
  return `/${basePath}/${titleSlug}-${shortId}`;
};

// Aliases for convenient backward compatibility
export const getNewsUrl = (item: any) => getItemSeoUrl(item, 'news');
export const getProductUrl = (item: any) => getItemSeoUrl(item, 'product');
export const getProjectUrl = (item: any) => getItemSeoUrl(item, 'project');
export const getSolutionUrl = (item: any) => getItemSeoUrl(item, 'solution');
export const getResourceUrl = (item: any) => getItemSeoUrl(item, 'resource');
