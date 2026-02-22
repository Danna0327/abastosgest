<?php
$pageTitle = 'Dashboard';
$modulo    = 'dashboard';
require __DIR__ . '/../partials/header.php';
?>

<div class="dashboard-grid">

    <div class="stat-card">
        <div class="stat-label">Ventas Hoy</div>
        <div class="stat-value">$<?= number_format($ventasHoy, 2) ?></div>
        <div class="stat-sub"><?= $numVentasHoy ?> transacciones</div>
    </div>

    <div class="stat-card">
        <div class="stat-label">Productos Registrados</div>
        <div class="stat-value"><?= $totalProductos ?></div>
        <div class="stat-sub"><?= count($productosAlerta) ?> con stock bajo</div>
    </div>

    <div class="stat-card">
        <div class="stat-label">Valor Inventario</div>
        <div class="stat-value">$<?= number_format($valorInventario, 2) ?></div>
        <div class="stat-sub">A precio de venta</div>
    </div>

    <div class="stat-card">
        <div class="stat-label">Proveedores</div>
        <div class="stat-value"><?= $totalProveedores ?></div>
        <div class="stat-sub">Registrados</div>
    </div>

</div>

<div class="dashboard-bottom">

    <!-- Productos con stock bajo -->
    <?php if (!empty($productosAlerta)): ?>
    <div class="card card-alerta">
        <div class="card-header">
            <span class="card-title">⚠ Stock Bajo</span>
            <a href="index.php?mod=inventario" class="btn btn-sm btn-outline">Ver inventario</a>
        </div>
        <table class="tabla">
            <thead>
                <tr><th>Producto</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Estado</th></tr>
            </thead>
            <tbody>
                <?php foreach ($productosAlerta as $p): ?>
                <tr>
                    <td><?= htmlspecialchars($p['nombre']) ?></td>
                    <td><strong class="text-danger"><?= $p['stock'] ?> <?= $p['unidad'] ?></strong></td>
                    <td><?= $p['stock_minimo'] ?></td>
                    <td><span class="badge badge-danger">Reabastecer</span></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>

    <!-- Últimas ventas -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Últimas Ventas</span>
            <a href="index.php?mod=ventas" class="btn btn-sm btn-outline">Ver todas</a>
        </div>
        <?php if (empty($ultimasVentas)): ?>
            <div class="empty-state">No hay ventas registradas aún</div>
        <?php else: ?>
        <table class="tabla">
            <thead>
                <tr><th>#</th><th>Cliente</th><th>Método</th><th>Productos</th><th>Total</th><th>Fecha</th></tr>
            </thead>
            <tbody>
                <?php foreach ($ultimasVentas as $v): ?>
                <tr>
                    <td class="mono">#<?= $v['id'] ?></td>
                    <td><?= htmlspecialchars($v['cliente'] ?? 'Cliente General') ?></td>
                    <td><span class="badge badge-<?= $v['metodo_pago'] === 'efectivo' ? 'success' : 'info' ?>"><?= $v['metodo_pago'] ?></span></td>
                    <td><?= $v['num_productos'] ?></td>
                    <td class="mono"><strong>$<?= number_format($v['total'], 2) ?></strong></td>
                    <td class="text-muted"><?= date('d/m/Y H:i', strtotime($v['fecha'])) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    </div>

</div>

<?php require __DIR__ . '/../partials/footer.php'; ?>
