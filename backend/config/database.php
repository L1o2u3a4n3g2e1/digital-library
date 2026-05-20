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
    private $conn;

    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->user = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASSWORD'] ?? '';
        $this->name = $_ENV['DB_NAME'] ?? 'multilingual_library';
        $this->connect();
    }

    private function connect() {
        $this->conn = new mysqli($this->host, $this->user, $this->password, $this->name);

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
