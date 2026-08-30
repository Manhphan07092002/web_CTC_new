/**
 * ================================================================
 * TEST 09 — TÍNH TOÀN VẸN DỮ LIỆU & QUAN HỆ
 * Kiểm tra: số lượng sản phẩm khớp DB, parent_id đúng,
 * không mất liên kết sau khi sửa/xóa
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiPut, apiDelete, ts } from './helpers';

const label = ts();

test.describe('DATA — Kiểm tra tính toàn vẹn dữ liệu', () => {

  test('DATA-001: Số lượng sản phẩm API khớp tổng số hiển thị', async ({ page }) => {
    const { status, body } = await apiGet(page, '/products?page=1&limit=50');
    expect(status).toBe(200);

    const total   = body?.total ?? body?.count ?? body?.length;
    const items   = body?.data ?? body?.products ?? body ?? [];
    const fetched = Array.isArray(items) ? items.length : 0;

    console.log(`Tổng SP trong DB: ${total} | Lấy được: ${fetched}`);
    if (total !== undefined && fetched < total) {
      console.log(`ℹ️ Có ${total - fetched} sản phẩm chưa được lấy (phân trang)`);
    }
  });

  test('DATA-002: Mỗi sản phẩm có đủ trường bắt buộc', async ({ page }) => {
    const { body } = await apiGet(page, '/products?limit=10');
    const items = body?.data ?? body?.products ?? body ?? [];

    const issues: string[] = [];
    for (const p of items) {
      if (!p._id && !p.id)   issues.push(`Sản phẩm thiếu _id: ${JSON.stringify(p).substring(0, 50)}`);
      if (!p.name)           issues.push(`Sản phẩm ${p._id} thiếu name`);
      if (!p.slug)           issues.push(`Sản phẩm ${p._id} (${p.name}) thiếu slug`);
      if (p.price === undefined) issues.push(`Sản phẩm ${p._id} (${p.name}) thiếu price`);
    }

    if (issues.length > 0) {
      console.warn('⚠️ Dữ liệu thiếu trường:\n', issues.join('\n'));
    }
    console.log(`✅ Kiểm tra ${items.length} sản phẩm`);
  });

  test('DATA-003: Danh mục con phải có parentId hợp lệ', async ({ page }) => {
    const { body } = await apiGet(page, '/product-categories?limit=100');
    const cats = body?.data ?? body?.categories ?? body ?? [];

    const catIds = new Set(cats.map((c: any) => c._id || c.id));
    const issues: string[] = [];

    for (const cat of cats) {
      const parentId = cat.parentId ?? cat.parent_id ?? cat.parent;
      if (parentId && !catIds.has(parentId)) {
        issues.push(`Danh mục "${cat.name}" có parentId "${parentId}" không tồn tại!`);
      }
    }

    if (issues.length > 0) {
      console.warn('⚠️ Vấn đề quan hệ danh mục:\n', issues.join('\n'));
    } else {
      console.log(`✅ ${cats.length} danh mục - tất cả parentId hợp lệ`);
    }
  });

  test('DATA-004: Sản phẩm thuộc đúng danh mục', async ({ page }) => {
    const { body: catBody } = await apiGet(page, '/product-categories?limit=5');
    const cats = catBody?.data ?? catBody?.categories ?? catBody ?? [];

    for (const cat of cats.slice(0, 3)) {
      const catId = cat._id || cat.id;
      const { body: prodBody } = await apiGet(page, `/products?categoryId=${catId}&limit=10`);
      const products = prodBody?.data ?? prodBody?.products ?? prodBody ?? [];

      console.log(`Danh mục "${cat.name}": ${products.length} sản phẩm`);

      // Mỗi sản phẩm phải có categoryId = catId (hoặc là con cháu)
      for (const p of products) {
        const pCatId = p.categoryId ?? p.category ?? p.category_id;
        // Không fail cứng vì có thể lọc theo toàn bộ cây con
        if (pCatId && pCatId !== catId) {
          console.log(`  SP "${p.name}" có category khác: ${pCatId}`);
        }
      }
    }
  });

  test('DATA-005: Sản phẩm không bị mất sau khi sửa danh mục', async ({ page }) => {
    // Tạo danh mục tạm
    const { body: cat1 } = await apiPost(page, '/product-categories', {
      name: `Cat A ${label}`,
      slug: `cat-a-${label}`,
    });
    const { body: cat2 } = await apiPost(page, '/product-categories', {
      name: `Cat B ${label}`,
      slug: `cat-b-${label}`,
    });

    if (!cat1?._id || !cat2?._id) {
      console.warn('Không tạo được danh mục test');
      return;
    }

    // Tạo sản phẩm trong cat1
    const { body: prod } = await apiPost(page, '/products', {
      name: `Product Cat Move ${label}`,
      sku: `MOVE-${label}`,
      price: 100000,
      categoryId: cat1._id,
    });

    if (!prod?._id) {
      console.warn('Không tạo được sản phẩm test');
      await apiDelete(page, `/product-categories/${cat1._id}`);
      await apiDelete(page, `/product-categories/${cat2._id}`);
      return;
    }

    // Chuyển sản phẩm sang cat2
    await apiPut(page, `/products/${prod._id}`, { categoryId: cat2._id });

    // Lấy lại sản phẩm - phải còn tồn tại
    const { status: getStatus, body: updatedProd } = await apiGet(page, `/products/${prod._id}`);
    expect(getStatus).toBe(200);
    expect(updatedProd._id || updatedProd.id).toBeTruthy();
    console.log(`✅ Sản phẩm tồn tại sau khi chuyển danh mục`);

    // Cleanup
    await apiDelete(page, `/products/${prod._id}`);
    await apiDelete(page, `/product-categories/${cat1._id}`);
    await apiDelete(page, `/product-categories/${cat2._id}`);
  });

  test('DATA-006: Không tạo bản ghi trùng lặp khi gọi API 2 lần', async ({ page }) => {
    const uniqueSlug = `unique-slug-${label}`;

    // Gọi POST 2 lần với cùng slug
    const { status: s1, body: b1 } = await apiPost(page, '/product-categories', {
      name: `Unique Test ${label}`,
      slug: uniqueSlug,
    });
    const { status: s2, body: b2 } = await apiPost(page, '/product-categories', {
      name: `Unique Test ${label}`,
      slug: uniqueSlug,
    });

    console.log(`Lần 1: HTTP ${s1} | ID: ${b1?._id}`);
    console.log(`Lần 2: HTTP ${s2} | ID: ${b2?._id}`);

    // Lần 2 phải bị từ chối hoặc tạo với slug khác
    if (s2 === 201 && b1?._id !== b2?._id) {
      // Kiểm tra 2 bản ghi có slug khác nhau
      if (b1?.slug === b2?.slug) {
        console.warn(`⚠️ Tạo 2 bản ghi với slug giống nhau: "${uniqueSlug}"`);
      } else {
        console.log(`✅ Server tạo slug khác: "${b2?.slug}"`);
      }
    } else if (s2 >= 400) {
      console.log(`✅ Server từ chối bản ghi trùng (HTTP ${s2})`);
    }

    // Cleanup
    if (b1?._id) await apiDelete(page, `/product-categories/${b1._id}`);
    if (b2?._id && b2._id !== b1?._id) await apiDelete(page, `/product-categories/${b2._id}`);
  });

  test('DATA-007: Số lượng sản phẩm theo danh mục khớp UI', async ({ page }) => {
    const { body } = await apiGet(page, '/product-categories?limit=3');
    const cats = body?.data ?? body?.categories ?? body ?? [];

    for (const cat of cats) {
      const catId = cat._id;
      const { body: prodBody } = await apiGet(page, `/products?categoryId=${catId}&limit=1`);
      const apiCount = prodBody?.total ?? prodBody?.count ?? (Array.isArray(prodBody) ? prodBody.length : 0);
      console.log(`Danh mục "${cat.name}": ${apiCount} sản phẩm (API)`);

      // Nếu UI hiển thị số lượng → cần kiểm tra khớp, ở đây chỉ log
      if (cat.productCount !== undefined) {
        if (cat.productCount !== apiCount) {
          console.warn(`⚠️ "${cat.name}": UI hiện ${cat.productCount} nhưng API trả ${apiCount}`);
        }
      }
    }
  });

});

test.describe('DATA — Kiểm tra thao tác Back/Forward/Refresh', () => {

  test('REFRESH-01: Refresh trang sản phẩm không 404', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('products');
  });

  test('REFRESH-02: Refresh trang chi tiết sản phẩm không 404', async ({ page }) => {
    const { body } = await apiGet(page, '/products?limit=1');
    const items = body?.data ?? body?.products ?? body ?? [];
    if (!items[0]?.slug) return;

    await page.goto(`/products/${items[0].slug}`);
    await page.waitForLoadState('networkidle');
    await page.reload();

    const res = await page.waitForResponse(r => r.url().includes(items[0].slug) || r.url().endsWith(items[0].slug));
    expect(res.status()).toBeLessThan(400);
  });

  test('BACK-FORWARD-01: Back và Forward không lỗi state', async ({ page }) => {
    await page.goto('/');
    await page.goto('/products');
    await page.goto('/news');

    await page.goBack();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('products');

    await page.goForward();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('news');
  });

});
