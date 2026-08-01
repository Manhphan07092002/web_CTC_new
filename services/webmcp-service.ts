/**
 * WebMCP Global Service
 * Automatic WebMCP Tool Registration for AI Agent Browsing (Chrome 150+)
 */

import { api } from './api';

export function registerGlobalWebMCPTools(): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('modelContext' in navigator) || !(navigator as any).modelContext) return;

  const modelContext = (navigator as any).modelContext;

  // 1. Tool: Tra cứu & lọc sản phẩm CTC
  try {
    modelContext.registerTool({
      name: 'search_ctc_products',
      description: 'Tìm kiếm và lọc danh mục sản phẩm, biến tần Inverter, Pin năng lượng mặt trời, BESS lưu trữ của CTC',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Từ khóa tìm kiếm tên sản phẩm, mã hiệu hoặc thương hiệu (VD: Inverter, Canadian Solar, 100kW)'
          },
          category: {
            type: 'string',
            description: 'Slug hoặc tên danh mục sản phẩm'
          },
          minPower: {
            type: 'number',
            description: 'Công suất tối thiểu (kWp)'
          },
          maxPower: {
            type: 'number',
            description: 'Công suất tối đa (kWp)'
          }
        }
      },
      execute: async (args: { query?: string; category?: string; minPower?: number; maxPower?: number }) => {
        try {
          const products = await api.products.getAll();
          let filtered = products || [];

          if (args.query) {
            const q = args.query.toLowerCase();
            filtered = filtered.filter(p =>
              (p.name && p.name.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q)) ||
              (p.code && p.code.toLowerCase().includes(q))
            );
          }

          if (args.category) {
            const cat = args.category.toLowerCase();
            filtered = filtered.filter(p =>
              (p.category && p.category.toLowerCase().includes(cat)) ||
              (p.categoryLabel && p.categoryLabel.toLowerCase().includes(cat))
            );
          }

          if (args.minPower !== undefined) {
            filtered = filtered.filter(p => (p.power || 0) >= args.minPower!);
          }
          if (args.maxPower !== undefined) {
            filtered = filtered.filter(p => (p.power || 0) <= args.maxPower!);
          }

          return {
            total: filtered.length,
            results: filtered.slice(0, 10).map(p => ({
              id: p.id || p._id,
              name: p.name,
              code: p.code,
              category: p.categoryLabel || p.category,
              powerKwp: p.power,
              efficiencyPercent: p.efficiency,
              warranty: p.warranty,
              price: p.contactPrice ? 'Liên hệ' : p.price
            }))
          };
        } catch (err) {
          return { error: 'Không thể truy xuất dữ liệu sản phẩm CTC' };
        }
      }
    });
  } catch (e) {
    console.warn('WebMCP product tool registration warning:', e);
  }

  // 2. Tool: Tra cứu dự án EPC tiêu biểu CTC
  try {
    modelContext.registerTool({
      name: 'search_ctc_projects',
      description: 'Tra cứu các dự án EPC điện mặt trời và công trình công nghiệp đã thi công bởi CTC',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Từ khóa tìm kiếm tên dự án hoặc chủ đầu tư'
          },
          location: {
            type: 'string',
            description: 'Địa điểm hoặc tỉnh thành triển khai dự án'
          }
        }
      },
      execute: async (args: { query?: string; location?: string }) => {
        try {
          const projects = await api.projects.getAll();
          let filtered = projects || [];

          if (args.query) {
            const q = args.query.toLowerCase();
            filtered = filtered.filter(p =>
              (p.title && p.title.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q)) ||
              (p.client && p.client.toLowerCase().includes(q))
            );
          }

          if (args.location) {
            const loc = args.location.toLowerCase();
            filtered = filtered.filter(p => p.location && p.location.toLowerCase().includes(loc));
          }

          return {
            total: filtered.length,
            results: filtered.slice(0, 10).map(p => ({
              id: p.id || p._id,
              title: p.title,
              location: p.location,
              capacity: p.capacity,
              completionDate: p.completionDate || p.date,
              client: p.client
            }))
          };
        } catch (err) {
          return { error: 'Không thể truy xuất dữ liệu dự án CTC' };
        }
      }
    });
  } catch (e) {
    console.warn('WebMCP project tool registration warning:', e);
  }
}
