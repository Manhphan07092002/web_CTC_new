import React, { useCallback } from 'react';
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
  Highlighter, Undo, Redo, Code, Table2
} from 'lucide-react';

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
      p-1.5 rounded-md text-sm transition-all duration-100 flex items-center justify-center
      ${active
        ? 'bg-primary text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder: placeholder || 'Bắt đầu viết nội dung bài viết...' }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[350px] p-6 text-gray-800',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Nhập URL hình ảnh:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent(`
      <table>
        <thead><tr><th>Cột 1</th><th>Cột 2</th><th>Cột 3</th></tr></thead>
        <tbody>
          <tr><td>Dữ liệu 1</td><td>Dữ liệu 2</td><td>Dữ liệu 3</td></tr>
          <tr><td>Dữ liệu 4</td><td>Dữ liệu 5</td><td>Dữ liệu 6</td></tr>
        </tbody>
      </table>
    `).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {/* === TOOLBAR === */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-0.5">
        
        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
          <Redo size={15} />
        </ToolbarButton>

        <Divider />

        {/* Heading */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Tiêu đề lớn (H1)">
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề vừa (H2)">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề nhỏ (H3)">
          <Heading3 size={15} />
        </ToolbarButton>

        <Divider />

        {/* Text format */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Đậm (Ctrl+B)">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Nghiêng (Ctrl+I)">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Đánh dấu">
          <Highlighter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code inline">
          <Code size={15} />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Căn đều">
          <AlignJustify size={15} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách đầu chấm">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách có số">
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
          <Minus size={15} />
        </ToolbarButton>

        <Divider />

        {/* Link & Image & Table */}
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Chèn liên kết">
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Chèn hình ảnh (URL)">
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Chèn bảng">
          <Table2 size={15} />
        </ToolbarButton>
      </div>

      {/* === EDITOR AREA === */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Word count */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-xs text-gray-400">
        <span>
          {editor.storage.characterCount?.characters?.() || editor.getText().length} ký tự
          &nbsp;·&nbsp;
          ~{Math.max(1, Math.ceil(editor.getText().length / 1200))} phút đọc
        </span>
        <span className="text-gray-300">Ctrl+B = Đậm · Ctrl+I = Nghiêng · Ctrl+Z = Hoàn tác</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
