CREATE TABLE IF NOT EXISTS board_messages (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 "user" varchar(80) NOT NULL CHECK(length(trim("user"))>0),
 text varchar(2000) NOT NULL CHECK(length(trim(text))>0),
 added timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS practice_users (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 first_name varchar(80) NOT NULL,
 last_name varchar(80) NOT NULL,
 email varchar(254) NOT NULL,
 age integer CHECK(age BETWEEN 18 AND 120),
 bio varchar(200) NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS usernames (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 username varchar(80) NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name varchar(80) UNIQUE NOT NULL,
 description varchar(500) NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS inventory_items (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 category_id integer NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
 name varchar(120) NOT NULL,
 description varchar(2000) NOT NULL DEFAULT '',
 price_cents integer NOT NULL CHECK(price_cents>=0),
 stock integer NOT NULL CHECK(stock>=0)
);
