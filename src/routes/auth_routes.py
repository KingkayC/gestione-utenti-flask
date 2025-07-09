from flask import Blueprint, request, redirect, url_for, flash, jsonify
from src.models.utente import Utente
from src import db

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
def register():
    data = request.get_json()

    codice_fiscale = data.get('codice_fiscale')

    # Verifica se il codice fiscale è già registrato
    utente_esistente = Utente.query.filter_by(codice_fiscale=codice_fiscale).first()
    if utente_esistente:
        return jsonify({"error": "Codice fiscale già registrato"}), 409

    # Crea un nuovo utente
    nuovo_utente = Utente(
        nome=data.get('nome'),
        cognome=data.get('cognome'),
        codice_fiscale=codice_fiscale,
        telefono=data.get('telefono'),
        email=data.get('email'),
        password=data.get('password')  # 🔐 da cifrare in produzione
    )

    db.session.add(nuovo_utente)
    db.session.commit()

    return jsonify({"message": "Registrazione riuscita"}), 201
