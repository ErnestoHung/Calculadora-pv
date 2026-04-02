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
    const tabsContainer = document.getElementById('tabs-container');
    const addTabBtn = document.getElementById('add-tab-btn');

    // --- ESTADO ---
    let appState = {
        activeTabIndex: 0,
        nextTabNum: 2,
        tabs: [
            {
                id: Date.now(),
                name: "Cuenta 1",
                tasa: localStorage.getItem('tasaDelDia') || '',
                dolarItems: [],
                bolivarItems: []
            }
        ]
    };
    let savedSessions = [];
    let dolarItemCount = 0;
    let bolivarItemCount = 0;

    // --- FUNCIONES CORE ---

    const formatCurrency = (num) => isNaN(num) ? '0.00' : num.toFixed(2);

    const saveDraft = () => {
        serializeCurrentTab();
        localStorage.setItem('calculadora_draft', JSON.stringify(appState));
    };

    const serializeCurrentTab = () => {
        const activeTab = appState.tabs[appState.activeTabIndex];
        if (!activeTab) return;

        activeTab.tasa = tasaInput.value;
        activeTab.dolarItems = Array.from(document.querySelectorAll('.dolar-item-row')).map(row => ({
            precio: row.querySelector('.precio-dolar').value,
            cantidad: row.querySelector('.cantidad-dolar').value,
        }));
        activeTab.bolivarItems = Array.from(document.querySelectorAll('.bolivar-item-row')).map(row => ({
            precio: row.querySelector('.precio-bolivar').value,
            cantidad: row.querySelector('.cantidad-bolivar').value,
        }));
    };

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
        
        saveDraft(); // Guardar cada vez que cambie algo
    };

    const attachInputListeners = () => {
        document.querySelectorAll('.precio-dolar, .cantidad-dolar, .precio-bolivar, .cantidad-bolivar').forEach(input => {
            input.removeEventListener('input', calcularTotales);
            input.addEventListener('input', calcularTotales);
        });
    };

    const agregarItemDolar = (precio = '', cantidad = 1, focus = true) => {
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
        attachInputListeners();
        if (focus) document.querySelector(`#${itemId} .precio-dolar`).focus();
    };

    const agregarItemBolivar = (precio = '', cantidad = 1, focus = true) => {
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
        attachInputListeners();
        if (focus) document.querySelector(`#${itemId} .precio-bolivar`).focus();
    };

    const reiniciarCalculadora = (addInitialRows = true) => {
        dolaresItemsContainer.innerHTML = '';
        bolivaresItemsContainer.innerHTML = '';
        dolarItemCount = 0;
        bolivarItemCount = 0;
        if (addInitialRows) {
            // Invertido el orden para que el foco quede en Dólares (el último que se añade con focus:true)
            agregarItemBolivar('', 1, false);
            agregarItemDolar('', 1, true);
        }
        attachInputListeners();
        calcularTotales();
    };

    // --- GESTIÓN DE PESTAÑAS ---

    const removeTab = (index) => {
        if (appState.tabs.length <= 1) return;
        if (!confirm('¿Cerrar esta cuenta? Los datos no guardados permanentemente se borrarán.')) return;
        
        appState.tabs.splice(index, 1);
        if (appState.activeTabIndex >= appState.tabs.length) {
            appState.activeTabIndex = appState.tabs.length - 1;
        }

        // Si solo queda una pestaña, volver a poner "Cuenta 1" y resetear contador
        if (appState.tabs.length === 1) {
            appState.tabs[0].name = "Cuenta 1";
            appState.nextTabNum = 2;
        }

        renderCurrentTab();
        saveDraft();
    };

    const renameTab = (index) => {
        const newName = prompt('Nombre de la cuenta:', appState.tabs[index].name);
        if (newName) {
            appState.tabs[index].name = newName;
            renderTabs();
            saveDraft();
        }
    };

    // --- GESTIÓN DE PESTAÑAS ---

    const renderTabs = () => {
        const oldTabs = tabsContainer.querySelectorAll('.tab-item');
        oldTabs.forEach(tab => tab.remove());

        appState.tabs.forEach((tab, index) => {
            const tabEl = document.createElement('div');
            tabEl.className = `tab-item ${index === appState.activeTabIndex ? 'active' : ''}`;
            tabEl.innerHTML = `
                <span class="tab-name">${tab.name}</span>
                ${appState.tabs.length > 1 ? '<button class="btn-close-tab" aria-label="Cerrar pestaña">×</button>' : ''}
            `;
            
            tabEl.addEventListener('click', (e) => {
                const closeBtn = e.target.closest('.btn-close-tab');
                if (closeBtn) {
                    e.stopPropagation();
                    removeTab(index);
                } else {
                    switchTab(index);
                }
            });

            tabEl.addEventListener('dblclick', () => renameTab(index));
            
            tabsContainer.insertBefore(tabEl, addTabBtn);
        });
    };

    const renderCurrentTab = () => {
        const activeTab = appState.tabs[appState.activeTabIndex];
        if (!activeTab) return;
        
        tasaInput.value = activeTab.tasa || localStorage.getItem('tasaDelDia') || '';
        
        dolaresItemsContainer.innerHTML = '';
        bolivaresItemsContainer.innerHTML = '';
        dolarItemCount = 0;
        bolivarItemCount = 0;

        if (activeTab.dolarItems.length === 0 && activeTab.bolivarItems.length === 0) {
            reiniciarCalculadora(true);
        } else {
            activeTab.dolarItems.forEach(item => agregarItemDolar(item.precio, item.cantidad, false));
            activeTab.bolivarItems.forEach(item => agregarItemBolivar(item.precio, item.cantidad, false));
            calcularTotales();
        }
        renderTabs();
    };

    const switchTab = (index) => {
        if (index === appState.activeTabIndex) return;
        serializeCurrentTab();
        appState.activeTabIndex = index;
        renderCurrentTab();
        saveDraft();
    };

    const addTab = () => {
        serializeCurrentTab();
        
        const nextNum = appState.nextTabNum++;

        const newTab = {
            id: Date.now(),
            name: `Cuenta ${nextNum}`,
            tasa: tasaInput.value,
            dolarItems: [],
            bolivarItems: []
        };
        appState.tabs.push(newTab);
        appState.activeTabIndex = appState.tabs.length - 1;
        renderCurrentTab();
        saveDraft();
    };

    // --- EVENT LISTENERS ---

    addTabBtn.onclick = addTab;

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

    // --- SESIONES GUARDADAS ---

    const renderSavedSessions = () => {
        savedSessionsList.innerHTML = '';
        if (savedSessions.length === 0) {
            savedSessionsList.innerHTML = '<p>No hay cuentas guardadas.</p>';
            deleteAllBtn.style.display = 'none';
            return;
        }
        deleteAllBtn.style.display = 'inline-block';

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
        serializeCurrentTab();
        const activeTab = appState.tabs[appState.activeTabIndex];
        const currentTotalBs = totalBsDisplay.textContent;
        const currentTotalUsd = totalUsdDisplay.textContent;
        
        if (parseFloat(currentTotalBs) === 0 && activeTab.dolarItems.length === 0 && activeTab.bolivarItems.length === 0) return;

        let nombre;
        const timestamp = new Date().toLocaleString();
        const suggestedName = `${currentTotalBs} - ${currentTotalUsd} - ${timestamp}`;

        if (isAutomatic) {
            nombre = suggestedName;
        } else {
            nombre = prompt('Ingresa un nombre para guardar esta cuenta:', suggestedName);
            if (!nombre) return;
        }

        const session = {
            id: Date.now(),
            name: nombre,
            tasa: activeTab.tasa,
            dolarItems: activeTab.dolarItems,
            bolivarItems: activeTab.bolivarItems,
        };

        savedSessions.push(session);
        localStorage.setItem('savedSessions', JSON.stringify(savedSessions));
        renderSavedSessions();
    };

    const loadSession = (id) => {
        const session = savedSessions.find(s => s.id === id);
        if (!session) return;

        // Cargar sesión como una nueva pestaña
        const newTab = {
            id: Date.now(),
            name: `Cuenta ${appState.nextTabNum++}`,
            tasa: session.tasa,
            dolarItems: session.dolarItems,
            bolivarItems: session.bolivarItems
        };
        appState.tabs.push(newTab);
        appState.activeTabIndex = appState.tabs.length - 1;
        renderCurrentTab();
        saveDraft();
    };

    const deleteSession = (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) return;
        savedSessions = savedSessions.filter(s => s.id !== id);
        localStorage.setItem('savedSessions', JSON.stringify(savedSessions));
        renderSavedSessions();
    };

    const deleteAllSessions = () => {
        if (!confirm('¿Estás seguro de que quieres eliminar TODAS las cuentas?')) return;
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
        localStorage.setItem('tasaDelDia', tasaInput.value);
        calcularTotales();
    });

    addDolarItemBtn.addEventListener('click', () => agregarItemDolar());
    addBolivarItemBtn.addEventListener('click', () => agregarItemBolivar());
    
    resetBtn.addEventListener('click', () => {
        if (autosaveCheckbox.checked) {
            saveCurrentSession(true);
        }
        reiniciarCalculadora(true);
    });

    themeToggleBtn.addEventListener('click', toggleTheme);
    saveSessionBtn.addEventListener('click', () => saveCurrentSession(false));
    deleteAllBtn.addEventListener('click', deleteAllSessions);

    dolaresItemsContainer.addEventListener('click', handleContainerClick);
    bolivaresItemsContainer.addEventListener('click', handleContainerClick);
    dolaresItemsContainer.addEventListener('focusin', handleContainerFocus);
    bolivaresItemsContainer.addEventListener('focusin', handleContainerFocus);

    // --- INICIALIZACIÓN ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    }

    const loadedSessions = JSON.parse(localStorage.getItem('savedSessions'));
    if (loadedSessions) {
        savedSessions = loadedSessions;
    }

    const draft = localStorage.getItem('calculadora_draft');
    if (draft) {
        appState = JSON.parse(draft);
    }

    renderCurrentTab();
    renderSavedSessions();

    // --- Modal "Acerca de" ---
    const aboutModal = document.getElementById('about-modal');
    const aboutBtn = document.getElementById('about-btn');
    const closeButton = document.querySelector('.close-button');

    const openModal = () => { aboutModal.style.display = 'block'; };
    const closeModal = () => { aboutModal.style.display = 'none'; };

    aboutBtn.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == aboutModal) closeModal();
    });
});
