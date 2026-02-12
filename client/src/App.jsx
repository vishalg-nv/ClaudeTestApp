import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import PostForm from './components/PostForm';
import SortBar from './components/SortBar';
import PostList from './components/PostList';
import { loginUser, fetchPosts, createPost, deletePost, voteOnPost } from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('reddit_lite_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('hot');
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts(sort, user?.id);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [sort, user?.id]);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user, loadPosts]);

  const handleLogin = async (username) => {
    const userData = await loginUser(username);
    setUser(userData);
    localStorage.setItem('reddit_lite_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setPosts([]);
    localStorage.removeItem('reddit_lite_user');
  };

  const handleCreatePost = async ({ title, url, body }) => {
    const newPost = await createPost({ title, url, body, author_id: user.id });
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleVote = async (postId, value) => {
    try {
      const result = await voteOnPost(postId, user.id, value);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, score: result.score, upvotes: result.upvotes, downvotes: result.downvotes, user_vote: result.user_vote }
            : p
        )
      );
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId, user.id);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-content">
        <PostForm onSubmit={handleCreatePost} />
        <SortBar currentSort={sort} onSortChange={handleSortChange} />
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : (
          <PostList
            posts={posts}
            user={user}
            onVote={handleVote}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
