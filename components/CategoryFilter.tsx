import React from 'react';
import { useProjectCategories, useNewsCategories, useProductCategories } from '../hooks/useCategories';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryFilterProps {
  type: 'project' | 'news' | 'product';
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  showAll?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  type,
  selectedCategoryId,
  onCategoryChange,
  showAll = true
}) => {
  const { t } = useLanguage();
  
  // Get categories based on type
  const { categories: projectCategories } = useProjectCategories();
  const { categories: newsCategories } = useNewsCategories();
  const { categories: productCategories } = useProductCategories();

  const categories = 
    type === 'project' ? projectCategories :
    type === 'news' ? newsCategories :
    productCategories;

  // Get count based on type
  const getCount = (category: any) => {
    if (type === 'project') return category.projectCount;
    if (type === 'news') return category.newsCount;
    if (type === 'product') return category.productCount;
    return undefined;
  };

  return (
    <div className="flex flex-wrap gap-3">
      {showAll && (
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedCategoryId === null
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('common.all')}
        </button>
      )}
      
      {categories.map((category) => {
        const count = getCount(category);
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategoryId === category.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
            {count !== undefined && count > 0 && (
              <span className="ml-2 text-xs opacity-75">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
