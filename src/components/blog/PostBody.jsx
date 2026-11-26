import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { richDocument } from '../../lib/richText';
import { coverIndex } from '../../lib/articleReading';
import ArticleImage from './ArticleImage';

function renderNode(node, key, anchors) {
  if (node.type === 'text') return (node.marks || []).reduce((text, mark, index) => {
    const markKey = `${key}-${index}`;
    switch (mark.type) {
      case 'bold': return <strong key={markKey}>{text}</strong>;
      case 'italic': return <em key={markKey}>{text}</em>;
      case 'underline': return <u key={markKey}>{text}</u>;
      case 'strike': return <s key={markKey}>{text}</s>;
      case 'code': return <code key={markKey}>{text}</code>;
      case 'textStyle': return <span key={markKey} style={{ fontSize: mark.attrs.fontSize }}>{text}</span>;
      case 'link': return <a key={markKey} href={mark.attrs.href} target="_blank" rel="noopener noreferrer">{text}</a>;
      default: return text;
    }
  }, node.text);
  const children = (node.content || []).map((child, index) => renderNode(child, `${key}-${index}`, anchors));
  const style = node.attrs?.textAlign ? { textAlign: node.attrs.textAlign } : undefined;
  switch (node.type) {
    case 'paragraph': return <p key={key} style={style}>{children.length ? children : <br />}</p>;
    case 'heading': {
      const Heading = `h${node.attrs.level}`;
      return <Heading key={key} id={anchors ? `article-section-${key}` : undefined} data-article-heading={anchors || undefined} style={style}>{children}</Heading>;
    }
    case 'image': return <ArticleImage key={key} image={node.attrs} />;
    case 'bulletList': return <ul key={key}>{children}</ul>;
    case 'orderedList': return <ol key={key} start={node.attrs?.start}>{children}</ol>;
    case 'listItem': return <li key={key}>{children}</li>;
    case 'blockquote': return <blockquote key={key}>{children}</blockquote>;
    case 'codeBlock': return <pre key={key}><code>{children}</code></pre>;
    case 'hardBreak': return <br key={key} />;
    case 'horizontalRule': return <hr key={key} />;
    default: return children;
  }
}

// Only supported JSON nodes/attributes become React elements; raw HTML is never injected.
export default function PostBody({ body, omitCover = false, anchors = false }) {
  const document = useMemo(() => richDocument(body), [body]);
  const cover = omitCover ? coverIndex(document) : -1;
  if (document) return <div className="post-body rich-content">{(document.content || []).map((node, index) => index === cover ? null : renderNode(node, String(index), anchors))}</div>;
  return <div className="post-body">{body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}
PostBody.propTypes = { body: PropTypes.string.isRequired, omitCover: PropTypes.bool, anchors: PropTypes.bool };
