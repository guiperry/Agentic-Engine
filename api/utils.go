package api

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// respondWithJSON sends a JSON response
func respondWithJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// respondWithError sends an error response
func respondWithError(w http.ResponseWriter, status int, message string) {
	respondWithJSON(w, status, map[string]string{"error": message})
}

// parseID parses a string ID into an int64
func parseID(id string) (int64, error) {
	return strconv.ParseInt(id, 10, 64)
}