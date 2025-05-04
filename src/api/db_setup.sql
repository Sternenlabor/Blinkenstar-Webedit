
-- =============================
-- 1. Create Users Table
-- =============================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================
-- 2. Create Animations Table
-- =============================
CREATE TABLE IF NOT EXISTS animations (
    id CHAR(36) PRIMARY KEY, 
    user_id INT NOT NULL,
    name VARCHAR(255) DEFAULT '',
    type VARCHAR(50) NOT NULL,
    text TEXT,
    frames_data TEXT, -- JSON (or TEXT) containing frame columns data
    speed INT NOT NULL DEFAULT 13,
    delay DECIMAL(4,2) NOT NULL DEFAULT 0,
    `repeat` INT NOT NULL DEFAULT 0,
    direction TINYINT(1) NOT NULL DEFAULT 0,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reviewed_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================
-- 3. Create Public Gallery Table
-- =============================
CREATE TABLE IF NOT EXISTS public_gallery (
    id CHAR(36) PRIMARY KEY, -- or you can use AUTO_INCREMENT if you prefer numeric IDs
    original_id CHAR(36) NOT NULL,
    author_id INT NOT NULL,
    name VARCHAR(255) DEFAULT '',
    type VARCHAR(50) NOT NULL,
    text TEXT,
    frames_data TEXT, -- JSON or TEXT
    speed INT NOT NULL DEFAULT 13,
    delay DECIMAL(4,2) NOT NULL DEFAULT 0,
    `repeat` INT NOT NULL DEFAULT 0,
    direction TINYINT(1) NOT NULL DEFAULT 0,
    published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    -- Optionally: you may want to add a foreign key constraint from original_id
    -- to animations(id) if you plan on ensuring consistency.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================
-- 4. Indexes and Additional Constraints (optional)
-- =============================
-- Create an index for faster lookups of animations by user_id:
CREATE INDEX idx_animations_user_id ON animations(user_id);

-- Create an index for faster lookups in public_gallery by author_id:
CREATE INDEX idx_public_gallery_author_id ON public_gallery(author_id);
