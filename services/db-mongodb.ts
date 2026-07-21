/**
 * Server-side MongoDB Database Service
 * Provides a unified interface for database operations using Mongoose models
 */

import { 
  Product,
  Project,
  News,
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
  const obj = doc.toObject ? doc.toObject({ flattenMaps: true }) : doc;
  return {
    ...obj,
    id: obj._id?.toString() || obj.id
  };
};

export const db = {
  products: {
    getAll: async () => {
      const products = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
      return products.map(toPlainObject<IProduct>);
    },

    getAllIncludingDeleted: async () => {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return products.map(toPlainObject<IProduct>);
    },

    getDeleted: async () => {
      console.log('DB: Fetching deleted products...');
      const products = await Product.find({ isDeleted: true }).sort({ deletedAt: -1 });
      console.log('DB: Found', products.length, 'deleted products');
      return products.map(toPlainObject<IProduct>);
    },
    
    getById: async (id: string) => {
      const product = await Product.findById(id);
      return product ? toPlainObject<IProduct>(product) : null;
    },
    
    getFeatured: async (limit: number = 4) => {
      const products = await Product.find({ 
        isFeatured: true, 
        isDeleted: { $ne: true } 
      })
        .sort({ featuredOrder: 1, createdAt: -1 })
        .limit(limit);
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
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
      return product ? toPlainObject<IProduct>(product) : null;
    },
    
    incrementLike: async (id: string) => {
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
      );
      return product ? toPlainObject<IProduct>(product) : null;
    },
    
    incrementShare: async (id: string) => {
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { shares: 1 } },
        { new: true }
      );
      return product ? toPlainObject<IProduct>(product) : null;
    }
  },

  projects: {
    getFeatured: async (limit: number = 4) => { const projects = await Project.find().sort({ createdAt: -1 }).limit(limit); return projects.map(toPlainObject<IProject>); },
    getAll: async () => {
      const projects = await Project.find().sort({ createdAt: -1 });
      return projects.map(toPlainObject<IProject>);
    },
    
    getById: async (id: string) => {
      const project = await Project.findById(id);
      return project ? toPlainObject<IProject>(project) : null;
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
    
    getById: async (id: string) => {
      const newsItem = await News.findById(id);
      return newsItem ? toPlainObject<INewsItem>(newsItem) : null;
    },
    
    add: async (data: Partial<INewsItem>) => {
      const newsItem = new News(data);
      await newsItem.save();
      return toPlainObject<INewsItem>(newsItem);
    },
    
    update: async (id: string, data: Partial<INewsItem>) => {
      const newsItem = await News.findByIdAndUpdate(id, data, { new: true });
      return newsItem ? toPlainObject<INewsItem>(newsItem) : null;
    },
    
    delete: async (id: string) => {
      const result = await News.findByIdAndDelete(id);
      return !!result;
    }
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
      const user = await User.findOne({ email });
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
      const notification = await Notification.findById(id);
      return notification ? toPlainObject<INotification>(notification) : null;
    },
    
    add: async (data: Partial<INotification>) => {
      const notification = new Notification(data);
      await notification.save();
      return toPlainObject<INotification>(notification);
    },
    
    update: async (id: string, data: Partial<INotification>) => {
      const notification = await Notification.findByIdAndUpdate(id, data, { new: true });
      return notification ? toPlainObject<INotification>(notification) : null;
    },
    
    delete: async (id: string) => {
      const result = await Notification.findByIdAndDelete(id);
      return !!result;
    },
    
    markAsRead: async (id: string) => {
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
      const product = await Product.findById(productId);
      if (!product || !product.reviews) return [];
      return product.reviews.map((review: any) => toPlainObject(review));
    },

    addToProduct: async (productId: string, reviewData: any) => {
      const product = await Product.findById(productId);
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
      const product = await Product.findById(productId);
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
