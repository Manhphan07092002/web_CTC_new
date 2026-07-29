/**
 * Clean & Format AI-generated Product HTML
 * 1. Replaces raw markdown asterisks (**bold**) with HTML <strong>bold</strong>
 * 2. Converts markdown headers (##, ###) into <h2>, <h3>
 * 3. Guarantees 100% presence of <img> tags with alt="[focusKeyword]" for 7/7 Yoast Image score
 * 4. Embeds YouTube/Vimeo/scraped video players inside responsive <iframe> wrappers
 * 5. Adds internal links to CTC products & contact page if missing
 */
export function formatSeoProductHtml(
  rawHtml: string,
  focusKeyword: string = 'sản phẩm',
  mainImage?: string,
  extraImages: string[] = [],
  scrapedVideos: string[] = [],
  technicalSpecs?: { [key: string]: string },
  specificationsText?: string
): { cleanHtml: string; finalMainImage: string; finalExtraImages: string[] } {
  if (!rawHtml) return { cleanHtml: '', finalMainImage: '', finalExtraImages: [] };

  let html = rawHtml.trim();

  // 1. Clean markdown blocks & placeholder strings from prompt templates
  html = html.replace(/```html/gi, '').replace(/```/g, '').trim();
  html = html.replace(/<p>\s*Mở đầu bám sát nội dung gốc[^\n<]*<\/p>/gi, '');
  html = html.replace(/Mở đầu bám sát nội dung gốc[^\n<]*/gi, '');
  html = html.replace(/<p>\s*\[\s*focusKeyword\s*\][^\n<]*<\/p>/gi, '');
  html = html.replace(/\[focusKeyword\]/gi, focusKeyword);
  html = html.replace(/<p>\s*\.\.\.\s*<\/p>/gi, '');
  html = html.replace(/^\s*\.\.\.\s*$/gm, '');

  // 2. Convert markdown bold **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Convert markdown italic *text* -> <em>text</em>
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // 4. Convert markdown headings #, ##, ###
  html = html.replace(/###\s*(.*?)(?:\n|<br\s*\/?>|$)/gi, '<h3>$1</h3>');
  html = html.replace(/##\s*(.*?)(?:\n|<br\s*\/?>|$)/gi, '<h2>$1</h2>');
  html = html.replace(/#\s*(.*?)(?:\n|<br\s*\/?>|$)/gi, '<h2>$1</h2>');

  // 5. Ensure paragraphs for plain text blocks
  if (!html.includes('<p>') && !html.includes('<h2>')) {
    html = html
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  // 5.5 Build Responsive Spec Grid Card (Tiptap friendly) if missing
  if (!html.includes('Bảng Thông Số Kỹ Thuật Chi Tiết') && !html.includes('grid-cols')) {
    let specItemsHtml = '';
    
    if (technicalSpecs && typeof technicalSpecs === 'object' && Object.keys(technicalSpecs).length > 0) {
      specItemsHtml = Object.entries(technicalSpecs).map(([key, val]) => `
        <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
          <span class="font-bold text-slate-700 dark:text-slate-200 text-sm flex-shrink-0">${key}:</span>
          <span class="text-slate-900 dark:text-white font-semibold text-sm text-right">${val}</span>
        </div>
      `).join('');
    } else if (specificationsText && specificationsText.trim().length > 10) {
      const lines = specificationsText.split(/\n|,|;/).map(l => l.trim()).filter(Boolean);
      specItemsHtml = lines.map(line => {
        const parts = line.split(/:|-|=/);
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join(':').trim();
          return `
        <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
          <span class="font-bold text-slate-700 dark:text-slate-200 text-sm flex-shrink-0">${k}:</span>
          <span class="text-slate-900 dark:text-white font-semibold text-sm text-right">${v}</span>
        </div>`;
        } else {
          return `
        <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span class="text-slate-900 dark:text-white font-semibold text-sm">${line}</span>
        </div>`;
        }
      }).join('');
    }

    if (specItemsHtml) {
      const specCardHtml = `
<div class="my-8 p-5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm">
  <h2 class="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
    <span>📋</span> Bảng Thông Số Kỹ Thuật Chi Tiết
  </h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    ${specItemsHtml}
  </div>
</div>`;

      if (html.includes('<h2>')) {
        const firstH2Pos = html.indexOf('<h2>');
        const nextH2Pos = html.indexOf('<h2>', firstH2Pos + 4);
        if (nextH2Pos > 0) {
          html = html.substring(0, nextH2Pos) + specCardHtml + html.substring(nextH2Pos);
        } else {
          html += specCardHtml;
        }
      } else {
        html += specCardHtml;
      }
    }
  }

  // 6. Resolve Images
  const scrapedImgs: string[] = [...extraImages];
  if (mainImage && !scrapedImgs.includes(mainImage)) {
    scrapedImgs.unshift(mainImage);
  }

  // Fallback domain images if no image was scraped
  const fallbackImages = [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'
  ];

  const finalMainImage = scrapedImgs[0] || mainImage || fallbackImages[0];
  const finalExtraImages = scrapedImgs.slice(1, 4).length > 0
    ? scrapedImgs.slice(1, 4)
    : [fallbackImages[1], fallbackImages[2]];

  // 7. Check if <img> tag is present in HTML body
  const hasImgTag = /<img[^>]+>/i.test(html);
  if (!hasImgTag) {
    const img1Block = `
<figure class="my-6">
  <img src="${finalMainImage}" alt="${focusKeyword} chính hãng CTC" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic">Hình ảnh chi tiết ${focusKeyword} tại Bưu Điện Miền Trung (CTC)</figcaption>
</figure>`;

    const img2Block = `
<figure class="my-6">
  <img src="${finalExtraImages[0] || fallbackImages[1]}" alt="Chi tiết kỹ thuật ${focusKeyword}" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800';" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic">Hình ảnh thực tế và kiểm định chất lượng ${focusKeyword}</figcaption>
</figure>`;

    // Insert img1Block after first <h2> or <p>
    if (html.includes('</h2>')) {
      html = html.replace('</h2>', '</h2>' + img1Block);
    } else if (html.includes('</p>')) {
      html = html.replace('</p>', '</p>' + img1Block);
    } else {
      html = img1Block + html;
    }

    // Insert img2Block before final paragraph
    const lastPIndex = html.lastIndexOf('<p>');
    if (lastPIndex > 0) {
      html = html.substring(0, lastPIndex) + img2Block + html.substring(lastPIndex);
    } else {
      html += img2Block;
    }
  }

  // 8. Embed Video Player if scrapedVideos exist and no <iframe> is in HTML
  if (scrapedVideos.length > 0 && !/<iframe[^>]+>/i.test(html)) {
    const videoBlock = `
<div class="my-6">
  <p class="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">🎬 Video trải nghiệm & review thực tế ${focusKeyword}:</p>
  <div class="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
    <iframe src="${scrapedVideos[0]}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>`;

    if (html.includes('<h2>')) {
      html = html.replace('<h2>', videoBlock + '<h2>');
    } else {
      html = videoBlock + html;
    }
  }

  // 9. Internal Links at the end
  if (!html.includes('/products') && !html.includes('/contact')) {
    html += `
<p class="mt-6 pt-4 border-t border-slate-200">Quý khách có thể tham khảo thêm các thiết bị tại <a href="/products" class="text-primary font-bold hover:underline">Danh mục Sản phẩm CTC</a> hoặc liên hệ báo giá tại <a href="/contact" class="text-primary font-bold hover:underline">Trang Liên Hệ CTC</a>.</p>`;
  }

  return {
    cleanHtml: html,
    finalMainImage,
    finalExtraImages
  };
}
