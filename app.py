import db
import os
import json
from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    redirect,
    url_for
    )

def create_app():
    # create and configure app
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE = os.path.join('data.db'),
    )

    # connect db
    db.init_app(app)

    # define routes

    # index page
    @app.route('/', methods=['GET', 'POST'])
    def index():
        if request.method == 'POST':
            data = request.form
            db.add_game(data)
            return redirect(url_for('index'))

        return render_template("index.html")
    
    # delete by form
    @app.route('/api/game/delete', methods=['POST',])
    def form_delete():
        db.delete_game(request.form["id"])
        return redirect(url_for('index'))
    
    # delete game by id
    @app.route('/api/game/delete/<gid>', methods=['GET',])
    def delete(gid):
        db.delete_game(gid)
        return redirect(url_for('index'))
    
    @app.route('/api/game/update', methods=['POST',])
    def update():
        db.update_game(request.form["gid"], request.form["name"], request.form["rating"], request.form["genre"], request.form["store_links"])
        return redirect(url_for('index'))
    
    # Get all games from game table, potentially filtering based on given form
    @app.route('/api/games', methods=['GET', 'POST',])
    def get_games():
        if request.method == 'POST':
            return json.dumps([dict(zip(row.keys(), row)) for row in db.get_filtered_games(request.form)])
        else: 
            return json.dumps([dict(zip(row.keys(), row)) for row in db.get_games()])
    
    @app.route('/api/game/<id>', methods=['GET',])
    def get_game(id):
        game = db.get_game(id);
        return json.dumps(dict(zip(game.keys(), game)))
    
    @app.route('/api/developers/<gid>', methods=['GET',])
    def get_developers_by_game(gid):
        return json.dumps([dict(zip(row.keys(), row)) for row in db.get_table_by_game("developer", "developed_game", "id", "did", gid)])
    
    @app.route('/api/developer/stats/<did>', methods=['GET',])
    def get_developer_stats(did):
        stats = db.get_developer_stats(did)
        return json.dumps(dict(zip(stats.keys(), stats)))
    
    @app.route('/api/publishers/<gid>', methods=['GET',])
    def get_publishers_by_game(gid):
        return json.dumps([dict(zip(row.keys(), row)) for row in db.get_table_by_game("publisher", "published_game", "id", "pid", gid)])
    
    @app.route('/api/tags/<gid>', methods=['GET',])
    def get_tags_by_game(gid):
        return json.dumps([dict(zip(row.keys(), row)) for row in db.get_table_by_game("tag", "tagged_with", "name", "tname", gid)])
    
    @app.route('/api/tag', methods=["POST",])
    def add_tag():
        data = request.form
        db.add_tag(data)
        return redirect(url_for('index'))
    
    return app
