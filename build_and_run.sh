#!/bin/bash

# Build the React application
echo "Building React application..."
cd gui
npm run build
cd ..

# Build the Go binary
echo "Building Go binary..."
go build -o agentic-engine

# Run the Go application in production mode
echo "Starting Go server in production mode..."
./agentic-engine --production