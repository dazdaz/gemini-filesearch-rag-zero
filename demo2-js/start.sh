#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID file for tracking server process
PID_FILE="/tmp/gemini-demo-server.pid"

# Check for stop flag
if [[ "$1" == "--stop" ]]; then
    echo -e "${YELLOW}🛑 Stopping Gemini File Search Demo Server...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        SERVER_PID=$(cat "$PID_FILE")
        if kill -0 "$SERVER_PID" 2>/dev/null; then
            kill -INT "$SERVER_PID"
            sleep 2
            
            # Check if process stopped
            if ! kill -0 "$SERVER_PID" 2>/dev/null; then
                echo -e "${GREEN}✅ Server stopped successfully${NC}"
                rm -f "$PID_FILE"
            else
                echo -e "${RED}⚠️ Server still running, forcing shutdown...${NC}"
                kill -KILL "$SERVER_PID"
                rm -f "$PID_FILE"
            fi
        else
            echo -e "${YELLOW}Server process not found (PID: $SERVER_PID)${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}No server appears to be running (no PID file found)${NC}"
    fi
    exit 0
fi

# Check for debug flag
DEBUG_MODE=false
if [[ "$1" == "--debug" ]]; then
    DEBUG_MODE=true
    export NODE_ENV=development
    export DEBUG=express:*
    echo -e "${YELLOW}🐛 DEBUG MODE ENABLED${NC}"
    echo "   All API requests and errors will be logged"
    echo ""
fi

# Check for help flag
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo -e "${BLUE}Gemini File Search Demo - Usage${NC}"
    echo ""
    echo "  ./start.sh          - Start the server normally"
    echo "  ./start.sh --debug  - Start with verbose debug logging"
    echo "  ./start.sh --stop   - Stop the running server"
    echo "  ./start.sh --help   - Show this help message"
    echo ""
    exit 0
fi

echo -e "${BLUE}🚀 Gemini File Search - JavaScript Demo Startup${NC}"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js version 18+ is recommended (you have $(node -v))${NC}"
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    
    # Check if parent directory has .env
    if [ -f "../.env" ]; then
        echo -e "${BLUE}ℹ️  Found .env in parent directory, copying...${NC}"
        cp ../.env .env
        echo -e "${GREEN}✓${NC} .env file copied"
    elif [ -f "../.env.example" ]; then
        echo -e "${BLUE}ℹ️  Creating .env from .env.example...${NC}"
        cp ../.env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env and add your GEMINI_API_KEY${NC}"
        echo ""
        read -p "Press Enter to continue or Ctrl+C to exit and configure .env..."
    else
        echo -e "${RED}❌ Error: No .env or .env.example file found${NC}"
        echo "Please create a .env file with your GEMINI_API_KEY"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} .env file found"
fi

# Check if GEMINI_API_KEY is set in .env
if ! grep -q "GEMINI_API_KEY=.*[a-zA-Z0-9]" .env; then
    echo -e "${RED}❌ Error: GEMINI_API_KEY not set in .env file${NC}"
    echo "Please edit .env and add your API key:"
    echo "  GEMINI_API_KEY=your-api-key-here"
    echo ""
    echo "Get your API key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

echo -e "${GREEN}✓${NC} GEMINI_API_KEY configured"

# Check if port 3000 is already in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo ""
    echo "Options:"
    echo "  1. Stop the existing process: ./start.sh --stop"
    echo "  2. Kill the process using port 3000: lsof -ti:3000 | xargs kill -9"
    echo ""
    read -p "Kill existing process and continue? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓${NC} Port 3000 cleared"
        sleep 1
    else
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Error: npm is not installed${NC}"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Dependencies installed successfully"
    else
        echo -e "${RED}❌ Error: Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir uploads
    echo -e "${GREEN}✓${NC} Created uploads directory"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 All checks passed! Starting server...${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}📍 Server will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}📍 Press Ctrl+C to stop the server${NC}"

if [ "$DEBUG_MODE" = true ]; then
    echo -e "${YELLOW}📍 Debug mode: Verbose logging enabled${NC}"
    echo -e "${YELLOW}📍 Test page: http://localhost:3000/test.html${NC}"
fi

echo ""

# Trap Ctrl+C and handle graceful shutdown
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down server gracefully...${NC}"
    
    # Kill the npm/node process
    if [ ! -z "$SERVER_PID" ]; then
        kill -SIGTERM $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ Server stopped cleanly${NC}"
    echo -e "${BLUE}👋 Goodbye!${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the server and capture its PID
if [ "$DEBUG_MODE" = true ]; then
    echo -e "${YELLOW}Starting in DEBUG mode...${NC}"
    echo ""
    NODE_ENV=development npm start &
    SERVER_PID=$!
else
    npm start &
    SERVER_PID=$!
fi

# Save PID to file for --stop option
echo $SERVER_PID > "$PID_FILE"
echo -e "${GREEN}✅ Server PID saved: $SERVER_PID${NC}"
echo ""
echo -e "${BLUE}To stop the server, use:${NC}"
echo -e "  ${YELLOW}./start.sh --stop${NC}  or  ${YELLOW}Ctrl+C${NC}"
echo ""

# Wait for the server process
wait $SERVER_PID

# Clean up PID file when server exits
rm -f "$PID_FILE"