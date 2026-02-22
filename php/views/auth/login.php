<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión — AbastosGest</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg:      #0f1117;
            --surface: #171b25;
            --border:  #2a3148;
            --primary: #3b82f6;
            --danger:  #ef4444;
            --text:    #e2e8f0;
            --muted:   #64748b;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'IBM Plex Sans', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        /* Fondo con patrón de puntos sutil */
        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image: radial-gradient(circle, #2a3148 1px, transparent 1px);
            background-size: 28px 28px;
            opacity: 0.4;
            pointer-events: none;
        }
        .login-wrapper {
            width: 100%;
            max-width: 420px;
            position: relative;
            z-index: 1;
        }
        .login-brand {
            text-align: center;
            margin-bottom: 32px;
        }
        .brand-icon {
            font-size: 48px;
            color: var(--primary);
            display: block;
            margin-bottom: 12px;
            line-height: 1;
        }
        .brand-name {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        .brand-sub {
            font-size: 13px;
            color: var(--muted);
            margin-top: 4px;
        }
        .login-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 32px;
        }
        .login-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }
        .form-group {
            margin-bottom: 18px;
        }
        .form-group label {
            display: block;
            font-size: 11.5px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--muted);
            margin-bottom: 6px;
        }
        .input {
            width: 100%;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 10px 14px;
            color: var(--text);
            font-family: 'IBM Plex Sans', sans-serif;
            font-size: 14px;
            outline: none;
            transition: border-color 0.15s;
        }
        .input:focus { border-color: var(--primary); }
        .input::placeholder { color: var(--muted); }
        .btn-login {
            width: 100%;
            background: var(--primary);
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 11px;
            font-family: 'IBM Plex Sans', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
            transition: background 0.15s;
        }
        .btn-login:hover { background: #2563eb; }
        .error-box {
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.3);
            color: var(--danger);
            border-radius: 6px;
            padding: 10px 14px;
            font-size: 13.5px;
            margin-bottom: 20px;
        }
        .login-hint {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            font-size: 12px;
            color: var(--muted);
            text-align: center;
        }
        .login-hint code {
            font-family: 'IBM Plex Mono', monospace;
            background: var(--bg);
            padding: 1px 6px;
            border-radius: 3px;
            border: 1px solid var(--border);
            font-size: 11px;
        }
        .footer-text {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: var(--muted);
        }
    </style>
</head>
<body>

<div class="login-wrapper">
    <div class="login-brand">
        <span class="brand-icon">▦</span>
        <div class="brand-name">AbastosGest</div>
        <div class="brand-sub">Nancy Market — Sistema de Gestión</div>
    </div>

    <div class="login-card">
        <div class="login-title">Iniciar Sesión</div>

        <?php if (!empty($_SESSION['login_error'])): ?>
            <div class="error-box">✕ <?= htmlspecialchars($_SESSION['login_error']) ?></div>
            <?php unset($_SESSION['login_error']); ?>
        <?php endif; ?>

        <form action="index.php?mod=login&accion=post" method="POST">
            <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input type="email" id="email" name="email" class="input"
                       placeholder="usuario@correo.com" required autofocus
                       value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" class="input"
                       placeholder="••••••••" required minlength="6">
            </div>
            <button type="submit" class="btn-login">Ingresar al Sistema</button>
        </form>

        <div class="login-hint">
            Acceso por defecto: <code>admin@abastosgest.com</code> / <code>admin123</code>
        </div>
    </div>

    <div class="footer-text">AbastosGest v1.0 &mdash; Proyecto Final Ingeniería en Sistemas</div>
</div>

</body>
</html>
