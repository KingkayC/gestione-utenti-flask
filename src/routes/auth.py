from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
import re

auth_bp = Blueprint('auth', __name__)

def validate_codice_fiscale(cf):
    """Validazione base del codice fiscale italiano"""
    if not cf or len(cf) != 16:
        return False
    # Pattern base per codice fiscale italiano
    pattern = r'^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$'
    return bool(re.match(pattern, cf.upper()))

def validate_email(email):
    """Validazione email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_telefono(telefono):
    """Validazione telefono italiano"""
    # Rimuove spazi e caratteri speciali
    telefono_clean = re.sub(r'[^\d+]', '', telefono)
    # Accetta numeri italiani con o senza prefisso internazionale
    pattern = r'^(\+39)?[0-9]{9,10}$'
    return bool(re.match(pattern, telefono_clean))

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registrazione nuovo utente"""
    try:
        data = request.json
        
        # Validazione dati richiesti
        required_fields = ['nome', 'cognome', 'codice_fiscale', 'telefono', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} richiesto'}), 400
        
        # Validazione codice fiscale
        if not validate_codice_fiscale(data['codice_fiscale']):
            return jsonify({'error': 'Codice fiscale non valido'}), 400
        
        # Validazione email
        if not validate_email(data['email']):
            return jsonify({'error': 'Email non valida'}), 400
        
        # Validazione telefono
        if not validate_telefono(data['telefono']):
            return jsonify({'error': 'Numero di telefono non valido'}), 400
        
        # Validazione password (minimo 8 caratteri)
        if len(data['password']) < 8:
            return jsonify({'error': 'La password deve essere di almeno 8 caratteri'}), 400
        
        # Verifica che tutte e 3 le clausole siano accettate
        if not all([data.get('clausola_1'), data.get('clausola_2'), data.get('clausola_3')]):
            return jsonify({'error': 'Tutte le clausole devono essere accettate'}), 400
        
        # Verifica che codice fiscale e email non esistano già
        existing_user = User.query.filter(
            (User.codice_fiscale == data['codice_fiscale'].upper()) | 
            (User.email == data['email'].lower())
        ).first()
        
        if existing_user:
            if existing_user.codice_fiscale == data['codice_fiscale'].upper():
                return jsonify({'error': 'Codice fiscale già registrato'}), 400
            else:
                return jsonify({'error': 'Email già registrata'}), 400
        
        # Creazione nuovo utente
        user = User(
            nome=data['nome'].strip(),
            cognome=data['cognome'].strip(),
            codice_fiscale=data['codice_fiscale'].upper().strip(),
            telefono=data['telefono'].strip(),
            email=data['email'].lower().strip(),
            clausola_1=True,
            clausola_2=True,
            clausola_3=True,
            stato=0  # Solo registrato
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Registrazione completata con successo',
            'user': user.to_dict_public()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Errore durante la registrazione'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login utente"""
    try:
        data = request.json
        
        if not data.get('codice_fiscale') or not data.get('password'):
            return jsonify({'error': 'Codice fiscale e password richiesti'}), 400
        
        user = User.query.filter_by(codice_fiscale=data['codice_fiscale'].upper()).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Credenziali non valide'}), 401
        
        # Salva l'utente nella sessione
        session['user_id'] = user.id
        session['is_admin'] = user.is_admin
        
        return jsonify({
            'message': 'Login effettuato con successo',
            'user': user.to_dict(),
            'is_admin': user.is_admin
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Errore durante il login'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout utente"""
    session.clear()
    return jsonify({'message': 'Logout effettuato con successo'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Ottieni informazioni utente corrente"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non autenticato'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return jsonify({'error': 'Utente non trovato'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    """Aggiorna profilo utente (solo email, telefono, password)"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non autenticato'}), 401
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'Utente non trovato'}), 404
        
        data = request.json
        
        # Aggiorna email se fornita
        if data.get('email'):
            if not validate_email(data['email']):
                return jsonify({'error': 'Email non valida'}), 400
            
            # Verifica che l'email non sia già in uso
            existing_user = User.query.filter(
                User.email == data['email'].lower(),
                User.id != user.id
            ).first()
            
            if existing_user:
                return jsonify({'error': 'Email già in uso'}), 400
            
            user.email = data['email'].lower().strip()
        
        # Aggiorna telefono se fornito
        if data.get('telefono'):
            if not validate_telefono(data['telefono']):
                return jsonify({'error': 'Numero di telefono non valido'}), 400
            
            user.telefono = data['telefono'].strip()
        
        # Aggiorna password se fornita
        if data.get('password'):
            if len(data['password']) < 8:
                return jsonify({'error': 'La password deve essere di almeno 8 caratteri'}), 400
            
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profilo aggiornato con successo',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Errore durante l\'aggiornamento del profilo'}), 500

