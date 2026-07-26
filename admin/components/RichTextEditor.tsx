import React, { useCallback, useState } from 'react';
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
  Highlighter, Undo, Redo, Code, Table2, FolderImage, ExternalLink, Unlink
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: 'rounded-2xl shadow-md my-4 max-h-[550px] mx-auto object-cover' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline font-medium hover:text-secondary' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder: placeholder || 'Nhập nội dung chi tiết... Bạn có thể chèn hình ảnh, đường dẫn liên kết, định dạng văn bản...' }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[380px] p-6 text-gray-800 dark:text-gray-100',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
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
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const addImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Nhập đường dẫn URL hình ảnh (ví dụ: https://...):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageSelectFromFilePicker = (url: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImagePicker(false);
  };

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent(`
      <table className="w-full border-collapse border border-gray-300 my-4 text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="border border-gray-300 p-2.5 font-bold">Thông số / Tiêu chí</th>
            <th className="border border-gray-300 p-2.5 font-bold">Giá trị / Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2.5">Công nghệ</td>
            <td className="border border-gray-300 p-2.5">Năng lượng mặt trời thế hệ mới</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2.5">Bảo hành</td>
            <td className="border border-gray-300 p-2.5">Chính hãng CTC Solar</td>
          </tr>
        </tbody>
      </table>
    `).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all bg-white dark:bg-gray-800">
      {/* === TOOLBAR === */}
      <div className="bg-gray-100/80 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1">
        
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
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Đậm (Ctrl+B)">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Nghiêng (Ctrl+I)">
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Đánh dấu highlight">
          <Highlighter size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Mã Code inline">
          <Code size={16} />
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
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách đầu chấm">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Đoạn trích dẫn">
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
          <Minus size={16} />
        </ToolbarButton>

        <Divider />

        {/* Link & Image & Table Buttons */}
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Chèn / Sửa đường dẫn liên kết (Link)">
          <Link2 size={16} />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={unsetLink} title="Xóa liên kết">
            <Unlink size={16} className="text-red-500" />
          </ToolbarButton>
        )}

        {/* Image insertion options */}
        <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setShowImagePicker(true)}
            className="px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded flex items-center gap-1 transition-colors"
            title="Chọn ảnh từ Thư viện tệp / Upload máy tính"
          >
            <FolderImage size={15} />
            <span>Thư viện ảnh</span>
          </button>
          <button
            type="button"
            onClick={addImageFromUrl}
            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="Chèn ảnh từ URL đường dẫn"
          >
            <ImageIcon size={15} />
          </button>
        </div>

        <ToolbarButton onClick={insertTable} title="Chèn bảng thông số">
          <Table2 size={16} />
        </ToolbarButton>
      </div>

      {/* === EDITOR AREA === */}
      <div className="bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
      </div>

      {/* Footer stats */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span>
          {editor.storage.characterCount?.characters?.() || editor.getText().length} ký tự
          &nbsp;·&nbsp;
          ~{Math.max(1, Math.ceil(editor.getText().length / 1200))} phút đọc
        </span>
        <span className="hidden sm:inline text-gray-400">Dùng Ctrl+B = Đậm · Ctrl+I = Nghiêng · Chèn ảnh từ Thư viện hoặc URL</span>
      </div>

      {/* Image Picker Modal */}
      <FilePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleImageSelectFromFilePicker}
        title="Chọn hoặc Tải lên hình ảnh chèn vào bài viết sản phẩm"
      />
    </div>
  );
};

export default RichTextEditor;
