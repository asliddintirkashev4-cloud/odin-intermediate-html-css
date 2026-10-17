CREATE TABLE IF NOT EXISTS members_sessions (
 sid varchar PRIMARY KEY,
 sess json NOT NULL,
 expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS members_sessions_expire_idx ON members_sessions(expire);
CREATE TABLE IF NOT EXISTS messages_sessions (
 sid varchar PRIMARY KEY,
 sess json NOT NULL,
 expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_sessions_expire_idx ON messages_sessions(expire);
CREATE TABLE IF NOT EXISTS book_sessions (
 sid varchar PRIMARY KEY,
 sess json NOT NULL,
 expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS book_sessions_expire_idx ON book_sessions(expire);
