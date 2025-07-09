# Sistema di Registrazione Utenti

Un sistema completo di registrazione utenti con area privata e pannello amministrativo sviluppato con Flask e JavaScript.

## 🌐 Demo Live

Il sistema è disponibile online all'indirizzo: **https://vgh0i1cjdzmz.manus.space**

## 📋 Funzionalità

### Per gli Utenti
- **Registrazione completa** con validazione dei dati
- **Accettazione di 3 clausole obbligatorie** durante la registrazione
- **Login sicuro** con codice fiscale come username
- **Area personale** per visualizzare i propri dati
- **Modifica profilo** limitata a email, telefono e password
- **Validazione** di codice fiscale, email e telefono italiani

### Per gli Amministratori
- **Pannello amministrativo completo**
- **Visualizzazione di tutti gli utenti** in tabella
- **Ricerca avanzata** per nome, cognome, codice fiscale, email o telefono
- **Gestione stati utente** con sistema a semaforo:
  - 🔴 Solo registrato
  - 🟡 Approvato
  - 🟢 Pagamento effettuato
- **Modifica dati utente** (tutti i campi eccetto password)
- **Eliminazione utenti**
- **Statistiche in tempo reale**
- **Funzionalità di stampa** dell'elenco utenti

## 🏗️ Architettura

### Backend (Flask)
- **Framework**: Flask con SQLAlchemy ORM
- **Database**: SQLite (facilmente sostituibile)
- **Autenticazione**: Session-based con hashing sicuro delle password
- **API RESTful** per tutte le operazioni
- **Validazione completa** dei dati in input
- **CORS abilitato** per frontend-backend interaction

### Frontend
- **HTML5, CSS3, JavaScript** vanilla
- **Design responsive** e mobile-friendly
- **UI moderna** con gradients e animazioni
- **Notifiche in tempo reale**
- **Modal per editing**
- **Stampa ottimizzata**

## 🚀 Installazione e Avvio

### Prerequisiti
- Python 3.11+
- pip

### Installazione Locale
```bash
# Clona il repository
git clone <repository-url>
cd user_registration_system

# Attiva l'ambiente virtuale
source venv/bin/activate

# Installa le dipendenze
pip install -r requirements.txt

# Avvia il server
python src/main.py
```

Il sistema sarà disponibile su `http://localhost:5000`

## 👤 Credenziali di Default

### Amministratore
- **Codice Fiscale**: ADMINSISTEMA001
- **Password**: admin123

## 📊 Schema Database

### Tabella User
- `id`: Integer, Primary Key
- `nome`: String(100), Not Null
- `cognome`: String(100), Not Null
- `codice_fiscale`: String(16), Unique, Not Null (username)
- `telefono`: String(20), Not Null
- `email`: String(120), Unique, Not Null
- `password_hash`: String(255), Not Null
- `stato`: Integer, Default 0 (0=Registrato, 1=Approvato, 2=Pagamento)
- `clausola_1`: Boolean, Default False
- `clausola_2`: Boolean, Default False
- `clausola_3`: Boolean, Default False
- `data_registrazione`: DateTime, Default UTC Now
- `is_admin`: Boolean, Default False

## 🔧 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione nuovo utente
- `POST /api/auth/login` - Login utente
- `POST /api/auth/logout` - Logout utente
- `GET /api/auth/me` - Informazioni utente corrente
- `PUT /api/auth/update-profile` - Aggiorna profilo utente

### Amministrazione
- `GET /api/admin/users` - Lista tutti gli utenti
- `GET /api/admin/users/search?q=query` - Ricerca utenti
- `PUT /api/admin/users/<id>` - Modifica dati utente
- `PUT /api/admin/users/<id>/status` - Modifica stato utente
- `DELETE /api/admin/users/<id>` - Elimina utente
- `GET /api/admin/stats` - Statistiche utenti

## 🎨 Design e UX

- **Design moderno** con gradients e glassmorphism
- **Colori**: Palette viola/blu con accenti colorati
- **Typography**: Segoe UI per leggibilità ottimale
- **Responsive**: Ottimizzato per desktop, tablet e mobile
- **Accessibilità**: Contrasti adeguati e navigazione keyboard-friendly
- **Micro-interazioni**: Hover effects e transizioni smooth

## 🔒 Sicurezza

- **Password hashing** con Werkzeug.security
- **Validazione input** lato server e client
- **Protezione CSRF** con Flask sessions
- **Sanitizzazione dati** per prevenire XSS
- **Controlli di autorizzazione** per operazioni admin

## 📱 Responsive Design

Il sistema è completamente responsive e ottimizzato per:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🖨️ Funzionalità di Stampa

- **CSS print-friendly** per l'elenco utenti
- **Nasconde elementi non necessari** durante la stampa
- **Layout ottimizzato** per formato A4
- **Intestazioni tabella** su ogni pagina

## 🚀 Deployment

Il sistema è deployato automaticamente e disponibile 24/7 all'indirizzo:
**https://mzhyi8cqpjgx.manus.space**

## 📝 Note Tecniche

- **Database**: Creato automaticamente al primo avvio
- **Admin user**: Creato automaticamente se non esiste
- **Sessioni**: Persistenti tra riavvii del server
- **Logs**: Disponibili nella console durante lo sviluppo
- **CORS**: Abilitato per tutte le origini

## 🔄 Workflow Utente

1. **Registrazione**: Compilazione form con 3 clausole obbligatorie
2. **Validazione**: Controllo codice fiscale, email e telefono
3. **Login**: Accesso con codice fiscale e password
4. **Area personale**: Visualizzazione dati e modifica limitata
5. **Gestione admin**: Controllo completo da parte dell'amministratore

## 🎯 Caratteristiche Avanzate

- **Ricerca real-time** nel pannello admin
- **Cambio stato** con un click sul semaforo
- **Modal editing** per modifica rapida
- **Notifiche toast** per feedback immediato
- **Statistiche live** aggiornate in tempo reale
- **Validazione client-side** per UX migliore

## 📞 Supporto

Per assistenza o domande sul sistema, contattare l'amministratore del sistema.

