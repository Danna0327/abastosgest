<?php
require_once __DIR__ . '/../config/database.php';

class Usuario {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Crea la tabla de usuarios si no existe.
     * Se llama una sola vez al inicializar el sistema.
     */
    public function crearTablaSiNoExiste(): void {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS usuarios (
                id       SERIAL PRIMARY KEY,
                nombre   VARCHAR(100) NOT NULL,
                email    VARCHAR(200) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol      VARCHAR(50)  NOT NULL DEFAULT 'vendedor',
                activo   BOOLEAN      NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP  DEFAULT NOW()
            )
        ");
    }

    /**
     * Busca un usuario por email para validar el login
     */
    public function buscarPorEmail(string $email): array|false {
        $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE email = :email AND activo = TRUE");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Valida credenciales y retorna el usuario si son correctas
     */
    public function login(string $email, string $password): array|false {
        $usuario = $this->buscarPorEmail($email);
        if (!$usuario) return false;
        if (!password_verify($password, $usuario['password'])) return false;
        return $usuario;
    }

    /**
     * Crea el usuario administrador por defecto si no existe ninguno
     */
    public function crearAdminPorDefecto(): void {
        $count = (int) $this->db->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
        if ($count === 0) {
            $stmt = $this->db->prepare("
                INSERT INTO usuarios (nombre, email, password, rol)
                VALUES (:nombre, :email, :password, 'admin')
            ");
            $stmt->execute([
                ':nombre'   => 'Administrador',
                ':email'    => 'admin@abastosgest.com',
                ':password' => password_hash('admin123', PASSWORD_BCRYPT),
            ]);
        }
    }

    public function getAll(): array {
        return $this->db->query("SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY nombre")->fetchAll();
    }

    public function crear(array $data): bool {
        $stmt = $this->db->prepare("
            INSERT INTO usuarios (nombre, email, password, rol)
            VALUES (:nombre, :email, :password, :rol)
        ");
        return $stmt->execute([
            ':nombre'   => $data['nombre'],
            ':email'    => $data['email'],
            ':password' => password_hash($data['password'], PASSWORD_BCRYPT),
            ':rol'      => $data['rol'] ?? 'vendedor',
        ]);
    }
}
