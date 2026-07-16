import mongoose, { Document, Schema } from 'mongoose';

export interface ITranslation extends Document {
  key: string;
  namespace: string;
  language: string;
  value: string;
  description?: string;
  context?: string;
  isPlural?: boolean;
  pluralForms?: {
    zero?: string;
    one?: string;
    other?: string;
  };
  variables?: string[];
  status: 'draft' | 'approved' | 'published' | 'deprecated';
  version: number;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<ITranslation>({
  key: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  namespace: {
    type: String,
    required: true,
    trim: true,
    index: true,
    enum: ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin', 'home', 'dynamic']
  },
  language: {
    type: String,
    required: true,
    trim: true,
    index: true,
    enum: ['vi', 'en', 'ko', 'ja', 'zh', 'de', 'fr', 'es']
  },
  value: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  context: {
    type: String,
    trim: true
  },
  isPlural: {
    type: Boolean,
    default: false
  },
  pluralForms: {
    zero: String,
    one: String,
    other: String
  },
  variables: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'approved', 'published', 'deprecated'],
    default: 'draft',
    index: true
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  createdBy: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  collection: 'translations'
});

// Compound indexes for efficient queries
TranslationSchema.index({ key: 1, namespace: 1, language: 1 }, { unique: true });
TranslationSchema.index({ namespace: 1, language: 1, status: 1 });
TranslationSchema.index({ status: 1, updatedAt: -1 });
TranslationSchema.index({ usageCount: -1, lastUsed: -1 });

// Virtual for full translation key
TranslationSchema.virtual('fullKey').get(function() {
  return this.namespace === 'common' ? this.key : `${this.namespace}:${this.key}`;
});

// Pre-save middleware
TranslationSchema.pre('save', function(next) {
  if (this.isModified('value') && !this.isNew) {
    this.version += 1;
  }
  
  // Extract variables from value
  if (this.isModified('value')) {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(this.value)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    this.variables = variables;
  }
  
  next();
});

// Static methods
TranslationSchema.statics.findByKey = function(key: string, namespace: string, language: string) {
  return this.findOne({ key, namespace, language, status: { $in: ['approved', 'published'] } });
};

TranslationSchema.statics.findByNamespace = function(namespace: string, language: string) {
  return this.find({ namespace, language, status: { $in: ['approved', 'published'] } });
};

TranslationSchema.statics.getPublishedTranslations = function(language: string) {
  return this.find({ language, status: 'published' });
};

TranslationSchema.statics.incrementUsage = function(key: string, namespace: string, language: string) {
  return this.updateOne(
    { key, namespace, language },
    { 
      $inc: { usageCount: 1 },
      $set: { lastUsed: new Date() }
    }
  );
};

// Instance methods
TranslationSchema.methods.approve = function(approvedBy: string) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

TranslationSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

TranslationSchema.methods.deprecate = function() {
  this.status = 'deprecated';
  return this.save();
};

export const Translation = mongoose.model<ITranslation>('Translation', TranslationSchema);
