CREATE TEMPORARY TABLE staging (
	staging_id INT auto_increment PRIMARY KEY,
	slug varchar(256),
	title text,
	description text,
	keywords text,
	post_category_id int,
	post_category_title varchar(256),
	status enum('draft', 'publish') default 'draft',
	reading_time_text varchar(128),
	reading_time_words int,
	reading_time_minutes float,
	reading_time_ms int, 
	html text,
	markdown text,
	image_url varchar(256),
	cloudinary_id varchar(128),
	published timestamp
)

INSERT INTO staging (slug, post_category_title)
VALUES 
	('rlcs-season-4', 'This Week in Rocket League'),
	('competitive-season-5-6', 'This Week in Rocket League'),
	('redesigning-jasherio', 'Personal Website');
	
# Insert new categories
INSERT IGNORE INTO post_categories (title)
	SELECT DISTINCT post_category_title 
	FROM staging;
	
SELECT * FROM post_categories;
DELETE FROM post_categories;
ALTER TABLE post_categories AUTO_INCREMENT = 1;
	
# Add FKs
UPDATE staging
	INNER JOIN post_categories 
	ON staging.post_category_title = post_categories.title
SET staging.post_category_id = post_categories.post_category_id;

# Upsert staing to posts
INSERT INTO posts (slug, title, description, keywords, post_category_id, STATUS, reading_time_text, reading_time_words, reading_time_minutes, reading_time_ms, html, markdown, image_url, cloudinary_id, published)
	SELECT s.slug, s.title, s.description, s.keywords, s.post_category_id, s.status, s.reading_time_text, s.reading_time_words, s.reading_time_minutes, s.reading_time_ms, s.html, s.markdown, s.image_url, s.cloudinary_id, s.published
	FROM staging s
ON DUPLICATE KEY 
	UPDATE 
		slug = s.slug,
		title = s.title,
		description = s.description,
		keywords = s.keywords,
		post_category_id = s.post_category_id,
		STATUS = s.status,
		reading_time_text = s.reading_time_text,
		reading_time_words = s.reading_time_words,
		reading_time_minutes = s.reading_time_minutes,
		reading_time_ms = s.reading_time_ms,
		html = s.html,
		markdown = s.markdown,
		image_url = s.image_url,
		cloudinary_id = s.cloudinary_id,
		published = s.published;


