document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const tasaInput = document.getElementById('tasa-input');

    const dolaresItemsContainer = document.getElementById('dolares-items');
    const addDolarItemBtn = document.getElementById('add-dolar-item');

    const bolivaresItemsContainer = document.getElementById('bolivares-items');
    const addBolivarItemBtn = document.getElementById('add-bolivar-item');

    const totalBsDisplay = document.getElementById('total-bs-display');
    const totalUsdDisplay = document.getElementById('total-usd-display');

    const resetBtn = document.getElementById('reset-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const savedSessionsList = document.getElementById('saved-sessions-list');
    const autosaveCheckbox = document.getElementById('autosave-checkbox');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    // --- ESTADO INICIAL ---
    let dolarItemCount = 0;
    let bolivarItemCount = 0;
    let savedSessions = [];

    // --- FUNCIONES ---

    const formatCurrency = (num) => isNaN(num) ? '0.00' : num.toFixed(2);

    const calcularTotales = () => {
        const tasa = parseFloat(tasaInput.value) || 0;
        let granTotalBs = 0;

        document.querySelectorAll('.dolar-item-row').forEach(row => {
            const precio = parseFloat(row.querySelector('.precio-dolar').value) || 0;
            const cantidad = parseInt(row.querySelector('.cantidad-dolar').value) || 0;
            const subtotalBs = precio * cantidad * tasa;
            row.querySelector('.subtotal-dolar').textContent = `${formatCurrency(subtotalBs)} Bs.`;
            granTotalBs += subtotalBs;
        });

        document.querySelectorAll('.bolivar-item-row').forEach(row => {
            const precio = parseFloat(row.querySelector('.precio-bolivar').value) || 0;
            const cantidad = parseInt(row.querySelector('.cantidad-bolivar').value) || 0;
            const subtotalBs = precio * cantidad;
            row.querySelector('.subtotal-bolivar').textContent = `${formatCurrency(subtotalBs)} Bs.`;
            granTotalBs += subtotalBs;
        });

        const granTotalUsd = tasa > 0 ? granTotalBs / tasa : 0;

        totalBsDisplay.textContent = `${formatCurrency(granTotalBs)} Bs.`;
        totalUsdDisplay.textContent = `${formatCurrency(granTotalUsd)} $`;
    };

    const attachInputListeners = () => {
        document.querySelectorAll('.precio-dolar, .cantidad-dolar, .precio-bolivar, .cantidad-bolivar').forEach(input => {
            input.removeEventListener('input', calcularTotales);
            input.addEventListener('input', calcularTotales);
        });
    };

    const agregarItemDolar = (precio = '', cantidad = 1) => {
        dolarItemCount++;
        const itemId = `dolar-item-${dolarItemCount}`;
        const itemHtml = `
            <div class="item-row dolar-item-row" id="${itemId}">
                <input type="number" class="precio-dolar" placeholder="Precio en $" step="0.01" value="${precio}">
                <input type="number" class="cantidad-dolar" value="${cantidad}" min="1" step="1">
                <span class="item-subtotal subtotal-dolar">0.00 Bs.</span>
                <button class="btn-delete" aria-label="Eliminar item">×</button>
            </div>
        `;
        dolaresItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
        attachInputListeners(); // Re-add listener call for new rows
        // Auto-focus en el nuevo campo de precio
        document.querySelector(`#${itemId} .precio-dolar`).focus();
    };

    const agregarItemBolivar = (precio = '', cantidad = 1) => {
        bolivarItemCount++;
        const itemId = `bolivar-item-${bolivarItemCount}`;
        const itemHtml = `
            <div class="item-row bolivar-item-row" id="${itemId}">
                <input type="number" class="precio-bolivar" placeholder="Precio en Bs." step="0.01" value="${precio}">
                <input type="number" class="cantidad-bolivar" value="${cantidad}" min="1" step="1">
                <span class="item-subtotal subtotal-bolivar">0.00 Bs.</span>
                <button class="btn-delete" aria-label="Eliminar item">×</button>
            </div>
        `;
        bolivaresItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
        attachInputListeners(); // Re-add listener call for new rows
        // Auto-focus en el nuevo campo de precio
        document.querySelector(`#${itemId} .precio-bolivar`).focus();
    };

    const reiniciarCalculadora = (addInitialRows = true) => {
        dolaresItemsContainer.innerHTML = '';
        bolivaresItemsContainer.innerHTML = '';
        dolarItemCount = 0;
        bolivarItemCount = 0;
        if (addInitialRows) {
            agregarItemDolar();
            agregarItemBolivar();
        }
        attachInputListeners();
        calcularTotales();
    };

    const handleContainerClick = (e) => {
        if (e.target.classList.contains('btn-delete')) {
            e.target.closest('.item-row').remove();
            calcularTotales();
        }
    };

    const handleContainerFocus = (e) => {
        if (e.target.classList.contains('cantidad-dolar') || e.target.classList.contains('cantidad-bolivar')) {
            e.target.select();
        }
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };

    // --- Funciones de Sesión ---

    const renderSavedSessions = () => {
        savedSessionsList.innerHTML = '';
        if (savedSessions.length === 0) {
            savedSessionsList.innerHTML = '<p>No hay cuentas guardadas.</p>';
            deleteAllBtn.style.display = 'none'; // Oculta el botón si no hay cuentas
            return;
        }
        deleteAllBtn.style.display = 'inline-block'; // Muestra el botón si hay cuentas

        savedSessions.forEach(session => {
            const sessionEl = document.createElement('div');
            sessionEl.classList.add('saved-session-item');
            sessionEl.innerHTML = `
                <span class="name">${session.name}</span>
                <div class="actions">
                    <button class="btn btn-secondary load-session-btn" data-id="${session.id}">Cargar</button>
                    <button class="btn btn-danger delete-session-btn" data-id="${session.id}">Eliminar</button>
                </div>
            `;
            savedSessionsList.appendChild(sessionEl);
        });
    };

    const saveCurrentSession = (isAutomatic = false) => {
        const currentTotalBs = totalBsDisplay.textContent;
        // No guarda si el total es 0.00
        if (parseFloat(currentTotalBs) === 0) return;

        let nombre;
        if (isAutomatic) {
            nombre = `${currentTotalBs} - ${new Date().toLocaleString()}`;
        } else {
            const defaultName = `${currentTotalBs} - ${new Date().toLocaleString()}`;
            nombre = prompt('Ingresa un nombre para esta cuenta:', defaultName);
            if (!nombre) return;
        }

        const dolarItems = Array.from(document.querySelectorAll('.dolar-item-row')).map(row => ({
            precio: row.querySelector('.precio-dolar').value,
            cantidad: row.querySelector('.cantidad-dolar').value,
        }));

        const bolivarItems = Array.from(document.querySelectorAll('.bolivar-item-row')).map(row => ({
            precio: row.querySelector('.precio-bolivar').value,
            cantidad: row.querySelector('.cantidad-bolivar').value,
        }));

        const session = {
            id: Date.now(),
            name: nombre,
            tasa: tasaInput.value,
            dolarItems,
            bolivarItems,
        };

        savedSessions.push(session);
        localStorage.setItem('savedSessions', JSON.stringify(savedSessions));
        renderSavedSessions();
    };

    const loadSession = (id) => {
        const session = savedSessions.find(s => s.id === id);
        if (!session) return;

        reiniciarCalculadora(false); // Limpia la calculadora sin añadir filas por defecto
        tasaInput.value = session.tasa;

        session.dolarItems.forEach(item => agregarItemDolar(item.precio, item.cantidad));
        session.bolivarItems.forEach(item => agregarItemBolivar(item.precio, item.cantidad));
        
        attachInputListeners();
        calcularTotales();
    };

    const deleteSession = (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) return;
        savedSessions = savedSessions.filter(s => s.id !== id);
        localStorage.setItem('savedSessions', JSON.stringify(savedSessions));
        renderSavedSessions();
    };

    const deleteAllSessions = () => {
        if (!confirm('¿Estás seguro de que quieres eliminar TODAS las cuentas guardadas? Esta acción no se puede deshacer.')) return;
        savedSessions = [];
        localStorage.setItem('savedSessions', JSON.stringify(savedSessions));
        renderSavedSessions();
    };

    savedSessionsList.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('load-session-btn')) {
            loadSession(id);
        } else if (e.target.classList.contains('delete-session-btn')) {
            deleteSession(id);
        }
    });

    // --- EVENT LISTENERS INICIALES ---
    tasaInput.addEventListener('input', () => {
        calcularTotales();
        localStorage.setItem('tasaDelDia', tasaInput.value);
    });

    addDolarItemBtn.addEventListener('click', () => agregarItemDolar());
    addBolivarItemBtn.addEventListener('click', () => agregarItemBolivar());
    
    resetBtn.addEventListener('click', () => {
        if (autosaveCheckbox.checked) {
            saveCurrentSession(true); // Guarda automáticamente sin prompt
        }
        reiniciarCalculadora(true);
    });

    themeToggleBtn.addEventListener('click', toggleTheme);
    saveSessionBtn.addEventListener('click', () => saveCurrentSession(false)); // Guardado manual con prompt
    deleteAllBtn.addEventListener('click', deleteAllSessions);

    dolaresItemsContainer.addEventListener('click', handleContainerClick);
    bolivaresItemsContainer.addEventListener('click', handleContainerClick);
    dolaresItemsContainer.addEventListener('focusin', handleContainerFocus);
    bolivaresItemsContainer.addEventListener('focusin', handleContainerFocus);

    // --- INICIALIZACIÓN ---
    const savedTasa = localStorage.getItem('tasaDelDia');
    if (savedTasa) {
        tasaInput.value = savedTasa;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    }

    const loadedSessions = JSON.parse(localStorage.getItem('savedSessions'));
    if (loadedSessions) {
        savedSessions = loadedSessions;
    }

    renderSavedSessions();
    reiniciarCalculadora(true);

    // --- Modal "Acerca de" ---
    const aboutModal = document.getElementById('about-modal');
    const aboutBtn = document.getElementById('about-btn');
    const closeButton = document.querySelector('.close-button');

    const openModal = () => {
        aboutModal.style.display = 'block';
    };

    const closeModal = () => {
        aboutModal.style.display = 'none';
    };

    aboutBtn.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == aboutModal) {
            closeModal();
        }
    });
});
