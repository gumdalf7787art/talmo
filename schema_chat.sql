CREATE TABLE chat_rooms (
  id TEXT PRIMARY KEY,
  user_id TEXT, 
  clinic_id TEXT, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (clinic_id) REFERENCES users(id)
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  sender_id TEXT,
  content TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
