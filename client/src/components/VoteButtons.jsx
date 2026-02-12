export default function VoteButtons({ score, userVote, onVote }) {
  const handleUpvote = () => {
    onVote(userVote === 1 ? 0 : 1);
  };

  const handleDownvote = () => {
    onVote(userVote === -1 ? 0 : -1);
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`}
        onClick={handleUpvote}
        title="Upvote"
      >
        ▲
      </button>
      <span className={`vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`}>
        {score}
      </span>
      <button
        className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`}
        onClick={handleDownvote}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
