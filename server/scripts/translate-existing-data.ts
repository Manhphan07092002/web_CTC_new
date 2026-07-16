/**
 * Script to translate all existing data in MongoDB using Gemini AI
 * Run: npx tsx server/scripts/translate-existing-data.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, Project, News, Testimonial, ProductCategory, NewsCategory, ProjectCategory } from '../../models';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Supported languages
const TARGET_LANGUAGES = ['en', 'ko', 'ja', 'zh', 'de'] as const;
type TargetLanguage = typeof TARGET_LANGUAGES[number];

const LANGUAGE_NAMES: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese (Simplified)',
  de: 'German'
};

// Translation function using Gemini AI
async function translateContent(
  content: Record<string, string | string[]>,
  targetLang: TargetLanguage
): Promise<Record<string, string | string[]> | null> {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set!');
    return null;
  }

  const fieldsToTranslate = Object.entries(content)
    .filter(([_, value]) => value && (typeof value === 'string' ? value.trim() : value.length > 0))
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  if (!fieldsToTranslate) return null;

  const prompt = `You are a professional translator for a solar energy company website.
Translate the following content from Vietnamese to ${LANGUAGE_NAMES[targetLang]}.

IMPORTANT RULES:
1. Maintain technical accuracy for solar/energy terms
2. Keep the same format (key: value)
3. Only translate the VALUES, not the keys
4. For arrays (in JSON format), translate each item
5. Keep product codes, numbers, units, and brand names unchanged
6. Make the translation natural and professional
7. Return ONLY the translated content, nothing else

Content to translate:
${fieldsToTranslate}

Return the translated content in the exact same format (key: value).`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
      })
    });

    if (!response.ok) {
      console.error(`API error for ${targetLang}:`, response.status);
      return null;
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Parse response
    const translatedFields: Record<string, string | string[]> = {};
    const lines = translatedText.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            translatedFields[key] = JSON.parse(value);
          } catch {
            translatedFields[key] = value;
          }
        } else {
          translatedFields[key] = value;
        }
      }
    }

    return Object.keys(translatedFields).length > 0 ? translatedFields : null;
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
    return null;
  }
}

// Translate all products
async function translateProducts() {
  console.log('\n📦 Translating Products...');
  const products = await Product.find({});
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    console.log(`  → Translating: ${product.name}`);
    
    const translations: Record<string, any> = product.translations || {};
    
    for (const lang of TARGET_LANGUAGES) {
      // Skip if already translated
      if (translations[lang]?.name) {
        console.log(`    ✓ ${lang} already exists`);
        continue;
      }

      const content: Record<string, string | string[]> = {};
      if (product.name) content.name = product.name;
      if (product.description) content.description = product.description;
      if (product.shortDescription) content.shortDescription = product.shortDescription;
      if (product.specifications) content.specifications = product.specifications;
      if (product.warranty) content.warranty = product.warranty;
      if (product.features?.length) content.features = product.features;

      const translated = await translateContent(content, lang);
      if (translated) {
        translations[lang] = translated;
        console.log(`    ✓ ${lang} translated`);
      } else {
        console.log(`    ✗ ${lang} failed`);
      }

      // Delay to avoid rate limiting (2 seconds)
      await new Promise(r => setTimeout(r, 2000));
    }

    // Save translations
    await Product.findByIdAndUpdate(product._id, { translations });
  }
  console.log('✅ Products translation completed!');
}

// Translate all projects
async function translateProjects() {
  console.log('\n🏗️ Translating Projects...');
  const projects = await Project.find({});
  console.log(`Found ${projects.length} projects`);

  for (const project of projects) {
    console.log(`  → Translating: ${project.title}`);
    
    const translations: Record<string, any> = project.translations || {};
    
    for (const lang of TARGET_LANGUAGES) {
      if (translations[lang]?.title) {
        console.log(`    ✓ ${lang} already exists`);
        continue;
      }

      const content: Record<string, string> = {};
      if (project.title) content.title = project.title;
      if (project.location) content.location = project.location;
      if (project.description) content.description = project.description;

      const translated = await translateContent(content, lang);
      if (translated) {
        translations[lang] = translated;
        console.log(`    ✓ ${lang} translated`);
      } else {
        console.log(`    ✗ ${lang} failed`);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    await Project.findByIdAndUpdate(project._id, { translations });
  }
  console.log('✅ Projects translation completed!');
}

// Translate all news
async function translateNews() {
  console.log('\n📰 Translating News...');
  const newsItems = await News.find({});
  console.log(`Found ${newsItems.length} news items`);

  for (const news of newsItems) {
    console.log(`  → Translating: ${news.title}`);
    
    const translations: Record<string, any> = news.translations || {};
    
    for (const lang of TARGET_LANGUAGES) {
      if (translations[lang]?.title) {
        console.log(`    ✓ ${lang} already exists`);
        continue;
      }

      const content: Record<string, string> = {};
      if (news.title) content.title = news.title;
      if (news.excerpt) content.excerpt = news.excerpt;
      if (news.content) content.content = news.content;

      const translated = await translateContent(content, lang);
      if (translated) {
        translations[lang] = translated;
        console.log(`    ✓ ${lang} translated`);
      } else {
        console.log(`    ✗ ${lang} failed`);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    await News.findByIdAndUpdate(news._id, { translations });
  }
  console.log('✅ News translation completed!');
}

// Translate all categories
async function translateCategories() {
  console.log('\n🏷️ Translating Categories...');

  // Product Categories
  console.log('  Product Categories:');
  const productCategories = await ProductCategory.find({});
  for (const category of productCategories) {
    console.log(`    → ${category.name}`);
    const translations: Record<string, any> = (category as any).translations || {};
    for (const lang of TARGET_LANGUAGES) {
      if (translations[lang]?.name) continue;
      const content: Record<string, string> = {};
      if (category.name) content.name = category.name;
      if (category.description) content.description = category.description;
      const translated = await translateContent(content, lang);
      if (translated) translations[lang] = translated;
      await new Promise(r => setTimeout(r, 2000));
    }
    await ProductCategory.findByIdAndUpdate(category._id, { translations });
  }

  // News Categories
  console.log('  News Categories:');
  const newsCategories = await NewsCategory.find({});
  for (const category of newsCategories) {
    console.log(`    → ${category.name}`);
    const translations: Record<string, any> = (category as any).translations || {};
    for (const lang of TARGET_LANGUAGES) {
      if (translations[lang]?.name) continue;
      const content: Record<string, string> = {};
      if (category.name) content.name = category.name;
      if (category.description) content.description = category.description;
      const translated = await translateContent(content, lang);
      if (translated) translations[lang] = translated;
      await new Promise(r => setTimeout(r, 2000));
    }
    await NewsCategory.findByIdAndUpdate(category._id, { translations });
  }

  // Project Categories
  console.log('  Project Categories:');
  const projectCategories = await ProjectCategory.find({});
  for (const category of projectCategories) {
    console.log(`    → ${category.name}`);
    const translations: Record<string, any> = (category as any).translations || {};
    for (const lang of TARGET_LANGUAGES) {
      if (translations[lang]?.name) continue;
      const content: Record<string, string> = {};
      if (category.name) content.name = category.name;
      if (category.description) content.description = category.description;
      const translated = await translateContent(content, lang);
      if (translated) translations[lang] = translated;
      await new Promise(r => setTimeout(r, 2000));
    }
    await ProjectCategory.findByIdAndUpdate(category._id, { translations });
  }
  console.log('✅ Categories translation completed!');
}

// Main function
async function main() {
  console.log('🌍 Starting MongoDB Data Translation...');
  console.log('=====================================');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env file!');
    process.exit(1);
  }
  
  console.log('✓ GEMINI_API_KEY found');
  console.log(`✓ Target languages: ${TARGET_LANGUAGES.join(', ')}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Run translations
    await translateProducts();
    await translateProjects();
    await translateNews();
    await translateCategories();

    console.log('\n=====================================');
    console.log('🎉 All translations completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
