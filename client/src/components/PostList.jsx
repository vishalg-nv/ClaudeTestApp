import PostCard from './PostCard';

export default function PostList({ posts, user, onVote, onDelete }) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          onVote={onVote}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
