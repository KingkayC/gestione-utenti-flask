## Todo List per il sistema di registrazione utenti

### Fase 1: Progettazione e struttura del sistema
- [ ] Definire lo schema del database per gli utenti (nome, cognome, codice fiscale, telefono, email, password, stato, clausole accettate).
- [ ] Delineare le API endpoints necessarie per la registrazione, login, modifica profilo utente e gestione admin.
- [ ] Progettare l'architettura generale del sistema (Flask backend, frontend).

### Fase 2: Sviluppo backend Flask con database
- [x] Inizializzare il progetto Flask.
- [x] Configurare il database (es. SQLite per semplicità, o PostgreSQL/MySQL per scalabilità).
- [x] Implementare il modello utente nel database.
- [x] Creare le API per la registrazione utente (hashing password, salvataggio dati, gestione clausole).
- [x] Creare le API per il login utente (autenticazione, sessioni/token).
- [x] Creare le API per la modifica del profilo utente (password, email, telefono).
- [x] Creare le API per la gestione utenti da parte dell'admin (visualizzazione, ricerca, modifica dati, cambio stato).

### Fase 3: Sviluppo frontend per registrazione e area utente
- [x] Creare la pagina di registrazione con i campi richiesti e le 3 clausole con flag.
- [x] Implementare la logica di invio dati al backend per la registrazione.
- [x] Creare la pagina di login.
- [x] Creare l'area privata dell'utente con la possibilità di modificare password, email e telefono.
- [x] Implementare la logica di interazione con le API del backend.

### Fase 4: Sviluppo pannello amministrativo
- [x] Creare la pagina di login per l'admin.
- [x] Implementare la visualizzazione di tutti gli utenti registrati in una tabella.
- [x] Aggiungere funzionalità di ricerca utenti.
- [x] Implementare la possibilità di modificare i dati degli utenti (nome, cognome, codice fiscale, telefono, email, stato).
- [x] Implementare la colonna con il semaforo (🔴, 🟡, 🟢) e la logica per cambiare lo stato dell'utente.
- [x] Aggiungere la funzionalità di stampa dell'elenco utenti.

### Fase 5: Test e deployment del sistema
- [x] Eseguire test unitari e di integrazione per backend e frontend.
- [x] Preparare il sistema per il deployment (es. Dockerization).
- [x] Effettuare il deployment del sistema in un ambiente di test.

### Fase 6: Consegna risultati all'utente
- [x] Fornire le istruzioni per l'utilizzo del sistema.
- [x] Presentare il codice sorgente e la documentazione.


- [x] Definire lo schema del database per gli utenti (nome, cognome, codice fiscale, telefono, email, password, stato, clausole accettate).
  - **Schema Utente:**
    - `id`: Integer, Primary Key, Auto-increment
    - `nome`: String, Not Null
    - `cognome`: String, Not Null
    - `codice_fiscale`: String, Unique, Not Null (username)
    - `telefono`: String, Not Null
    - `email`: String, Unique, Not Null
    - `password_hash`: String, Not Null
    - `stato`: Enum (0: Registrato, 1: Approvato, 2: Pagamento Effettuato), Default 0
    - `clausola_1`: Boolean, Not Null, Default False
    - `clausola_2`: Boolean, Not Null, Default False
    - `clausola_3`: Boolean, Not Null, Default False



- [x] Delineare le API endpoints necessarie per la registrazione, login, modifica profilo utente e gestione admin.
  - **API Endpoints:**
    - `POST /api/register`: Registrazione nuovo utente
    - `POST /api/login`: Login utente
    - `PUT /api/user/profile`: Modifica password, email, telefono utente (richiede autenticazione)
    - `GET /api/admin/users`: Ottieni tutti gli utenti (richiede autenticazione admin)
    - `GET /api/admin/users/search`: Ricerca utenti (richiede autenticazione admin)
    - `PUT /api/admin/users/<id>`: Modifica dati utente (richiede autenticazione admin)
    - `PUT /api/admin/users/<id>/status`: Modifica stato utente (richiede autenticazione admin)
- [x] Progettare l'architettura generale del sistema (Flask backend, frontend).
  - **Architettura:**
    - **Backend:** Flask (Python) con SQLAlchemy per ORM e database.
    - **Frontend:** HTML, CSS, JavaScript (potenzialmente con un framework leggero come Jinja2 per il templating di Flask o un framework JS come React/Vue se necessario per maggiore interattività, ma per ora useremo Jinja2 per semplicità).
    - **Autenticazione:** Session-based per il backend, con protezione CSRF.
    - **Hashing Password:** Werkzeug.security per hashing sicuro.



