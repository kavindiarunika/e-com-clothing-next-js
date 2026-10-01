"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  FilePlus2,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  Undo2,
  Underline as UnderlineIcon,
} from "lucide-react";

const PRODUCT_DESCRIPTION_TEMPLATE = `
  <h2>Product title</h2>
  <p>Introduce the product and describe what makes it a great choice.</p>
  <ul>
    <li>Add a key feature or material.</li>
    <li>Describe the fit, feel, or finish.</li>
    <li>Highlight another customer benefit.</li>
  </ul>
  <blockquote><p>Add a short product highlight.</p></blockquote>
  <h3>Care Instructions</h3>
  <ol>
    <li>Add washing or cleaning instructions.</li>
    <li>Include any temperature guidance.</li>
    <li>Describe how to store the item.</li>
  </ol>
  <p><a href="#">Add a related size guide or product link.</a></p>
`;

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        "aria-label": "Product description",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  function setLink() {
    if (!editor) return;

    const currentHref = editor.getAttributes("link").href || "";
    const href = window.prompt("Enter link URL", currentHref);

    if (href === null) return;

    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: href.trim() })
      .run();
  }

  function changeBlockType(blockType) {
    if (!editor) return;

    const chain = editor.chain().focus();

    if (blockType === "heading") {
      chain.toggleHeading({ level: 2 }).run();
    } else if (blockType === "subheading") {
      chain.toggleHeading({ level: 3 }).run();
    } else if (blockType === "quote") {
      chain.toggleBlockquote().run();
    } else {
      chain.setParagraph().run();
    }
  }

  function insertTemplate() {
    if (!editor) return;

    if (
      editor.getText().trim() &&
      !window.confirm("Replace the current description with the template?")
    ) {
      return;
    }

    editor.commands.setContent(PRODUCT_DESCRIPTION_TEMPLATE);
  }

  const toolbarButtons = [
    {
      label: "Bold",
      icon: Bold,
      active: editor?.isActive("bold"),
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: editor?.isActive("italic"),
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: UnderlineIcon,
      active: editor?.isActive("underline"),
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: editor?.isActive("heading", { level: 2 }),
      onClick: () =>
        editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Align left",
      icon: AlignLeft,
      active: editor?.isActive({ textAlign: "left" }),
      onClick: () => editor?.chain().focus().setTextAlign("left").run(),
    },
    {
      label: "Align center",
      icon: AlignCenter,
      active: editor?.isActive({ textAlign: "center" }),
      onClick: () => editor?.chain().focus().setTextAlign("center").run(),
    },
    {
      label: "Align right",
      icon: AlignRight,
      active: editor?.isActive({ textAlign: "right" }),
      onClick: () => editor?.chain().focus().setTextAlign("right").run(),
    },
    {
      label: "Justify",
      icon: AlignJustify,
      active: editor?.isActive({ textAlign: "justify" }),
      onClick: () => editor?.chain().focus().setTextAlign("justify").run(),
    },
    {
      label: "Bulleted list",
      icon: List,
      active: editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Add link",
      icon: LinkIcon,
      active: editor?.isActive("link"),
      onClick: setLink,
    },
    {
      label: "Undo",
      icon: Undo2,
      onClick: () => editor?.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo2,
      onClick: () => editor?.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Description formatting">
        <select
          aria-label="Block style"
          value={
            editor?.isActive("heading", { level: 3 })
              ? "subheading"
              : editor?.isActive("heading", { level: 2 })
                ? "heading"
                : editor?.isActive("blockquote")
                  ? "quote"
                  : "paragraph"
          }
          onChange={(event) => changeBlockType(event.target.value)}
          disabled={!editor}
        >
          <option value="paragraph">Paragraph</option>
          <option value="heading">Heading</option>
          <option value="subheading">Subheading</option>
          <option value="quote">Quote</option>
        </select>
        {toolbarButtons.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-pressed={Boolean(active)}
            title={label}
            className={active ? "is-active" : ""}
            onClick={onClick}
            disabled={!editor}
          >
            <Icon size={16} />
          </button>
        ))}
        <button
          type="button"
          className="rich-text-template-button"
          onClick={insertTemplate}
          disabled={!editor}
        >
          <FilePlus2 size={15} />
          Insert template
        </button>
      </div>
      <div className="rich-text-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}