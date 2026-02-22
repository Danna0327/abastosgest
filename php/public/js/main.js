/**
 * AbastosGest — JavaScript principal
 * Manejo de modales y utilidades de interfaz
 */

/**
 * Abre un modal por su ID
 * @param {string} id - ID del elemento .modal-overlay
 */
function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

/**
 * Cierra un modal y limpia el formulario si lo tiene
 * @param {string} id
 */
function cerrarModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');

    // Resetear formularios dentro del modal
    const form = el.querySelector('form');
    if (form) {
        form.reset();
        // Limpiar hidden ID para evitar que el próximo "nuevo" envíe un ID
        const hiddenId = form.querySelector('input[name="id"]');
        if (hiddenId) hiddenId.value = '';
    }

    // Limpiar títulos del modal al estado inicial
    const titulo = el.querySelector('.modal-title');
    if (titulo && titulo.dataset.original) {
        titulo.textContent = titulo.dataset.original;
    }
}

// Guardar el título original de cada modal para poder restaurarlo
document.querySelectorAll('.modal-title').forEach(el => {
    el.dataset.original = el.textContent;
});

// Cerrar modal al hacer clic fuera del contenido
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('open');
        }
    });
});

// Cerrar con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(el => {
            el.classList.remove('open');
        });
    }
});

// Actualizar el reloj en el topbar cada minuto
function actualizarReloj() {
    const el = document.querySelector('.topbar-time');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}
setInterval(actualizarReloj, 60000);

// Auto-ocultar alertas de éxito después de 4 segundos
document.querySelectorAll('.alert-success').forEach(el => {
    setTimeout(() => {
        el.style.transition = 'opacity 0.4s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 4000);
});
