/**
 * Security Monitoring Dashboard
 * Giám sát bảo mật hệ thống
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePermission } from '../contexts/PermissionContext';
import AccessDenied from '../components/AccessDenied';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Users,
  AlertTriangle,
  Ban,
  Eye,
  RefreshCw,
  Clock,
  Globe,
  Server,
  Lock,
  Unlock,
  Filter,
  Download,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  X,
  Check,
  Info,
  Zap,
} from 'lucide-react';

// API Base URL
const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api/security-monitoring';
  }
  return `${protocol}//${hostname}:4000/api/security-monitoring`;
};

// Types
interface SecurityEvent {
  _id: string;
  id?: string;
  createdAt: string;
  timestamp?: string;
  type: 'suspicious_request' | 'rate_limit_exceeded' | 'failed_login' | 'ip_blocked' | 'xss_attempt' | 'sql_injection' | 'unauthorized_access';
  ip: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  blocked?: boolean;
}

interface AuditLog {
  _id: string;
  id?: string;
  createdAt: string;
  timestamp?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failed' | 'unauthorized';
  ip: string;
  duration?: number;
  method?: string;
  path?: string;
}

interface IPBlacklistEntry {
  _id: string;
  ip: string;
  reason: string;
  blockedBy?: string;
  blockedByEmail?: string;
  permanent: boolean;
  createdAt: string;
}

interface SecurityStats {
  totalEvents: number;
  blockedRequests: number;
  failedLogins: number;
  suspiciousActivities: number;
  activeUsers: number;
  blacklistedIPs: number;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const SecurityMonitoring: React.FC = () => {
  const { hasPermission, hasMinRoleLevel } = usePermission();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'audit' | 'blacklist'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  // Data states
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalEvents: 0,
    blockedRequests: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    activeUsers: 0,
    blacklistedIPs: 0,
  });
  
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [blacklist, setBlacklist] = useState<IPBlacklistEntry[]>([]);
  const [blockReason, setBlockReason] = useState('');
  
  // Filters
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newIPToBlock, setNewIPToBlock] = useState('');
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Show notification
  const showNotification = (type: Notification['type'], title: string, message: string, duration = 5000) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  };
  
  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Fetch security stats from API
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/stats?days=7`);
      if (response.ok) {
        const data = await response.json();
        setSecurityStats({
          totalEvents: data.stats?.totalEvents || 0,
          blockedRequests: data.stats?.blockedRequests || 0,
          failedLogins: data.stats?.failedLogins || 0,
          suspiciousActivities: data.stats?.suspiciousActivities || 0,
          activeUsers: data.stats?.activeUsers || 0,
          blacklistedIPs: data.stats?.blacklistedIPs || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);
  
  // Fetch security events from API
  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (eventFilter !== 'all') params.append('type', eventFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      
      const response = await fetch(`${getApiUrl()}/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSecurityEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, [eventFilter, severityFilter]);
  
  // Fetch audit logs from API
  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/audit-logs?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  }, []);
  
  // Fetch blacklist from API
  const fetchBlacklist = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/blacklist`);
      if (response.ok) {
        const data = await response.json();
        setBlacklist(data.blacklist || []);
      }
    } catch (error) {
      console.error('Failed to fetch blacklist:', error);
    }
  }, []);
  
  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchEvents(),
      fetchAuditLogs(),
      fetchBlacklist(),
    ]);
    setIsLoading(false);
  }, [fetchStats, fetchEvents, fetchAuditLogs, fetchBlacklist]);
  
  // Initial load
  useEffect(() => {
    loadData();
    showNotification('info', '🔄 Đang tải dữ liệu...', 'Hệ thống đang tải thông tin bảo mật mới nhất.', 2000);
  }, [loadData]);
  
  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);
  
  // Reload when filters change
  useEffect(() => {
    fetchEvents();
  }, [eventFilter, severityFilter, fetchEvents]);
  
  // Handle IP blocking via API
  const handleBlockIP = async () => {
    if (!newIPToBlock.trim()) return;
    
    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIPToBlock)) {
      showNotification('error', 'IP không hợp lệ', 'Vui lòng nhập địa chỉ IP đúng định dạng (ví dụ: 192.168.1.100)');
      return;
    }
    
    // Check if already blocked
    if (blacklist.some(b => b.ip === newIPToBlock)) {
      showNotification('warning', 'IP đã tồn tại', `IP ${newIPToBlock} đã có trong danh sách chặn`);
      return;
    }
    
    try {
      const response = await fetch(`${getApiUrl()}/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ip: newIPToBlock, 
          reason: blockReason || 'Chặn thủ công từ admin',
          permanent: true,
        }),
      });
      
      if (response.ok) {
        setNewIPToBlock('');
        setBlockReason('');
        fetchBlacklist();
        fetchStats();
        showNotification('success', '🛡️ Chặn IP thành công!', `IP ${newIPToBlock} đã được thêm vào danh sách chặn. Hệ thống sẽ tự động từ chối các yêu cầu từ IP này.`);
      } else {
        const data = await response.json();
        showNotification('error', 'Lỗi chặn IP', data.message || 'Không thể thêm IP vào danh sách chặn');
      }
    } catch (error) {
      console.error('Failed to block IP:', error);
      showNotification('error', 'Lỗi hệ thống', 'Đã xảy ra lỗi khi chặn IP. Vui lòng thử lại.');
    }
  };
  
  const handleUnblockIP = async (ip: string) => {
    if (!confirm(`Bạn có chắc muốn bỏ chặn IP ${ip}?`)) return;
    
    try {
      const response = await fetch(`${getApiUrl()}/blacklist/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchBlacklist();
        fetchStats();
        showNotification('success', '✅ Bỏ chặn IP thành công!', `IP ${ip} đã được gỡ khỏi danh sách chặn. IP này có thể truy cập lại hệ thống.`);
      } else {
        const data = await response.json();
        showNotification('error', 'Lỗi bỏ chặn IP', data.message || 'Không thể gỡ IP khỏi danh sách chặn');
      }
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      showNotification('error', 'Lỗi hệ thống', 'Đã xảy ra lỗi khi bỏ chặn IP. Vui lòng thử lại.');
    }
  };
  
  // Quick block IP from event
  const handleQuickBlockIP = async (ip: string, reason: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason, permanent: true }),
      });
      
      if (response.ok) {
        fetchBlacklist();
        fetchStats();
        showNotification('success', '⚡ Chặn IP nhanh thành công!', `IP ${ip} đã được chặn ngay lập tức do hoạt động đáng ngờ.`);
      }
    } catch (error) {
      console.error('Failed to quick block IP:', error);
    }
  };
  
  // Export events to CSV
  const exportEventsCSV = () => {
    const headers = ['Thời gian', 'Loại', 'IP', 'Chi tiết', 'Mức độ', 'Đã chặn'];
    const rows = filteredEvents.map(event => [
      event.createdAt ? new Date(event.createdAt).toLocaleString('vi-VN') : '-',
      event.type,
      event.ip,
      `"${event.details.replace(/"/g, '""')}"`,
      event.severity,
      event.blocked ? 'Có' : 'Không'
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('info', '📊 Xuất dữ liệu thành công!', `Đã tải xuống ${filteredEvents.length} sự kiện bảo mật dưới dạng CSV.`);
  };

  // Export audit logs to CSV
  const exportAuditLogsCSV = () => {
    const headers = ['Thời gian', 'Người dùng', 'Hành động', 'Tài nguyên', 'IP', 'Trạng thái', 'Thời gian xử lý (ms)'];
    const rows = filteredAuditLogs.map(log => [
      log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '-',
      log.userEmail || 'Anonymous',
      log.action,
      log.resource,
      log.ip,
      log.status,
      log.duration || '-'
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('info', '📋 Xuất nhật ký thành công!', `Đã tải xuống ${filteredAuditLogs.length} bản ghi hoạt động dưới dạng CSV.`);
  };
  
  // Filter events
  const filteredEvents = securityEvents.filter(event => {
    if (eventFilter !== 'all' && event.type !== eventFilter) return false;
    if (severityFilter !== 'all' && event.severity !== severityFilter) return false;
    if (searchQuery && !event.ip.includes(searchQuery) && !event.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (searchQuery && !log.userEmail?.includes(searchQuery) && !log.ip.includes(searchQuery)) return false;
    return true;
  });
  
  // Severity badge
  const SeverityBadge: React.FC<{ severity: 'low' | 'medium' | 'high' }> = ({ severity }) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity]}`}>
        {severity === 'low' ? 'Thấp' : severity === 'medium' ? 'Trung bình' : 'Cao'}
      </span>
    );
  };
  
  // Status badge
  const StatusBadge: React.FC<{ status: 'success' | 'failed' | 'unauthorized' }> = ({ status }) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      unauthorized: 'bg-orange-100 text-orange-800',
    };
    
    const icons = {
      success: <CheckCircle className="w-3 h-3 mr-1" />,
      failed: <XCircle className="w-3 h-3 mr-1" />,
      unauthorized: <AlertCircle className="w-3 h-3 mr-1" />,
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${colors[status]}`}>
        {icons[status]}
        {status === 'success' ? 'Thành công' : status === 'failed' ? 'Thất bại' : 'Không có quyền'}
      </span>
    );
  };
  
  // Event type badge
  const EventTypeBadge: React.FC<{ type: SecurityEvent['type'] }> = ({ type }) => {
    const labels: Record<SecurityEvent['type'], string> = {
      suspicious_request: 'Yêu cầu đáng ngờ',
      rate_limit_exceeded: 'Vượt giới hạn',
      failed_login: 'Đăng nhập thất bại',
      ip_blocked: 'IP bị chặn',
      xss_attempt: 'Tấn công XSS',
      sql_injection: 'SQL Injection',
      unauthorized_access: 'Truy cập trái phép',
    };
    
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
        {labels[type]}
      </span>
    );
  };

  // Check permissions
  if (!hasPermission('view_security_logs') && !hasMinRoleLevel(90)) {
    return (
      <AccessDenied 
        message="Bạn cần quyền 'view_security_logs' hoặc vai trò level 90+ để truy cập giám sát bảo mật"
        requiredPermission="view_security_logs"
        requiredLevel={90}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giám sát Bảo mật</h1>
            <p className="text-sm text-gray-500">Theo dõi và quản lý bảo mật hệ thống</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Tự động làm mới:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 rounded text-xs font-medium ${
                autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefresh ? 'Bật' : 'Tắt'}
            </button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
          </div>
          
          {/* Manual Refresh */}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'overview', label: 'Tổng quan', icon: PieChart },
          { id: 'events', label: 'Sự kiện bảo mật', icon: ShieldAlert },
          { id: 'audit', label: 'Nhật ký hoạt động', icon: Activity },
          { id: 'blacklist', label: 'Danh sách chặn IP', icon: Ban },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
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
      
      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={<Globe className="w-5 h-5" />}
              label="Tổng sự kiện"
              value={(securityStats?.totalEvents ?? 0).toLocaleString()}
              color="blue"
            />
            <StatCard
              icon={<Ban className="w-5 h-5" />}
              label="Yêu cầu bị chặn"
              value={(securityStats?.blockedRequests ?? 0).toString()}
              color="red"
            />
            <StatCard
              icon={<Lock className="w-5 h-5" />}
              label="Đăng nhập thất bại"
              value={(securityStats?.failedLogins ?? 0).toString()}
              color="orange"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Hoạt động đáng ngờ"
              value={(securityStats?.suspiciousActivities ?? 0).toString()}
              color="yellow"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Người dùng hoạt động"
              value={(securityStats?.activeUsers ?? 0).toString()}
              color="green"
            />
            <StatCard
              icon={<ShieldAlert className="w-5 h-5" />}
              label="IP bị chặn"
              value={(securityStats?.blacklistedIPs ?? 0).toString()}
              color="purple"
            />
          </div>
          
          {/* Security Features Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Trạng thái tính năng bảo mật
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Rate Limiting', status: true, desc: 'Giới hạn 100 req/15 phút' },
                { name: 'XSS Protection', status: true, desc: 'Lọc script độc hại' },
                { name: 'CORS', status: true, desc: 'Chỉ cho phép origin hợp lệ' },
                { name: 'JWT Auth', status: true, desc: 'Token hết hạn sau 7 ngày' },
                { name: 'IP Filtering', status: true, desc: `${blacklist.length} IP bị chặn` },
                { name: 'Audit Logging', status: true, desc: 'Ghi log tất cả hoạt động' },
                { name: 'SQL Injection', status: true, desc: 'MongoDB Sanitize' },
                { name: 'Security Headers', status: true, desc: 'X-Frame, X-XSS, etc.' },
              ].map((feature) => (
                <div key={feature.name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {feature.status ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium text-sm">{feature.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Events Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                Sự kiện bảo mật gần đây
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {securityEvents.slice(0, 5).map((event, idx) => (
                  <div key={event._id || `event-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={event.severity} />
                      <div>
                        <EventTypeBadge type={event.type} />
                        <p className="text-xs text-gray-500 mt-1">{event.ip}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {event.createdAt ? new Date(event.createdAt).toLocaleTimeString('vi-VN') : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Hoạt động gần đây
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auditLogs.slice(0, 5).map((log, idx) => (
                  <div key={log._id || `log-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={log.status} />
                      <div>
                        <p className="text-sm font-medium">{log.action} - {log.resource}</p>
                        <p className="text-xs text-gray-500">{log.userEmail || 'Anonymous'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN') : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('audit')}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'events' && (
        <div className="bg-white rounded-xl shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tất cả loại</option>
                <option value="suspicious_request">Yêu cầu đáng ngờ</option>
                <option value="rate_limit_exceeded">Vượt giới hạn</option>
                <option value="failed_login">Đăng nhập thất bại</option>
                <option value="ip_blocked">IP bị chặn</option>
                <option value="xss_attempt">Tấn công XSS</option>
              </select>
            </div>
            
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
            
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo IP hoặc nội dung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            
            <button 
              onClick={exportEventsCSV}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Xuất CSV
            </button>
          </div>
          
          {/* Events Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEvents.map((event, idx) => (
                  <tr key={event._id || `event-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <EventTypeBadge type={event.type} />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{event.ip}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{event.details}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={event.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleQuickBlockIP(event.ip, event.details)}
                        disabled={blacklist.some(b => b.ip === event.ip)}
                        className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400"
                      >
                        {blacklist.some(b => b.ip === event.ip) ? 'Đã chặn' : 'Chặn IP'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không có sự kiện nào phù hợp với bộ lọc
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm">
          {/* Search and Export */}
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo email hoặc IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <button 
              onClick={exportAuditLogsCSV}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Xuất CSV
            </button>
          </div>
          
          {/* Audit Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài nguyên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAuditLogs.map((log, idx) => (
                  <tr key={log._id || `log-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{log.userEmail || 'Anonymous'}</td>
                    <td className="px-4 py-3 text-sm font-medium capitalize">{log.action}</td>
                    <td className="px-4 py-3 text-sm">
                      {log.resource}
                      {log.resourceId && <span className="text-gray-400 ml-1">#{log.resourceId.slice(-6)}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{log.ip}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.duration ? `${log.duration}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAuditLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không có nhật ký nào phù hợp với bộ lọc
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          {/* Add IP Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm IP vào danh sách chặn
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Nhập địa chỉ IP (ví dụ: 192.168.1.100)"
                value={newIPToBlock}
                onChange={(e) => setNewIPToBlock(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Lý do chặn (không bắt buộc)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
                onKeyPress={(e) => e.key === 'Enter' && handleBlockIP()}
              />
              <button
                onClick={handleBlockIP}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Ban className="w-4 h-4" />
                Chặn IP
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              IP bị chặn sẽ không thể truy cập vào hệ thống. Hãy cẩn thận để không chặn nhầm.
            </p>
          </div>
          
          {/* Blacklisted IPs List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Danh sách IP bị chặn ({blacklist.length})
              </h3>
            </div>
            
            {blacklist.length > 0 ? (
              <div className="divide-y">
                {blacklist.map((entry, index) => (
                  <div key={entry._id || entry.ip} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-mono text-lg">{entry.ip}</span>
                        <p className="text-sm text-gray-500">
                          {entry.reason || 'Không có lý do'} • Bởi {entry.blockedByEmail || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleString('vi-VN') : '-'}
                          {entry.permanent && ' • Vĩnh viễn'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblockIP(entry.ip)}
                      className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Unlock className="w-4 h-4" />
                      Bỏ chặn
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-500">Không có IP nào trong danh sách chặn</p>
                <p className="text-sm text-gray-400">Hệ thống đang hoạt động bình thường</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'red' | 'orange' | 'yellow' | 'green' | 'purple';
  trend?: number;
}> = ({ icon, label, value, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {trend !== undefined && (
          <span className={`flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const { type, title, message } = notification;
  
  const typeConfig = {
    success: {
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      icon: <Check className="w-5 h-5" />,
    },
    error: {
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      icon: <X className="w-5 h-5" />,
    },
    warning: {
      bgColor: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    info: {
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      icon: <Info className="w-5 h-5" />,
    },
  };
  
  const config = typeConfig[type];
  
  return (
    <div className={`max-w-sm w-full ${config.bgColor} border rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SecurityMonitoring;
