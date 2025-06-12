package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

// AuthDB manages the authentication database
type AuthDB struct {
	db *sql.DB
}

// User represents an authenticated user
type User struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NewAuthDB creates a new authentication database connection
func NewAuthDB(dbPath string) (*AuthDB, error) {
	// Ensure directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open auth database: %w", err)
	}

	// Set pragmas for better performance and safety
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to set journal mode: %w", err)
	}

	if _, err := db.Exec("PRAGMA foreign_keys=ON"); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	// Initialize schema if needed
	if err := initAuthSchema(db); err != nil {
		db.Close()
		return nil, err
	}

	return &AuthDB{db: db}, nil
}

// Close closes the database connection
func (a *AuthDB) Close() error {
	return a.db.Close()
}

// initAuthSchema initializes the authentication database schema
func initAuthSchema(db *sql.DB) error {
	// Create users table
	_, err := db.Exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		role TEXT NOT NULL DEFAULT 'user',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	// Create roles table
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS roles (
		name TEXT PRIMARY KEY,
		description TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		return fmt.Errorf("failed to create roles table: %w", err)
	}

	// Create permissions table
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS permissions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		description TEXT NOT NULL
	)`)
	if err != nil {
		return fmt.Errorf("failed to create permissions table: %w", err)
	}

	// Create role_permissions junction table
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS role_permissions (
		role_name TEXT NOT NULL,
		permission_id INTEGER NOT NULL,
		PRIMARY KEY (role_name, permission_id),
		FOREIGN KEY (role_name) REFERENCES roles(name) ON DELETE CASCADE,
		FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
	)`)
	if err != nil {
		return fmt.Errorf("failed to create role_permissions table: %w", err)
	}

	// Create api_tokens table
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS api_tokens (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		token TEXT NOT NULL UNIQUE,
		description TEXT,
		expires_at TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`)
	if err != nil {
		return fmt.Errorf("failed to create api_tokens table: %w", err)
	}

	// Insert default roles if they don't exist
	_, err = db.Exec(`
	INSERT OR IGNORE INTO roles (name, description) VALUES 
	('admin', 'Administrator with full access'),
	('user', 'Standard user with limited access')
	`)
	if err != nil {
		return fmt.Errorf("failed to insert default roles: %w", err)
	}

	// Insert default permissions if they don't exist
	_, err = db.Exec(`
	INSERT OR IGNORE INTO permissions (name, description) VALUES 
	('agent:read', 'Read agent information'),
	('agent:create', 'Create new agents'),
	('agent:update', 'Update existing agents'),
	('agent:delete', 'Delete agents'),
	('target:read', 'Read target system information'),
	('target:create', 'Create new target systems'),
	('target:update', 'Update existing target systems'),
	('target:delete', 'Delete target systems'),
	('capability:read', 'Read capability information'),
	('capability:create', 'Create new capabilities'),
	('capability:update', 'Update existing capabilities'),
	('capability:delete', 'Delete capabilities'),
	('workflow:read', 'Read workflow information'),
	('workflow:create', 'Create new workflows'),
	('workflow:execute', 'Execute workflows'),
	('analytics:read', 'Read analytics data'),
	('user:read', 'Read user information'),
	('user:create', 'Create new users'),
	('user:update', 'Update existing users'),
	('user:delete', 'Delete users')
	`)
	if err != nil {
		return fmt.Errorf("failed to insert default permissions: %w", err)
	}

	// Assign all permissions to admin role
	rows, err := db.Query("SELECT id FROM permissions")
	if err != nil {
		return fmt.Errorf("failed to query permissions: %w", err)
	}
	defer rows.Close()

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	stmt, err := tx.Prepare("INSERT OR IGNORE INTO role_permissions (role_name, permission_id) VALUES ('admin', ?)")
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to scan permission id: %w", err)
		}
		if _, err := stmt.Exec(id); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert role permission: %w", err)
		}
	}

	// Assign basic permissions to user role
	userPermissions := []string{
		"agent:read", "target:read", "capability:read", "workflow:read",
		"workflow:create", "workflow:execute", "analytics:read",
	}

	stmt, err = tx.Prepare(`
	INSERT OR IGNORE INTO role_permissions (role_name, permission_id) 
	SELECT 'user', id FROM permissions WHERE name = ?
	`)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to prepare user permissions statement: %w", err)
	}

	for _, perm := range userPermissions {
		if _, err := stmt.Exec(perm); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert user permission: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Create admin user if no users exist
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to count users: %w", err)
	}

	if count == 0 {
		// Create default admin user
		passwordHash, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}

		_, err = db.Exec(`
		INSERT INTO users (username, email, password_hash, role) 
		VALUES ('admin', 'admin@example.com', ?, 'admin')
		`, string(passwordHash))
		if err != nil {
			return fmt.Errorf("failed to create admin user: %w", err)
		}

		log.Println("Created default admin user (username: admin, password: admin). Please change the password immediately.")
	}

	return nil
}

// UserRepository handles user persistence
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// GetUserByID retrieves a user by ID
func (r *UserRepository) GetUserByID(id int64) (*User, error) {
	row := r.db.QueryRow(`
	SELECT id, username, email, role, created_at, updated_at
	FROM users WHERE id = ?
	`, id)

	user := &User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %d", id)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByUsername retrieves a user by username
func (r *UserRepository) GetUserByUsername(username string) (*User, error) {
	row := r.db.QueryRow(`
	SELECT id, username, email, role, created_at, updated_at
	FROM users WHERE username = ?
	`, username)

	user := &User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %s", username)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by email
func (r *UserRepository) GetUserByEmail(email string) (*User, error) {
	row := r.db.QueryRow(`
	SELECT id, username, email, role, created_at, updated_at
	FROM users WHERE email = ?
	`, email)

	user := &User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %s", email)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// CreateUser adds a new user to the database
func (r *UserRepository) CreateUser(user *User, password string) error {
	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Insert user
	result, err := r.db.Exec(`
	INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, ?)
	`, user.Username, user.Email, string(passwordHash), user.Role, time.Now(), time.Now())
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	// Get generated ID
	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get user ID: %w", err)
	}

	user.ID = id
	return nil
}

// UpdateUser updates an existing user
func (r *UserRepository) UpdateUser(user *User) error {
	_, err := r.db.Exec(`
	UPDATE users SET username = ?, email = ?, role = ?, updated_at = ?
	WHERE id = ?
	`, user.Username, user.Email, user.Role, time.Now(), user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

// UpdatePassword updates a user's password
func (r *UserRepository) UpdatePassword(userID int64, password string) error {
	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	_, err = r.db.Exec(`
	UPDATE users SET password_hash = ?, updated_at = ?
	WHERE id = ?
	`, string(passwordHash), time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// DeleteUser deletes a user
func (r *UserRepository) DeleteUser(id int64) error {
	_, err := r.db.Exec("DELETE FROM users WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

// ListUsers retrieves all users
func (r *UserRepository) ListUsers() ([]*User, error) {
	rows, err := r.db.Query(`
	SELECT id, username, email, role, created_at, updated_at
	FROM users ORDER BY username
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user := &User{}
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating users: %w", err)
	}

	return users, nil
}

// VerifyPassword checks if the provided password matches the stored hash
func (r *UserRepository) VerifyPassword(username, password string) (bool, error) {
	var passwordHash string
	err := r.db.QueryRow("SELECT password_hash FROM users WHERE username = ?", username).Scan(&passwordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // User not found, but not an error
		}
		return false, fmt.Errorf("failed to get password hash: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	return err == nil, nil
}
