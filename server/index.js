import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- User routes ---

// Create or get user by username
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const trimmed = username.trim();
  if (trimmed.length > 30) {
    return res.status(400).json({ error: 'Username must be 30 characters or less' });
  }

  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(trimmed);
  if (!user) {
    const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(trimmed);
    user = { id: result.lastInsertRowid, username: trimmed };
  }
  res.json(user);
});

// --- Post routes ---

// Get all posts with vote counts and optional sorting
app.get('/api/posts', (req, res) => {
  const { sort = 'hot', user_id } = req.query;

  let orderClause;
  switch (sort) {
    case 'newest':
      orderClause = 'ORDER BY p.created_at DESC';
      break;
    case 'oldest':
      orderClause = 'ORDER BY p.created_at ASC';
      break;
    case 'top':
      orderClause = 'ORDER BY score DESC, p.created_at DESC';
      break;
    case 'controversial':
      orderClause = 'ORDER BY total_votes DESC, p.created_at DESC';
      break;
    case 'hot':
    default:
      // Hot ranking: score weighted by recency (logarithmic decay)
      orderClause = `ORDER BY (COALESCE(score, 0) / (1.0 + (julianday('now') - julianday(p.created_at)) * 2.0)) DESC, p.created_at DESC`;
      break;
  }

  const query = `
    SELECT
      p.id,
      p.title,
      p.url,
      p.body,
      p.created_at,
      u.username AS author,
      p.author_id,
      COALESCE(SUM(v.value), 0) AS score,
      COUNT(v.id) AS total_votes,
      COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
      COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0) AS downvotes
      ${user_id ? `, (SELECT value FROM votes WHERE post_id = p.id AND user_id = ${Number(user_id)}) AS user_vote` : ''}
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN votes v ON p.id = v.post_id
    GROUP BY p.id
    ${orderClause}
  `;

  const posts = db.prepare(query).all();
  res.json(posts);
});

// Create a new post
app.post('/api/posts', (req, res) => {
  const { title, url, body, author_id } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!author_id) {
    return res.status(400).json({ error: 'Author is required' });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 300) {
    return res.status(400).json({ error: 'Title must be 300 characters or less' });
  }

  const result = db.prepare(
    'INSERT INTO posts (title, url, body, author_id) VALUES (?, ?, ?, ?)'
  ).run(trimmedTitle, url || null, body || null, author_id);

  const post = db.prepare(`
    SELECT p.*, u.username AS author
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ ...post, score: 0, upvotes: 0, downvotes: 0, user_vote: null });
});

// Delete a post (only by author)
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.author_id !== user_id) {
    return res.status(403).json({ error: 'You can only delete your own posts' });
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  res.json({ success: true });
});

// --- Vote routes ---

// Vote on a post (upvote or downvote)
app.post('/api/posts/:id/vote', (req, res) => {
  const postId = req.params.id;
  const { user_id, value } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  if (value !== 1 && value !== -1 && value !== 0) {
    return res.status(400).json({ error: 'Vote value must be -1, 0, or 1' });
  }

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (value === 0) {
    // Remove vote
    db.prepare('DELETE FROM votes WHERE post_id = ? AND user_id = ?').run(postId, user_id);
  } else {
    // Upsert vote
    const existing = db.prepare(
      'SELECT id FROM votes WHERE post_id = ? AND user_id = ?'
    ).get(postId, user_id);

    if (existing) {
      db.prepare('UPDATE votes SET value = ? WHERE post_id = ? AND user_id = ?')
        .run(value, postId, user_id);
    } else {
      db.prepare('INSERT INTO votes (post_id, user_id, value) VALUES (?, ?, ?)')
        .run(postId, user_id, value);
    }
  }

  // Return updated score
  const result = db.prepare(`
    SELECT
      COALESCE(SUM(value), 0) AS score,
      COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
      COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) AS downvotes
    FROM votes WHERE post_id = ?
  `).get(postId);

  res.json({ ...result, user_vote: value === 0 ? null : value });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
