-- Notes table (MongoDB "Note" collection → Aurora MySQL)
-- Arrays stored as JSON columns.

CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(512) NULL,
  description TEXT NULL,
  type VARCHAR(128) NULL,
  to_driver_ids JSON NULL,
  cc_emails JSON NULL,
  subject VARCHAR(512) NULL,
  message TEXT NULL,
  gif_url VARCHAR(2048) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
