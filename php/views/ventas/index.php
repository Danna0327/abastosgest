<?php
$pageTitle = 'Ventas';
$modulo    = 'ventas';
require __DIR__ . '/../partials/header.php';
?>

<div class="page-actions">
    <button class="btn btn-primary" onclick="abrirModal('modal-venta')">+ Nueva Venta</button>
</div>

<div class="card">
    <div class="card-header">
        <span class="card-title">Historial de Ventas</span>
    </div>
    <?php if (empty($ventas)): ?>
        <div class="empty-state">No hay ventas registradas</div>
    <?php else: ?>
    <table class="tabla">
        <thead>
            <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Método</th><th>Productos</th><th>Total</th></tr>
        </thead>
        <tbody>
        <?php foreach ($ventas as $v): ?>
            <tr>
                <td class="mono">#<?= $v['id'] ?></td>
                <td><?= date('d/m/Y H:i', strtotime($v['fecha'])) ?></td>
                <td><?= htmlspecialchars($v['cliente'] ?? 'Cliente General') ?></td>
                <td><span class="badge badge-<?= $v['metodo_pago'] === 'efectivo' ? 'success' : 'info' ?>"><?= $v['metodo_pago'] ?></span></td>
                <td>
                    <?php
                    $items = is_string($v['items']) ? json_decode($v['items'], true) : $v['items'];
                    if (!empty($items) && $items[0]['producto']):
                        echo implode(', ', array_map(fn($i) => htmlspecialchars($i['producto']) . ' x' . $i['cantidad'], $items));
                    else: echo '—'; endif; ?>
                </td>
                <td class="mono"><strong>$<?= number_format($v['total'], 2) ?></strong></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>
</div>

<!-- Modal Nueva Venta -->
<div class="modal-overlay" id="modal-venta">
    <div class="modal modal-lg">
        <div class="modal-header">
            <h2 class="modal-title">Registrar Venta</h2>
            <button class="modal-close" onclick="cerrarModal('modal-venta')">✕</button>
        </div>
        <form action="index.php?mod=ventas&accion=registrar" method="POST" onsubmit="return prepararVenta()">
            <div class="form-grid">
                <div class="form-group">
                    <label>Cliente</label>
                    <input type="text" name="cliente" class="input" placeholder="Cliente General">
                </div>
                <div class="form-group">
                    <label>Método de Pago</label>
                    <select name="metodo_pago" class="input">
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                    </select>
                </div>
                <div class="form-group span-2">
                    <label>Notas</label>
                    <input type="text" name="notas" class="input" placeholder="Opcional">
                </div>
            </div>

            <!-- Selector de productos -->
            <div class="item-selector">
                <div class="form-grid">
                    <div class="form-group span-2">
                        <label>Producto</label>
                        <select id="v-producto" class="input" onchange="cargarPrecioVenta()">
                            <option value="">— Seleccionar —</option>
                            <?php foreach ($productos as $p): ?>
                            <option value="<?= $p['id'] ?>"
                                    data-precio="<?= $p['precio_venta'] ?>"
                                    data-nombre="<?= htmlspecialchars($p['nombre']) ?>"
                                    data-stock="<?= $p['stock'] ?>">
                                <?= htmlspecialchars($p['nombre']) ?> (Stock: <?= $p['stock'] ?>)
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" id="v-cantidad" class="input" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label>Precio Unit.</label>
                        <input type="number" id="v-precio" class="input" step="0.01" min="0">
                    </div>
                </div>
                <button type="button" class="btn btn-outline" onclick="agregarItemVenta()">+ Agregar</button>
            </div>

            <!-- Tabla de ítems -->
            <table class="tabla tabla-items" id="tabla-items-venta">
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th><th></th></tr></thead>
                <tbody id="items-venta-body"></tbody>
                <tfoot>
                    <tr><td colspan="3" class="text-right"><strong>TOTAL</strong></td>
                        <td class="mono"><strong id="total-venta">$0.00</strong></td><td></td></tr>
                </tfoot>
            </table>

            <input type="hidden" name="items" id="items-json-venta">

            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="cerrarModal('modal-venta')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Registrar Venta</button>
            </div>
        </form>
    </div>
</div>

<script>
let itemsVenta = [];

function cargarPrecioVenta() {
    const sel = document.getElementById('v-producto');
    const opt = sel.options[sel.selectedIndex];
    document.getElementById('v-precio').value = opt.dataset.precio || '';
}

function agregarItemVenta() {
    const sel      = document.getElementById('v-producto');
    const cantidad = parseInt(document.getElementById('v-cantidad').value);
    const precio   = parseFloat(document.getElementById('v-precio').value);
    const opt      = sel.options[sel.selectedIndex];

    if (!sel.value || !cantidad || !precio) return alert('Completa todos los campos del producto');
    if (cantidad > parseInt(opt.dataset.stock)) return alert('Stock insuficiente');

    itemsVenta.push({ producto_id: sel.value, nombre: opt.dataset.nombre, cantidad, precio_unitario: precio });
    renderItemsVenta();
    sel.value = ''; document.getElementById('v-cantidad').value = 1; document.getElementById('v-precio').value = '';
}

function quitarItemVenta(idx) {
    itemsVenta.splice(idx, 1);
    renderItemsVenta();
}

function renderItemsVenta() {
    const tbody = document.getElementById('items-venta-body');
    let total = 0;
    tbody.innerHTML = itemsVenta.map((it, i) => {
        const sub = it.cantidad * it.precio_unitario;
        total += sub;
        return `<tr>
            <td>${it.nombre}</td>
            <td class="mono">${it.cantidad}</td>
            <td class="mono">$${it.precio_unitario.toFixed(2)}</td>
            <td class="mono">$${sub.toFixed(2)}</td>
            <td><button type="button" class="btn btn-sm btn-danger" onclick="quitarItemVenta(${i})">✕</button></td>
        </tr>`;
    }).join('');
    document.getElementById('total-venta').textContent = '$' + total.toFixed(2);
}

function prepararVenta() {
    if (itemsVenta.length === 0) { alert('Agrega al menos un producto'); return false; }
    document.getElementById('items-json-venta').value = JSON.stringify(itemsVenta);
    return true;
}
</script>

<?php require __DIR__ . '/../partials/footer.php'; ?>
