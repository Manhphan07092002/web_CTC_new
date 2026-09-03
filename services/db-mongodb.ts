/**
 * Server-side MongoDB Database Service
 * Provides a unified interface for database operations using Mongoose models
 */

import mongoose from 'mongoose';
import { 
  Product,
  Project,
  News,
  NewsComment,
  CommentLike,
  Testimonial,
  Partner,
  User,
  Category,
  ProductCategory,
  NewsCategory,
  ProjectCategory,
  Contact,
  Notification,
  Settings,
  TeamMember,
  AnalyticsEvent,
  AnalyticsGoal,
  FunnelMetrics,
  type IProduct,
  type IProject,
  type INewsItem,
  type INewsComment,
  type ITestimonial,
  type IPartner,
  type IUser,
  type ICategory,
  type IProductCategory,
  type INewsCategory,
  type IProjectCategory,
  type IContact,
  type INotification,
  type ISettings,
  type ITeamMember,
  Order,
  OrderItem,
  type IOrder,
  type IOrderItem
} from '../models';

// Helper to convert MongoDB document to plain object with id
const toPlainObject = <T>(doc: any): T => {
  if (!doc) return null as any;
  const obj = doc.toObject ? doc.toObject({ flattenMaps: true, versionKey: false }) : { ...doc };
  
  // Extract real _id regardless of type (ObjectId, string, etc.)
  let realId = '';
  if (obj._id) {
    realId = typeof obj._id === 'object' ? obj._id.toString() : String(obj._id);
  } else if (obj.id) {
    realId = String(obj.id);
  }
  
  return {
    ...obj,
    _id: realId,
    id: realId
  };
};

// Helper to find Product document by ObjectId, id, slug, or hash
const findProductDoc = async (idParam: string) => {
  if (!idParam) return null;
  const cleanParam = idParam.replace(/\.html$/i, '').trim();

  // 1. Direct ObjectId match
  if (mongoose.Types.ObjectId.isValid(cleanParam)) {
    try {
      const itemById = await Product.findOne({ _id: cleanParam, isDeleted: { $ne: true } });
      if (itemById) return itemById;
    } catch (_) {}
  }

  // 2. Direct Slug / Code / SKU / MPN / ID match
  let item = await Product.findOne({
    isDeleted: { $ne: true },
    $or: [
      { id: cleanParam },
      { slug: cleanParam },
      { code: cleanParam },
      { sku: cleanParam },
      { mpn: cleanParam },
      { model: cleanParam }
    ]
  });
  if (item) return item;

  // 3. Strip legacy hex hash suffix (e.g. -94451c64, -cf813af8, -00003025)
  const strippedSlug = cleanParam.replace(/-[a-f0-9]{4,12}$/i, '');
  if (strippedSlug && strippedSlug !== cleanParam) {
    item = await Product.findOne({
      $or: [
        { id: strippedSlug },
        { slug: strippedSlug },
        { code: strippedSlug },
        { sku: strippedSlug },
        { model: strippedSlug }
      ]
    });
    if (item) return item;
  }

  // 4. Regex prefix matching on slug
  const parts = (strippedSlug || cleanParam).split('-');
  const prefixSlug = parts.slice(0, Math.min(parts.length, 4)).join('-');
  if (prefixSlug && prefixSlug.length >= 4) {
    item = await Product.findOne({
      slug: new RegExp('^' + prefixSlug.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
    });
    if (item) return item;
  }

  // 5. Keyword fallback search
  const keywords = (strippedSlug || cleanParam).split('-').filter(k => k.length >= 3);
  if (keywords.length > 0) {
    const allProducts = await Product.find({ isDeleted: { $ne: true } }).select('_id id slug name').lean();
    const matched = allProducts.find(p => {
      const pSlug = (String((p as any).slug || '')).toLowerCase();
      return keywords.filter(k => pSlug.includes(k)).length >= Math.min(2, keywords.length);
    });
    if (matched) return await Product.findById(matched._id);
  }

  return null;
};


export const db = {
  products: {
    getAll: async () => {
      const products = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
      return products.map(toPlainObject<IProduct>);
    },

    getAllIncludingDeleted: async () => {
      const products = await Product.find({}).sort({ createdAt: -1 }).lean();
      return products.map(toPlainObject<IProduct>);
    },

    getDeleted: async () => {
      console.log('DB: Fetching deleted products...');
      const products = await Product.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean();
      console.log('DB: Found', products.length, 'deleted products');
      return products.map(toPlainObject<IProduct>);
    },
    
    getById: async (idParam: string) => {
      const doc = await findProductDoc(idParam);
      return doc ? toPlainObject<IProduct>(doc) : null;
    },
    
    getFeatured: async (limit: number = 4) => {
      let products = await Product.find({ 
        isFeatured: true, 
        isDeleted: { $ne: true } 
      })
        .sort({ featuredOrder: 1, createdAt: -1 })
        .limit(limit)
        .lean();

      // Fallback: Nếu chưa có đủ sản phẩm gắn cờ isFeatured, tự động lấy thêm sản phẩm mới nhất đang hoạt động
      if (products.length < limit) {
        const existingIds = products.map(p => p._id);
        const fallbackProducts = await Product.find({
          _id: { $nin: existingIds },
          isDeleted: { $ne: true }
        })
          .sort({ createdAt: -1 })
          .limit(limit - products.length)
          .lean();
        products = [...products, ...fallbackProducts];
      }

      return products.map(toPlainObject<IProduct>);
    },
    
    add: async (data: Partial<IProduct>) => {
      const product = new Product(data);
      await product.save();
      return toPlainObject<IProduct>(product);
    },
    
    update: async (id: string, data: Partial<IProduct>) => {
      const product = await Product.findByIdAndUpdate(id, data, { new: true });
      return product ? toPlainObject<IProduct>(product) : null;
    },
    
    delete: async (id: string) => {
      const product = await Product.findByIdAndUpdate(
        id, 
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
      return !!product;
    },
    
    restore: async (id: string) => {
      const product = await Product.findByIdAndUpdate(
        id,
        { isDeleted: false, $unset: { deletedAt: 1 } },
        { new: true }
      );
      return !!product;
    },
    
    permanentDelete: async (id: string) => {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    },
    
    incrementView: async (id: string) => {
      const product = await findProductDoc(id);
      if (!product) return null;
      product.views = (product.views || 0) + 1;
      await product.save();
      return toPlainObject<IProduct>(product);
    },
    
    incrementLike: async (id: string) => {
      const product = await findProductDoc(id);
      if (!product) return null;
      product.likes = (product.likes || 0) + 1;
      await product.save();
      return toPlainObject<IProduct>(product);
    },
    
    incrementShare: async (id: string) => {
      const product = await findProductDoc(id);
      if (!product) return null;
      product.shares = (product.shares || 0) + 1;
      await product.save();
      return toPlainObject<IProduct>(product);
    }
  },

  projects: {
    getFeatured: async (limit: number = 4) => {
      let projects = await Project.find({ 
        $or: [{ isFeatured: true }, { featured: true }] 
      }).sort({ featuredOrder: 1, createdAt: -1 }).limit(limit).lean();
      // Fallback: Nếu không có hoặc chưa đủ dự án tiêu biểu, lấy thêm dự án mới nhất
      if (projects.length < limit) {
        const existingIds = projects.map(p => p._id);
        const fallback = await Project.find({ _id: { $nin: existingIds } }).sort({ createdAt: -1 }).limit(limit - projects.length).lean();
        projects = [...projects, ...fallback];
      }
      return projects.map(toPlainObject<IProject>);
    },
    getAll: async () => {
      const projects = await Project.find().sort({ createdAt: -1 });
      return projects.map(toPlainObject<IProject>);
    },
    
    getById: async (idParam: string) => {
      if (!idParam) return null;
      const cleanParam = idParam.replace(/\.html$/i, '').trim();

      // 1. Direct ObjectId match
      if (mongoose.Types.ObjectId.isValid(cleanParam)) {
        try {
          const itemById = await Project.findById(cleanParam);
          if (itemById) return toPlainObject<IProject>(itemById);
        } catch (_) {}
      }

      // 2. Direct Slug / ID match
      let project = await Project.findOne({
        $or: [
          { id: cleanParam },
          { slug: cleanParam }
        ]
      });
      if (project) return toPlainObject<IProject>(project);

      // 3. Strip legacy hex hash suffix (e.g. -cf813af8, -00003025)
      const strippedSlug = cleanParam.replace(/-[a-f0-9]{4,12}$/i, '');
      if (strippedSlug && strippedSlug !== cleanParam) {
        project = await Project.findOne({
          $or: [
            { id: strippedSlug },
            { slug: strippedSlug }
          ]
        });
        if (project) return toPlainObject<IProject>(project);
      }

      // 4. Regex prefix matching on project slug
      const parts = (strippedSlug || cleanParam).split('-');
      const prefixSlug = parts.slice(0, Math.min(parts.length, 4)).join('-');
      if (prefixSlug && prefixSlug.length >= 4) {
        project = await Project.findOne({
          slug: new RegExp('^' + prefixSlug.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
        });
        if (project) return toPlainObject<IProject>(project);
      }

      // 5. Keyword fallback search
      const keywords = (strippedSlug || cleanParam).split('-').filter(k => k.length >= 3);
      if (keywords.length > 0) {
        const allProjects = await Project.find().select('_id id slug title name').lean();
        const matched = allProjects.find(p => {
          const pSlug = (String((p as any).slug || '')).toLowerCase();
          return keywords.filter(k => pSlug.includes(k)).length >= Math.min(2, keywords.length);
        });
        if (matched) {
          const doc = await Project.findById(matched._id);
          if (doc) return toPlainObject<IProject>(doc);
        }
      }

      return null;
    },
    
    add: async (data: Partial<IProject>) => {
      const project = new Project(data);
      await project.save();
      return toPlainObject<IProject>(project);
    },
    
    update: async (id: string, data: Partial<IProject>) => {
      const project = await Project.findByIdAndUpdate(id, data, { new: true });
      return project ? toPlainObject<IProject>(project) : null;
    },
    
    delete: async (id: string) => {
      const result = await Project.findByIdAndDelete(id);
      return !!result;
    }
  },

  news: {
    getLatest: async (limit: number = 5) => { const news = await News.find().sort({ createdAt: -1 }).limit(limit); return news.map(toPlainObject<INewsItem>); },
    getAll: async () => {
      const news = await News.find().sort({ createdAt: -1 });
      return news.map(toPlainObject<INewsItem>);
    },
    
    getById: async (idParam: string) => {
      if (!idParam) return null;
      // Loai bo duoi .html neu co
      const cleanParam = idParam.replace(/\.html$/i, '');

      // 1. Thu tim theo ObjectId nguyen ban
      try {
        const itemById = await News.findById(cleanParam);
        if (itemById) return toPlainObject<INewsItem>(itemById);
      } catch (_) {}

      // 2. Tách slug va hash ID ngan o cuoi
      const parts = cleanParam.split('-');
      const possibleHash = parts[parts.length - 1];
      const baseSlug = parts.slice(0, -1).join('-');

      // Neu possibleHash la 24 ky tu ObjectId
      if (possibleHash && possibleHash.length === 24) {
        try {
          const itemByHash = await News.findById(possibleHash);
          if (itemByHash) return toPlainObject<INewsItem>(itemByHash);
        } catch (_) {}
      }

      // 3. Tim theo Slug / ID hoac khop voi 8 ky tu cuoi ObjectId
      let newsItem = await News.findOne({
        $or: [
          { id: cleanParam },
          { slug: cleanParam },
          { slug: baseSlug },
          { id: possibleHash }
        ]
      });

      if (!newsItem && possibleHash && possibleHash.length >= 4) {
        // Tim bai viet co _id hoặc id ket thuc bang shortHash
        const allItems = await News.find();
        newsItem = allItems.find(item => {
          const fullId = String(item._id || item.id);
          return fullId.endsWith(possibleHash) || fullId.includes(possibleHash);
        }) || null;
      }

      return newsItem ? toPlainObject<INewsItem>(newsItem) : null;
    },
    
    add: async (data: Partial<INewsItem>) => {
      const cleanData: any = { ...data };
      if (!cleanData.categoryId || cleanData.categoryId === '' || !mongoose.Types.ObjectId.isValid(String(cleanData.categoryId))) {
        delete cleanData.categoryId;
      }
      delete cleanData._id;
      delete cleanData.id;
      
      cleanData.title = typeof cleanData.title === 'string' && cleanData.title.trim() ? cleanData.title.trim() : 'Tin tức chưa có tiêu đề';
      cleanData.excerpt = typeof cleanData.excerpt === 'string' && cleanData.excerpt.trim() ? cleanData.excerpt.trim() : cleanData.title;
      cleanData.image = typeof cleanData.image === 'string' && cleanData.image.trim() ? cleanData.image.trim() : '/uploads/images/default-news.webp';
      cleanData.date = typeof cleanData.date === 'string' && cleanData.date.trim() ? cleanData.date.trim() : new Date().toISOString().split('T')[0];
      cleanData.content = typeof cleanData.content === 'string' ? cleanData.content : '';
      cleanData.author = typeof cleanData.author === 'string' && cleanData.author.trim() ? cleanData.author : 'Phan Xuân Mạnh';
      cleanData.viewCount = typeof cleanData.viewCount === 'number' && !isNaN(cleanData.viewCount) ? cleanData.viewCount : 0;
      cleanData.likes = typeof cleanData.likes === 'number' && !isNaN(cleanData.likes) ? cleanData.likes : 0;
      cleanData.isFeatured = Boolean(cleanData.isFeatured);
      cleanData.featuredOrder = typeof cleanData.featuredOrder === 'number' && !isNaN(cleanData.featuredOrder) ? cleanData.featuredOrder : 0;
      cleanData.tags = Array.isArray(cleanData.tags) ? cleanData.tags : (typeof cleanData.tags === 'string' ? (cleanData.tags as string).split(',').map(t => t.trim()).filter(Boolean) : []);
      cleanData.focusKeyword = typeof cleanData.focusKeyword === 'string' ? cleanData.focusKeyword : '';
      if (!['published', 'pending', 'draft'].includes(cleanData.status)) {
        cleanData.status = 'published';
      }
      if (!cleanData.slug && cleanData.title) {
        cleanData.slug = cleanData.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      }

      const newsItem = new News(cleanData);
      await newsItem.save();
      return toPlainObject<INewsItem>(newsItem);
    },
    
    update: async (id: string, data: Partial<INewsItem>) => {
      if (!id) return null;
      const cleanData: any = { ...data };
      if (!cleanData.categoryId || cleanData.categoryId === '' || !mongoose.Types.ObjectId.isValid(String(cleanData.categoryId))) {
        delete cleanData.categoryId;
      }
      delete cleanData._id;
      delete cleanData.id;
      
      if (cleanData.tags && !Array.isArray(cleanData.tags)) {
        cleanData.tags = typeof cleanData.tags === 'string' ? (cleanData.tags as string).split(',').map(t => t.trim()).filter(Boolean) : [];
      }
      if (cleanData.status && !['published', 'pending', 'draft'].includes(cleanData.status)) {
        cleanData.status = 'published';
      }

      let newsItem = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        newsItem = await News.findByIdAndUpdate(id, cleanData, { new: true });
      }
      if (!newsItem) {
        newsItem = await News.findOneAndUpdate({ slug: id }, cleanData, { new: true });
      }
      if (!newsItem) {
        newsItem = await News.findOneAndUpdate({ id }, cleanData, { new: true });
      }
      return newsItem ? toPlainObject<INewsItem>(newsItem) : null;
    },
    
    delete: async (id: string) => {
      if (!id) return false;
      let result = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        result = await News.findByIdAndDelete(id);
      }
      if (!result) {
        result = await News.findOneAndDelete({ slug: id });
      }
      return !!result;
    },

    incrementViewCount: async (idParam: string) => {
      if (!idParam) return;
      try {
        const newsItem = await db.news.getById(idParam);
        if (newsItem) {
          const targetId = newsItem._id || newsItem.id;
          await News.findByIdAndUpdate(targetId, { $inc: { viewCount: 1 } });
        }
      } catch (err) {
        console.error('Error incrementing view count:', err);
      }
    },

    incrementLikesCount: async (idParam: string) => {
      if (!idParam) return;
      try {
        const newsItem = await db.news.getById(idParam);
        if (newsItem) {
          const targetId = newsItem._id || newsItem.id;
          await News.findByIdAndUpdate(targetId, { $inc: { likes: 1 } });
        }
      } catch (err) {
        console.error('Error incrementing likes count:', err);
      }
    },

    getFeatured: async (limit = 5) => {
      const items = await News.find({ isFeatured: true }).sort({ featuredOrder: 1, createdAt: -1 }).limit(limit);
      return items.map(toPlainObject<INewsItem>);
    },
  },

  // ==================== COMMENTS ====================
  comments: {
    getByNewsId: async (idParam: string, options?: { email?: string; userId?: string }) => {
      if (!idParam) return [];
      try {
        const newsItem = await db.news.getById(idParam);
        const mainNewsId = newsItem ? (newsItem._id || newsItem.id) : null;
        if (!mainNewsId) return [];

        const items = await NewsComment.find({
          $or: [
            { newsId: String(mainNewsId) },
            { newsId: idParam }
          ],
          isApproved: { $ne: false }
        })
          .sort({ createdAt: 1 })
          .lean();

        // Get list of liked comment IDs for the current user/guest if provided
        const likedCommentIds = new Set<string>();
        if (options?.email || options?.userId) {
          const userEmail = options.email?.trim().toLowerCase();
          const userId = options.userId;
          const identifiers: string[] = [];
          if (userId) identifiers.push(`user:${userId}`);
          if (userEmail) identifiers.push(`email:${userEmail}`);

          if (identifiers.length > 0) {
            const userLikes = await CommentLike.find({ identifier: { $in: identifiers } }).lean();
            for (const ul of userLikes) {
              likedCommentIds.add(String(ul.commentId));
            }
          }
        }

        // Map and format all documents
        const allComments = items.map(doc => {
          const realId = doc._id ? doc._id.toString() : '';
          return {
            ...doc,
            _id: realId,
            id: realId,
            likes: doc.likes || 0,
            isLiked: likedCommentIds.has(realId),
            replies: [] as any[]
          };
        });

        // Separate root comments and child comments
        const rootComments: any[] = [];
        const childComments: any[] = [];
        const commentMap = new Map<string, any>();

        for (const c of allComments) {
          commentMap.set(c.id, c);
          if (!c.parentId) {
            rootComments.push(c);
          } else {
            childComments.push(c);
          }
        }

        // Attach child comments to their root comment (Level 2)
        for (const child of childComments) {
          const rootTarget = child.rootId 
            ? commentMap.get(String(child.rootId)) 
            : commentMap.get(String(child.parentId));

          if (rootTarget) {
            rootTarget.replies.push(child);
          } else {
            rootComments.push(child);
          }
        }

        // Backward compatibility for legacy reply field on root comment
        for (const root of rootComments) {
          if (root.reply && !root.replies.some((r: any) => r.isAdminReply)) {
            const adminReplyId = `${root.id}_admin_reply`;
            root.replies.unshift({
              _id: adminReplyId,
              id: adminReplyId,
              newsId: root.newsId,
              parentId: root.id,
              rootId: root.id,
              name: root.repliedBy?.name || root.replyAuthor || 'Administrator',
              email: root.repliedBy?.email || 'admin@ctcdn.vn',
              content: typeof root.reply === 'object' && root.reply ? (root.reply as any).content : root.reply,
              isAdminReply: true,
              repliedBy: root.repliedBy || { name: root.replyAuthor || 'Administrator', role: 'admin' },
              repliedAt: root.repliedAt || root.updatedAt,
              createdAt: root.repliedAt || root.updatedAt,
              likes: 0,
              isLiked: likedCommentIds.has(adminReplyId)
            });
          }
        }

        return rootComments;
      } catch (err) {
        console.error('Error getting comments:', err);
        return [];
      }
    },

    countByNewsId: async (idParam: string) => {
      if (!idParam) return 0;
      try {
        const newsItem = await db.news.getById(idParam);
        const mainNewsId = newsItem ? (newsItem._id || newsItem.id) : null;
        if (!mainNewsId) return 0;

        return await NewsComment.countDocuments({
          $or: [
            { newsId: String(mainNewsId) },
            { newsId: idParam }
          ],
          isApproved: { $ne: false }
        });
      } catch (err) {
        return 0;
      }
    },

    add: async (data: { 
      newsId: string; 
      name: string; 
      email: string; 
      content: string; 
      parentId?: string | null; 
      replyToName?: string;
      isAdminReply?: boolean;
      repliedBy?: any;
    }) => {
      let rootId = null;
      let finalParentId = null;
      let finalReplyToName = data.replyToName;

      if (data.parentId) {
        finalParentId = data.parentId;
        // Check if parent comment is a synthetic admin reply (e.g. "..._admin_reply")
        if (typeof data.parentId === 'string' && data.parentId.endsWith('_admin_reply')) {
          const actualRootId = data.parentId.replace('_admin_reply', '');
          rootId = actualRootId;
          finalParentId = actualRootId;
        } else {
          try {
            const parentDoc = await NewsComment.findById(data.parentId).lean();
            if (parentDoc) {
              rootId = parentDoc.rootId || parentDoc._id;
              if (!finalReplyToName) {
                finalReplyToName = parentDoc.name;
              }
            }
          } catch (e) {
            console.error('Error resolving parent comment:', e);
          }
        }
      }

      const comment = new NewsComment({
        newsId: data.newsId,
        parentId: finalParentId,
        rootId: rootId,
        replyToName: finalReplyToName,
        isAdminReply: !!data.isAdminReply,
        repliedBy: data.repliedBy,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        content: data.content.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=64`,
        isApproved: true,
        likes: 0,
      });
      await comment.save();
      const obj = comment.toObject({ flattenMaps: true });
      const realId = obj._id ? obj._id.toString() : '';
      return { ...obj, _id: realId, id: realId, likes: 0, replies: [] };
    },

    toggleLike: async (commentId: string, identifier: { email?: string; userId?: any }) => {
      const userEmail = identifier.email?.trim().toLowerCase();
      const userId = identifier.userId;

      if (!userEmail && !userId) {
        throw new Error('Vui lòng cung cấp email hoặc userId để thực hiện thích');
      }

      const isSynthetic = typeof commentId === 'string' && commentId.endsWith('_admin_reply');
      const actualCommentId = isSynthetic ? commentId.replace('_admin_reply', '') : commentId;

      const userKey = userId ? `user:${userId}` : `email:${userEmail}`;

      const existingLike = await CommentLike.findOne({ commentId, identifier: userKey });

      let isLiked = false;
      let newLikes = 0;

      if (existingLike) {
        // Unlike
        await CommentLike.findByIdAndDelete(existingLike._id);
        if (!isSynthetic) {
          const updated = await NewsComment.findByIdAndUpdate(
            actualCommentId,
            { $inc: { likes: -1 } },
            { new: true }
          );
          newLikes = Math.max(0, updated?.likes || 0);
          if (updated && updated.likes < 0) {
            await NewsComment.findByIdAndUpdate(actualCommentId, { likes: 0 });
          }
        }
        isLiked = false;
      } else {
        // Like
        await CommentLike.create({
          commentId,
          identifier: userKey,
          userId: userId || undefined,
          email: userEmail || undefined
        });
        if (!isSynthetic) {
          const updated = await NewsComment.findByIdAndUpdate(
            actualCommentId,
            { $inc: { likes: 1 } },
            { new: true }
          );
          newLikes = updated?.likes || 1;
        } else {
          newLikes = 1;
        }
        isLiked = true;
      }

      if (isSynthetic) {
        newLikes = await CommentLike.countDocuments({ commentId });
      }

      return { isLiked, likes: newLikes };
    },

    delete: async (commentId: string) => {
      const result = await NewsComment.findByIdAndDelete(commentId);
      // Delete child replies and likes
      await NewsComment.deleteMany({ $or: [{ parentId: commentId }, { rootId: commentId }] });
      await CommentLike.deleteMany({ commentId });
      return !!result;
    },

    getAllForAdmin: async () => {
      const items = await NewsComment.find().sort({ createdAt: -1 }).lean();
      return items.map(doc => {
        const realId = doc._id ? doc._id.toString() : '';
        return { ...doc, _id: realId, id: realId };
      });
    },

    replyComment: async (commentId: string, replyText: string, repliedBy?: { id?: any; name: string; email?: string; avatar?: string; role?: string }) => {
      const trimmed = (replyText || '').trim();
      let updated;
      if (!trimmed) {
        // If reply is empty, unset reply fields on root comment and delete child admin replies
        updated = await NewsComment.findByIdAndUpdate(
          commentId,
          { $unset: { reply: 1, replyAuthor: 1, repliedAt: 1, repliedBy: 1 } },
          { new: true }
        ).lean();
        await NewsComment.deleteMany({ parentId: commentId, isAdminReply: true });
      } else {
        const authorName = repliedBy?.name || 'Administrator';
        updated = await NewsComment.findByIdAndUpdate(
          commentId,
          {
            reply: trimmed,
            replyAuthor: authorName,
            repliedBy: repliedBy || { name: authorName },
            repliedAt: new Date()
          },
          { new: true }
        ).lean();

        // Also ensure child comment exists for this admin reply
        const existingChild = await NewsComment.findOne({ parentId: commentId, isAdminReply: true });
        if (existingChild) {
          await NewsComment.findByIdAndUpdate(existingChild._id, {
            content: trimmed,
            name: authorName,
            repliedBy: repliedBy || { name: authorName },
            repliedAt: new Date()
          });
        } else if (updated) {
          await NewsComment.create({
            newsId: updated.newsId,
            parentId: commentId,
            rootId: commentId,
            isAdminReply: true,
            name: authorName,
            email: repliedBy?.email || 'admin@ctcdn.vn',
            content: trimmed,
            repliedBy: repliedBy || { name: authorName },
            repliedAt: new Date(),
            likes: 0,
            isApproved: true
          });
        }
      }
      if (!updated) return null;
      const realId = updated._id ? updated._id.toString() : '';
      return { ...updated, _id: realId, id: realId };
    },

    deleteReply: async (commentId: string) => {
      const updated = await NewsComment.findByIdAndUpdate(
        commentId,
        { $unset: { reply: 1, replyAuthor: 1, repliedAt: 1, repliedBy: 1 } },
        { new: true }
      ).lean();
      await NewsComment.deleteMany({ parentId: commentId, isAdminReply: true });
      if (!updated) return null;
      const realId = updated._id ? updated._id.toString() : '';
      return { ...updated, _id: realId, id: realId };
    },

    toggleApproval: async (commentId: string, isApproved: boolean) => {
      const updated = await NewsComment.findByIdAndUpdate(
        commentId,
        { isApproved },
        { new: true }
      ).lean();
      return updated;
    },
  },

  testimonials: {
    getAll: async () => {
      const testimonials = await Testimonial.find().sort({ createdAt: -1 });
      return testimonials.map(toPlainObject<ITestimonial>);
    },
    
    getById: async (id: string) => {
      const testimonial = await Testimonial.findById(id);
      return testimonial ? toPlainObject<ITestimonial>(testimonial) : null;
    },
    
    add: async (data: Partial<ITestimonial>) => {
      const testimonial = new Testimonial(data);
      await testimonial.save();
      return toPlainObject<ITestimonial>(testimonial);
    },
    
    update: async (id: string, data: Partial<ITestimonial>) => {
      const testimonial = await Testimonial.findByIdAndUpdate(id, data, { new: true });
      return testimonial ? toPlainObject<ITestimonial>(testimonial) : null;
    },
    
    delete: async (id: string) => {
      const result = await Testimonial.findByIdAndDelete(id);
      return !!result;
    }
  },

  partners: {
    getAll: async () => {
      const partners = await Partner.find().sort({ createdAt: -1 });
      return partners.map(toPlainObject<IPartner>);
    },
    
    getById: async (id: string) => {
      const partner = await Partner.findById(id);
      return partner ? toPlainObject<IPartner>(partner) : null;
    },
    
    add: async (data: Partial<IPartner>) => {
      const partner = new Partner(data);
      await partner.save();
      return toPlainObject<IPartner>(partner);
    },
    
    update: async (id: string, data: Partial<IPartner>) => {
      const partner = await Partner.findByIdAndUpdate(id, data, { new: true });
      return partner ? toPlainObject<IPartner>(partner) : null;
    },
    
    delete: async (id: string) => {
      const result = await Partner.findByIdAndDelete(id);
      return !!result;
    }
  },

  users: {
    getAll: async () => {
      const users = await User.find().sort({ createdAt: -1 });
      return users.map(toPlainObject<IUser>);
    },
    
    getById: async (id: string) => {
      const user = await User.findById(id);
      return user ? toPlainObject<IUser>(user) : null;
    },
    
    getByEmail: async (email: string) => {
      if (!email) return null;
      const normalizedEmail = email.trim().toLowerCase();
      const user = await User.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
      });
      return user ? toPlainObject<IUser>(user) : null;
    },
    
    add: async (data: Partial<IUser>) => {
      const user = new User(data);
      await user.save();
      return toPlainObject<IUser>(user);
    },
    
    update: async (id: string, data: Partial<IUser>) => {
      const user = await User.findByIdAndUpdate(id, data, { new: true });
      return user ? toPlainObject<IUser>(user) : null;
    },
    
    delete: async (id: string) => {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    }
  },

  categories: {
    getAll: async () => {
      const categories = await Category.find().sort({ createdAt: -1 });
      return categories.map(toPlainObject<ICategory>);
    },
    
    getById: async (id: string) => {
      const category = await Category.findById(id);
      return category ? toPlainObject<ICategory>(category) : null;
    },
    
    add: async (data: Partial<ICategory>) => {
      const category = new Category(data);
      await category.save();
      return toPlainObject<ICategory>(category);
    },
    
    update: async (id: string, data: Partial<ICategory>) => {
      const category = await Category.findByIdAndUpdate(id, data, { new: true });
      return category ? toPlainObject<ICategory>(category) : null;
    },
    
    delete: async (id: string) => {
      const result = await Category.findByIdAndDelete(id);
      return !!result;
    }
  },

  productCategories: {
    getAll: async () => {
      const categories = await ProductCategory.find().sort({ order: 1, createdAt: -1 });
      return categories.map(toPlainObject<IProductCategory>);
    },
    
    getById: async (id: string) => {
      const category = await ProductCategory.findById(id);
      return category ? toPlainObject<IProductCategory>(category) : null;
    },
    
    add: async (data: Partial<IProductCategory>) => {
      const category = new ProductCategory(data);
      await category.save();
      return toPlainObject<IProductCategory>(category);
    },
    
    update: async (id: string, data: Partial<IProductCategory>) => {
      const category = await ProductCategory.findByIdAndUpdate(id, data, { new: true });
      return category ? toPlainObject<IProductCategory>(category) : null;
    },
    
    delete: async (id: string) => {
      const result = await ProductCategory.findByIdAndDelete(id);
      return !!result;
    }
  },

  newsCategories: {
    getAll: async () => {
      const categories = await NewsCategory.find().sort({ order: 1, createdAt: -1 });
      return categories.map(toPlainObject<INewsCategory>);
    },
    
    getById: async (id: string) => {
      const category = await NewsCategory.findById(id);
      return category ? toPlainObject<INewsCategory>(category) : null;
    },
    
    add: async (data: Partial<INewsCategory>) => {
      const category = new NewsCategory(data);
      await category.save();
      return toPlainObject<INewsCategory>(category);
    },
    
    update: async (id: string, data: Partial<INewsCategory>) => {
      const category = await NewsCategory.findByIdAndUpdate(id, data, { new: true });
      return category ? toPlainObject<INewsCategory>(category) : null;
    },
    
    delete: async (id: string) => {
      const result = await NewsCategory.findByIdAndDelete(id);
      return !!result;
    }
  },

  projectCategories: {
    getAll: async () => {
      const categories = await ProjectCategory.find().sort({ order: 1, createdAt: -1 });
      return categories.map(toPlainObject<IProjectCategory>);
    },
    
    getById: async (id: string) => {
      const category = await ProjectCategory.findById(id);
      return category ? toPlainObject<IProjectCategory>(category) : null;
    },
    
    add: async (data: Partial<IProjectCategory>) => {
      const category = new ProjectCategory(data);
      await category.save();
      return toPlainObject<IProjectCategory>(category);
    },
    
    update: async (id: string, data: Partial<IProjectCategory>) => {
      const category = await ProjectCategory.findByIdAndUpdate(id, data, { new: true });
      return category ? toPlainObject<IProjectCategory>(category) : null;
    },
    
    delete: async (id: string) => {
      const result = await ProjectCategory.findByIdAndDelete(id);
      return !!result;
    }
  },

  contacts: {
    getAll: async () => {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return contacts.map(toPlainObject<IContact>);
    },
    
    getById: async (id: string) => {
      const contact = await Contact.findById(id);
      return contact ? toPlainObject<IContact>(contact) : null;
    },
    
    add: async (data: Partial<IContact>) => {
      const contact = new Contact(data);
      await contact.save();
      return toPlainObject<IContact>(contact);
    },
    
    update: async (id: string, data: Partial<IContact>) => {
      const contact = await Contact.findByIdAndUpdate(id, data, { new: true });
      return contact ? toPlainObject<IContact>(contact) : null;
    },
    
    delete: async (id: string) => {
      const result = await Contact.findByIdAndDelete(id);
      return !!result;
    }
  },

  notifications: {
    getUnread: async () => { const notifs = await Notification.find({ read: false }).sort({ createdAt: -1 }); return notifs.map(toPlainObject<INotification>); },
    deleteAll: async () => { await Notification.deleteMany({}); return true; },
    getAll: async () => {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      return notifications.map(toPlainObject<INotification>);
    },
    
    getById: async (id: string) => {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
      const notification = await Notification.findById(id);
      return notification ? toPlainObject<INotification>(notification) : null;
    },
    
    add: async (data: Partial<INotification>) => {
      const notification = new Notification(data);
      await notification.save();
      return toPlainObject<INotification>(notification);
    },
    
    update: async (id: string, data: Partial<INotification>) => {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
      const notification = await Notification.findByIdAndUpdate(id, data, { new: true });
      return notification ? toPlainObject<INotification>(notification) : null;
    },
    
    delete: async (id: string) => {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) return false;
      const result = await Notification.findByIdAndDelete(id);
      return !!result;
    },
    
    markAsRead: async (id: string) => {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
      const notification = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      return notification ? toPlainObject<INotification>(notification) : null;
    },
    
    markAllAsRead: async () => {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return true;
    }
  },

  settings: {
    get: async () => {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({});
        await settings.save();
      }
      return toPlainObject<ISettings>(settings);
    },
    
    update: async (data: Partial<ISettings>) => {
      const updateData = { ...data };
      delete (updateData as any)._id;
      delete (updateData as any).id;
      delete (updateData as any).__v;
      delete (updateData as any).createdAt;
      delete (updateData as any).updatedAt;

      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(updateData);
        await settings.save();
      } else {
        settings = await Settings.findOneAndUpdate(
          { _id: settings._id },
          { $set: updateData },
          { new: true, runValidators: true }
        );
        if (!settings) {
          settings = new Settings(updateData);
          await settings.save();
        }
      }
      return toPlainObject<ISettings>(settings);
    }
  },

  teamMembers: {
    getAll: async () => {
      const members = await TeamMember.find().sort({ order: 1, createdAt: -1 });
      return members.map(toPlainObject<ITeamMember>);
    },
    
    getById: async (id: string) => {
      const member = await TeamMember.findById(id);
      return member ? toPlainObject<ITeamMember>(member) : null;
    },
    
    add: async (data: Partial<ITeamMember>) => {
      const member = new TeamMember(data);
      await member.save();
      return toPlainObject<ITeamMember>(member);
    },
    
    update: async (id: string, data: Partial<ITeamMember>) => {
      const member = await TeamMember.findByIdAndUpdate(id, data, { new: true });
      return member ? toPlainObject<ITeamMember>(member) : null;
    },
    
    delete: async (id: string) => {
      const result = await TeamMember.findByIdAndDelete(id);
      return !!result;
    }
  },

  analytics: {
    trackEvent: async (data: any) => {
      const event = new AnalyticsEvent(data);
      await event.save();
      return toPlainObject(event);
    },
    
    clearOldEvents: async (days: number) => { const date = new Date(); date.setDate(date.getDate() - days); const res = await AnalyticsEvent.deleteMany({ timestamp: { $lt: date } }); return res.deletedCount; },
    getEvents: async (filters: any = {}) => {
      const events = await AnalyticsEvent.find(filters).sort({ timestamp: -1 });
      return events.map(toPlainObject);
    },
    
    getFunnelData: async () => {
      // Get latest funnel metrics or calculate from events
      const latestMetrics = await FunnelMetrics.findOne().sort({ timestamp: -1 });
      if (latestMetrics) {
        return toPlainObject(latestMetrics);
      }
      
      // If no metrics exist, return default structure
      return {
        metrics: {
          pageViews: 0,
          productViews: 0,
          contactRequests: 0,
          quoteRequests: 0,
          purchases: 0
        },
        conversionRates: {
          visitorToLead: 0,
          leadToCustomer: 0,
          overallConversion: 0
        }
      };
    }
  },

  goals: {
    getAll: async () => {
      const goals = await AnalyticsGoal.find().sort({ createdAt: -1 });
      return goals.map(toPlainObject);
    },
    
    getById: async (id: string) => {
      const goal = await AnalyticsGoal.findById(id);
      return goal ? toPlainObject(goal) : null;
    },
    
    getActive: async () => {
      const goals = await AnalyticsGoal.find({ isActive: true }).sort({ createdAt: -1 });
      return goals.map(toPlainObject);
    },
    
    getCurrent: async () => {
      const now = new Date();
      const goal = await AnalyticsGoal.findOne({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).sort({ createdAt: -1 });
      return goal ? toPlainObject(goal) : null;
    },
    
    add: async (data: any) => {
      const goal = new AnalyticsGoal(data);
      await goal.save();
      return toPlainObject(goal);
    },
    
    create: async (data: any) => {
      const goal = new AnalyticsGoal(data);
      await goal.save();
      return toPlainObject(goal);
    },
    
    update: async (id: string, data: any) => {
      const goal = await AnalyticsGoal.findByIdAndUpdate(id, data, { new: true });
      return goal ? toPlainObject(goal) : null;
    },
    
    delete: async (id: string) => {
      const result = await AnalyticsGoal.findByIdAndDelete(id);
      return !!result;
    }
  },

  funnelMetrics: {
    getAll: async () => {
      const metrics = await FunnelMetrics.find().sort({ timestamp: -1 });
      return metrics.map(toPlainObject);
    },
    
    getById: async (id: string) => {
      const metric = await FunnelMetrics.findById(id);
      return metric ? toPlainObject(metric) : null;
    },
    
    add: async (data: any) => {
      const metric = new FunnelMetrics(data);
      await metric.save();
      return toPlainObject(metric);
    }
  },

  reviews: {
    getAll: async () => {
      // Get all products and extract their reviews
      const products = await Product.find();
      const allReviews: any[] = [];
      products.forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach((review: any) => {
            allReviews.push({
              ...toPlainObject(review),
              productId: product._id.toString(),
              productName: product.name
            });
          });
        }
      });
      return allReviews;
    },

    getByProductId: async (productId: string) => {
      const product = await findProductDoc(productId);
      if (!product || !product.reviews) return [];
      return product.reviews.map((review: any) => toPlainObject(review));
    },

    addToProduct: async (productId: string, reviewData: any) => {
      const product = await findProductDoc(productId);
      if (!product) return null;

      if (!product.reviews) {
        product.reviews = [];
      }

      product.reviews.push(reviewData);

      // Recalculate average rating
      const totalRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      product.rating = totalRating / product.reviews.length;

      await product.save();
      return toPlainObject(product);
    },

    deleteFromProduct: async (productId: string, reviewIndex: number) => {
      const product = await findProductDoc(productId);
      if (!product || !product.reviews || reviewIndex < 0 || reviewIndex >= product.reviews.length) {
        return false;
      }

      product.reviews.splice(reviewIndex, 1);

      // Recalculate average rating
      if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        product.rating = totalRating / product.reviews.length;
      } else {
        product.rating = 0;
      }

      await product.save();
      return true;
    }
  },

  orders: {
    getAll: async (filter: any = {}) => {
      const orders = await Order.find(filter).sort({ createdAt: -1 });
      return orders.map(toPlainObject<IOrder>);
    },
    getById: async (id: string) => {
      const order = await Order.findById(id);
      if (!order) return null;
      const items = await OrderItem.find({ orderId: order._id });
      return {
        ...toPlainObject<IOrder>(order),
        items: items.map(toPlainObject<IOrderItem>)
      };
    },
    create: async (orderData: Partial<IOrder>, itemsData: Array<Partial<IOrderItem>>) => {
      const order = new Order(orderData);
      await order.save();
      
      const createdItems = [];
      for (const item of itemsData) {
        const orderItem = new OrderItem({
          ...item,
          orderId: order._id
        });
        await orderItem.save();
        createdItems.push(toPlainObject<IOrderItem>(orderItem));
      }
      
      return {
        ...toPlainObject<IOrder>(order),
        items: createdItems
      };
    },
    updateStatus: async (id: string, status: string) => {
      const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
      return order ? toPlainObject<IOrder>(order) : null;
    },
    delete: async (id: string) => {
      await OrderItem.deleteMany({ orderId: id });
      const result = await Order.findByIdAndDelete(id);
      return !!result;
    },
    getPendingCount: async () => {
      return await Order.countDocuments({ status: 'pending' });
    }
  }
};
