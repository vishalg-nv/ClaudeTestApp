const API_BASE = `http://${window.location.hostname}:3001/api`;

export async function loginUser(username) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to log in');
  }
  return res.json();
}

export async function fetchPosts(sort = 'hot', userId = null) {
  const params = new URLSearchParams({ sort });
  if (userId) params.set('user_id', userId);
  const res = await fetch(`${API_BASE}/posts?${params}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function createPost({ title, url, body, author_id }) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, url, body, author_id }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create post');
  }
  return res.json();
}

export async function deletePost(postId, userId) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete post');
  }
  return res.json();
}

export async function voteOnPost(postId, userId, value) {
  const res = await fetch(`${API_BASE}/posts/${postId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, value }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to vote');
  }
  return res.json();
}
