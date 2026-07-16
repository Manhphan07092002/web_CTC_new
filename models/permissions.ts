/**
 * Permission & Role Management Models
 * Hệ thống phân quyền chi tiết
 */

import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// PERMISSION MODEL
// ============================================
export interface IPermission extends Document {
  name: string;
  resource: string;
  action: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  resource: {
    type: String,
    required: true,
    trim: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'view', 'edit', 'publish', 'approve', 'export'],
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['content', 'user', 'system', 'security', 'analytics', 'commerce'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ category: 1 });

export const Permission = mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);

// ============================================
// ROLE MODEL
// ============================================
export interface IRole extends Document {
  name: string;
  displayName: string;
  description?: string;
  permissions: mongoose.Types.ObjectId[];
  level: number;
  isSystem: boolean;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: '#6B7280',
  },
  icon: {
    type: String,
    default: 'User',
  },
}, {
  timestamps: true,
});

RoleSchema.index({ level: 1 });
RoleSchema.index({ isActive: 1 });

export const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

// ============================================
// USER PERMISSION MODEL (Extended User)
// ============================================
export interface IUserPermission extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  additionalPermissions: mongoose.Types.ObjectId[];
  deniedPermissions: mongoose.Types.ObjectId[];
  expiresAt?: Date;
  isActive: boolean;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  notes?: string;
}

const UserPermissionSchema = new Schema<IUserPermission>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  additionalPermissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  deniedPermissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  expiresAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

UserPermissionSchema.index({ userId: 1 });
UserPermissionSchema.index({ roleId: 1 });
UserPermissionSchema.index({ isActive: 1 });

export const UserPermission = mongoose.models.UserPermission || mongoose.model<IUserPermission>('UserPermission', UserPermissionSchema);

// ============================================
// PERMISSION LOG MODEL
// ============================================
export interface IPermissionLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  permission: string;
  result: 'granted' | 'denied';
  reason?: string;
  ip: string;
  userAgent?: string;
  createdAt: Date;
}

const PermissionLogSchema = new Schema<IPermissionLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
  },
  permission: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
    enum: ['granted', 'denied'],
  },
  reason: {
    type: String,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

PermissionLogSchema.index({ userId: 1, createdAt: -1 });
PermissionLogSchema.index({ resource: 1, action: 1 });
PermissionLogSchema.index({ result: 1 });

// Auto-delete logs after 90 days
PermissionLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const PermissionLog = mongoose.models.PermissionLog || mongoose.model<IPermissionLog>('PermissionLog', PermissionLogSchema);
