<?php
require_once __DIR__ . '/../config/database.php';

class Proveedor {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        return $this->db->query("SELECT * FROM proveedores ORDER BY nombre ASC")->fetchAll();
    }

    public function getById(int $id): array|false {
        $stmt = $this->db->prepare("SELECT * FROM proveedores WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function crear(array $data): bool {
        $stmt = $this->db->prepare("
            INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
            VALUES (:nombre, :contacto, :telefono, :email, :direccion)
        ");
        return $stmt->execute([
            ':nombre'    => $data['nombre'],
            ':contacto'  => $data['contacto'] ?? null,
            ':telefono'  => $data['telefono'] ?? null,
            ':email'     => $data['email'] ?? null,
            ':direccion' => $data['direccion'] ?? null,
        ]);
    }

    public function actualizar(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE proveedores SET
                nombre    = :nombre,
                contacto  = :contacto,
                telefono  = :telefono,
                email     = :email,
                direccion = :direccion
            WHERE id = :id
        ");
        return $stmt->execute([
            ':id'        => $id,
            ':nombre'    => $data['nombre'],
            ':contacto'  => $data['contacto'] ?? null,
            ':telefono'  => $data['telefono'] ?? null,
            ':email'     => $data['email'] ?? null,
            ':direccion' => $data['direccion'] ?? null,
        ]);
    }

    public function eliminar(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM proveedores WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function contarTotal(): int {
        return (int) $this->db->query("SELECT COUNT(*) FROM proveedores")->fetchColumn();
    }
}
