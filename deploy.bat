@echo off
setlocal enabledelayedexpansion

:: Colors for output
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: Print header
echo %GREEN%Harmony Music Platform Deployment Script (Windows x64)%NC%
echo %GREEN%------------------------------------------------%NC%

:: Check requirements
echo %YELLOW%Checking requirements...%NC%

:: Check Node.js
node --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%Node.js is not installed. Please install Node.js for Windows x64.%NC%
    exit /b 1
)

:: Check npm
npm --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%npm is not installed. Please install npm.%NC%
    exit /b 1
)

:: Check Git
git --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%Git is not installed. Please install Git for Windows.%NC%
    exit /b 1
)

echo %GREEN%All requirements satisfied!%NC%

:: Setup environment
if not exist .env (
    copy .env.example .env
    echo %GREEN%Created .env file from template%NC%
    echo %YELLOW%Please edit .env file with your configuration%NC%
    exit /b 1
)

:: Menu
echo.
echo Choose deployment platform:
echo 1) Local Development
echo 2) Vercel (Recommended for frontend)
echo 3) Heroku (Recommended for backend)
echo 4) All platforms
echo.

set /p choice="Enter your choice (1-4): "

:: Install dependencies
echo %YELLOW%Installing dependencies...%NC%
call npm install --arch=x64 --platform=win32

if %ERRORLEVEL% neq 0 (
    echo %RED%Failed to install dependencies%NC%
    exit /b 1
)

:: Build application
echo %YELLOW%Building application...%NC%
call npm run build

if %ERRORLEVEL% neq 0 (
    echo %RED%Build failed%NC%
    exit /b 1
)

:: Process choice
if "%choice%"=="1" (
    call :local_deployment
) else if "%choice%"=="2" (
    call :vercel_deployment
) else if "%choice%"=="3" (
    call :heroku_deployment
) else if "%choice%"=="4" (
    call :all_deployments
) else (
    echo %RED%Invalid choice!%NC%
    exit /b 1
)

echo %GREEN%Deployment complete!%NC%
echo %YELLOW%Don't forget to:%NC%
echo 1. Configure your domain DNS settings
echo 2. Set up SSL certificates
echo 3. Configure OAuth providers
echo 4. Set up payment processing

exit /b 0

:: Local Deployment
:local_deployment
echo %YELLOW%Starting local deployment...%NC%

:: Check if ports are available
netstat -an | find "3000" > nul
if %ERRORLEVEL% equ 0 (
    echo %RED%Port 3000 is already in use. Please free up the port.%NC%
    exit /b 1
)

:: Start application
echo %YELLOW%Starting application...%NC%
start npm run start

echo %GREEN%Local deployment successful! Access the application at http://localhost:3000%NC%
exit /b 0

:: Vercel Deployment
:vercel_deployment
echo %YELLOW%Deploying to Vercel...%NC%

:: Install Vercel CLI if not present
call vercel --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %YELLOW%Installing Vercel CLI...%NC%
    call npm install -g vercel
)

:: Deploy to Vercel
call vercel --prod

if %ERRORLEVEL% neq 0 (
    echo %RED%Vercel deployment failed%NC%
    exit /b 1
)

echo %GREEN%Vercel deployment successful!%NC%
exit /b 0

:: Heroku Deployment
:heroku_deployment
echo %YELLOW%Deploying to Heroku...%NC%

:: Check Heroku CLI
call heroku --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%Heroku CLI is not installed. Please install Heroku CLI for Windows.%NC%
    exit /b 1
)

:: Deploy to Heroku
call heroku create harmony-music-platform
call git push heroku main

if %ERRORLEVEL% neq 0 (
    echo %RED%Heroku deployment failed%NC%
    exit /b 1
)

echo %GREEN%Heroku deployment successful!%NC%
exit /b 0

:: All Deployments
:all_deployments
call :local_deployment
call :vercel_deployment
call :heroku_deployment
exit /b 0
