DROP TABLE IF EXISTS game;

CREATE TABLE game ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating REAL,
    genre TEXT,
    store_links TEXT
);

DROP TABLE IF EXISTS developer;

CREATE TABLE developer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

DROP TABLE IF EXISTS developed_game;

CREATE TABLE developed_game (
    gid INTEGER NOT NULL,
    did INTEGER NOT NULL,
    FOREIGN KEY(gid) REFERENCES game(id),
    FOREIGN KEY(did) REFERENCES developer(id)
);

DROP TABLE IF EXISTS publisher;

CREATE TABLE publisher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

DROP TABLE IF EXISTS published_game;

CREATE TABLE published_game (
    gid INTEGER NOT NULL,
    pid INTEGER NOT NULL,
    FOREIGN KEY(gid) REFERENCES game(id),
    FOREIGN KEY(pid) REFERENCES publisher(id)
);

-- Init default values
INSERT INTO game VALUES (0, 'z?Game', 4.5,  'Platformer', 'https://threehalves.itch.io/zgame');
INSERT INTO game VALUES (1, 'Mana Cycle', 10.0,  'Puzzle-Party', 'https://store.steampowered.com/app/2864390/Mana_Cycle/');

INSERT INTO publisher VALUES (0, 'Lemniscate Games');

INSERT INTO developer VALUES (0, 'InfinityJKA');
INSERT INTO developer VALUES (1, 'Jackachulian');
INSERT INTO developer VALUES (2, 'Threehalves');

INSERT INTO published_game VALUES (1, 0);
INSERT INTO developed_game VALUES (1, 0);
INSERT INTO developed_game VALUES (1, 1);
INSERT INTO developed_game VALUES (1, 2);
INSERT INTO developed_game VALUES (0, 2);