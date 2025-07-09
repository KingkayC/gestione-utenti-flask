from flask import Blueprint, request, jsonify
from src.models.utente import Utente
from src import db
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        nome = data.get('nome')
        cognome = data.get('cognome')
        codice_fiscale = data.get('codice_fiscale')
        telefono = data.get('telefono')
        email = data.get('email')
        password = data.get('password')

        # Controllo dati minimi
        if not (nome and cognome and codice_fiscale and telefono and email and password):
            return jsonify({"error": "Tutti i campi sono obbligatori"}), 400

        # Verifica se esiste già
        existing_user = Utente.query.filter_by(codice_fiscale=codice_fiscale).first()
        if existing_user:
            return jsonify({"error": "Codice fiscale già registrato"}), 409

        # Crea nuovo utente
        nuovo_utente = Utente(
            nome=nome,
            cognome=cognome,
            codice_fiscale=codice_fiscale,
            telefono=telefono,
            email=email,
            password=password
        )
        db.session.add(nuovo_utente)
        db.session.commit()

        return jsonify({"message": "Registrazione completata con successo"}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Errore di integrità, dati duplicati"}), 409

    except Exception as e:
        return jsonify({"error": f"Errore interno: {str(e)}"}), 500
