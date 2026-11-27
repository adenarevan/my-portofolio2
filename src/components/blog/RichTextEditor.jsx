import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { bodyToDocument, FONT_SIZES, safeLink, serializeBody } from '../../lib/richText';
import { ARTICLE_IMAGES, normalizeArticleImage } from '../../lib/articleMedia';
import { coverIndex } from '../../lib/articleReading';
import { ArticleImageNode } from './ArticleImageNode';
import ImageSearch from './ImageSearch';

export default function RichTextEditor({ value, onChange, disabled, t }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [linkError, setLinkError] = useState(false);
  const linkInput = useRef(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageForm, setImageForm] = useState({ src: '', alt: '', caption: '', credit: '', creditUrl: '' });
  const [imagePosition, setImagePosition] = useState('inline');
  const [imageError, setImageError] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, trailingNode: false, link: { openOnClick: false, defaultProtocol: 'https', isAllowedUri: url => Boolean(safeLink(url)) } }),
      TextStyle, FontSize, TextAlign.configure({ types: ['heading', 'paragraph'] }), ArticleImageNode,
    ],
    content: bodyToDocument(value),
    editable: !disabled,
    editorProps: { attributes: { id: 'post-body', class: 'rich-content', role: 'textbox', 'aria-multiline': 'true', 'aria-labelledby': 'post-body-label', 'aria-describedby': 'body-help', 'data-placeholder': t.bodyPlaceholder } },
    onUpdate: ({ editor }) => onChange(serializeBody(editor.getJSON())),
  });
  const state = useEditorState({ editor, selector: ({ editor }) => editor ? ({
    bold: editor.isActive('bold'), italic: editor.isActive('italic'), underline: editor.isActive('underline'), strike: editor.isActive('strike'),
    bulletList: editor.isActive('bulletList'), orderedList: editor.isActive('orderedList'), blockquote: editor.isActive('blockquote'), link: editor.isActive('link'),
    heading: editor.getAttributes('heading').level || '', fontSize: editor.getAttributes('textStyle').fontSize || '',
    align: editor.getAttributes('paragraph').textAlign || editor.getAttributes('heading').textAlign || 'left',
    undo: editor.can().undo(), redo: editor.can().redo(), empty: editor.isEmpty, image: editor.isActive('image'),
  }) : null });

  useEffect(() => { editor?.setEditable(!disabled, false); }, [editor, disabled]);
  useEffect(() => {
    if (editor && serializeBody(editor.getJSON()) !== value) editor.commands.setContent(bodyToDocument(value), { emitUpdate: false });
  }, [editor, value]);
  useEffect(() => { if (linkOpen) linkInput.current?.focus(); }, [linkOpen]);
  if (!editor || !state) return null;

  const button = (name, label, content, command, active = state[name], unavailable = false) => <button key={name} type="button" title={label} aria-label={label} aria-pressed={typeof active === 'boolean' ? active : undefined} disabled={disabled || unavailable} onMouseDown={event => event.preventDefault()} onClick={command}>{content}</button>;
  function openLink() {
    setUrl(editor.getAttributes('link').href || ''); setLinkError(false); setImageOpen(false); setLinkOpen(open => !open);
  }
  function applyImage(event) {
    event.preventDefault();
    const image = normalizeArticleImage(imageForm);
    if (!image || !image.alt) { setImageError(true); return; }
    const node = { type: 'image', attrs: image };
    if (imagePosition === 'replace' && editor.isActive('image')) editor.chain().focus().updateAttributes('image', image).run();
    else if (imagePosition === 'cover') {
      const document = editor.getJSON(); const index = coverIndex(document);
      const content = document.content.filter((_, position) => position !== index);
      editor.chain().setContent({ type: 'doc', content: [node, ...content] }, { emitUpdate: true }).focus('end').run();
    } else editor.chain().focus().insertContent(node).run();
    setImageOpen(false); setImageError(false);
  }
  function applyLink(event) {
    event.preventDefault();
    const input = url.trim();
    const href = safeLink(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`);
    if (!href) { setLinkError(true); return; }
    const chain = editor.chain().focus().extendMarkRange('link');
    if (editor.state.selection.empty) chain.insertContent({ type: 'text', text: input, marks: [{ type: 'link', attrs: { href } }] }).run();
    else chain.setLink({ href }).run();
    setLinkOpen(false);
  }

  return <div className="rich-editor" data-disabled={disabled || undefined} data-empty={state.empty || undefined}>
    <div className="rich-toolbar" role="group" aria-label={t.formatting}>
      <div className="rich-tool-group">
        <select aria-label={t.textStyle} value={state.heading} disabled={disabled} onChange={event => event.target.value ? editor.chain().focus().setHeading({ level: Number(event.target.value) }).run() : editor.chain().focus().setParagraph().run()}><option value="">{t.paragraph}</option><option value="2">{t.heading} 2</option><option value="3">{t.heading} 3</option><option value="4">{t.heading} 4</option></select>
        <select className="rich-size" aria-label={t.fontSize} value={state.fontSize} disabled={disabled} onChange={event => event.target.value ? editor.chain().focus().setFontSize(event.target.value).run() : editor.chain().focus().unsetFontSize().run()}><option value="">{t.sizeAuto}</option>{FONT_SIZES.map(size => <option value={size} key={size}>{parseInt(size, 10)}</option>)}</select>
      </div>
      <div className="rich-tool-group">
        {button('bold', t.bold, <b>B</b>, () => editor.chain().focus().toggleBold().run())}
        {button('italic', t.italic, <i>I</i>, () => editor.chain().focus().toggleItalic().run())}
        {button('underline', t.underline, <u>U</u>, () => editor.chain().focus().toggleUnderline().run())}
        {button('strike', t.strike, <s>S</s>, () => editor.chain().focus().toggleStrike().run())}
      </div>
      <div className="rich-tool-group">
        {button('bulletList', t.bulletList, '• ≡', () => editor.chain().focus().toggleBulletList().run())}
        {button('orderedList', t.orderedList, '1. ≡', () => editor.chain().focus().toggleOrderedList().run())}
        {button('blockquote', t.quote, '“ ”', () => editor.chain().focus().toggleBlockquote().run())}
        <select aria-label={t.alignment} value={state.align} disabled={disabled} onChange={event => editor.chain().focus().setTextAlign(event.target.value).run()}><option value="left">{t.alignLeft}</option><option value="center">{t.alignCenter}</option><option value="right">{t.alignRight}</option><option value="justify">{t.alignJustify}</option></select>
      </div>
      <div className="rich-tool-group">
        {button('link', t.link, t.link, openLink)}
        {button('image', t.image, t.image, () => { setLinkOpen(false); setImageError(false); if (!imageOpen) { setImageForm(state.image ? editor.getAttributes('image') : { src: '', alt: '', caption: '', credit: '', creditUrl: '' }); setImagePosition(state.image ? 'replace' : 'inline'); } setImageOpen(open => !open); }, imageOpen)}
        {button('clear', t.clearFormatting, 'Tx', () => editor.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().run(), null)}
        {button('undo', t.undo, '↶', () => editor.chain().focus().undo().run(), null, !state.undo)}
        {button('redo', t.redo, '↷', () => editor.chain().focus().redo().run(), null, !state.redo)}
      </div>
    </div>
    {linkOpen && <form className="rich-link-form" onSubmit={applyLink}>
      <label htmlFor="post-link">{t.linkAddress}</label>
      <div><input ref={linkInput} id="post-link" value={url} onChange={event => { setUrl(event.target.value); setLinkError(false); }} placeholder="https://github.com/adenarevan" maxLength={2048} required disabled={disabled} aria-invalid={linkError || undefined} aria-describedby={linkError ? 'post-link-error' : undefined} onKeyDown={event => { if (event.key === 'Escape') { setLinkOpen(false); editor.commands.focus(); } }} /><button type="submit" disabled={disabled}>{t.applyLink}</button>{state.link && <button type="button" disabled={disabled} onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false); }}>{t.removeLink}</button>}<button type="button" onClick={() => { setLinkOpen(false); editor.commands.focus(); }}>{t.cancel}</button></div>
      {linkError && <p id="post-link-error" role="alert">{t.invalidLink}</p>}
    </form>}
    {imageOpen && <form className="rich-image-form" onSubmit={applyImage}>
      <fieldset disabled={disabled}><legend>{t.image}</legend><p className="editor-help">{t.imageHelp}</p>
      <ImageSearch selected={imageForm.src} onSelect={image => { setImageForm(image); setImageError(false); }} disabled={disabled} t={t} />
      <details className="image-builtins"><summary>{t.imageGallery}</summary><div className="rich-image-gallery" role="group" aria-label={t.imageGallery}>{ARTICLE_IMAGES.map(image => <button type="button" key={image.id} aria-pressed={imageForm.src === image.src} onClick={() => { setImageForm(image); setImageError(false); }}><img src={image.src} alt="" width="160" height="100" loading="lazy" /><span>{t.imageChoices[image.id] || image.label}</span></button>)}</div></details>
      {normalizeArticleImage(imageForm) && <figure className="image-selection"><img src={imageForm.src} alt={imageForm.alt} referrerPolicy="no-referrer" /><figcaption>{t.imageSelected}</figcaption></figure>}
      <label htmlFor="post-image-url">{t.imageUrl}</label><input id="post-image-url" value={imageForm.src} onChange={event => { setImageForm({ src: event.target.value, alt: '', caption: '', credit: '', creditUrl: '' }); setImageError(false); }} required maxLength={2048} placeholder="https://…" aria-invalid={imageError || undefined} aria-describedby={imageError ? 'post-image-error' : undefined} />
      <label htmlFor="post-image-alt">{t.imageAlt}</label><input id="post-image-alt" value={imageForm.alt} onChange={event => setImageForm(current => ({ ...current, alt: event.target.value }))} required maxLength={240} />
      <label htmlFor="post-image-caption">{t.imageCaption}</label><input id="post-image-caption" value={imageForm.caption} onChange={event => setImageForm(current => ({ ...current, caption: event.target.value }))} maxLength={300} />
      <div className="editor-field-pair"><div><label htmlFor="post-image-credit">{t.imageCredit}</label><input id="post-image-credit" value={imageForm.credit} onChange={event => setImageForm(current => ({ ...current, credit: event.target.value }))} maxLength={180} /></div><div><label htmlFor="post-image-source">{t.imageCreditUrl}</label><input id="post-image-source" value={imageForm.creditUrl} onChange={event => setImageForm(current => ({ ...current, creditUrl: event.target.value }))} maxLength={2048} /></div></div>
      <label htmlFor="post-image-position">{t.imagePosition}</label><select id="post-image-position" value={imagePosition} onChange={event => setImagePosition(event.target.value)}>{state.image && <option value="replace">{t.imageReplace}</option>}<option value="inline">{t.imageInline}</option><option value="cover">{t.imageCover}</option></select>
      {imageError && <p id="post-image-error" className="editor-message is-error" role="alert">{t.imageInvalid}</p>}
      <div className="rich-image-actions"><button className="blog-secondary" type="submit">{t.imageApply}</button><button type="button" className="text-link" onClick={() => setImageOpen(false)}>{t.cancel}</button></div>
      </fieldset>
    </form>}
    <EditorContent editor={editor} />
  </div>;
}
RichTextEditor.propTypes = { value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, disabled: PropTypes.bool, t: PropTypes.object.isRequired };
