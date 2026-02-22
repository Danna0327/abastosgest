<?php
require_once __DIR__ . '/../models/Usuario.php';

class AuthController {
    private Usuario $usuarioModel;

    public function __construct() {
        $this->usuarioModel = new Usuario();
    }

    /** Muestra el formulario de login */
    public function loginForm(): void {
        // Si ya hay sesión activa, redirigir al dashboard
        if (!empty($_SESSION['usuario'])) {
            header('Location: index.php?mod=dashboard');
            exit;
        }
        require __DIR__ . '/../views/auth/login.php';
    }

    /** Procesa las credenciales del formulario */
    public function loginPost(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?mod=login');
            exit;
        }

        $email    = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        // Validación básica antes de consultar la BD
        if (empty($email) || empty($password)) {
            $_SESSION['login_error'] = 'Ingresa tu correo y contraseña';
            header('Location: index.php?mod=login');
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['login_error'] = 'Correo electrónico no válido';
            header('Location: index.php?mod=login');
            exit;
        }

        $usuario = $this->usuarioModel->login($email, $password);

        if (!$usuario) {
            // Mensaje genérico para no revelar si el email existe
            $_SESSION['login_error'] = 'Credenciales incorrectas';
            header('Location: index.php?mod=login');
            exit;
        }

        // Regenerar ID de sesión para prevenir session fixation
        session_regenerate_id(true);

        $_SESSION['usuario'] = [
            'id'     => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email'  => $usuario['email'],
            'rol'    => $usuario['rol'],
        ];

        header('Location: index.php?mod=dashboard');
        exit;
    }

    /** Cierra la sesión activa */
    public function logout(): void {
        $_SESSION = [];
        session_destroy();
        header('Location: index.php?mod=login');
        exit;
    }
}
