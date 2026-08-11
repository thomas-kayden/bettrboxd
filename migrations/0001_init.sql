PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(username) BETWEEN 2 AND 80),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 120),
  avatar TEXT NOT NULL DEFAULT '',
  letterboxd_username TEXT CHECK (letterboxd_username IS NULL OR length(letterboxd_username) BETWEEN 2 AND 40),
  letterboxd_last_import_at TEXT,
  letterboxd_last_import_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
, theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')), letterboxd_friends_last_sync_at TEXT, letterboxd_friends_last_sync_error TEXT, current_export_import_id TEXT);
CREATE TABLE movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
  year INTEGER CHECK (year IS NULL OR year BETWEEN 1870 AND 2200),
  director TEXT NOT NULL DEFAULT '' CHECK (length(director) <= 300),
  poster TEXT NOT NULL DEFAULT '' CHECK (length(poster) <= 2000),
  tmdb_id INTEGER UNIQUE CHECK (tmdb_id IS NULL OR tmdb_id > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
, media_type TEXT NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv')), tmdb_media_id INTEGER CHECK (tmdb_media_id IS NULL OR tmdb_media_id > 0));
CREATE TABLE import_leases (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lease_token TEXT NOT NULL UNIQUE,
  acquired_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE access_identities (
  issuer TEXT NOT NULL CHECK (length(issuer) BETWEEN 1 AND 500),
  subject TEXT NOT NULL CHECK (length(subject) BETWEEN 1 AND 500),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (issuer, subject)
);
CREATE TABLE follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'native' CHECK (source IN ('native', 'letterboxd')),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);
CREATE TABLE export_import_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archive_fingerprint TEXT NOT NULL CHECK (length(archive_fingerprint) = 64),
  state TEXT NOT NULL CHECK (state IN ('uploading', 'paused', 'complete', 'failed')),
  declared_record_count INTEGER NOT NULL CHECK (declared_record_count BETWEEN 0 AND 20000),
  uploaded_record_count INTEGER NOT NULL DEFAULT 0 CHECK (uploaded_record_count BETWEEN 0 AND declared_record_count),
  declared_raw_bytes INTEGER NOT NULL CHECK (declared_raw_bytes BETWEEN 0 AND 52428800),
  uploaded_raw_bytes INTEGER NOT NULL DEFAULT 0 CHECK (uploaded_raw_bytes BETWEEN 0 AND declared_raw_bytes),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  error TEXT,
  UNIQUE (user_id, archive_fingerprint)
);
CREATE TABLE export_import_files (
  job_id TEXT NOT NULL REFERENCES export_import_jobs(id) ON DELETE CASCADE,
  path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 500),
  declared_count INTEGER NOT NULL CHECK (declared_count BETWEEN 0 AND 20000),
  uploaded_count INTEGER NOT NULL DEFAULT 0 CHECK (uploaded_count BETWEEN 0 AND declared_count),
  PRIMARY KEY (job_id, path)
);
CREATE TABLE export_import_chunks (
  job_id TEXT NOT NULL REFERENCES export_import_jobs(id) ON DELETE CASCADE,
  chunk_fingerprint TEXT NOT NULL CHECK (length(chunk_fingerprint) = 64),
  record_count INTEGER NOT NULL CHECK (record_count BETWEEN 1 AND 40),
  estimated_writes INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (job_id, chunk_fingerprint)
);
CREATE TABLE export_records (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES export_import_jobs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL CHECK (length(fingerprint) = 64),
  file_path TEXT NOT NULL CHECK (length(file_path) BETWEEN 1 AND 500),
  category TEXT NOT NULL CHECK (category IN ('diary','watched','ratings','reviews','watchlist','lists','likes','comments','other')),
  row_index INTEGER NOT NULL CHECK (row_index > 0),
  raw_json TEXT NOT NULL CHECK (length(raw_json) BETWEEN 2 AND 64000),
  title TEXT CHECK (title IS NULL OR length(title) <= 500),
  year INTEGER CHECK (year IS NULL OR year BETWEEN 1870 AND 2200),
  letterboxd_uri TEXT CHECK (letterboxd_uri IS NULL OR length(letterboxd_uri) <= 2000),
  record_date TEXT CHECK (record_date IS NULL OR length(record_date) <= 40),
  rating REAL CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
  rewatch INTEGER CHECK (rewatch IS NULL OR rewatch IN (0, 1)),
  tags TEXT CHECK (tags IS NULL OR length(tags) <= 32000),
  record_text TEXT CHECK (record_text IS NULL OR length(record_text) <= 32000),
  list_name TEXT CHECK (list_name IS NULL OR length(list_name) <= 500),
  position INTEGER CHECK (position IS NULL OR position >= 0),
  created_at TEXT NOT NULL,
  UNIQUE (job_id, fingerprint)
);
CREATE TABLE app_write_budget (
  utc_day TEXT PRIMARY KEY,
  estimated_writes INTEGER NOT NULL CHECK (estimated_writes BETWEEN 0 AND 60000),
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "reviews" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  rating REAL NOT NULL CHECK (rating BETWEEN 0.5 AND 5 AND rating * 2 = CAST(rating * 2 AS INTEGER)),
  text TEXT NOT NULL CHECK (length(text) BETWEEN 0 AND 20000),
  spoilers INTEGER NOT NULL DEFAULT 0 CHECK (spoilers IN (0, 1)),
  watched_at TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('native', 'letterboxd')),
  external_id TEXT CHECK (external_id IS NULL OR length(external_id) BETWEEN 1 AND 200),
  external_url TEXT NOT NULL DEFAULT '' CHECK (length(external_url) <= 2000),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  text_format TEXT NOT NULL DEFAULT 'plain' CHECK (text_format IN ('plain', 'markdown'))
);
CREATE TABLE IF NOT EXISTS "review_likes" (
  review_id TEXT NOT NULL REFERENCES "reviews"(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (review_id, user_id)
);
CREATE TABLE watchlist_items (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, movie_id)
);
CREATE TABLE native_sessions (
  token_hash TEXT PRIMARY KEY CHECK (length(token_hash) = 43),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE TABLE beta_invites (
  code_hash TEXT PRIMARY KEY CHECK (length(code_hash) = 43),
  label TEXT NOT NULL DEFAULT '' CHECK (length(label) <= 120),
  created_at TEXT NOT NULL,
  expires_at TEXT,
  used_at TEXT,
  used_by TEXT REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS "native_credentials" (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(email) BETWEEN 3 AND 254),
  password_salt TEXT NOT NULL UNIQUE CHECK (length(password_salt) = 22),
  password_hash TEXT NOT NULL CHECK (length(password_hash) = 43),
  password_iterations INTEGER NOT NULL CHECK (password_iterations IN (100000, 600000)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  invite_hash TEXT REFERENCES beta_invites(code_hash)
);
DELETE FROM sqlite_sequence;
CREATE INDEX movies_title_lookup ON movies(title COLLATE NOCASE);
CREATE INDEX import_leases_expiry ON import_leases(expires_at);
CREATE INDEX access_identities_user ON access_identities(user_id);
CREATE INDEX follows_followed_recent ON follows(followed_id, created_at DESC);
CREATE INDEX follows_follower_recent ON follows(follower_id, created_at DESC);
CREATE UNIQUE INDEX users_letterboxd_identity_unique
  ON users(lower(letterboxd_username))
  WHERE letterboxd_username IS NOT NULL;
CREATE INDEX follows_follower_source ON follows(follower_id, source);
CREATE INDEX export_jobs_user_state ON export_import_jobs(user_id, state, updated_at DESC);
CREATE INDEX export_records_library ON export_records(user_id, job_id, category, record_date DESC, row_index DESC);
CREATE INDEX export_records_file ON export_records(job_id, file_path, row_index);
CREATE UNIQUE INDEX export_jobs_one_active_per_user
  ON export_import_jobs(user_id)
  WHERE state IN ('uploading', 'paused') OR (state = 'failed' AND error = 'Cancelling import');
CREATE UNIQUE INDEX movies_media_tmdb_unique
  ON movies(media_type, tmdb_media_id) WHERE tmdb_media_id IS NOT NULL;
CREATE UNIQUE INDEX movies_title_year_unique
  ON movies(media_type, lower(title), ifnull(year, -1)) WHERE tmdb_media_id IS NULL;
CREATE UNIQUE INDEX reviews_import_identity_unique
  ON reviews(user_id, source, external_id)
  WHERE external_id IS NOT NULL;
CREATE INDEX reviews_user_recent ON reviews(user_id, watched_at DESC, created_at DESC);
CREATE INDEX review_likes_user ON review_likes(user_id, created_at DESC);
CREATE INDEX watchlist_items_user_recent ON watchlist_items(user_id, created_at DESC);
CREATE INDEX watchlist_items_movie ON watchlist_items(movie_id);
CREATE INDEX native_sessions_user ON native_sessions(user_id, expires_at DESC);
CREATE INDEX native_sessions_expiry ON native_sessions(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX beta_invites_available ON beta_invites(expires_at) WHERE used_at IS NULL;
CREATE UNIQUE INDEX native_credentials_invite ON native_credentials(invite_hash) WHERE invite_hash IS NOT NULL;
CREATE TRIGGER app_write_budget_insert_guard
BEFORE INSERT ON app_write_budget WHEN NEW.estimated_writes > 40000
BEGIN SELECT RAISE(ABORT, 'APP_WRITE_BUDGET_EXCEEDED'); END;
CREATE TRIGGER app_write_budget_update_guard
BEFORE UPDATE OF estimated_writes ON app_write_budget WHEN NEW.estimated_writes > 40000
BEGIN SELECT RAISE(ABORT, 'APP_WRITE_BUDGET_EXCEEDED'); END;
