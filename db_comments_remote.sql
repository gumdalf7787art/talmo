CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  user_id TEXT,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
