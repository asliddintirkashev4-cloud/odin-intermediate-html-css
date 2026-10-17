-- 0 SELECT basics / 1
SELECT population FROM world WHERE name='Germany';

-- 0 SELECT basics / 2
SELECT name,population FROM world WHERE name IN ('Sweden','Norway','Denmark');

-- 0 SELECT basics / 3
SELECT name,area FROM world WHERE area BETWEEN 200000 AND 250000;

-- 1 SELECT name / 1
SELECT name FROM world WHERE name LIKE 'Y%';

-- 1 SELECT name / 2
SELECT name FROM world WHERE name LIKE '%y';

-- 1 SELECT name / 3
SELECT name FROM world WHERE name LIKE '%x%';

-- 1 SELECT name / 4
SELECT name FROM world WHERE name LIKE '%land';

-- 1 SELECT name / 5
SELECT name FROM world WHERE name LIKE 'C%ia';

-- 1 SELECT name / 6
SELECT name FROM world WHERE name LIKE '%oo%';

-- 1 SELECT name / 7
SELECT name FROM world WHERE name LIKE '%a%a%a%';

-- 1 SELECT name / 8
SELECT name FROM world WHERE name LIKE '_t%' ORDER BY name;

-- 1 SELECT name / 9
SELECT name FROM world WHERE name LIKE '%o__o%';

-- 1 SELECT name / 10
SELECT name FROM world WHERE name LIKE '____';

-- 1 SELECT name / 11
SELECT name FROM world WHERE capital=name;

-- 1 SELECT name / 12
SELECT name FROM world WHERE capital=CONCAT(name,' City');

-- 1 SELECT name / 13
SELECT capital,name FROM world WHERE capital LIKE CONCAT('%',name,'%');

-- 1 SELECT name / 14
SELECT capital,name FROM world WHERE capital LIKE CONCAT(name,'%') AND capital<>name;

-- 1 SELECT name / 15
SELECT name,REPLACE(capital,name,'') FROM world WHERE capital LIKE CONCAT(name,'%') AND capital<>name;

-- 2 SELECT from World / 1
SELECT name,continent,population FROM world;

-- 2 SELECT from World / 2
SELECT name FROM world WHERE population>=200000000;

-- 2 SELECT from World / 3
SELECT name,gdp/population FROM world WHERE population>=200000000;

-- 2 SELECT from World / 4
SELECT name,population/1000000 FROM world WHERE continent='South America';

-- 2 SELECT from World / 5
SELECT name,population FROM world WHERE name IN ('France','Germany','Italy');

-- 2 SELECT from World / 6
SELECT name FROM world WHERE name LIKE '%United%';

-- 2 SELECT from World / 7
SELECT name,population,area FROM world WHERE area>3000000 OR population>250000000;

-- 2 SELECT from World / 8
SELECT name,population,area FROM world WHERE (area>3000000) XOR (population>250000000);

-- 2 SELECT from World / 9
SELECT name,ROUND(population/1000000,2),ROUND(gdp/1000000000,2) FROM world WHERE continent='South America';

-- 2 SELECT from World / 10
SELECT name,ROUND(gdp/population,-3) FROM world WHERE gdp>=1000000000000;

-- 2 SELECT from World / 11
SELECT name,capital FROM world WHERE LENGTH(name)=LENGTH(capital);

-- 2 SELECT from World / 12
SELECT name,capital FROM world WHERE LEFT(name,1)=LEFT(capital,1) AND name<>capital;

-- 2 SELECT from World / 13
SELECT name FROM world WHERE name LIKE '%a%' AND name LIKE '%e%' AND name LIKE '%i%' AND name LIKE '%o%' AND name LIKE '%u%' AND name NOT LIKE '% %';

-- 3 SELECT from Nobel / 1
SELECT yr,subject,winner FROM nobel WHERE yr=1950;

-- 3 SELECT from Nobel / 2
SELECT winner FROM nobel WHERE yr=1962 AND subject='Literature';

-- 3 SELECT from Nobel / 3
SELECT yr,subject FROM nobel WHERE winner='Albert Einstein';

-- 3 SELECT from Nobel / 4
SELECT winner FROM nobel WHERE subject='Peace' AND yr>=2000;

-- 3 SELECT from Nobel / 5
SELECT yr,subject,winner FROM nobel WHERE subject='Literature' AND yr BETWEEN 1980 AND 1989;

-- 3 SELECT from Nobel / 6
SELECT yr,subject,winner FROM nobel WHERE winner IN ('Theodore Roosevelt','Thomas Woodrow Wilson','Jimmy Carter','Barack Obama');

-- 3 SELECT from Nobel / 7
SELECT winner FROM nobel WHERE winner LIKE 'John %';

-- 3 SELECT from Nobel / 8
SELECT yr,subject,winner FROM nobel WHERE (yr=1980 AND subject='Physics') OR (yr=1984 AND subject='Chemistry');

-- 3 SELECT from Nobel / 9
SELECT yr,subject,winner FROM nobel WHERE yr=1980 AND subject NOT IN ('Chemistry','Medicine');

-- 3 SELECT from Nobel / 10
SELECT yr,subject,winner FROM nobel WHERE (subject='Medicine' AND yr<1910) OR (subject='Literature' AND yr>=2004);

-- 3 SELECT from Nobel / 11
SELECT yr,subject,winner FROM nobel WHERE winner='PETER GRÜNBERG';

-- 3 SELECT from Nobel / 12
SELECT yr,subject,winner FROM nobel WHERE winner='EUGENE O''NEILL';

-- 3 SELECT from Nobel / 13
SELECT winner,yr,subject FROM nobel WHERE winner LIKE 'Sir%' ORDER BY yr DESC,winner;

-- 3 SELECT from Nobel / 14
SELECT winner,subject FROM nobel WHERE yr=1984 ORDER BY subject IN ('Chemistry','Physics'),subject,winner;

-- 4 SELECT within SELECT / 1
SELECT name FROM world WHERE population>(SELECT population FROM world WHERE name='Russia');

-- 4 SELECT within SELECT / 2
SELECT name FROM world WHERE continent='Europe' AND gdp/population>(SELECT gdp/population FROM world WHERE name='United Kingdom');

-- 4 SELECT within SELECT / 3
SELECT name,continent FROM world WHERE continent IN (SELECT continent FROM world WHERE name IN ('Argentina','Australia')) ORDER BY name;

-- 4 SELECT within SELECT / 4
SELECT name,population FROM world WHERE population>(SELECT population FROM world WHERE name='United Kingdom') AND population<(SELECT population FROM world WHERE name='Germany');

-- 4 SELECT within SELECT / 5
SELECT name,CONCAT(ROUND(100*population/(SELECT population FROM world WHERE name='Germany'),0),'%') FROM world WHERE continent='Europe';

-- 4 SELECT within SELECT / 6
SELECT name FROM world WHERE gdp>ALL(SELECT gdp FROM world WHERE continent='Europe' AND gdp IS NOT NULL);

-- 4 SELECT within SELECT / 7
SELECT continent,name,area FROM world x WHERE area>=ALL(SELECT area FROM world y WHERE y.continent=x.continent);

-- 4 SELECT within SELECT / 8
SELECT continent,name FROM world x WHERE name<=ALL(SELECT name FROM world y WHERE y.continent=x.continent);

-- 4 SELECT within SELECT / 9
SELECT name,continent,population FROM world x WHERE NOT EXISTS(SELECT 1 FROM world y WHERE y.continent=x.continent AND y.population>25000000);

-- 4 SELECT within SELECT / 10
SELECT name,continent FROM world x WHERE population>ALL(SELECT 3*population FROM world y WHERE y.continent=x.continent AND y.name<>x.name);

-- 5 SUM and COUNT / 1
SELECT SUM(population) FROM world;

-- 5 SUM and COUNT / 2
SELECT DISTINCT continent FROM world;

-- 5 SUM and COUNT / 3
SELECT SUM(gdp) FROM world WHERE continent='Africa';

-- 5 SUM and COUNT / 4
SELECT COUNT(*) FROM world WHERE area>=1000000;

-- 5 SUM and COUNT / 5
SELECT SUM(population) FROM world WHERE name IN ('Estonia','Latvia','Lithuania');

-- 5 SUM and COUNT / 6
SELECT continent,COUNT(*) FROM world GROUP BY continent;

-- 5 SUM and COUNT / 7
SELECT continent,COUNT(*) FROM world WHERE population>=10000000 GROUP BY continent;

-- 5 SUM and COUNT / 8
SELECT continent FROM world GROUP BY continent HAVING SUM(population)>=100000000;

-- 6 JOIN / 1
SELECT game,team,player,gtime FROM goal WHERE player='Leandro Trossard';

-- 6 JOIN / 2
SELECT id,teamname,coach FROM team WHERE id='BEL';

-- 6 JOIN / 3
SELECT player,gtime,teamname FROM goal JOIN team ON goal.team=team.id WHERE gtime<8;

-- 6 JOIN / 4
SELECT player,teamname,coach FROM goal JOIN team ON goal.team=team.id WHERE coach LIKE 'Sébastien%';

-- 6 JOIN / 5
SELECT player,game.id,city FROM goal JOIN game ON goal.game=game.id WHERE player='Harry Edward Kane';

-- 6 JOIN / 6
SELECT player,team FROM goal JOIN game ON goal.game=game.id WHERE city='Vancouver';

-- 6 JOIN / 7
SELECT player,teamname FROM goal JOIN game ON goal.game=game.id JOIN team ON goal.team=team.id WHERE city='Vancouver';

-- 6 JOIN / 8
SELECT city,teamname FROM game JOIN team ON team.id=game.team1 OR team.id=game.team2 WHERE played='2026-07-01';

-- 6 JOIN / 9
SELECT teamname,player FROM goal JOIN game ON goal.game=game.id JOIN team ON goal.team=team.id WHERE played='2026-07-02';

-- 6 JOIN / 10
SELECT played,player,pos FROM goal JOIN game ON goal.game=game.id JOIN player ON goal.player=player.playername WHERE city='Mexico City';

-- 6 JOIN / 11
SELECT player,teamname FROM goal JOIN player ON goal.player=player.playername JOIN team ON player.team=team.id WHERE pos='DEF';

-- 6 JOIN / 12
SELECT player,pos,teamname,city FROM goal JOIN player ON goal.player=player.playername JOIN team ON player.team=team.id JOIN game ON goal.game=game.id WHERE gtime BETWEEN 91 AND 120;

-- 7 More JOIN operations / 1
SELECT id,title FROM movie WHERE yr=1962 AND budget>2000000;

-- 7 More JOIN operations / 2
SELECT yr FROM movie WHERE title='Citizen Kane';

-- 7 More JOIN operations / 3
SELECT id,title,yr FROM movie WHERE title LIKE 'Star Trek%' ORDER BY yr;

-- 7 More JOIN operations / 4
SELECT id FROM actor WHERE name='Glenn Close';

-- 7 More JOIN operations / 5
SELECT id FROM movie WHERE title='Casablanca' AND yr=1942;

-- 7 More JOIN operations / 6
SELECT name FROM actor JOIN casting ON actor.id=casting.actorid JOIN movie ON casting.movieid=movie.id WHERE title='Casablanca' AND yr=1942;

-- 7 More JOIN operations / 7
SELECT name FROM actor JOIN casting ON actor.id=casting.actorid JOIN movie ON casting.movieid=movie.id WHERE title='Alien';

-- 7 More JOIN operations / 8
SELECT title FROM movie JOIN casting ON movie.id=casting.movieid JOIN actor ON casting.actorid=actor.id WHERE name='Harrison Ford';

-- 7 More JOIN operations / 9
SELECT title FROM movie JOIN casting ON movie.id=casting.movieid JOIN actor ON casting.actorid=actor.id WHERE name='Harrison Ford' AND ord<>1;

-- 7 More JOIN operations / 10
SELECT title,name FROM movie JOIN casting ON movie.id=casting.movieid JOIN actor ON casting.actorid=actor.id WHERE yr=1962 AND ord=1;

-- 7 More JOIN operations / 11
SELECT yr,COUNT(*) FROM movie JOIN casting ON movie.id=casting.movieid JOIN actor ON actor.id=casting.actorid WHERE name='Rock Hudson' GROUP BY yr HAVING COUNT(*)>2;

-- 7 More JOIN operations / 12
SELECT title,name FROM movie JOIN casting ON movie.id=casting.movieid JOIN actor ON actor.id=casting.actorid WHERE ord=1 AND movie.id IN (SELECT movieid FROM casting JOIN actor ON actor.id=casting.actorid WHERE name='Julie Andrews');

-- 7 More JOIN operations / 13
SELECT name FROM actor JOIN casting ON actor.id=casting.actorid WHERE ord=1 GROUP BY actor.id,name HAVING COUNT(*)>=15 ORDER BY name;

-- 7 More JOIN operations / 14
SELECT title,COUNT(*) FROM movie JOIN casting ON movie.id=casting.movieid WHERE yr=1978 GROUP BY movie.id,title ORDER BY COUNT(*) DESC,title;

-- 7 More JOIN operations / 15
SELECT DISTINCT name FROM actor JOIN casting ON actor.id=casting.actorid WHERE movieid IN (SELECT movieid FROM casting JOIN actor ON actor.id=casting.actorid WHERE name='Art Garfunkel') AND name<>'Art Garfunkel';

-- 8 Using Null / 1
SELECT name FROM teacher WHERE dept IS NULL;

-- 8 Using Null / 2
SELECT teacher.name,dept.name FROM teacher INNER JOIN dept ON teacher.dept=dept.id;

-- 8 Using Null / 3
SELECT teacher.name,dept.name FROM teacher LEFT JOIN dept ON teacher.dept=dept.id;

-- 8 Using Null / 4
SELECT teacher.name,dept.name FROM teacher RIGHT JOIN dept ON teacher.dept=dept.id;

-- 8 Using Null / 5
SELECT name,COALESCE(mobile,'07986 444 2266') FROM teacher;

-- 8 Using Null / 6
SELECT teacher.name,COALESCE(dept.name,'None') FROM teacher LEFT JOIN dept ON teacher.dept=dept.id;

-- 8 Using Null / 7
SELECT COUNT(*),COUNT(mobile) FROM teacher;

-- 8 Using Null / 8
SELECT dept.name,COUNT(teacher.id) FROM teacher RIGHT JOIN dept ON teacher.dept=dept.id GROUP BY dept.name;

-- 8 Using Null / 9
SELECT name,CASE WHEN dept IN (1,2) THEN 'Sci' ELSE 'Art' END FROM teacher;

-- 8 Using Null / 10
SELECT name,CASE WHEN dept IN (1,2) THEN 'Sci' WHEN dept=3 THEN 'Art' ELSE 'None' END FROM teacher;

-- 8+ Numeric Examples / 1
SELECT A_STRONGLY_AGREE FROM nss WHERE question='Q01' AND institution='Edinburgh Napier University' AND subject='(8) Computer Science';

-- 8+ Numeric Examples / 2
SELECT institution,subject FROM nss WHERE score>=100 AND question='Q15';

-- 8+ Numeric Examples / 3
SELECT institution,score FROM nss WHERE subject='(8) Computer Science' AND score<50 AND question='Q15';

-- 8+ Numeric Examples / 4
SELECT subject,SUM(response) FROM nss WHERE question='Q22' AND subject IN ('(8) Computer Science','(H) Creative Arts and Design') GROUP BY subject;

-- 8+ Numeric Examples / 5
SELECT subject,SUM(A_STRONGLY_AGREE*response/100) FROM nss WHERE question='Q22' AND subject IN ('(8) Computer Science','(H) Creative Arts and Design') GROUP BY subject;

-- 8+ Numeric Examples / 6
SELECT subject,ROUND(SUM(A_STRONGLY_AGREE*response)/SUM(response),0) FROM nss WHERE question='Q22' AND subject IN ('(8) Computer Science','(H) Creative Arts and Design') GROUP BY subject;

-- 8+ Numeric Examples / 7
SELECT institution,ROUND(SUM(score*response)/SUM(response),0) FROM nss WHERE question='Q22' AND institution LIKE '%Manchester%' GROUP BY institution;

-- 8+ Numeric Examples / 8
SELECT institution,SUM(sample),SUM(CASE WHEN subject='(8) Computer Science' THEN sample ELSE 0 END) FROM nss WHERE question='Q01' AND institution LIKE '%Manchester%' GROUP BY institution;

-- 9- Window function / 1
SELECT lastName,party,votes FROM ge WHERE constituency='S14000024' AND yr=2017 ORDER BY votes DESC;

-- 9- Window function / 2
SELECT party,votes,RANK() OVER(ORDER BY votes DESC) FROM ge WHERE constituency='S14000024' AND yr=2017 ORDER BY party;

-- 9- Window function / 3
SELECT yr,party,votes,RANK() OVER(PARTITION BY yr ORDER BY votes DESC) FROM ge WHERE constituency='S14000021' ORDER BY party,yr;

-- 9- Window function / 4
SELECT constituency,party,votes,RANK() OVER(PARTITION BY constituency ORDER BY votes DESC) AS posn FROM ge WHERE constituency BETWEEN 'S14000021' AND 'S14000026' AND yr=2017 ORDER BY posn,constituency;

-- 9- Window function / 5
SELECT constituency,party FROM (SELECT constituency,party,RANK() OVER(PARTITION BY constituency ORDER BY votes DESC) AS posn FROM ge WHERE constituency BETWEEN 'S14000021' AND 'S14000026' AND yr=2017) ranked WHERE posn=1;

-- 9- Window function / 6
SELECT party,COUNT(*) FROM (SELECT party,RANK() OVER(PARTITION BY constituency ORDER BY votes DESC) AS posn FROM ge WHERE constituency LIKE 'S%' AND yr=2017) ranked WHERE posn=1 GROUP BY party;

-- 9+ COVID 19 / 1
SELECT name,DAY(whn),confirmed,deaths,recovered FROM covid WHERE name='Spain' AND MONTH(whn)=3 AND YEAR(whn)=2020 ORDER BY whn;

-- 9+ COVID 19 / 2
SELECT name,DAY(whn),confirmed,LAG(confirmed,1) OVER(PARTITION BY name ORDER BY whn) FROM covid WHERE name='Italy' AND MONTH(whn)=3 AND YEAR(whn)=2020 ORDER BY whn;

-- 9+ COVID 19 / 3
SELECT name,DAY(whn),confirmed-LAG(confirmed,1) OVER(PARTITION BY name ORDER BY whn) FROM covid WHERE name='Italy' AND MONTH(whn)=3 AND YEAR(whn)=2020 ORDER BY whn;

-- 9+ COVID 19 / 4
SELECT name,DATE_FORMAT(whn,'%Y-%m-%d'),confirmed-LAG(confirmed,1) OVER(PARTITION BY name ORDER BY whn) FROM covid WHERE name='Italy' AND WEEKDAY(whn)=0 AND YEAR(whn)=2020 ORDER BY whn;

-- 9+ COVID 19 / 5
SELECT tw.name,DATE_FORMAT(tw.whn,'%Y-%m-%d'),tw.confirmed-lw.confirmed FROM covid tw LEFT JOIN covid lw ON DATE_ADD(lw.whn,INTERVAL 1 WEEK)=tw.whn AND tw.name=lw.name WHERE tw.name='Italy' AND WEEKDAY(tw.whn)=0 ORDER BY tw.whn;

-- 9+ COVID 19 / 6
SELECT name,confirmed,RANK() OVER(ORDER BY confirmed DESC),deaths,RANK() OVER(ORDER BY deaths DESC) FROM covid WHERE whn='2020-04-20' ORDER BY confirmed DESC;

-- 9+ COVID 19 / 7
SELECT world.name,ROUND(100000*confirmed/population,2),RANK() OVER(ORDER BY 100000*confirmed/population) FROM covid JOIN world ON covid.name=world.name WHERE whn='2020-04-20' AND population>=10000000 ORDER BY population DESC;

-- 9+ COVID 19 / 8
WITH daily AS (SELECT name,whn,confirmed-LAG(confirmed) OVER(PARTITION BY name ORDER BY whn) AS new_cases FROM covid), peaks AS (SELECT name,whn,new_cases,RANK() OVER(PARTITION BY name ORDER BY new_cases DESC) AS posn FROM daily) SELECT name,DATE_FORMAT(whn,'%Y-%m-%d'),new_cases FROM peaks WHERE posn=1 AND new_cases>=20000 ORDER BY name;

-- 9 Self join / 1
SELECT COUNT(*) FROM stops;

-- 9 Self join / 2
SELECT id FROM stops WHERE name='Craiglockhart';

-- 9 Self join / 3
SELECT stops.id,stops.name FROM stops JOIN route ON stops.id=route.stop WHERE num='4' AND company='LRT';

-- 9 Self join / 4
SELECT company,num,COUNT(*) FROM route WHERE stop=149 OR stop=53 GROUP BY company,num HAVING COUNT(*)=2;

-- 9 Self join / 5
SELECT a.company,a.num,a.stop,b.stop FROM route a JOIN route b ON a.company=b.company AND a.num=b.num WHERE a.stop=53 AND b.stop=149;

-- 9 Self join / 6
SELECT a.company,a.num,stopa.name,stopb.name FROM route a JOIN route b ON a.company=b.company AND a.num=b.num JOIN stops stopa ON a.stop=stopa.id JOIN stops stopb ON b.stop=stopb.id WHERE stopa.name='Craiglockhart' AND stopb.name='London Road';

-- 9 Self join / 7
SELECT DISTINCT a.company,a.num FROM route a JOIN route b ON a.company=b.company AND a.num=b.num WHERE a.stop=115 AND b.stop=137;

-- 9 Self join / 8
SELECT DISTINCT a.company,a.num FROM route a JOIN route b ON a.company=b.company AND a.num=b.num JOIN stops x ON a.stop=x.id JOIN stops y ON b.stop=y.id WHERE x.name='Craiglockhart' AND y.name='Tollcross';

-- 9 Self join / 9
SELECT DISTINCT y.name,a.company,a.num FROM route a JOIN route b ON a.company=b.company AND a.num=b.num JOIN stops x ON a.stop=x.id JOIN stops y ON b.stop=y.id WHERE x.name='Craiglockhart' AND a.company='LRT';

-- 9 Self join / 10
SELECT DISTINCT a.num,a.company,transfer.name,c.num,c.company FROM route a JOIN route b ON a.num=b.num AND a.company=b.company JOIN route c ON b.stop=c.stop JOIN route d ON c.num=d.num AND c.company=d.company JOIN stops start ON a.stop=start.id JOIN stops transfer ON b.stop=transfer.id JOIN stops finish ON d.stop=finish.id WHERE start.name='Craiglockhart' AND finish.name='Lochend' ORDER BY a.num,a.company,transfer.name,c.num,c.company;
