import React, { useCallback, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Minus, Link2, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3,
  Highlighter, Undo, Redo, Code, Table2, FolderOpen, ExternalLink, Unlink
} from 'lucide-react';
import FilePickerModal from '../FilePickerModal';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      p-1.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-center
      ${active
        ? 'bg-primary text-white shadow-sm font-semibold scale-105'
        : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />;

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(content || '');

  // Stable extension configuration without duplicates
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Image.configure({ 
      inline: false, 
      allowBase64: true, 
      HTMLAttributes: { class: 'rounded-2xl shadow-md my-4 max-h-[550px] mx-auto object-cover' } 
    }),
    Link.configure({ 
      openOnClick: false, 
      HTMLAttributes: { class: 'text-primary underline font-medium hover:text-secondary' } 
    }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: false }),
    Placeholder.configure({ 
      placeholder: placeholder || 'Nhập nội dung chi tiết... Bạn có thể chèn hình ảnh, đường dẫn liên kết, dán mã HTML...' 
    }),
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content: content || '',
    onUpdate: ({ editor }) => {
      if (!editor || editor.isDestroyed || !editor.schema) return;
      try {
        const html = editor.getHTML();
        onChange(html);
        setHtmlSource(html);
      } catch (err) {
        console.warn('RichTextEditor onUpdate error:', err);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[380px] p-6 text-gray-800 dark:text-gray-100',
      },
    },
  });

  // Synchronize external content changes safely without crashing when editor is unmounted/destroyed
  React.useEffect(() => {
    if (!editor || editor.isDestroyed || !editor.schema) return;
    try {
      const currentHtml = editor.getHTML();
      if (content !== undefined && content !== currentHtml) {
        editor.commands.setContent(content || '', { emitUpdate: false });
        setHtmlSource(content || '');
      }
    } catch (err) {
      console.warn('RichTextEditor sync warning:', err);
    }
  }, [content, editor]);

  const toggleHtmlMode = useCallback(() => {
    if (!editor || editor.isDestroyed || !editor.schema) return;
    if (isHtmlMode) {
      // Switching from HTML code to Visual mode
      editor.commands.setContent(htmlSource || '', { emitUpdate: true });
      onChange(htmlSource);
      setIsHtmlMode(false);
    } else {
      // Switching from Visual mode to HTML code view
      try {
        setHtmlSource(editor.getHTML());
      } catch (err) {
        setHtmlSource(content || '');
      }
      setIsHtmlMode(true);
    }
  }, [editor, isHtmlMode, htmlSource, onChange, content]);

  const handleHtmlSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlSource(val);
    onChange(val);
  };

  const setLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập URL đường dẫn liên kết:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '' || url === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const unsetLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const addImageFromUrl = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const url = window.prompt('Nhập đường dẫn URL hình ảnh (ví dụ: https://...):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageSelectFromFilePicker = (url: string) => {
    if (editor && !editor.isDestroyed && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImagePicker(false);
  };

  const insertTable = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    editor.chain().focus().insertContent(`
      <table class="w-full border-collapse border border-gray-300 my-4 text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-800">
            <th class="border border-gray-300 p-2.5 font-bold">Thông số / Tiêu chí</th>
            <th class="border border-gray-300 p-2.5 font-bold">Giá trị / Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 p-2.5">Công nghệ</td>
            <td class="border border-gray-300 p-2.5">Năng lượng sạch thế hệ mới CTC</td>
          </tr>
          <tr>
            <td class="border border-gray-300 p-2.5">Bảo hành</td>
            <td class="border border-gray-300 p-2.5">Chính hãng CTC Bưu Điện Miền Trung</td>
          </tr>
        </tbody>
      </table>
    `).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all bg-white dark:bg-gray-800">
      {/* === TOOLBAR === */}
      <div className="bg-gray-100/80 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
            <Redo size={16} />
          </ToolbarButton>

          <Divider />

          {/* Headings */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Tiêu đề lớn (H1)">
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề vừa (H2)">
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề nhỏ (H3)">
            <Heading3 size={16} />
          </ToolbarButton>

          <Divider />

          {/* Text format */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Tô màu chữ">
            <Highlighter size={16} />
          </ToolbarButton>

          <Divider />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Căn đều 2 bên">
            <AlignJustify size={16} />
          </ToolbarButton>

          <Divider />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách chấm điểm (Bullet List)">
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số (Ordered List)">
            <ListOrdered size={16} />
          </ToolbarButton>

          <Divider />

          {/* Blockquote & Horizontal Rule & Table */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Đoạn trích dẫn (Blockquote)">
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường phân cách ngang">
            <Minus size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={insertTable} title="Chèn bảng mẫu (Table)">
            <Table2 size={16} />
          </ToolbarButton>

          <Divider />

          {/* Links */}
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Chèn đường dẫn liên kết">
            <Link2 size={16} />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton onClick={unsetLink} title="Xóa đường dẫn liên kết">
              <Unlink size={16} />
            </ToolbarButton>
          )}

          <Divider />

          {/* Media */}
          <ToolbarButton onClick={() => setShowImagePicker(true)} title="Chọn ảnh từ Thư viện CTC">
            <FolderOpen size={16} className="text-amber-500" />
          </ToolbarButton>
          <ToolbarButton onClick={addImageFromUrl} title="Chèn ảnh từ đường dẫn URL ngoài">
            <ImageIcon size={16} />
          </ToolbarButton>
        </div>

        {/* Toggle HTML Code View */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleHtmlMode}
            className={`
              px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border
              ${isHtmlMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <Code size={14} />
            <span>{isHtmlMode ? 'Quay lại Giao diện Trực quan' : 'Mã HTML'}</span>
          </button>
        </div>
      </div>

      {/* === EDITOR BODY AREA === */}
      {isHtmlMode ? (
        <div className="p-4 bg-slate-900 font-mono text-xs text-amber-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 font-sans">
            <span className="text-[11px] font-bold uppercase tracking-wider">Trình chỉnh sửa mã HTML trực tiếp (Source Code View)</span>
            <span className="text-[10px]">Thay đổi ở đây sẽ tự động cập nhật vào bài viết</span>
          </div>
          <textarea
            value={htmlSource}
            onChange={handleHtmlSourceChange}
            rows={16}
            spellCheck={false}
            placeholder="Dán hoặc chỉnh sửa mã HTML ở đây..."
            className="w-full bg-transparent outline-none font-mono text-xs leading-relaxed text-amber-300 resize-y min-h-[380px]"
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* File Picker Modal */}
      {showImagePicker && (
        <FilePickerModal
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleImageSelectFromFilePicker}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
