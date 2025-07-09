from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# Inizializzazione app Flask
app = Flask(__name__)

# ✅ CORS configurato per accettare tutte le origini (anche file://)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configurazione database SQLite compatibile con Render
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'db.sqlite3')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inizializzazione estensione SQLAlchemy
db = SQLAlchemy(app)

# Import blueprint dopo l'inizializzazione di db per evitare import ciclici
from src.routes.auth_routes import auth_bp
from src.routes.admin_routes import admin_bp

# Registrazione blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')

# Route principale
@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "API Flask attiva 🚀"})

# Route per pagina di registrazione (se serve da frontend)
@app.route('/register-page')
def register_page():
    return render_template('register.html')

# Avvio applicazione
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0')
