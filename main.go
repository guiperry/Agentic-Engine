package main

import (
	"context"
	"flag"
	"fmt"
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

	dbPath := "./data/inference_engine.db"

	if *cleanDB {
		log.Printf("🧹 Attempting to clean database directory: %s", dbPath)
		if err := os.RemoveAll(dbPath); err != nil {
			log.Printf("⚠️  Warning: Failed to remove database directory %s: %v. Proceeding anyway.", dbPath, err)
		} else {
			log.Printf("✅ Database directory %s cleaned successfully.", dbPath)
		}
	}

	shutdownFromAPIChan := make(chan struct{}, 1) // Channel to signal shutdown from API

	// Start API server in a goroutine
	apiServer, err := api.NewSimpleAPIServer(8080, dbPath, shutdownFromAPIChan)
	if err != nil {
		log.Fatalf("Failed to create API server: %v", err)
	}

	// Create sample data
	if err := apiServer.CreateSampleData(); err != nil {
		log.Printf("Warning: Failed to create sample data: %v", err)
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

// serveStaticGUI serves the built React GUI (alternative to dev server)
func serveStaticGUI(port int, serverPtr **http.Server) error {
	guiDistDir := "./gui/dist"

	// Check if dist directory exists
	if _, err := os.Stat(guiDistDir); os.IsNotExist(err) {
		return fmt.Errorf("GUI dist directory not found: %s. Run 'npm run build' in the gui directory first", guiDistDir)
	}
	fs := http.FileServer(http.Dir(guiDistDir))
	mux := http.NewServeMux()

	// Create a custom handler to support client-side routing
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if the requested file exists
		path := filepath.Join(guiDistDir, r.URL.Path)
		statInfo, err := os.Stat(path)

		// If the file exists, serve it directly
		if err == nil && !statInfo.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}

		// For all other routes, serve the index.html file to support client-side routing
		http.ServeFile(w, r, filepath.Join(guiDistDir, "index.html"))
	})

	log.Printf("🎨 Serving static GUI on port %d...", port)
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}
	*serverPtr = server // Assign the server instance to the provided pointer

	err := server.ListenAndServe()
	return err
}
