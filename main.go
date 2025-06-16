package main

import (
	"context"
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"

	"Inference_Engine/api"
	"Inference_Engine/database"
	"Inference_Engine/inference"

	"github.com/joho/godotenv"
)

var staticGUIServer *http.Server // To manage the static GUI server's lifecycle

func main() {
	// Command line flags
	var production = flag.Bool("production", false, "Run in production mode (serve static files)")
	var guiPort = flag.Int("gui-port", 3000, "Port for GUI server")
	var cleanDB = flag.Bool("clean-db", false, "Clean the database directory before starting")
	flag.Parse()

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	if *production {
		log.Println("🚀 Starting Inference Engine in PRODUCTION mode...")
	} else {
		log.Println("🚀 Starting Inference Engine in DEVELOPMENT mode...")
	}

	// Database paths
	dbDir := "./data"
	domainDBPath := filepath.Join(dbDir, "domain.db")
	authDBPath := filepath.Join(dbDir, "auth.db")

	if *cleanDB {
		log.Printf("🧹 Attempting to clean database directory: %s", dbDir)
		if err := os.RemoveAll(dbDir); err != nil {
			log.Printf("⚠️  Warning: Failed to remove database directory %s: %v. Proceeding anyway.", dbDir, err)
		} else {
			log.Printf("✅ Database directory %s cleaned successfully.", dbDir)
		}
	}

	// Ensure database directory exists
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		log.Fatalf("Failed to create database directory: %v", err)
	}

	// Initialize auth database
	authDB, err := database.NewAuthDB(authDBPath)
	if err != nil {
		log.Fatalf("Failed to initialize auth database: %v", err)
	}
	defer authDB.Close()

	// Initialize domain database
	domainDB, err := database.NewSimpleDomainDB(domainDBPath)
	if err != nil {
		log.Fatalf("Failed to initialize domain database: %v", err)
	}
	defer domainDB.Close()

	// Initialize inference service
	inferenceService, err := inference.NewInferenceService(domainDB)
	if err != nil {
		log.Fatalf("Failed to initialize inference service: %v", err)
	}

	// Get JWT secret from environment or use a default
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key" // Default secret key (change in production)
		log.Println("⚠️  Warning: Using default JWT secret. Set JWT_SECRET environment variable in production.")
	}

	shutdownFromAPIChan := make(chan struct{}, 1) // Channel to signal shutdown from API

	// Create shutdown channel for API server
	apiShutdownChan := make(chan struct{}, 1)

	// Create and start API server with inference service
	apiServer, err := api.NewSimpleAPIServer(8080, domainDBPath, apiShutdownChan, inferenceService)
	if err != nil {
		log.Fatalf("Failed to create API server: %v", err)
	}

	// Start API server in background
	go func() {
		log.Println("📡 Starting API server on :8080")
		if err := apiServer.Start(); err != nil {
			log.Printf("API server error: %v", err)
		}
	}()

	// Start the React GUI server
	go func() {
		if *production {
			// Production mode: serve static files
			if err := serveStaticGUI(*guiPort, &staticGUIServer); err != nil && err != http.ErrServerClosed {
				log.Printf("Static GUI server error: %v", err)
				// Optionally trigger shutdown if GUI server fails to start
				// close(shutdownFromAPIChan)
			} else if err == http.ErrServerClosed {
				log.Printf("Static GUI server error: %v", err)
			}
		} else {
			// Development mode: use npm dev server
			if err := startReactGUI(*guiPort); err != nil {
				log.Printf("Dev GUI server error: %v", err)
			}
		}
	}()

	// Wait a moment for servers to start
	time.Sleep(2 * time.Second)

	// Open browser to the React GUI
	guiURL := fmt.Sprintf("http://localhost:%d", *guiPort)
	if *production {
		log.Printf("🌐 Opening Production GUI at %s", guiURL)
	} else {
		log.Printf("🌐 Opening Development GUI at %s", guiURL)
	}

	if err := openBrowser(guiURL); err != nil {
		log.Printf("Could not open browser automatically: %v", err)
		log.Printf("Please open your browser and navigate to: %s", guiURL)
	}

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case <-sigChan:
		log.Println("🛑 Received OS signal. Initiating shutdown...")
	case <-shutdownFromAPIChan:
		log.Println("🛑 Received shutdown signal from frontend. Initiating shutdown...")
	}

	log.Println("🛑 Shutting down servers...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if staticGUIServer != nil {
		log.Println("Shutting down static GUI server...")
		if err := staticGUIServer.Shutdown(ctx); err != nil {
			log.Printf("Error stopping static GUI server: %v", err)
		}
	}
	if err := apiServer.Stop(ctx); err != nil {
		log.Printf("Error stopping API server: %v", err)
	}

	log.Println("✅ Shutdown complete")
}

// startReactGUI starts the React development server
func startReactGUI(port int) error {
	guiDir := "./gui"

	// Check if gui directory exists
	if _, err := os.Stat(guiDir); os.IsNotExist(err) {
		return fmt.Errorf("GUI directory not found: %s", guiDir)
	}

	// Check if node_modules exists, if not run npm install
	nodeModulesPath := filepath.Join(guiDir, "node_modules")
	if _, err := os.Stat(nodeModulesPath); os.IsNotExist(err) {
		log.Println("📦 Installing GUI dependencies...")
		cmd := exec.Command("npm", "install")
		cmd.Dir = guiDir
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("failed to install GUI dependencies: %w", err)
		}
	}

	// Start the development server
	log.Printf("🎨 Starting React GUI server on port %d...", port)
	cmd := exec.Command("npm", "run", "dev", "--", "--port", fmt.Sprintf("%d", port), "--host")
	cmd.Dir = guiDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

// openBrowser opens the default browser to the specified URL
func openBrowser(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
	}
	args = append(args, url)
	return exec.Command(cmd, args...).Start()
}

//go:embed gui/dist/*
var embeddedGUI embed.FS

// serveStaticGUI serves the built React GUI from embedded files
func serveStaticGUI(port int, serverPtr **http.Server) error {
	// Create filesystem from embedded assets
	subFS, err := fs.Sub(embeddedGUI, "gui/dist")
	if err != nil {
		return fmt.Errorf("failed to create embedded filesystem: %w", err)
	}

	mux := http.NewServeMux()

	// Create a custom handler to support client-side routing
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Try to serve the requested file
		filePath := r.URL.Path
		if filePath == "/" {
			filePath = "/index.html"
		}

		// Check if file exists in embedded FS
		_, err := embeddedGUI.Open("gui/dist" + filePath)
		if err == nil {
			// Serve the requested file directly
			http.FileServer(http.FS(subFS)).ServeHTTP(w, r)
			return
		}

		// For all other routes, serve index.html for SPA routing
		// For SPA routing, serve index.html from the embedded filesystem
		http.ServeFile(w, r, filepath.Join("gui/dist", "index.html"))
	})

	log.Printf("🎨 Serving static GUI on port %d...", port)
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}
	*serverPtr = server // Assign the server instance to the provided pointer

	return server.ListenAndServe()
	
}