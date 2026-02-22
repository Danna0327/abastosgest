<?php
$pageTitle = 'Inventario';
$modulo    = 'inventario';
require __DIR__ . '/../partials/header.php';
?>

<div class="page-actions">
    <button class="btn btn-primary" onclick="abrirModal('modal-producto')">+ Nuevo Producto</button>
</div>

<?php if (!empty($bajoStock)): ?>
<div class="alert alert-warning">
    ⚠ <strong><?= count($bajoStock) ?> producto(s)</strong> con stock en o por debajo del mínimo
</div>
<?php endif; ?>

<div class="card">
    <div class="card-header">
        <span class="card-title">Productos (<?= count($productos) ?>)</span>
        <input type="text" id="buscador" placeholder="Buscar producto..." class="input-search" oninput="filtrarTabla(this.value)">
    </div>
    <table class="tabla" id="tabla-productos">
        <thead>
            <tr>
                <th>#</th><th>Nombre</th><th>Categoría</th><th>Proveedor</th>
                <th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Unidad</th><th>Acciones</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($productos as $p): ?>
            <?php $bajo = $p['stock'] <= $p['stock_minimo']; ?>
            <tr class="<?= $bajo ? 'fila-alerta' : '' ?>">
                <td class="mono"><?= $p['id'] ?></td>
                <td>
                    <?= htmlspecialchars($p['nombre']) ?>
                    <?php if ($bajo): ?><span class="badge badge-danger">Stock bajo</span><?php endif; ?>
                </td>
                <td><?= htmlspecialchars($p['categoria'] ?? '—') ?></td>
                <td><?= htmlspecialchars($p['proveedor_nombre'] ?? '—') ?></td>
                <td class="mono">$<?= number_format($p['precio_compra'], 2) ?></td>
                <td class="mono">$<?= number_format($p['precio_venta'], 2) ?></td>
                <td class="mono <?= $bajo ? 'text-danger' : '' ?>"><strong><?= $p['stock'] ?></strong> / <?= $p['stock_minimo'] ?> mín</td>
                <td><?= htmlspecialchars($p['unidad']) ?></td>
                <td class="acciones">
                    <button class="btn btn-sm btn-outline" onclick='editarProducto(<?= json_encode($p) ?>)'>Editar</button>
                    <a href="index.php?mod=inventario&accion=eliminar&id=<?= $p['id'] ?>"
                       class="btn btn-sm btn-danger"
                       onclick="return confirm('¿Eliminar <?= htmlspecialchars($p['nombre']) ?>?')">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- Modal Producto -->
<div class="modal-overlay" id="modal-producto">
    <div class="modal">
        <div class="modal-header">
            <h2 class="modal-title" id="modal-producto-titulo">Nuevo Producto</h2>
            <button class="modal-close" onclick="cerrarModal('modal-producto')">✕</button>
        </div>
        <form action="index.php?mod=inventario&accion=guardar" method="POST">
            <input type="hidden" name="id" id="prod-id">
            <div class="form-grid">
                <div class="form-group span-2">
                    <label>Nombre *</label>
                    <input type="text" name="nombre" id="prod-nombre" required maxlength="200" class="input">
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <input type="text" name="categoria" id="prod-categoria" maxlength="100" class="input" placeholder="Ej: Granos, Aceites...">
                </div>
                <div class="form-group">
                    <label>Proveedor</label>
                    <select name="proveedor_id" id="prod-proveedor" class="input">
                        <option value="">— Sin proveedor —</option>
                        <?php foreach ($proveedores as $pv): ?>
                        <option value="<?= $pv['id'] ?>"><?= htmlspecialchars($pv['nombre']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label>Precio Compra *</label>
                    <input type="number" name="precio_compra" id="prod-precio-compra" step="0.01" min="0" required class="input">
                </div>
                <div class="form-group">
                    <label>Precio Venta *</label>
                    <input type="number" name="precio_venta" id="prod-precio-venta" step="0.01" min="0" required class="input">
                </div>
                <div class="form-group">
                    <label>Stock Actual</label>
                    <input type="number" name="stock" id="prod-stock" min="0" value="0" class="input">
                </div>
                <div class="form-group">
                    <label>Stock Mínimo</label>
                    <input type="number" name="stock_minimo" id="prod-stock-minimo" min="0" value="5" class="input">
                </div>
                <div class="form-group">
                    <label>Unidad</label>
                    <input type="text" name="unidad" id="prod-unidad" value="unidad" maxlength="50" class="input">
                </div>
                <div class="form-group span-2">
                    <label>Descripción</label>
                    <textarea name="descripcion" id="prod-descripcion" rows="2" class="input"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="cerrarModal('modal-producto')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Producto</button>
            </div>
        </form>
    </div>
</div>

<script>
function editarProducto(p) {
    document.getElementById('modal-producto-titulo').textContent = 'Editar Producto';
    document.getElementById('prod-id').value           = p.id;
    document.getElementById('prod-nombre').value       = p.nombre;
    document.getElementById('prod-categoria').value    = p.categoria || '';
    document.getElementById('prod-precio-compra').value= p.precio_compra;
    document.getElementById('prod-precio-venta').value = p.precio_venta;
    document.getElementById('prod-stock').value        = p.stock;
    document.getElementById('prod-stock-minimo').value = p.stock_minimo;
    document.getElementById('prod-unidad').value       = p.unidad;
    document.getElementById('prod-descripcion').value  = p.descripcion || '';
    document.getElementById('prod-proveedor').value    = p.proveedor_id || '';
    abrirModal('modal-producto');
}

function filtrarTabla(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#tabla-productos tbody tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}
</script>

<?php require __DIR__ . '/../partials/footer.php'; ?>
