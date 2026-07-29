import { Category } from '../types';

export interface CategoryNode extends Category {
  level: number;
  children: CategoryNode[];
  parentChain: Category[];
}

/**
 * Builds a multi-level recursive category tree from flat array of categories
 */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();

  // 1. Create nodes
  categories.forEach(cat => {
    map.set(cat.id, {
      ...cat,
      level: 1,
      children: [],
      parentChain: []
    });
  });

  const roots: CategoryNode[] = [];

  // 2. Attach children to parents
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      const parentNode = map.get(node.parentId)!;
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 3. Compute levels and parent chains recursively
  function setLevelsAndChains(nodes: CategoryNode[], currentLevel: number, currentChain: Category[]) {
    nodes.forEach(node => {
      node.level = currentLevel;
      node.parentChain = [...currentChain, node];
      if (node.children.length > 0) {
        setLevelsAndChains(node.children, currentLevel + 1, node.parentChain);
      }
    });
  }

  setLevelsAndChains(roots, 1, []);
  return roots;
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
