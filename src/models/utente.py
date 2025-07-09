from src.main import db

class Utente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codice_fiscale = db.Column(db.String(16), unique=True, nullable=False)
