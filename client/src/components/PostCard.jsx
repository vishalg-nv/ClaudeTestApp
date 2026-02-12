import VoteButtons from './VoteButtons';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString + 'Z').getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
}

export default function PostCard({ post, user, onVote, onDelete }) {
  const domain = post.url ? getDomain(post.url) : null;

  return (
    <div className="post-card">
      <VoteButtons
        score={post.score}
        userVote={post.user_vote ?? null}
        onVote={(value) => onVote(post.id, value)}
      />
      <div className="post-content">
        <div className="post-title-row">
          {post.url ? (
            <a href={post.url} className="post-title" target="_blank" rel="noopener noreferrer">
              {post.title}
            </a>
          ) : (
            <span className="post-title">{post.title}</span>
          )}
          {domain && <span className="post-domain">({domain})</span>}
        </div>
        {post.body && <p className="post-body">{post.body}</p>}
        <div className="post-meta">
          <span>posted by <strong>{post.author}</strong></span>
          <span>{timeAgo(post.created_at)}</span>
          {user && user.id === post.author_id && (
            <button className="btn-delete" onClick={() => onDelete(post.id)}>
              delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
