'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Minus, RotateCcw, RotateCw } from 'lucide-react'

interface Props {
  content: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-5 py-4',
      },
    },
  })

  if (!editor) return null

  const btn = (action: () => void, active: boolean, Icon: React.ElementType, title: string) => (
    <button type="button" onClick={action} title={title}
      className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-[#722F37] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
        {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), Bold, 'Grassetto')}
        {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), Italic, 'Corsivo')}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), Heading2, 'Titolo H2')}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), Heading3, 'Titolo H3')}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), List, 'Lista puntata')}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), ListOrdered, 'Lista numerata')}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {btn(() => editor.chain().focus().setHorizontalRule().run(), false, Minus, 'Separatore')}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {btn(() => editor.chain().focus().undo().run(), false, RotateCcw, 'Annulla')}
        {btn(() => editor.chain().focus().redo().run(), false, RotateCw, 'Ripristina')}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
