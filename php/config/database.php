<?php
/**
 * Configuración de conexión a PostgreSQL usando PDO
 * Usa la misma DATABASE_URL que ya está configurada en Railway
 */

class Database {
    private static ?PDO $instance = null;

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            // Railway provee DATABASE_URL directamente
            $databaseUrl = getenv('DATABASE_URL');

            if ($databaseUrl) {
                // Parsear la URL: postgresql://user:pass@host:port/dbname
                $parsed = parse_url($databaseUrl);
                $host   = $parsed['host'];
                $port   = $parsed['port'] ?? 5432;
                $dbname = ltrim($parsed['path'], '/');
                $user   = $parsed['user'];
                $pass   = $parsed['pass'];
                $dsn    = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";
            } else {
                // Fallback para desarrollo local
                $dsn  = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=prefer',
                    getenv('DB_HOST') ?: 'localhost',
                    getenv('DB_PORT') ?: '5432',
                    getenv('DB_NAME') ?: 'abastosgest'
                );
                $user = getenv('DB_USER') ?: 'postgres';
                $pass = getenv('DB_PASS') ?: '';
            }

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                error_log('DB Connection Error: ' . $e->getMessage());
                die('Error de conexión a la base de datos');
            }
        }
        return self::$instance;
    }

    private function __construct() {}
    private function __clone() {}
}
