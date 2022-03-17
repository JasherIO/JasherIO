create table posts (
	post_id int auto_increment not null,
	slug varchar(256) not null,
	title text not null,
	description text not null,
	keywords text not null,
	post_category_id int not null,
	status enum('draft', 'publish') not null default 'draft',
	reading_time_text varchar(128) not null,
	reading_time_words int not null,
	reading_time_minutes float not null,
	reading_time_ms int not null,
	html text not null,
	markdown text not null,
	image_url varchar(256),
	cloudinary_id varchar(128),
	created timestamp not null default now(),
	modified timestamp not null default now() on update now(),
	published timestamp,
	constraint pk_post_id primary key (post_id),
	constraint uq_slug unique (slug),
	constraint fk_post_category_id foreign key (post_category_id) references post_categories(post_category_id)
)

drop table posts;

create table post_categories (
	post_category_id int auto_increment not null,
	title varchar(256) not null,
	constraint pk_post_category_id primary key (post_category_id),
	constraint uq_title unique (title)
)
