import { Category } from '../types';

export interface CategoryNode extends Category {
  level: number;
  children: CategoryNode[];
  parentChain: Category[];
}

/**
 * Normalizes category name for deduplication comparison (ignores case, accents, spaces, special chars)
 */
function normalizeCategoryKey(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9&]/g, '')
    .trim();
}

/**
 * Builds a multi-level recursive category tree from flat array of categories
 * Automatically deduplicates duplicate category names across parent levels
 */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  if (!categories || categories.length === 0) return [];

  // 1. Deduplicate flat categories list by parentId + normalized name
  const idRedirectMap = new Map<string, string>();
  const dupGroups = new Map<string, Category[]>();

  categories.forEach(cat => {
    const parentKey = cat.parentId ? String(cat.parentId) : 'root';
    const normName = normalizeCategoryKey(cat.name);
    const groupKey = `${parentKey}:${normName}`;

    if (!dupGroups.has(groupKey)) {
      dupGroups.set(groupKey, []);
    }
    dupGroups.get(groupKey)!.push(cat);
  });

  const deduplicatedCategories: Category[] = [];

  dupGroups.forEach((group) => {
    if (group.length === 1) {
      deduplicatedCategories.push(group[0]);
    } else {
      // Pick best category in group:
      // 1. Highest productCount
      // 2. Titlecase name (prefer 'Hạ Tầng...' over 'HẠ TẦNG...')
      const best = group.slice().sort((a, b) => {
        const countA = a.productCount || 0;
        const countB = b.productCount || 0;
        if (countA !== countB) return countB - countA;

        const isAllCapsA = a.name === a.name.toUpperCase();
        const isAllCapsB = b.name === b.name.toUpperCase();
        if (isAllCapsA !== isAllCapsB) return isAllCapsA ? 1 : -1;

        return 0;
      })[0];

      deduplicatedCategories.push(best);

      group.forEach(cat => {
        if (cat.id !== best.id) {
          idRedirectMap.set(cat.id, best.id);
        }
      });
    }
  });

  // Re-map parentId if it was redirected
  const cleanCategories = deduplicatedCategories.map(cat => {
    if (cat.parentId && idRedirectMap.has(String(cat.parentId))) {
      return { ...cat, parentId: idRedirectMap.get(String(cat.parentId)) };
    }
    return cat;
  });

  // 2. Create nodes
  const map = new Map<string, CategoryNode>();
  cleanCategories.forEach(cat => {
    map.set(cat.id, {
      ...cat,
      level: 1,
      children: [],
      parentChain: []
    });
  });

  const roots: CategoryNode[] = [];

  // 3. Attach children to parents
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      const parentNode = map.get(node.parentId)!;
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 4. Deduplicate roots if any root has duplicate normalized name across roots
  const rootGroupMap = new Map<string, CategoryNode>();
  roots.forEach(root => {
    const key = normalizeCategoryKey(root.name);
    if (!rootGroupMap.has(key)) {
      rootGroupMap.set(key, root);
    } else {
      const existing = rootGroupMap.get(key)!;
      existing.children.push(...root.children);
      existing.productCount = (existing.productCount || 0) + (root.productCount || 0);
      if (root.name !== root.name.toUpperCase() && existing.name === existing.name.toUpperCase()) {
        existing.name = root.name;
      }
    }
  });

  const finalRoots = Array.from(rootGroupMap.values());

  // 5. Compute levels and parent chains recursively
  function setLevelsAndChains(nodes: CategoryNode[], currentLevel: number, currentChain: Category[]) {
    nodes.forEach(node => {
      node.level = currentLevel;
      node.parentChain = [...currentChain, node];

      if (node.children.length > 0) {
        const childMap = new Map<string, CategoryNode>();
        node.children.forEach(child => {
          const childKey = normalizeCategoryKey(child.name);
          if (!childMap.has(childKey)) {
            childMap.set(childKey, child);
          } else {
            const existingChild = childMap.get(childKey)!;
            existingChild.children.push(...child.children);
            existingChild.productCount = (existingChild.productCount || 0) + (child.productCount || 0);
          }
        });
        node.children = Array.from(childMap.values());
        setLevelsAndChains(node.children, currentLevel + 1, node.parentChain);
      }
    });
  }

  setLevelsAndChains(finalRoots, 1, []);
  return finalRoots;
}


/**
 * Flatten tree into ordered array with indent prefix for <select> options
 */
export function flattenCategoryTreeForSelect(categories: Category[]): Array<{ id: string; name: string; level: number; indentName: string; category: Category }> {
  const tree = buildCategoryTree(categories);
  const result: Array<{ id: string; name: string; level: number; indentName: string; category: Category }> = [];

  function traverse(nodes: CategoryNode[]) {
    nodes.forEach(node => {
      const prefix = node.level === 1 ? '' : '— '.repeat(node.level - 1);
      const iconPrefix = node.level === 1 ? '📁 ' : node.level === 2 ? '📂 ' : node.level === 3 ? '📄 ' : '└ ';
      result.push({
        id: node.id,
        name: node.name,
        level: node.level,
        indentName: `${prefix}${iconPrefix}${node.name}`,
        category: node
      });
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(tree);
  return result;
}

/**
 * Get all descendant IDs of a category (for filtering products of parent categories)
 */
export function getCategoryDescendantIds(categoryId: string, categories: Category[]): string[] {
  const tree = buildCategoryTree(categories);
  const result: string[] = [categoryId];

  function findAndCollect(nodes: CategoryNode[]) {
    nodes.forEach(node => {
      if (node.id === categoryId) {
        collectChildren(node.children);
      } else if (node.children.length > 0) {
        findAndCollect(node.children);
      }
    });
  }

  function collectChildren(nodes: CategoryNode[]) {
    nodes.forEach(node => {
      result.push(node.id);
      if (node.children.length > 0) {
        collectChildren(node.children);
      }
    });
  }

  findAndCollect(tree);
  return result;
}

/**
 * Get parent chain from root down to category
 */
export function getCategoryParentChain(categoryId: string, categories: Category[]): Category[] {
  const tree = buildCategoryTree(categories);
  let chain: Category[] = [];

  function search(nodes: CategoryNode[]) {
    for (const node of nodes) {
      if (node.id === categoryId) {
        chain = node.parentChain;
        return true;
      }
      if (node.children.length > 0) {
        if (search(node.children)) return true;
      }
    }
    return false;
  }

  search(tree);
  return chain;
}

/**
 * Get all descendant IDs of a category (excluding itself)
 */
export function getCategoryDescendantIdsOnly(categoryId: string, categories: Category[]): string[] {
  const tree = buildCategoryTree(categories);
  const result: string[] = [];

  function findAndCollect(nodes: CategoryNode[]) {
    nodes.forEach(node => {
      if (node.id === categoryId) {
        collectChildren(node.children);
      } else if (node.children.length > 0) {
        findAndCollect(node.children);
      }
    });
  }

  function collectChildren(nodes: CategoryNode[]) {
    nodes.forEach(node => {
      result.push(node.id);
      if (node.children.length > 0) {
        collectChildren(node.children);
      }
    });
  }

  findAndCollect(tree);
  return result;
}

/**
 * Get IDs of all sibling categories sharing the same parent
 */
export function getCategorySiblingIds(categoryId: string, categories: Category[]): string[] {
  const target = categories.find(c => c.id === categoryId);
  if (!target) return [];
  const targetParent = target.parentId || null;
  return categories
    .filter(c => (c.parentId || null) === targetParent && c.id !== categoryId)
    .map(c => c.id);
}

/**
 * Get ancestor IDs leading to a category
 */
export function getCategoryAncestorIds(categoryId: string, categories: Category[]): string[] {
  const chain = getCategoryParentChain(categoryId, categories);
  return chain.filter(c => c.id !== categoryId).map(c => c.id);
}
