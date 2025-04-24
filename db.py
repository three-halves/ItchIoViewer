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
        'INSERT INTO game (name, rating, developer, publisher, genre, store_links) VALUES (:name, :rating, :developer, :publisher, :genre, :store_links)',
        data
    )
    db.commit()

def get_games():
    return get_db().execute(
        'SELECT * FROM game'
    ).fetchall()

def get_game(id):
    return get_db().execute(
        'SELECT * FROM game WHERE id = ?',
        (id,)
    ).fetchone()

def update_game(id: str, name: str, developer: str):
    db = get_db()
    db.execute(
        """
        UPDATE game
        SET name = ?, developer = ?
        WHERE id = ?;
        """,
        (name, developer, id)
    )
    db.commit()

def delete_game(id: str):
    db = get_db()
    db.execute(
        'DELETE FROM game WHERE id = ?',
        (id,)
    )
    db.commit()
    