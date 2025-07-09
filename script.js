// Stato dell'applicazione
let currentUser = null;
let isLoggedIn = false;

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('loginBtn').addEventListener('click', () => showPage('loginPage'));
    document.getElementById('registerBtn').addEventListener('click', () => showPage('registerPage'));
    document.getElementById('adminBtn').addEventListener('click', () => {
        if (currentUser && currentUser.is_admin) {
            showAdminPage();
        } else {
            showPage('loginPage');
        }
    });
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Forms
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('updateProfileForm').addEventListener('submit', handleUpdateProfile);

    // User area buttons
    document.getElementById('editProfileBtn').addEventListener('click', showEditProfile);

    // Admin functionality
    document.getElementById('searchBtn').addEventListener('click', searchUsers);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    document.getElementById('printBtn').addEventListener('click', printUsersList);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);

    // Modal functionality
    document.querySelector('.close').addEventListener('click', closeEditModal);
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('editUserModal');
        if (e.target === modal) {
            closeEditModal();
        }
    });

    // Codice fiscale uppercase
    document.getElementById('codice_fiscale').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
    document.getElementById('loginCF').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
    document.getElementById('editCodiceFiscale').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
}

// Gestione delle pagine
function showPage(pageId) {
    // Nascondi tutte le pagine
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostra la pagina richiesta
    document.getElementById(pageId).classList.add('active');
}

// Controllo stato autenticazione
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            isLoggedIn = true;
            updateUI();
            showUserArea();
        } else {
            isLoggedIn = false;
            updateUI();
        }
    } catch (error) {
        console.error('Errore nel controllo autenticazione:', error);
        isLoggedIn = false;
        updateUI();
    }
}

// Aggiorna UI in base allo stato di autenticazione
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        // Mostra il pulsante admin solo se l'utente è admin
        if (currentUser && currentUser.is_admin) {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        adminBtn.style.display = 'none';
    }
}

// Gestione registrazione
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Validazione password
    if (data.password !== data.confirmPassword) {
        showNotification('Le password non coincidono', 'error');
        return;
    }
    
    // Rimuovi confirmPassword dai dati da inviare
    delete data.confirmPassword;
    
    // Converti checkbox in boolean
    data.clausola_1 = document.getElementById('clausola_1').checked;
    data.clausola_2 = document.getElementById('clausola_2').checked;
    data.clausola_3 = document.getElementById('clausola_3').checked;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Registrazione completata con successo!', 'success');
            document.getElementById('registerForm').reset();
            showPage('loginPage');
        } else {
            showNotification(result.error || 'Errore durante la registrazione', 'error');
        }
    } catch (error) {
        console.error('Errore registrazione:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Gestione login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            isLoggedIn = true;
            updateUI();
            showNotification('Login effettuato con successo!', 'success');
            document.getElementById('loginForm').reset();
            
            if (result.is_admin) {
                showAdminPage();
            } else {
                showUserArea();
            }
        } else {
            showNotification(result.error || 'Errore durante il login', 'error');
        }
    } catch (error) {
        console.error('Errore login:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Logout
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = null;
            isLoggedIn = false;
            updateUI();
            showNotification('Logout effettuato con successo!', 'success');
            showPage('welcomePage');
        }
    } catch (error) {
        console.error('Errore logout:', error);
        showNotification('Errore durante il logout', 'error');
    }
}

// Mostra area utente
function showUserArea() {
    if (!currentUser) return;
    
    const userInfo = document.getElementById('userInfo');
    const statusClass = getStatusClass(currentUser.stato);
    
    userInfo.innerHTML = `
        <h3>Informazioni Personali</h3>
        <p><strong>Nome:</strong> ${currentUser.nome}</p>
        <p><strong>Cognome:</strong> ${currentUser.cognome}</p>
        <p><strong>Codice Fiscale:</strong> ${currentUser.codice_fiscale}</p>
        <p><strong>Telefono:</strong> ${currentUser.telefono}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Stato:</strong> <span class="status-badge ${statusClass}">${currentUser.stato_emoji} ${currentUser.stato_text}</span></p>
        <p><strong>Data Registrazione:</strong> ${new Date(currentUser.data_registrazione).toLocaleDateString('it-IT')}</p>
    `;
    
    showPage('userArea');
}

// Ottieni classe CSS per lo stato
function getStatusClass(stato) {
    switch(stato) {
        case 0: return 'status-registrato';
        case 1: return 'status-approvato';
        case 2: return 'status-pagamento';
        default: return 'status-registrato';
    }
}

// Mostra form modifica profilo
function showEditProfile() {
    const editForm = document.getElementById('editProfileForm');
    editForm.style.display = 'block';
    
    // Pre-compila i campi con i dati attuali
    document.getElementById('newEmail').value = currentUser.email;
    document.getElementById('newTelefono').value = currentUser.telefono;
}

// Nascondi form modifica profilo
function hideEditProfile() {
    const editForm = document.getElementById('editProfileForm');
    editForm.style.display = 'none';
    document.getElementById('updateProfileForm').reset();
}

// Gestione aggiornamento profilo
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Includi solo i campi che hanno un valore
    for (let [key, value] of formData.entries()) {
        if (value.trim()) {
            data[key] = value;
        }
    }
    
    if (Object.keys(data).length === 0) {
        showNotification('Nessuna modifica da salvare', 'info');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            showNotification('Profilo aggiornato con successo!', 'success');
            hideEditProfile();
            showUserArea();
        } else {
            showNotification(result.error || 'Errore durante l\'aggiornamento', 'error');
        }
    } catch (error) {
        console.error('Errore aggiornamento profilo:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Mostra notifiche
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Variabili globali per admin
let allUsers = [];
let filteredUsers = [];

// Aggiorna setup event listeners per includere admin
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('loginBtn').addEventListener('click', () => showPage('loginPage'));
    document.getElementById('registerBtn').addEventListener('click', () => showPage('registerPage'));
    document.getElementById('adminBtn').addEventListener('click', () => {
        if (currentUser && currentUser.is_admin) {
            showAdminPage();
        } else {
            showPage('loginPage');
        }
    });
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Forms
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('updateProfileForm').addEventListener('submit', handleUpdateProfile);

    // User area buttons
    document.getElementById('editProfileBtn').addEventListener('click', showEditProfile);

    // Admin functionality
    document.getElementById('searchBtn').addEventListener('click', searchUsers);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    document.getElementById('printBtn').addEventListener('click', printUsersList);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);

    // Modal functionality
    document.querySelector('.close').addEventListener('click', closeEditModal);
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('editUserModal');
        if (e.target === modal) {
            closeEditModal();
        }
    });

    // Codice fiscale uppercase
    document.getElementById('codice_fiscale').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
    document.getElementById('loginCF').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
    document.getElementById('editCodiceFiscale').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
}

// Mostra pagina admin
async function showAdminPage() {
    showPage('adminPage');
    await loadAdminStats();
    await loadAllUsers();
}

// Carica statistiche admin
async function loadAdminStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const stats = await response.json();
            displayAdminStats(stats);
        } else {
            showNotification('Errore nel caricamento delle statistiche', 'error');
        }
    } catch (error) {
        console.error('Errore caricamento statistiche:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Visualizza statistiche admin
function displayAdminStats(stats) {
    const statsContainer = document.getElementById('adminStats');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h4>Totale Utenti</h4>
            <div class="stat-number">${stats.total_users}</div>
        </div>
        <div class="stat-card">
            <h4>🔴 Solo Registrati</h4>
            <div class="stat-number">${stats.registrati}</div>
        </div>
        <div class="stat-card">
            <h4>🟡 Approvati</h4>
            <div class="stat-number">${stats.approvati}</div>
        </div>
        <div class="stat-card">
            <h4>🟢 Pagamenti Effettuati</h4>
            <div class="stat-number">${stats.pagamenti_effettuati}</div>
        </div>
    `;
}

// Carica tutti gli utenti
async function loadAllUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            credentials: 'include'
        });
        
        if (response.ok) {
            allUsers = await response.json();
            filteredUsers = [...allUsers];
            displayUsers(filteredUsers);
        } else {
            showNotification('Errore nel caricamento degli utenti', 'error');
        }
    } catch (error) {
        console.error('Errore caricamento utenti:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Visualizza utenti nella tabella
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <h3>Nessun utente trovato</h3>
                    <p>Non ci sono utenti che corrispondono ai criteri di ricerca.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.nome}</td>
            <td>${user.cognome}</td>
            <td>${user.codice_fiscale}</td>
            <td>${user.telefono}</td>
            <td>${user.email}</td>
            <td>
                <button class="status-btn ${getStatusClass(user.stato)}" onclick="changeUserStatus(${user.id}, ${user.stato})">
                    ${user.stato_emoji} ${user.stato_text}
                </button>
            </td>
            <td>${formatDate(user.data_registrazione)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editUser(${user.id})">Modifica</button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">Elimina</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Ricerca utenti
async function searchUsers() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        filteredUsers = [...allUsers];
        displayUsers(filteredUsers);
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            filteredUsers = await response.json();
            displayUsers(filteredUsers);
        } else {
            showNotification('Errore nella ricerca', 'error');
        }
    } catch (error) {
        console.error('Errore ricerca:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Pulisci ricerca
function clearSearch() {
    document.getElementById('searchInput').value = '';
    filteredUsers = [...allUsers];
    displayUsers(filteredUsers);
}

// Cambia stato utente
async function changeUserStatus(userId, currentStatus) {
    const nextStatus = (currentStatus + 1) % 3;
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stato: nextStatus }),
            credentials: 'include'
        });
        
        if (response.ok) {
            showNotification('Stato utente aggiornato con successo!', 'success');
            await loadAllUsers();
            await loadAdminStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Errore nell\'aggiornamento dello stato', 'error');
        }
    } catch (error) {
        console.error('Errore aggiornamento stato:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Modifica utente
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editNome').value = user.nome;
    document.getElementById('editCognome').value = user.cognome;
    document.getElementById('editCodiceFiscale').value = user.codice_fiscale;
    document.getElementById('editTelefono').value = user.telefono;
    document.getElementById('editEmail').value = user.email;
    
    document.getElementById('editUserModal').style.display = 'block';
}

// Chiudi modal modifica
function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('editUserForm').reset();
}

// Gestisci modifica utente
async function handleEditUser(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        
        if (response.ok) {
            showNotification('Utente aggiornato con successo!', 'success');
            closeEditModal();
            await loadAllUsers();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Errore nell\'aggiornamento dell\'utente', 'error');
        }
    } catch (error) {
        console.error('Errore aggiornamento utente:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Elimina utente
async function deleteUser(userId) {
    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showNotification('Utente eliminato con successo!', 'success');
            await loadAllUsers();
            await loadAdminStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Errore nell\'eliminazione dell\'utente', 'error');
        }
    } catch (error) {
        console.error('Errore eliminazione utente:', error);
        showNotification('Errore di connessione', 'error');
    }
}

// Stampa elenco utenti
function printUsersList() {
    const printWindow = window.open('', '_blank');
    let tableHtml = `
        <html>
        <head>
            <title>Elenco Utenti</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status-badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 0.8em; }
                .status-registrato { background: #fed7d7; color: #c53030; }
                .status-approvato { background: #faf089; color: #d69e2e; }
                .status-pagamento { background: #c6f6d5; color: #38a169; }
            </style>
        </head>
        <body>
            <h1>Elenco Utenti Registrati</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>Codice Fiscale</th>
                        <th>Telefono</th>
                        <th>Email</th>
                        <th>Stato</th>
                        <th>Clausola 1</th>
                        <th>Clausola 2</th>
                        <th>Clausola 3</th>
                        <th>Data Registrazione</th>
                    </tr>
                </thead>
                <tbody>
    `;

    allUsers.forEach(user => {
        const statusClass = getStatusClass(user.stato);
        tableHtml += `
            <tr>
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.cognome}</td>
                <td>${user.codice_fiscale}</td>
                <td>${user.telefono}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${statusClass}">${user.stato_emoji} ${user.stato_text}</span></td>
                <td>${user.clausola_1 ? 'Sì' : 'No'}</td>
                <td>${user.clausola_2 ? 'Sì' : 'No'}</td>
                <td>${user.clausola_3 ? 'Sì' : 'No'}</td>
                <td>${formatDate(user.data_registrazione)}</td>
            </tr>
        `;
    });

    tableHtml += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.write(tableHtml);
    printWindow.document.close();
    printWindow.print();
}

// Utility per formattare date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

