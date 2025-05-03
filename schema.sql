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
    name TEXT NOT NULL,
    isSoloDeveloper INTEGER
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
    name TEXT NOT NULL,
    isAAA INTEGER
);

DROP TABLE IF EXISTS published_game;

CREATE TABLE published_game (
    gid INTEGER NOT NULL,
    pid INTEGER NOT NULL,
    FOREIGN KEY(gid) REFERENCES game(id),
    FOREIGN KEY(pid) REFERENCES publisher(id)
);

DROP TABLE IF EXISTS tag;

CREATE TABLE tag (
    name TEXT PRIMARY KEY
);

DROP TABLE IF EXISTS tagged_with;

CREATE TABLE tagged_with (
    gid INTEGER NOT NULL,
    tname TEXT NOT NULL,
    FOREIGN KEY(gid) REFERENCES game(id),
    FOREIGN KEY(tname) REFERENCES tag(name)
    UNIQUE (gid, tname) ON CONFLICT IGNORE
);

DROP TABLE IF EXISTS platform;

CREATE TABLE platform (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    hasDRM INT NOT NULL
);

DROP TABLE IF EXISTS available_on_platform;

CREATE TABLE available_on_platform (
    gid INTEGER NOT NULL,
    plid INTEGER NOT NULL,
    FOREIGN KEY(gid) REFERENCES game(id),
    FOREIGN KEY(plid) REFERENCES tag(id)
);

-- Init default values
INSERT INTO game VALUES (0, 'z?Game', 3.0,  'Platformer', 'https://threehalves.itch.io/zgame');
INSERT INTO game VALUES (3, 'qBattle', 3.0,  'Fighting', 'https://threehalves.itch.io/qbattle');

INSERT INTO game VALUES (1, 'Mana Cycle', 5.0,  'Puzzle-Party', 'https://store.steampowered.com/app/2864390/Mana_Cycle/');
INSERT INTO game VALUES (2, 'Morpho Builder', 4.0,  'Platformer', 'https://infinityjka.itch.io/gmtk2024');

INSERT INTO game VALUES (4, 'Bipole V', 5.0,  'RPG', 'https://infinityjka.itch.io/bipole-v');

INSERT INTO game VALUES (5, 'FLIP-FLOP', 4.0,  'Platformer', 'https://iiazui.itch.io/flip-flop');

INSERT INTO publisher VALUES (0, 'Lemniscate Games', 0);

INSERT INTO developer VALUES (0, 'InfinityJKA', 1);
INSERT INTO developer VALUES (1, 'Jackachulian', 1);
INSERT INTO developer VALUES (2, 'Threehalves', 1);
INSERT INTO developer VALUES (3, 'iiAzui', 1);

INSERT INTO published_game VALUES (1, 0);
INSERT INTO developed_game VALUES (1, 0);
INSERT INTO developed_game VALUES (1, 1);
INSERT INTO developed_game VALUES (1, 2);
INSERT INTO published_game VALUES (2, 0);
INSERT INTO developed_game VALUES (2, 0);
INSERT INTO developed_game VALUES (2, 1);
INSERT INTO developed_game VALUES (2, 2);

INSERT INTO developed_game VALUES (0, 2);
INSERT INTO developed_game VALUES (3, 2);

INSERT INTO developed_game VALUES (4, 0);

INSERT INTO developed_game VALUES (5, 3);

INSERT INTO tag VALUES ("Multiplayer");
INSERT INTO tagged_with VALUES(1, "Multiplayer");
INSERT INTO tagged_with VALUES(5, "Multiplayer");
INSERT INTO tagged_with VALUES(3, "Multiplayer");