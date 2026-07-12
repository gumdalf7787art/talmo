CREATE TABLE IF NOT EXISTS reward_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  reward_type TEXT,
  amount INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
