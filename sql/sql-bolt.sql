-- SQLBolt: all 18 lesson/review pages, 53 verified tasks.
-- Mutation statements target the disposable tutorial tables.

-- SQL Lesson 1 / task 1
SELECT title FROM movies;

-- SQL Lesson 1 / task 2
SELECT director FROM movies;

-- SQL Lesson 1 / task 3
SELECT title, director FROM movies;

-- SQL Lesson 1 / task 4
SELECT title, year FROM movies;

-- SQL Lesson 1 / task 5
SELECT * FROM movies;

-- SQL Lesson 2: Queries with constraints (Pt. 1) / task 1
SELECT * FROM movies WHERE id = 6;

-- SQL Lesson 2: Queries with constraints (Pt. 1) / task 2
SELECT * FROM movies WHERE year BETWEEN 2000 AND 2010;

-- SQL Lesson 2: Queries with constraints (Pt. 1) / task 3
SELECT * FROM movies WHERE year NOT BETWEEN 2000 AND 2010;

-- SQL Lesson 2: Queries with constraints (Pt. 1) / task 4
SELECT title, year FROM movies ORDER BY year LIMIT 5;

-- SQL Lesson 3: Queries with constraints (Pt. 2) / task 1
SELECT * FROM movies WHERE title LIKE 'Toy Story%';

-- SQL Lesson 3: Queries with constraints (Pt. 2) / task 2
SELECT * FROM movies WHERE director = 'John Lasseter';

-- SQL Lesson 3: Queries with constraints (Pt. 2) / task 3
SELECT title, director FROM movies WHERE director <> 'John Lasseter';

-- SQL Lesson 3: Queries with constraints (Pt. 2) / task 4
SELECT * FROM movies WHERE title LIKE 'WALL-%';

-- SQL Lesson 4: Filtering and sorting Query results / task 1
SELECT DISTINCT director FROM movies ORDER BY director;

-- SQL Lesson 4: Filtering and sorting Query results / task 2
SELECT * FROM movies ORDER BY year DESC LIMIT 4;

-- SQL Lesson 4: Filtering and sorting Query results / task 3
SELECT * FROM movies ORDER BY title LIMIT 5;

-- SQL Lesson 4: Filtering and sorting Query results / task 4
SELECT * FROM movies ORDER BY title LIMIT 5 OFFSET 5;

-- SQL Review: Simple SELECT Queries / task 1
SELECT city, population FROM north_american_cities WHERE country = 'Canada';

-- SQL Review: Simple SELECT Queries / task 2
SELECT city, latitude FROM north_american_cities WHERE country = 'United States' ORDER BY latitude DESC;

-- SQL Review: Simple SELECT Queries / task 3
SELECT city, longitude FROM north_american_cities WHERE longitude < (SELECT longitude FROM north_american_cities WHERE city = 'Chicago') ORDER BY longitude;

-- SQL Review: Simple SELECT Queries / task 4
SELECT city, population FROM north_american_cities WHERE country = 'Mexico' ORDER BY population DESC LIMIT 2;

-- SQL Review: Simple SELECT Queries / task 5
SELECT city, population FROM north_american_cities WHERE country = 'United States' ORDER BY population DESC LIMIT 2 OFFSET 2;

-- SQL Lesson 6: Multi-table queries with JOINs / task 1
SELECT title, domestic_sales, international_sales FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id;

-- SQL Lesson 6: Multi-table queries with JOINs / task 2
SELECT title, domestic_sales, international_sales FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id WHERE international_sales > domestic_sales;

-- SQL Lesson 6: Multi-table queries with JOINs / task 3
SELECT title, rating FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id ORDER BY rating DESC;

-- SQL Lesson 7: OUTER JOINs / task 1
SELECT DISTINCT building FROM employees;

-- SQL Lesson 7: OUTER JOINs / task 2
SELECT building_name, capacity FROM buildings;

-- SQL Lesson 7: OUTER JOINs / task 3
SELECT DISTINCT building_name, role FROM buildings LEFT JOIN employees ON buildings.building_name = employees.building;

-- SQL Lesson 8: A short note on NULLs / task 1
SELECT name, role FROM employees WHERE building IS NULL;

-- SQL Lesson 8: A short note on NULLs / task 2
SELECT building_name FROM buildings LEFT JOIN employees ON buildings.building_name = employees.building WHERE employees.name IS NULL;

-- SQL Lesson 9: Queries with expressions / task 1
SELECT title, (domestic_sales + international_sales)/1000000.0 AS sales_millions FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id;

-- SQL Lesson 9: Queries with expressions / task 2
SELECT title, rating*10 AS rating_percent FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id;

-- SQL Lesson 9: Queries with expressions / task 3
SELECT title, year FROM movies WHERE year % 2 = 0;

-- SQL Lesson 10: Queries with aggregates (Pt. 1) / task 1
SELECT MAX(years_employed) FROM employees;

-- SQL Lesson 10: Queries with aggregates (Pt. 1) / task 2
SELECT role, AVG(years_employed) FROM employees GROUP BY role;

-- SQL Lesson 10: Queries with aggregates (Pt. 1) / task 3
SELECT building, SUM(years_employed) FROM employees GROUP BY building;

-- SQL Lesson 11: Queries with aggregates (Pt. 2) / task 1
SELECT COUNT(*) FROM employees WHERE role = 'Artist';

-- SQL Lesson 11: Queries with aggregates (Pt. 2) / task 2
SELECT role, COUNT(*) FROM employees GROUP BY role;

-- SQL Lesson 11: Queries with aggregates (Pt. 2) / task 3
SELECT SUM(years_employed) FROM employees WHERE role = 'Engineer';

-- SQL Lesson 12: Order of execution of a Query / task 1
SELECT director, COUNT(*) FROM movies GROUP BY director;

-- SQL Lesson 12: Order of execution of a Query / task 2
SELECT director, SUM(domestic_sales + international_sales) FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id GROUP BY director;

-- SQL Lesson 13: Inserting rows / task 1
INSERT INTO movies (title,director,year,length_minutes) VALUES ('Toy Story 4','Josh Cooley',2019,100);

-- SQL Lesson 13: Inserting rows / task 2
INSERT INTO boxoffice (movie_id,rating,domestic_sales,international_sales) VALUES (15,8.7,340000000,270000000);

-- SQL Lesson 14: Updating rows / task 1
UPDATE movies SET director = 'John Lasseter' WHERE title = 'A Bug''s Life';

-- SQL Lesson 14: Updating rows / task 2
UPDATE movies SET year = 1999 WHERE title = 'Toy Story 2';

-- SQL Lesson 14: Updating rows / task 3
UPDATE movies SET title = 'Toy Story 3', director = 'Lee Unkrich' WHERE title = 'Toy Story 8';

-- SQL Lesson 15: Deleting rows / task 1
DELETE FROM movies WHERE year < 2005;

-- SQL Lesson 15: Deleting rows / task 2
DELETE FROM movies WHERE director = 'Andrew Stanton';

-- SQL Lesson 16: Creating tables / task 1
CREATE TABLE Database (Name TEXT, Version FLOAT, Download_count INTEGER);

-- SQL Lesson 17: Altering tables / task 1
ALTER TABLE movies ADD COLUMN Aspect_ratio FLOAT;

-- SQL Lesson 17: Altering tables / task 2
ALTER TABLE movies ADD COLUMN Language TEXT DEFAULT 'English';

-- SQL Lesson 18: Dropping tables / task 1
DROP TABLE movies;

-- SQL Lesson 18: Dropping tables / task 2
DROP TABLE boxoffice;

