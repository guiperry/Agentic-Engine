package api

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"Inference_Engine/database/models"
	"github.com/gorilla/mux"
)

// AnalyticsSummary represents a summary of analytics data
type AnalyticsSummary struct {
	TotalWorkflows      int                  `json:"total_workflows"`
	CompletedWorkflows  int                  `json:"completed_workflows"`
	FailedWorkflows     int                  `json:"failed_workflows"`
	SuccessRate         float64              `json:"success_rate"`
	AverageResponseTime float64              `json:"average_response_time_ms"`
	TodayWorkflows      int                  `json:"today_workflows"`
	TopCapabilities     []TopCapabilityUsage `json:"top_capabilities"`
	AgentCount          int                  `json:"agent_count"`
	TargetCount         int                  `json:"target_count"`
	LastUpdated         time.Time            `json:"last_updated"`
}

// TopCapabilityUsage represents a frequently used capability
type TopCapabilityUsage struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// AnalyticsService manages analytics data
type AnalyticsService struct {
	workflowRepo  *WorkflowOrchestrationService
	cache         map[int64]*AnalyticsSummary
	cacheMutex    sync.RWMutex
	cacheExpiry   time.Duration
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(workflowRepo *WorkflowOrchestrationService) *AnalyticsService {
	return &AnalyticsService{
		workflowRepo:  workflowRepo,
		cache:         make(map[int64]*AnalyticsSummary),
		cacheExpiry:   5 * time.Minute, // Cache analytics for 5 minutes
	}
}

// GetAnalyticsSummary generates a summary of analytics data for a user
func (s *AnalyticsService) GetAnalyticsSummary(ctx context.Context, userID int64) (*AnalyticsSummary, error) {
	// Check cache first
	s.cacheMutex.RLock()
	if summary, ok := s.cache[userID]; ok {
		if time.Since(summary.LastUpdated) < s.cacheExpiry {
			s.cacheMutex.RUnlock()
			return summary, nil
		}
	}
	s.cacheMutex.RUnlock()

	// Cache miss or expired, generate new summary
	summary := &AnalyticsSummary{
		LastUpdated: time.Now(),
	}

	// Get all workflows for the user
	workflows, err := s.workflowRepo.ListWorkflows(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflows: %w", err)
	}

	// Calculate statistics
	summary.TotalWorkflows = len(workflows)
	
	// Count today's workflows
	today := time.Now().Truncate(24 * time.Hour)
	
	// Track unique targets and agents
	uniqueTargets := make(map[string]bool)
	uniqueAgents := make(map[string]bool)
	
	// Count completed and failed workflows
	for _, workflow := range workflows {
		// Count today's workflows
		if workflow.StartTime.After(today) || workflow.StartTime.Equal(today) {
			summary.TodayWorkflows++
		}
		
		// Track unique targets and agents
		uniqueTargets[workflow.TargetID] = true
		uniqueAgents[workflow.AgentID] = true
		
		// Count by status
		switch workflow.Status {
		case string(WorkflowStatusCompleted):
			summary.CompletedWorkflows++
			
			// Calculate duration for completed workflows
			if workflow.EndTime != nil {
				duration := workflow.EndTime.Sub(workflow.StartTime)
				summary.AverageResponseTime += float64(duration.Milliseconds())
			}
		case string(WorkflowStatusFailed):
			summary.FailedWorkflows++
		}
	}
	
	// Calculate success rate
	if summary.TotalWorkflows > 0 {
		summary.SuccessRate = float64(summary.CompletedWorkflows) / float64(summary.TotalWorkflows) * 100
	}
	
	// Calculate average response time
	if summary.CompletedWorkflows > 0 {
		summary.AverageResponseTime /= float64(summary.CompletedWorkflows)
	}
	
	// Count unique targets and agents
	summary.TargetCount = len(uniqueTargets)
	summary.AgentCount = len(uniqueAgents)
	
	// Get top capabilities (simplified for now)
	// In a real implementation, you would query the database for this
	capabilityCounts := make(map[string]int)
	for _, workflow := range workflows {
		capabilityCounts[workflow.CapabilityID]++
	}
	
	// Convert to TopCapabilityUsage slice
	for id, count := range capabilityCounts {
		summary.TopCapabilities = append(summary.TopCapabilities, TopCapabilityUsage{
			ID:    id,
			Name:  id, // In a real implementation, you would look up the name
			Count: count,
		})
	}
	
	// Sort top capabilities by count (descending)
	for i := 0; i < len(summary.TopCapabilities); i++ {
		for j := i + 1; j < len(summary.TopCapabilities); j++ {
			if summary.TopCapabilities[i].Count < summary.TopCapabilities[j].Count {
				summary.TopCapabilities[i], summary.TopCapabilities[j] = summary.TopCapabilities[j], summary.TopCapabilities[i]
			}
		}
	}
	
	// Limit to top 5
	if len(summary.TopCapabilities) > 5 {
		summary.TopCapabilities = summary.TopCapabilities[:5]
	}

	// Update cache
	s.cacheMutex.Lock()
	s.cache[userID] = summary
	s.cacheMutex.Unlock()

	return summary, nil
}

// RegisterHandlers registers the analytics API handlers
func (s *AnalyticsService) RegisterHandlers(router *mux.Router) {
	router.HandleFunc("/api/v1/analytics/summary", s.handleGetAnalyticsSummary).Methods("GET")
	router.HandleFunc("/api/v1/analytics/top-capabilities", s.handleGetTopCapabilities).Methods("GET")
}

// handleGetAnalyticsSummary handles GET /api/v1/analytics/summary
func (s *AnalyticsService) handleGetAnalyticsSummary(w http.ResponseWriter, r *http.Request) {
	// For simplicity, we'll use a fixed user ID
	userID := int64(1)

	summary, err := s.GetAnalyticsSummary(r.Context(), userID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get analytics summary: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"summary": summary,
	})
}

// handleGetTopCapabilities handles GET /api/v1/analytics/top-capabilities
func (s *AnalyticsService) handleGetTopCapabilities(w http.ResponseWriter, r *http.Request) {
	// For simplicity, we'll use a fixed user ID
	userID := int64(1)

	// Get limit from query parameter
	limitStr := r.URL.Query().Get("limit")
	limit := 5 // Default
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// Get analytics summary (which includes top capabilities)
	summary, err := s.GetAnalyticsSummary(r.Context(), userID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get top capabilities: %v", err), http.StatusInternalServerError)
		return
	}

	// Limit the number of capabilities returned
	topCapabilities := summary.TopCapabilities
	if len(topCapabilities) > limit {
		topCapabilities = topCapabilities[:limit]
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"capabilities": topCapabilities,
	})
}