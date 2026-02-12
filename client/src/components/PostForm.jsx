import { useState } from 'react';

export default function PostForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState('link');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        title,
        url: postType === 'link' ? url : '',
        body: postType === 'text' ? body : '',
      });
      setTitle('');
      setUrl('');
      setBody('');
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) {
    return (
      <div className="post-form-collapsed" onClick={() => setIsOpen(true)}>
        <input type="text" placeholder="Create a post..." readOnly />
      </div>
    );
  }

  return (
    <div className="post-form">
      <div className="post-type-tabs">
        <button
          className={`tab ${postType === 'link' ? 'active' : ''}`}
          onClick={() => setPostType('link')}
        >
          Link
        </button>
        <button
          className={`tab ${postType === 'text' ? 'active' : ''}`}
          onClick={() => setPostType('text')}
        >
          Text
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
          autoFocus
        />
        {postType === 'link' ? (
          <input
            type="url"
            placeholder="URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        ) : (
          <textarea
            placeholder="Text (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
        )}
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit" disabled={!title.trim()}>
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
