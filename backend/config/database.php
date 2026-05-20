<?php
/**
 * Database Configuration
 * Uses MySQLi for secure database connections
 */

class Database {
    private $host;
    private $user;
    private $password;
    private $name;
    private $port;
    private $conn;

    public function __construct() {
        $config = $this->resolveConfig();
        $this->host = $config['host'];
        $this->user = $config['user'];
        $this->password = $config['password'];
        $this->name = $config['name'];
        $this->port = $config['port'];
        $this->connect();
    }

    private function resolveConfig() {
        $config = [
            'host' => $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? 'localhost',
            'user' => $_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? $_SERVER['DB_PASSWORD'] ?? '',
            'name' => $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? 'multilingual_library',
            'port' => (int)($_ENV['DB_PORT'] ?? $_SERVER['DB_PORT'] ?? 3306),
        ];

        $railwayHost = $_ENV['MYSQLHOST'] ?? $_SERVER['MYSQLHOST'] ?? null;
        if ($railwayHost) {
            $config['host'] = $railwayHost;
            $config['user'] = $_ENV['MYSQLUSER'] ?? $_SERVER['MYSQLUSER'] ?? $config['user'];
            $config['password'] = $_ENV['MYSQLPASSWORD'] ?? $_SERVER['MYSQLPASSWORD'] ?? $config['password'];
            $config['name'] = $_ENV['MYSQLDATABASE'] ?? $_SERVER['MYSQLDATABASE'] ?? $config['name'];
            $config['port'] = (int)($_ENV['MYSQLPORT'] ?? $_SERVER['MYSQLPORT'] ?? $config['port']);
        }

        $databaseUrl = $_ENV['DATABASE_URL'] ?? $_SERVER['DATABASE_URL'] ?? $_ENV['MYSQL_URL'] ?? $_SERVER['MYSQL_URL'] ?? null;
        if ($databaseUrl) {
            $parts = parse_url($databaseUrl);
            if ($parts !== false) {
                $config['host'] = $parts['host'] ?? $config['host'];
                $config['user'] = $parts['user'] ?? $config['user'];
                $config['password'] = $parts['pass'] ?? $config['password'];
                $config['name'] = isset($parts['path']) ? ltrim($parts['path'], '/') : $config['name'];
                $config['port'] = (int)($parts['port'] ?? $config['port']);
            }
        }

        return $config;
    }

    private function connect() {
        $this->conn = new mysqli($this->host, $this->user, $this->password, $this->name, $this->port);

        if ($this->conn->connect_error) {
            die(json_encode([
                'success' => false,
                'message' => 'Database Connection Error: ' . $this->conn->connect_error
            ]));
        }

        // Set charset to utf8mb4 for multilingual support
        $this->conn->set_charset('utf8mb4');
    }

    public function getConnection() {
        return $this->conn;
    }

    public function close() {
        if ($this->conn) {
            $this->conn->close();
        }
    }

    /**
     * Prepare a statement for secure queries
     */
    public function prepare($query) {
        return $this->conn->prepare($query);
    }

    /**
     * Execute a prepared statement
     */
    public function execute($stmt) {
        return $stmt->execute();
    }

    /**
     * Get last insert ID
     */
    public function lastInsertId() {
        return $this->conn->insert_id;
    }

    /**
     * Get affected rows
     */
    public function affectedRows() {
        return $this->conn->affected_rows;
    }
}
?>
