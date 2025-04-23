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
    @app.route('/', methods=['GET', 'POST'])
    def index():
        if request.method == 'POST':
            data = request.form
            db.add_game(data)
            return redirect(url_for('index'))

        return render_template("index.html")
    
    @app.route('/api/game/delete', methods=['POST',])
    def delete():
        db.delete_game(request.form["id"])
        return redirect(url_for('index'))
    
    @app.route('/api/game/update', methods=['POST',])
    def update():
        db.update_game(request.form["id"], request.form["name"], request.form["developer"])
        return redirect(url_for('index'))
    
    @app.route('/api/games', methods=['GET',])
    def get_games():
        return json.dumps([tuple(row) for row in db.get_games()])


    @app.route('/api/game/<id>', methods=['GET',])
    def get_game(id):
        return json.dumps(tuple(db.get_game(id)))
    
    return app
