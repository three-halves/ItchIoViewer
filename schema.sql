DROP TABLE IF EXISTS game;

CREATE TABLE game ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating REAL,
    developer TEXT NOT NULL,
    publisher TEXT,
    genre TEXT,
    store_links TEXT
);