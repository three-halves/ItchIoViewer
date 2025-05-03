import sqlite3
import click
from flask import current_app
from flask import g

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

# command line tool to initialize db based on schema 
@click.command('init-db')
def init_db_command():
    # Clear the existing data and create new tables.
    init_db()
    click.echo('Initialized DB.')


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

# add game row to db
def add_game(data):
    db = get_db()
    db.execute(
        'INSERT INTO game (name, rating, genre, store_links) VALUES (:name, :rating, :genre, :store_links)',
        data
    )
    db.commit()

def add_tag(data):
    db = get_db()
    try:
        db.execute(
            'INSERT INTO tag (name) VALUES (:name)',
            data
        )
    except:
        pass

    db.execute(
        'INSERT INTO tagged_with (gid, tname) VALUES (:gid, :name)',
        data
    )

    db.commit()

def get_games():
    return get_db().execute(
        'SELECT * FROM game'
    ).fetchall()

def get_filtered_games(form: dict):
    where = "WHERE "
    for key in form.keys():
        if form[key] != '':
            where += f"{key} = \"{form[key]}\" AND "
    
    # remove trailing AND
    where = where[:-4] if (len(where) > 6) else ""
    
    return get_db().execute(
        """
        SELECT DISTINCT game.id, game.name, rating, genre, store_links
        FROM game
        LEFT JOIN developed_game
        ON game.id == developed_game.gid
        LEFT JOIN developer
        ON developed_game.did = developer.id
        LEFT JOIN published_game
        ON game.id == published_game.gid
        LEFT JOIN publisher
        ON published_game.pid = publisher.id
        LEFT JOIN tagged_with
        ON game.id == tagged_with.gid
        LEFT JOIN tag
        ON tagged_with.tname = tag.name
        {0}
        """.format(where)
    ).fetchall()

def get_game(id):
    return get_db().execute(
        'SELECT * FROM game WHERE id = ?',
        (id,)
    ).fetchone()

def update_game(id: str, name: str, rating: str, genre: str, store_links: str):
    db = get_db()
    db.execute(
        """
        UPDATE game
        SET name = ?, rating = ?, genre = ?, store_links = ?
        WHERE id = ?;
        """,
        (name, rating, genre, store_links, id)
    )
    db.commit()

def delete_game(id: str):
    db = get_db()
    db.execute(
        'DELETE FROM game WHERE id = ?',
        (id,)
    )
    db.commit()

def get_table_by_game(table: str, relation: str, key: str, fk: str, gid: str):
    return get_db().execute(
        """
        SELECT {3}, name FROM {0}
        JOIN {1}
        ON {0}.{3} = {1}.{2}
        WHERE {1}.gid = ?
        """.format(table, relation, fk, key),
        (gid,)
    ).fetchall()

def get_developer_stats(did):
    return get_db().execute(
        """
        SELECT COUNT(gid) as game_count, AVG(rating) as average_rating, MAX(rating) as max_rating, MIN(rating) as min_rating FROM developer
        JOIN developed_game
        ON developer.id = developed_game.did
        JOIN game
        ON developed_game.gid = game.id
        WHERE developer.id = ?
        """,
        (did,)
    ).fetchone()
    