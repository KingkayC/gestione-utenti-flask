from flask import Blueprint, request, redirect, url_for, flash, jsonify
from flask_cors import cross_origin
from src.models.utente import Utente
from db import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == "admin" and password == "admin":
            return redirect(url_for('dashboard'))
        else:
            flash("Credenziali non valide", "danger")
    return "Pagina di login (da implementare o sostituire con render_template)"

@auth_bp.route('/logout')
def logout():
    return redirect(url_for('auth.login'))

@auth_bp.route('/register', methods=['POST'])
@cross_origin()
def register():
    try:
        data = request.get_json()

        nuovo_utente = Utente(
            nome=data.get('nome'),
            cognome=data.get('cognome'),
            codice_fiscale=data.get('codice_fiscale'),
            telefono=data.get('telefono'),
            email=data.get('email'),
            password=data.get('password')  # ⚠️ Da hashare in produzione!
        )

        db.session.add(nuovo_utente)
        db.session.commit()

        return jsonify({"message": "Registrazione riuscita"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
