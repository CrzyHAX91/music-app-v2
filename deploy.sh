#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
check_requirements() {
    print_message "Checking requirements..." "$YELLOW"
    
    local requirements=("git" "node" "npm" "docker" "docker-compose")
    local missing=()
    
    for cmd in "${requirements[@]}"; do
        if ! command_exists "$cmd"; then
            missing+=("$cmd")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_message "Missing required tools: ${missing[*]}" "$RED"
        print_message "Please install them before continuing." "$RED"
        exit 1
    fi
    
    print_message "All requirements satisfied!" "$GREEN"
}

# Setup environment variables
setup_env() {
    print_message "Setting up environment variables..." "$YELLOW"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_message "Created .env file from template" "$GREEN"
        print_message "Please edit .env file with your configuration" "$YELLOW"
        exit 1
    fi
}

# Build application
build_app() {
    print_message "Building application..." "$YELLOW"
    
    npm install
    npm run build
    
    if [ $? -eq 0 ]; then
        print_message "Build successful!" "$GREEN"
    else
        print_message "Build failed!" "$RED"
        exit 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_message "Deploying to Vercel..." "$YELLOW"
    
    if ! command_exists vercel; then
        npm install -g vercel
    fi
    
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_message "Deployed to Vercel successfully!" "$GREEN"
    else
        print_message "Vercel deployment failed!" "$RED"
        exit 1
    fi
}

# Deploy to Heroku
deploy_heroku() {
    print_message "Deploying to Heroku..." "$YELLOW"
    
    if ! command_exists heroku; then
        print_message "Heroku CLI not found. Please install it first." "$RED"
        exit 1
    fi
    
    heroku create harmony-music-platform
    git push heroku main
    
    if [ $? -eq 0 ]; then
        print_message "Deployed to Heroku successfully!" "$GREEN"
    else
        print_message "Heroku deployment failed!" "$RED"
        exit 1
    fi
}

# Deploy using Docker
deploy_docker() {
    print_message "Deploying with Docker..." "$YELLOW"
    
    docker-compose build
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_message "Docker deployment successful!" "$GREEN"
    else
        print_message "Docker deployment failed!" "$RED"
        exit 1
    fi
}

# Main deployment script
main() {
    print_message "Harmony Music Platform Deployment Script" "$GREEN"
    print_message "----------------------------------------" "$GREEN"
    
    # Check requirements
    check_requirements
    
    # Setup environment
    setup_env
    
    # Choose deployment platform
    echo "Choose deployment platform:"
    echo "1) Vercel (Recommended for frontend)"
    echo "2) Heroku (Recommended for backend)"
    echo "3) Docker (Local deployment)"
    echo "4) All platforms"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            build_app
            deploy_vercel
            ;;
        2)
            build_app
            deploy_heroku
            ;;
        3)
            deploy_docker
            ;;
        4)
            build_app
            deploy_vercel
            deploy_heroku
            deploy_docker
            ;;
        *)
            print_message "Invalid choice!" "$RED"
            exit 1
            ;;
    esac
    
    print_message "Deployment complete!" "$GREEN"
    print_message "Don't forget to:" "$YELLOW"
    print_message "1. Configure your domain DNS settings" "$YELLOW"
    print_message "2. Set up SSL certificates" "$YELLOW"
    print_message "3. Configure OAuth providers" "$YELLOW"
    print_message "4. Set up payment processing" "$YELLOW"
}

# Run main function
main
