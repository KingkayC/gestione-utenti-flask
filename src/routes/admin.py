from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from sqlalchemy import or_
import re

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Decorator per verificare che l'utente sia admin"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non autenticato'}), 401
    
    if not session.get('is_admin'):
        return jsonify({'error': 'Accesso negato - privilegi admin richiesti'}), 403
    
    return None

@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    """Ottieni tutti gli utenti (solo admin)"""
    auth_check = require_admin()
    if auth_check:
        return auth_check
    
    try:
        users = User.query.filter_by(is_admin=False).order_by(User.data_registrazione.desc()).all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': 'Errore nel recupero degli utenti'}), 500

@admin_bp.route('/users/search', methods=['GET'])
def search_users():
    """Ricerca utenti (solo admin)"""
    auth_check = require_admin()
    if auth_check:
        return auth_check
    
    try:
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify([]), 200
        
        # Ricerca per nome, cognome, codice fiscale, email o telefono
        users = User.query.filter(
            User.is_admin == False,
            or_(
                User.nome.ilike(f'%{query}%'),
                User.cognome.ilike(f'%{query}%'),
                User.codice_fiscale.ilike(f'%{query}%'),
                User.email.ilike(f'%{query}%'),
                User.telefono.ilike(f'%{query}%')
            )
        ).order_by(User.data_registrazione.desc()).all()
        
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({'error': 'Errore nella ricerca'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Aggiorna dati utente (solo admin)"""
    auth_check = require_admin()
    if auth_check:
        return auth_check
    
    try:
        user = User.query.filter_by(id=user_id, is_admin=False).first()
        if not user:
            return jsonify({'error': 'Utente non trovato'}), 404
        
        data = request.json
        
        # Aggiorna nome se fornito
        if data.get('nome'):
            user.nome = data['nome'].strip()
        
        # Aggiorna cognome se fornito
        if data.get('cognome'):
            user.cognome = data['cognome'].strip()
        
        # Aggiorna codice fiscale se fornito
        if data.get('codice_fiscale'):
            cf = data['codice_fiscale'].upper().strip()
            
            # Validazione codice fiscale
            if not validate_codice_fiscale(cf):
                return jsonify({'error': 'Codice fiscale non valido'}), 400
            
            # Verifica che non sia già in uso
            existing_user = User.query.filter(
                User.codice_fiscale == cf,
                User.id != user.id
            ).first()
            
            if existing_user:
                return jsonify({'error': 'Codice fiscale già in uso'}), 400
            
            user.codice_fiscale = cf
        
        # Aggiorna telefono se fornito
        if data.get('telefono'):
            if not validate_telefono(data['telefono']):
                return jsonify({'error': 'Numero di telefono non valido'}), 400
            
            user.telefono = data['telefono'].strip()
        
        # Aggiorna email se fornita
        if data.get('email'):
            email = data['email'].lower().strip()
            
            if not validate_email(email):
                return jsonify({'error': 'Email non valida'}), 400
            
            # Verifica che non sia già in uso
            existing_user = User.query.filter(
                User.email == email,
                User.id != user.id
            ).first()
            
            if existing_user:
                return jsonify({'error': 'Email già in uso'}), 400
            
            user.email = email
        
        db.session.commit()
        
        return jsonify({
            'message': 'Utente aggiornato con successo',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Errore durante l\'aggiornamento dell\'utente'}), 500

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
def update_user_status(user_id):
    """Aggiorna stato utente (solo admin)"""
    auth_check = require_admin()
    if auth_check:
        return auth_check
    
    try:
        user = User.query.filter_by(id=user_id, is_admin=False).first()
        if not user:
            return jsonify({'error': 'Utente non trovato'}), 404
        
        data = request.json
        new_status = data.get('stato')
        
        if new_status is None or new_status not in [0, 1, 2]:
            return jsonify({'error': 'Stato non valido. Deve essere 0, 1 o 2'}), 400
        
        user.stato = new_status
        db.session.commit()
        
        return jsonify({
            'message': 'Stato utente aggiornato con successo',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Errore durante l\'aggiornamento dello stato'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Elimina utente (solo admin)"""
    auth_check = require_admin()
    if auth_check:
        return auth_check
    
    try:
        user = User.query.filter_by(id=user_id, is_admin=False).first()
        if not user:
            return jsonify({'error': 'Utente non trovato'}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Utente eliminato con successo'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Errore durante l\'eliminazione dell\'utente'}), 500

@admin_bp.route('/stats', methods=['GET'])
def get_stats():
    """Ottieni statistiche utenti (solo admin)"""
    auth_check = require_admin()
    if auth_check:
        return auth_check
    
    try:
        total_users = User.query.filter_by(is_admin=False).count()
        registrati = User.query.filter_by(is_admin=False, stato=0).count()
        approvati = User.query.filter_by(is_admin=False, stato=1).count()
        pagamenti = User.query.filter_by(is_admin=False, stato=2).count()
        
        return jsonify({
            'total_users': total_users,
            'registrati': registrati,
            'approvati': approvati,
            'pagamenti_effettuati': pagamenti
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Errore nel recupero delle statistiche'}), 500

def validate_codice_fiscale(cf):
    """Validazione base del codice fiscale italiano"""
    if not cf or len(cf) != 16:
        return False
    pattern = r'^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$'
    return bool(re.match(pattern, cf.upper()))

def validate_email(email):
    """Validazione email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_telefono(telefono):
    """Validazione telefono italiano"""
    telefono_clean = re.sub(r'[^\d+]', '', telefono)
    pattern = r'^(\+39)?[0-9]{9,10}$'
    return bool(re.match(pattern, telefono_clean))

