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
     
         // --- ESTADO INICIAL ---
         let dolarItemCount = 0;    let bolivarItemCount = 0;

    // --- FUNCIONES ---

    /**
     * Formatea un número a un formato de moneda con dos decimales.
     * @param {number} num - El número a formatear.
     * @returns {string} - El número formateado.
     */
    const formatCurrency = (num) => {
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    /**
     * Calcula y actualiza todos los subtotales y totales.
     * Se llama cada vez que un valor cambia.
     */
    const calcularTotales = () => {
        const tasa = parseFloat(tasaInput.value) || 0;
        let granTotalBs = 0;

        // Calcular subtotales en Dólares
        document.querySelectorAll('.dolar-item-row').forEach(row => {
            const precio = parseFloat(row.querySelector('.precio-dolar').value) || 0;
            const cantidad = parseInt(row.querySelector('.cantidad-dolar').value) || 0;
            const subtotalBs = precio * cantidad * tasa;
            row.querySelector('.subtotal-dolar').textContent = `${formatCurrency(subtotalBs)} Bs.`;
            granTotalBs += subtotalBs;
        });

        // Calcular subtotales en Bolívares
        document.querySelectorAll('.bolivar-item-row').forEach(row => {
            const precio = parseFloat(row.querySelector('.precio-bolivar').value) || 0;
            const cantidad = parseInt(row.querySelector('.cantidad-bolivar').value) || 0;
            const subtotalBs = precio * cantidad;
            row.querySelector('.subtotal-bolivar').textContent = `${formatCurrency(subtotalBs)} Bs.`;
            granTotalBs += subtotalBs;
        });

        // Calcular totales generales
        const granTotalUsd = tasa > 0 ? granTotalBs / tasa : 0;

        // Actualizar la UI
        totalBsDisplay.textContent = `${formatCurrency(granTotalBs)} Bs.`;
        totalUsdDisplay.textContent = `${formatCurrency(granTotalUsd)} $`;
    };

    /**
     * Crea y añade una nueva fila de item para la sección de dólares.
     */
    const agregarItemDolar = () => {
        dolarItemCount++;
        const itemId = `dolar-item-${dolarItemCount}`;
        const itemHtml = `
            <div class="item-row dolar-item-row" id="${itemId}">
                <input type="number" class="precio-dolar" placeholder="Precio en $" step="0.01">
                <input type="number" class="cantidad-dolar" value="1" min="1" step="1">
                <span class="item-subtotal subtotal-dolar">0.00 Bs.</span>
                <button class="btn-delete" aria-label="Eliminar item">×</button>
            </div>
        `;
        dolaresItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
        attachInputListeners();

        // Auto-focus en el nuevo campo de precio
        document.querySelector(`#${itemId} .precio-dolar`).focus();
    };

    /**
     * Crea y añade una nueva fila de item para la sección de bolívares.
     */
    const agregarItemBolivar = () => {
        bolivarItemCount++;
        const itemId = `bolivar-item-${bolivarItemCount}`;
        const itemHtml = `
            <div class="item-row bolivar-item-row" id="${itemId}">
                <input type="number" class="precio-bolivar" placeholder="Precio en Bs." step="0.01">
                <input type="number" class="cantidad-bolivar" value="1" min="1" step="1">
                <span class="item-subtotal subtotal-bolivar">0.00 Bs.</span>
                <button class="btn-delete" aria-label="Eliminar item">×</button>
            </div>
        `;
        bolivaresItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
        attachInputListeners();
        
        // Auto-focus en el nuevo campo de precio
        document.querySelector(`#${itemId} .precio-bolivar`).focus();
    };
    
    /**
     * Añade event listeners a todos los campos de entrada de items para recalcular al cambiar.
     * Se asegura de no agregar listeners duplicados y de no afectar el input de la tasa.
     */
    const attachInputListeners = () => {
        document.querySelectorAll('.precio-dolar, .cantidad-dolar, .precio-bolivar, .cantidad-bolivar').forEach(input => {
            input.removeEventListener('input', calcularTotales); // Evita duplicados
            input.addEventListener('input', calcularTotales);
        });
    };

    /**
     * Maneja los clics para eliminar filas usando delegación de eventos.
     */
    const handleContainerClick = (e) => {
        if (e.target.classList.contains('btn-delete')) {
            e.target.closest('.item-row').remove();
            calcularTotales();
        }
    };

    /**
     * Selecciona el contenido de un input de cantidad cuando recibe foco.
     */
    const handleContainerFocus = (e) => {
        if (e.target.classList.contains('cantidad-dolar') || e.target.classList.contains('cantidad-bolivar')) {
            e.target.select();
        }
    };

    /**
     * Reinicia la calculadora a su estado inicial, excepto la tasa.
     */
    const reiniciarCalculadora = () => {
        dolaresItemsContainer.innerHTML = '';
        bolivaresItemsContainer.innerHTML = '';
        dolarItemCount = 0;
        bolivarItemCount = 0;
        agregarItemDolar();
        agregarItemBolivar();
        calcularTotales(); // Asegura que los totales se actualicen a 0.00 después del reinicio
    };

    /**
     * Cambia entre el tema claro y oscuro.
     */
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };


    // --- EVENT LISTENERS INICIALES ---
    // Manejador específico para la tasa: calcula y guarda en localStorage
    tasaInput.addEventListener('input', () => {
        calcularTotales();
        localStorage.setItem('tasaDelDia', tasaInput.value);
    });

    addDolarItemBtn.addEventListener('click', agregarItemDolar);
    addBolivarItemBtn.addEventListener('click', agregarItemBolivar);
    resetBtn.addEventListener('click', reiniciarCalculadora);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Delegación de eventos para eliminar filas y seleccionar texto
    dolaresItemsContainer.addEventListener('click', handleContainerClick);
    bolivaresItemsContainer.addEventListener('click', handleContainerClick);
    dolaresItemsContainer.addEventListener('focusin', handleContainerFocus);
    bolivaresItemsContainer.addEventListener('focusin', handleContainerFocus);

    // --- INICIALIZACIÓN ---
    // Cargar la tasa desde localStorage al inicio
    const savedTasa = localStorage.getItem('tasaDelDia');
    if (savedTasa) {
        tasaInput.value = savedTasa;
    }

    // Cargar el tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    }

    agregarItemDolar(); // Crea la primera fila de dólares
    agregarItemBolivar(); // Crea la primera fila de bolívares
    attachInputListeners(); // Adjunta listeners a los inputs de las filas recién creadas
    calcularTotales(); // Realiza el cálculo inicial con la tasa cargada (si existe) o el valor por defecto
});