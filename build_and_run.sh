#!/bin/bash

# Build the React application
echo "Building React application..."
cd gui
npm run build
cd ..

# Run the Go application in production mode
echo "Starting Go server in production mode..."
go run main.go --production