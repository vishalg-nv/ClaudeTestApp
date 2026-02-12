export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="logo">RedditLite</h1>
        {user && (
          <div className="user-info">
            <span className="username">{user.username}</span>
            <button className="btn-logout" onClick={onLogout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
