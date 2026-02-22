<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'AbastosGest' ?> — AbastosGest</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="public/css/main.css">
</head>
<body>

<aside class="sidebar">
    <div class="sidebar-logo">
        <span class="logo-icon">▦</span>
        <span class="logo-text">AbastosGest</span>
    </div>
    <nav class="sidebar-nav">
        <a href="index.php?mod=dashboard"    class="nav-item <?= ($modulo === 'dashboard')   ? 'active' : '' ?>"><span class="nav-icon">◈</span> Dashboard</a>
        <a href="index.php?mod=inventario"   class="nav-item <?= ($modulo === 'inventario')  ? 'active' : '' ?>"><span class="nav-icon">◧</span> Inventario</a>
        <a href="index.php?mod=ventas"       class="nav-item <?= ($modulo === 'ventas')      ? 'active' : '' ?>"><span class="nav-icon">◎</span> Ventas</a>
        <a href="index.php?mod=compras"      class="nav-item <?= ($modulo === 'compras')     ? 'active' : '' ?>"><span class="nav-icon">◫</span> Compras</a>
        <a href="index.php?mod=proveedores"  class="nav-item <?= ($modulo === 'proveedores') ? 'active' : '' ?>"><span class="nav-icon">◉</span> Proveedores</a>
    </nav>

    <!-- Usuario en sesión -->
    <div class="sidebar-user">
        <div class="user-avatar"><?= strtoupper(substr($_SESSION['usuario']['nombre'] ?? 'U', 0, 1)) ?></div>
        <div class="user-info">
            <div class="user-name"><?= htmlspecialchars($_SESSION['usuario']['nombre'] ?? '') ?></div>
            <div class="user-rol"><?= htmlspecialchars($_SESSION['usuario']['rol'] ?? '') ?></div>
        </div>
    </div>

    <div class="sidebar-footer">
        <span>Nancy Market</span>
        <a href="index.php?mod=login&accion=logout" class="logout-btn">⏻ Salir</a>
    </div>
</aside>

<main class="main-content">
    <header class="topbar">
        <h1 class="page-title"><?= $pageTitle ?? '' ?></h1>
        <div class="topbar-right">
            <?php if (!empty($productosAlertaCount)): ?>
            <span class="badge-alerta" title="Productos con stock bajo">⚠ <?= $productosAlertaCount ?> stock bajo</span>
            <?php endif; ?>
            <span class="topbar-time"><?= date('H:i') ?></span>
        </div>
    </header>

    <?php if (!empty($_SESSION['msg'])): ?>
        <div class="alert alert-success"><?= htmlspecialchars($_SESSION['msg']) ?></div>
        <?php unset($_SESSION['msg']); ?>
    <?php endif; ?>

    <?php if (!empty($_SESSION['errores'])): ?>
        <div class="alert alert-error">
            <?php foreach ($_SESSION['errores'] as $e): ?>
                <div>✕ <?= htmlspecialchars($e) ?></div>
            <?php endforeach; ?>
        </div>
        <?php unset($_SESSION['errores']); ?>
    <?php endif; ?>
