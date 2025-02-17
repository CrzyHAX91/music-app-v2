# BaddBeats Music Platform (Windows x64)

A modern electronic music platform optimized for Windows x64 systems, featuring subscription-based services and electronic music focus.

## System Requirements

- Windows 10/11 (64-bit)
- Node.js 14+ (64-bit)
- npm 6+
- Git for Windows
- Visual Studio Build Tools 2019+
- Python 2.7 (for node-gyp)

## Quick Start (Windows)

1. Install Prerequisites:
```batch
:: Install Node.js (64-bit) from https://nodejs.org/

:: Install Python 2.7
winget install -e --id Python.Python.2

:: Install Visual Studio Build Tools
winget install -e --id Microsoft.VisualStudio.2019.BuildTools

:: Install Git
winget install -e --id Git.Git
```

2. Clone the Repository:
```batch
git clone https://github.com/yourusername/harmony-music-platform.git
cd harmony-music-platform
```

3. Install Dependencies:
```batch
:: Install Windows-specific dependencies
npm run install-windows
```

4. Configure Environment:
```batch
copy .env.example .env
:: Edit .env with your configuration
```

5. Run the Application:
```batch
:: Development mode
npm run dev

:: Production mode
npm run start
```

## Windows-Specific Features

- Optimized for Windows x64 architecture
- Native Windows audio processing
- Windows-compatible file system operations
- Integrated with Windows security features
- Windows Task Scheduler integration for background tasks

## Deployment Options

### 1. Local Windows Deployment
```batch
:: Run the deployment script
deploy.bat
```

### 2. Vercel Deployment (Frontend)
```batch
:: Install Vercel CLI
npm i -g vercel

:: Deploy
vercel --prod
```

### 3. Heroku Deployment (Backend)
```batch
:: Install Heroku CLI for Windows
winget install -e --id Heroku.CLI

:: Deploy
heroku create harmony-music-platform
git push heroku main
```

## Folder Structure

```
harmony-music-platform/
├── dist/               # Compiled files
├── node_modules/       # Dependencies
├── public/            # Static files
├── src/               # Source code
│   ├── api/          # API endpoints
│   ├── components/   # React components
│   ├── config/       # Configuration files
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── worker/       # Background workers
├── uploads/          # User uploads
├── .env              # Environment variables
├── package.json      # Project configuration
└── webpack.win.config.js  # Windows build configuration
```

## Windows Development Tools

1. **Visual Studio Code Setup**:
   - Install recommended extensions
   - Use Windows-specific settings
   - Enable Windows path resolution

2. **Debugging**:
   - Use Windows Task Manager for process monitoring
   - Enable Windows Event Logging
   - Integrated Chrome DevTools support

3. **Performance Monitoring**:
   - Windows Performance Monitor integration
   - Resource usage tracking
   - Network monitoring

## Common Windows Issues

1. **Node-gyp Errors**:
```batch
:: Fix node-gyp issues
npm install --global --production windows-build-tools
```

2. **Permission Issues**:
```batch
:: Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned
```

3. **Port Conflicts**:
```batch
:: Check ports
netstat -ano | findstr "3000"
:: Kill process
taskkill /PID <process_id> /F
```

## Security Considerations

1. Windows Defender Configuration:
   - Add application directories to exclusions
   - Configure real-time protection settings
   - Set up controlled folder access

2. Windows Firewall Settings:
   - Configure inbound rules
   - Set up outbound rules
   - Enable application-specific rules

## Maintenance

1. **Windows Services**:
```batch
:: Create Windows Service
sc create HarmonyMusic binPath= "path_to_executable"
sc start HarmonyMusic
```

2. **Scheduled Tasks**:
```batch
:: Create scheduled task
schtasks /create /tn "HarmonyMusicBackup" /tr "backup.bat" /sc daily
```

3. **Logging**:
   - Windows Event Log integration
   - Rotating file logs
   - Performance counters

## Support

For Windows-specific issues:
1. Check Windows Event Viewer
2. Review application logs
3. Contact support@harmonymusic.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
