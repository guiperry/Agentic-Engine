package api

import (
	"Inference_Engine/database"
	"Inference_Engine/inference"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

// Server represents the API server
type Server struct {
	router     *mux.Router
	httpServer *http.Server
	services   *ServiceContainer
}

// ServiceContainer holds all service instances
type ServiceContainer struct {
	AuthService         *AuthService
	UserService         *UserService
	AgentService        *AgentService
	TargetService       *TargetService
	CapabilityService   *CapabilityService
	InferenceService    *InferenceService
	OrchestrationService *WorkflowOrchestrationService
	AnalyticsService    *AnalyticsService
	WebConnectionsService *WebConnectionsService
}

// NewServer creates a new API server with all services
func NewServer(
	authDB *database.AuthDB,
	domainDB *database.SimpleDomainDB,
	coreInference *inference.InferenceService,
	jwtSecret string,
) (*Server, error) {
	// Create service container
	services, err := setupServices(authDB, domainDB, coreInference, jwtSecret)
	if err != nil {
		return nil, err
	}
	
	// Setup router with services
	router := setupRouter(services)
	
	return &Server{
		router: router,
		httpServer: &http.Server{
			Addr:    ":8080",
			Handler: router,
		},
		services: services,
	}, nil
}

// setupServices initializes all service instances
func setupServices(
	authDB *database.AuthDB,
	domainDB *database.SimpleDomainDB,
	coreInference *inference.InferenceService,
	jwtSecret string,
) (*ServiceContainer, error) {
	// Create repositories
	userRepo := database.NewUserRepository(authDB.GetDB())
	permissionRepo := database.NewPermissionRepository(authDB.GetDB())
	roleRepo := database.NewRoleRepository(authDB.GetDB())
	tokenRepo := database.NewTokenRepository(authDB.GetDB())
	
	// Create auth service
	authService := NewAuthService(userRepo, tokenRepo, permissionRepo, jwtSecret, 24*time.Hour)
	
	// Create user service
	userService := NewUserService(userRepo, permissionRepo, roleRepo)
	
	// Get agent collection
	agentCollection, err := domainDB.GetOrCreateCollection("agents")
	if err != nil {
		return nil, err
	}
	
	// Create agent repository
	agentRepo := database.NewSimpleAgentRepository(agentCollection)
	
	// Create workflow orchestration service
	workflowService := NewWorkflowOrchestrationService()
	
	// Create web connections service
	webConnectionsService := NewWebConnectionsService()
	
	// Create analytics service
	analyticsService := NewAnalyticsService(workflowService)
	
	return &ServiceContainer{
		AuthService:         authService,
		UserService:         userService,
		OrchestrationService: workflowService,
		AnalyticsService:    analyticsService,
		WebConnectionsService: webConnectionsService,
	}, nil
}

// setupRouter configures the Gin router with all service handlers
func setupRouter(services *ServiceContainer) *mux.Router {
	router := mux.NewRouter()
	
	// CORS middleware
	router.Use(corsMiddleware)
	
	// Public routes
	services.AuthService.RegisterHandlers(router)
	
	// Protected routes
	protected := router.PathPrefix("/api/v1").Subrouter()
	protected.Use(services.AuthService.AuthMiddleware)
	
	// Register service handlers
	services.UserService.RegisterHandlers(router, services.AuthService)
	services.OrchestrationService.RegisterHandlers(router)
	services.AnalyticsService.RegisterHandlers(router)
	services.WebConnectionsService.RegisterHandlers(router)
	
	return router
}

// corsMiddleware adds CORS headers
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Start starts the API server
func (s *Server) Start() error {
	log.Println("Starting API server on", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

// Stop stops the API server
func (s *Server) Stop(ctx context.Context) error {
	log.Println("Stopping API server")
	return s.httpServer.Shutdown(ctx)
}