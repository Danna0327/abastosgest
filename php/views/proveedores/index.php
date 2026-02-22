<?php
$pageTitle = 'Proveedores';
$modulo    = 'proveedores';
require __DIR__ . '/../partials/header.php';
?>

<div class="page-actions">
    <button class="btn btn-primary" onclick="abrirModal('modal-proveedor')">+ Nuevo Proveedor</button>
</div>

<div class="card">
    <div class="card-header"><span class="card-title">Proveedores (<?= count($proveedores) ?>)</span></div>
    <?php if (empty($proveedores)): ?>
        <div class="empty-state">No hay proveedores registrados</div>
    <?php else: ?>
    <table class="tabla">
        <thead>
            <tr><th>#</th><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Dirección</th><th>Acciones</th></tr>
        </thead>
        <tbody>
        <?php foreach ($proveedores as $pv): ?>
            <tr>
                <td class="mono"><?= $pv['id'] ?></td>
                <td><strong><?= htmlspecialchars($pv['nombre']) ?></strong></td>
                <td><?= htmlspecialchars($pv['contacto'] ?? '—') ?></td>
                <td><?= htmlspecialchars($pv['telefono'] ?? '—') ?></td>
                <td><?= htmlspecialchars($pv['email'] ?? '—') ?></td>
                <td><?= htmlspecialchars($pv['direccion'] ?? '—') ?></td>
                <td class="acciones">
                    <button class="btn btn-sm btn-outline" onclick='editarProveedor(<?= json_encode($pv) ?>)'>Editar</button>
                    <a href="index.php?mod=proveedores&accion=eliminar&id=<?= $pv['id'] ?>"
                       class="btn btn-sm btn-danger"
                       onclick="return confirm('¿Eliminar <?= htmlspecialchars($pv['nombre']) ?>?')">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>
</div>

<!-- Modal Proveedor -->
<div class="modal-overlay" id="modal-proveedor">
    <div class="modal">
        <div class="modal-header">
            <h2 class="modal-title" id="modal-prov-titulo">Nuevo Proveedor</h2>
            <button class="modal-close" onclick="cerrarModal('modal-proveedor')">✕</button>
        </div>
        <form action="index.php?mod=proveedores&accion=guardar" method="POST">
            <input type="hidden" name="id" id="prov-id">
            <div class="form-grid">
                <div class="form-group span-2">
                    <label>Nombre *</label>
                    <input type="text" name="nombre" id="prov-nombre" required maxlength="200" class="input">
                </div>
                <div class="form-group">
                    <label>Contacto</label>
                    <input type="text" name="contacto" id="prov-contacto" maxlength="200" class="input">
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" name="telefono" id="prov-telefono" maxlength="50" class="input">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" id="prov-email" maxlength="200" class="input">
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" name="direccion" id="prov-direccion" class="input">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="cerrarModal('modal-proveedor')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Proveedor</button>
            </div>
        </form>
    </div>
</div>

<script>
function editarProveedor(pv) {
    document.getElementById('modal-prov-titulo').textContent = 'Editar Proveedor';
    document.getElementById('prov-id').value        = pv.id;
    document.getElementById('prov-nombre').value    = pv.nombre;
    document.getElementById('prov-contacto').value  = pv.contacto || '';
    document.getElementById('prov-telefono').value  = pv.telefono || '';
    document.getElementById('prov-email').value     = pv.email || '';
    document.getElementById('prov-direccion').value = pv.direccion || '';
    abrirModal('modal-proveedor');
}
</script>

<?php require __DIR__ . '/../partials/footer.php'; ?>
