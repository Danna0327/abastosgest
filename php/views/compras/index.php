<?php
$pageTitle = 'Compras';
$modulo    = 'compras';
require __DIR__ . '/../partials/header.php';
?>

<div class="page-actions">
    <button class="btn btn-primary" onclick="abrirModal('modal-compra')">+ Registrar Compra</button>
</div>

<div class="card">
    <div class="card-header"><span class="card-title">Historial de Compras</span></div>
    <?php if (empty($compras)): ?>
        <div class="empty-state">No hay compras registradas</div>
    <?php else: ?>
    <table class="tabla">
        <thead>
            <tr><th>#</th><th>Fecha</th><th>Proveedor</th><th>Productos</th><th>Total</th><th>Notas</th></tr>
        </thead>
        <tbody>
        <?php foreach ($compras as $c): ?>
            <tr>
                <td class="mono">#<?= $c['id'] ?></td>
                <td><?= date('d/m/Y H:i', strtotime($c['fecha'])) ?></td>
                <td><?= htmlspecialchars($c['proveedor_nombre'] ?? '—') ?></td>
                <td><?= $c['num_productos'] ?> ítem(s)</td>
                <td class="mono"><strong>$<?= number_format($c['total'], 2) ?></strong></td>
                <td class="text-muted"><?= htmlspecialchars($c['notas'] ?? '—') ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>
</div>

<!-- Modal Compra -->
<div class="modal-overlay" id="modal-compra">
    <div class="modal modal-lg">
        <div class="modal-header">
            <h2 class="modal-title">Registrar Compra</h2>
            <button class="modal-close" onclick="cerrarModal('modal-compra')">✕</button>
        </div>
        <form action="index.php?mod=compras&accion=registrar" method="POST" onsubmit="return prepararCompra()">
            <div class="form-grid">
                <div class="form-group">
                    <label>Proveedor</label>
                    <select name="proveedor_id" class="input">
                        <option value="">— Sin proveedor —</option>
                        <?php foreach ($proveedores as $pv): ?>
                        <option value="<?= $pv['id'] ?>"><?= htmlspecialchars($pv['nombre']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <input type="text" name="notas" class="input" placeholder="Opcional">
                </div>
            </div>

            <div class="item-selector">
                <div class="form-grid">
                    <div class="form-group span-2">
                        <label>Producto</label>
                        <select id="c-producto" class="input" onchange="cargarPrecioCompra()">
                            <option value="">— Seleccionar —</option>
                            <?php foreach ($productos as $p): ?>
                            <option value="<?= $p['id'] ?>"
                                    data-precio="<?= $p['precio_compra'] ?>"
                                    data-nombre="<?= htmlspecialchars($p['nombre']) ?>">
                                <?= htmlspecialchars($p['nombre']) ?> (Stock actual: <?= $p['stock'] ?>)
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" id="c-cantidad" class="input" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label>Precio Unit. Compra</label>
                        <input type="number" id="c-precio" class="input" step="0.01" min="0">
                    </div>
                </div>
                <button type="button" class="btn btn-outline" onclick="agregarItemCompra()">+ Agregar</button>
            </div>

            <table class="tabla tabla-items">
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th><th></th></tr></thead>
                <tbody id="items-compra-body"></tbody>
                <tfoot>
                    <tr><td colspan="3" class="text-right"><strong>TOTAL</strong></td>
                        <td class="mono"><strong id="total-compra">$0.00</strong></td><td></td></tr>
                </tfoot>
            </table>

            <input type="hidden" name="items" id="items-json-compra">

            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="cerrarModal('modal-compra')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Registrar Compra</button>
            </div>
        </form>
    </div>
</div>

<script>
let itemsCompra = [];

function cargarPrecioCompra() {
    const sel = document.getElementById('c-producto');
    const opt = sel.options[sel.selectedIndex];
    document.getElementById('c-precio').value = opt.dataset.precio || '';
}

function agregarItemCompra() {
    const sel      = document.getElementById('c-producto');
    const cantidad = parseInt(document.getElementById('c-cantidad').value);
    const precio   = parseFloat(document.getElementById('c-precio').value);
    const opt      = sel.options[sel.selectedIndex];
    if (!sel.value || !cantidad || !precio) return alert('Completa todos los campos');
    itemsCompra.push({ producto_id: sel.value, nombre: opt.dataset.nombre, cantidad, precio_unitario: precio });
    renderItemsCompra();
    sel.value = ''; document.getElementById('c-cantidad').value = 1; document.getElementById('c-precio').value = '';
}

function quitarItemCompra(idx) { itemsCompra.splice(idx, 1); renderItemsCompra(); }

function renderItemsCompra() {
    let total = 0;
    document.getElementById('items-compra-body').innerHTML = itemsCompra.map((it, i) => {
        const sub = it.cantidad * it.precio_unitario; total += sub;
        return `<tr><td>${it.nombre}</td><td class="mono">${it.cantidad}</td>
            <td class="mono">$${it.precio_unitario.toFixed(2)}</td>
            <td class="mono">$${sub.toFixed(2)}</td>
            <td><button type="button" class="btn btn-sm btn-danger" onclick="quitarItemCompra(${i})">✕</button></td></tr>`;
    }).join('');
    document.getElementById('total-compra').textContent = '$' + total.toFixed(2);
}

function prepararCompra() {
    if (itemsCompra.length === 0) { alert('Agrega al menos un producto'); return false; }
    document.getElementById('items-json-compra').value = JSON.stringify(itemsCompra);
    return true;
}
</script>

<?php require __DIR__ . '/../partials/footer.php'; ?>
