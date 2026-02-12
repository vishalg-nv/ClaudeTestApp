import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to RedditLite</h1>
        <p className="login-subtitle">Share ideas, links, and vote on what matters</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
            autoFocus
          />
          <button type="submit" disabled={!username.trim()}>
            Enter
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
