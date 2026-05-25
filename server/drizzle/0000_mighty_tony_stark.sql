CREATE TABLE `annotations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`page` integer,
	`position` text,
	`content` text NOT NULL,
	`note` text,
	`color` text DEFAULT 'yellow',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_annotations_target` ON `annotations` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `book_bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`cfi` text NOT NULL,
	`title` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_book_bookmarks_book` ON `book_bookmarks` (`book_id`);--> statement-breakpoint
CREATE TABLE `book_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`cfi` text NOT NULL,
	`text` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_book_notes_book` ON `book_notes` (`book_id`);--> statement-breakpoint
CREATE TABLE `book_ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`reading_status` text DEFAULT 'want_to_read' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_ratings_book_id_unique` ON `book_ratings` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_book_ratings_book` ON `book_ratings` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_book_ratings_status` ON `book_ratings` (`reading_status`);--> statement-breakpoint
CREATE TABLE `book_reading_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`cfi` text,
	`percentage` real DEFAULT 0 NOT NULL,
	`current_page` integer DEFAULT 0 NOT NULL,
	`total_pages` integer DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`last_read_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_book_progress_book` ON `book_reading_progress` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_book_progress_last_read` ON `book_reading_progress` (`last_read_at`);--> statement-breakpoint
CREATE TABLE `book_tags` (
	`book_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_book_tags_book` ON `book_tags` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_book_tags_tag` ON `book_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `bookmark_books` (
	`bookmark_id` integer NOT NULL,
	`book_id` integer NOT NULL,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_bookmark_books_bookmark` ON `bookmark_books` (`bookmark_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bookmark_books_unique` ON `bookmark_books` (`bookmark_id`,`book_id`);--> statement-breakpoint
CREATE TABLE `bookmark_comics` (
	`bookmark_id` integer NOT NULL,
	`comic_id` integer NOT NULL,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_bookmark_comics_bookmark` ON `bookmark_comics` (`bookmark_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bookmark_comics_unique` ON `bookmark_comics` (`bookmark_id`,`comic_id`);--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`title_sort` text NOT NULL,
	`author` text,
	`description` text,
	`publisher` text,
	`publish_date` text,
	`isbn` text,
	`language` text,
	`page_count` integer DEFAULT 0 NOT NULL,
	`format` text NOT NULL,
	`path` text NOT NULL,
	`cover_path` text,
	`file_size` integer DEFAULT 0 NOT NULL,
	`last_read_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_path_unique` ON `books` (`path`);--> statement-breakpoint
CREATE INDEX `idx_books_title` ON `books` (`title_sort`);--> statement-breakpoint
CREATE INDEX `idx_books_author` ON `books` (`author`);--> statement-breakpoint
CREATE INDEX `idx_books_format` ON `books` (`format`);--> statement-breakpoint
CREATE INDEX `idx_books_created` ON `books` (`created_at`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`parent_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_categories_parent` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_id` integer NOT NULL,
	`volume` integer,
	`chapter_number` integer DEFAULT 1 NOT NULL,
	`title` text,
	`page_count` integer DEFAULT 0 NOT NULL,
	`file_path` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chapters_comic` ON `chapters` (`comic_id`);--> statement-breakpoint
CREATE INDEX `idx_chapters_sort` ON `chapters` (`comic_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `comic_categories` (
	`comic_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comic_categories_comic` ON `comic_categories` (`comic_id`);--> statement-breakpoint
CREATE INDEX `idx_comic_categories_category` ON `comic_categories` (`category_id`);--> statement-breakpoint
CREATE TABLE `comic_tags` (
	`comic_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comic_tags_comic` ON `comic_tags` (`comic_id`);--> statement-breakpoint
CREATE INDEX `idx_comic_tags_tag` ON `comic_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `comics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`title_sort` text NOT NULL,
	`author` text,
	`artist` text,
	`description` text,
	`status` text DEFAULT 'unknown' NOT NULL,
	`year` integer,
	`language` text,
	`path` text NOT NULL,
	`file_type` text NOT NULL,
	`page_count` integer DEFAULT 0 NOT NULL,
	`cover_path` text,
	`file_size` integer DEFAULT 0 NOT NULL,
	`last_read_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comics_path_unique` ON `comics` (`path`);--> statement-breakpoint
CREATE INDEX `idx_comics_title` ON `comics` (`title_sort`);--> statement-breakpoint
CREATE INDEX `idx_comics_author` ON `comics` (`author`);--> statement-breakpoint
CREATE INDEX `idx_comics_status` ON `comics` (`status`);--> statement-breakpoint
CREATE INDEX `idx_comics_created` ON `comics` (`created_at`);--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_id` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`reading_status` text DEFAULT 'want_to_read' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ratings_comic_id_unique` ON `ratings` (`comic_id`);--> statement-breakpoint
CREATE INDEX `idx_ratings_comic` ON `ratings` (`comic_id`);--> statement-breakpoint
CREATE INDEX `idx_ratings_status` ON `ratings` (`reading_status`);--> statement-breakpoint
CREATE TABLE `reading_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_id` integer NOT NULL,
	`chapter_id` integer NOT NULL,
	`current_page` integer DEFAULT 0 NOT NULL,
	`total_pages` integer DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`last_read_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_progress_comic` ON `reading_progress` (`comic_id`);--> statement-breakpoint
CREATE INDEX `idx_progress_last_read` ON `reading_progress` (`last_read_at`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);