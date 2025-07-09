from flask import Blueprint, render_template, request, redirect, url_for, flash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Qui andrebbe la logica di login (controllo username/password)
        username = request.form.get('username')
        password = request.form.get('password')
        # Finto controllo
        if username == "admin" and password == "admin":
            return redirect(url_for('dashboard'))
        else:
            flash("Credenziali non valide", "danger")
    return "Pagina di login (da implementare o sostituire con render_template)"

@auth_bp.route('/logout')
def logout():
    # Qui andrebbe la logica di logout
    return redirect(url_for('auth.login'))
