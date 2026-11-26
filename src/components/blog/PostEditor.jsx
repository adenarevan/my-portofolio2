import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/useLanguage';
import { POST_LIMITS, readingMinutes, removePost, savePost } from '../../lib/blog';
import { blogCopy } from './blogCopy';
import PostBody from './PostBody';
import RichTextEditor from './RichTextEditor';
import { bodyText, safeLink } from '../../lib/richText';

const fields = post => ({ title: post?.title || '', tag: post?.tag || '', excerpt: post?.excerpt || '', body: post?.body || '', slug: post?.slug || '', metaDescription: post?.metaDescription || '' });

export default function PostEditor({ initialPost, user, onDirty, onSaved, onDeleted }) {
  const { language } = useLanguage();
  const t = blogCopy[language];
  const [post, setPost] = useState(initialPost);
  const [form, setForm] = useState(() => fields(initialPost));
  const [baseline, setBaseline] = useState(() => JSON.stringify(fields(initialPost)));
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const dirty = JSON.stringify(form) !== baseline;
  function update(event) {
    updateField(event.target.name, event.target.value);
  }
  function updateField(name, value) {
    const next = { ...form, [name]: value };
    onDirty(JSON.stringify(next) !== baseline);
    setForm(next); setMessage('');
  }
  function showError(error) {
    const messages = { 'blog/offline': t.offline, 'blog/invalid': t.invalid, 'blog/invalid-slug': t.invalidSlug, 'blog/too-long': t.tooLong, 'blog/conflict': t.conflict, 'blog/deleted': t.missing, 'permission-denied': t.accessLost };
    setFailed(true); setMessage(messages[error.code || error.message] || t.saveFailed);
  }
  async function save(status) {
    if (!form.title.trim() || !bodyText(form.body).trim()) { setFailed(true); setMessage(t.invalid); return; }
    if (post?.status === 'published' && status === 'draft' && !window.confirm(`${t.unpublishConfirm}\n${post.title}`)) return;
    setBusy('save'); setMessage(''); setFailed(false);
    onDirty(true);
    let succeeded = false;
    try {
      const saved = await savePost(form, user, status, post);
      setPost(saved); setForm(fields(saved)); setBaseline(JSON.stringify(fields(saved)));
      succeeded = true; onDirty(false); onSaved(saved);
      setMessage(status === 'draft' ? t.savedDraft : post?.status === 'published' ? t.savedChanges : t.savedPublished);
    } catch (error) { showError(error); }
    finally { setBusy(''); if (!succeeded) onDirty(dirty); }
  }
  async function remove() {
    if (!window.confirm(`${t.deleteConfirm}\n${post.title}`)) return;
    setBusy('delete'); setMessage(''); setFailed(false);
    onDirty(true);
    try { await removePost(post); onDirty(false); onDeleted(); }
    catch (error) { showError(error); setBusy(''); onDirty(dirty); }
  }
  return <section className="post-editor" aria-label={t.admin}>
    <div className="editor-toolbar"><div className="editor-tabs" aria-label={t.preview}><button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}>{t.edit}</button><button type="button" aria-pressed={preview} onClick={() => setPreview(true)}>{t.preview}</button></div><span className="editor-save-state" aria-live="polite">{busy ? t.saving : dirty ? t.unsaved : post ? t.saved : t.draft}</span></div>
    <div className="editor-save-actions"><button className="blog-primary" disabled={Boolean(busy)} onClick={() => save('published')}>{busy === 'save' ? t.saving : post?.status === 'published' ? t.saveChanges : t.publish}</button><button className="blog-secondary" disabled={Boolean(busy)} onClick={() => save('draft')}>{post?.status === 'published' ? t.unpublish : t.saveDraft}</button>{post?.status === 'published' && <Link className="text-link" to={`/blog/${post.id}`}>{t.viewPost}</Link>}</div>
    {preview ? <div className="editor-preview"><h2>{form.title || t.postTitlePlaceholder}</h2>{form.excerpt && <p className="article-excerpt">{form.excerpt}</p>}{form.body.trim() ? <PostBody body={form.body} /> : <p>{t.previewEmpty}</p>}</div> : <div className="editor-form">
      <label htmlFor="post-title">{t.postTitle}</label><input id="post-title" name="title" value={form.title} onChange={update} maxLength={POST_LIMITS.title} placeholder={t.postTitlePlaceholder} disabled={Boolean(busy)} />
      <div className="editor-field-pair"><div><label htmlFor="post-tag">{t.tag} <span>({t.optional})</span></label><input id="post-tag" name="tag" value={form.tag} onChange={update} maxLength={POST_LIMITS.tag} placeholder={t.tagPlaceholder} disabled={Boolean(busy)} /></div><div><label htmlFor="post-excerpt">{t.excerpt} <span>({t.optional})</span></label><textarea id="post-excerpt" name="excerpt" value={form.excerpt} onChange={update} maxLength={POST_LIMITS.excerpt} rows={2} placeholder={t.excerptPlaceholder} disabled={Boolean(busy)} /></div></div>
      <details className="editor-seo"><summary>{t.seo}</summary><label htmlFor="post-slug">Slug</label><input id="post-slug" name="slug" value={form.slug} onChange={update} maxLength={POST_LIMITS.slug} placeholder="catatan-pengembangan-web" disabled={Boolean(busy)} /><label htmlFor="post-metaDescription">{t.metaDescription}</label><textarea id="post-metaDescription" name="metaDescription" value={form.metaDescription} onChange={update} maxLength={POST_LIMITS.metaDescription} rows={2} disabled={Boolean(busy)} /></details>
      <label id="post-body-label" htmlFor="post-body">{t.body}</label><RichTextEditor value={form.body} onChange={value => updateField('body', value)} disabled={Boolean(busy)} t={t} /><div className="editor-body-help"><p id="body-help">{t.bodyHelp}</p><p>{bodyText(form.body).length.toLocaleString(language)} {t.chars} · {readingMinutes(form.body)} {t.minutes}</p></div>
    </div>}
    {message && <p className={failed ? 'editor-message is-error' : 'editor-message'} role={failed ? 'alert' : 'status'}>{message}</p>}
    {post?.bot && <details className="editor-provenance"><summary>{t.botSources}</summary><p>{post.bot.selectionReason}</p><ul>{(Array.isArray(post.sources) ? post.sources : []).filter(source => safeLink(source.url)).map(source => <li key={source.url}><a className="text-link" href={safeLink(source.url)} target="_blank" rel="noopener noreferrer">{source.publisher}: {source.title}</a></li>)}</ul><p>{t.botReview}</p></details>}
    {post && <div className="editor-delete"><button className="text-link" disabled={Boolean(busy)} onClick={remove}>{busy === 'delete' ? t.deleting : t.delete}</button></div>}
  </section>;
}
PostEditor.propTypes = { initialPost: PropTypes.object, user: PropTypes.object.isRequired, onDirty: PropTypes.func.isRequired, onSaved: PropTypes.func.isRequired, onDeleted: PropTypes.func.isRequired };
