const os = require('os');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Health check configuration
const config = {
    diskSpaceThreshold: 90, // Percentage
    memoryThreshold: 90,    // Percentage
    cpuThreshold: 90,       // Percentage
    responseTimeThreshold: 500 // Milliseconds
};

// System health checks
async function checkSystemHealth() {
    try {
        const health = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            services: {},
            system: {
                uptime: os.uptime(),
                loadavg: os.loadavg(),
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem()
                },
                cpu: await getCpuUsage()
            }
        };

        // Check disk space
        const diskSpace = await checkDiskSpace();
        health.system.disk = diskSpace;

        // Check memory usage
        const memoryUsagePercent = (health.system.memory.used / health.system.memory.total) * 100;
        if (memoryUsagePercent > config.memoryThreshold) {
            health.status = 'warning';
            health.warnings = health.warnings || [];
            health.warnings.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
        }

        // Check CPU usage
        if (health.system.cpu > config.cpuThreshold) {
            health.status = 'warning';
            health.warnings = health.warnings || [];
            health.warnings.push(`High CPU usage: ${health.system.cpu.toFixed(2)}%`);
        }

        // Check disk space usage
        if (diskSpace.usedPercentage > config.diskSpaceThreshold) {
            health.status = 'warning';
            health.warnings = health.warnings || [];
            health.warnings.push(`High disk usage: ${diskSpace.usedPercentage.toFixed(2)}%`);
        }

        return health;
    } catch (error) {
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
}

// Get CPU usage
async function getCpuUsage() {
    const startMeasure = os.cpus().map(cpu => cpu.times);
    await new Promise(resolve => setTimeout(resolve, 100));
    const endMeasure = os.cpus().map(cpu => cpu.times);
    
    const totalUsage = endMeasure.map((end, i) => {
        const start = startMeasure[i];
        const total = (end.user + end.nice + end.sys + end.idle) - 
                     (start.user + start.nice + start.sys + start.idle);
        const idle = end.idle - start.idle;
        return (1 - idle / total) * 100;
    });

    return totalUsage.reduce((acc, curr) => acc + curr, 0) / totalUsage.length;
}

// Check disk space
async function checkDiskSpace() {
    try {
        const { stdout } = await exec('df -h /');
        const lines = stdout.trim().split('\n');
        const [, info] = lines;
        const [filesystem, size, used, available, percentage] = info.split(/\s+/);
        
        return {
            filesystem,
            size,
            used,
            available,
            usedPercentage: parseInt(percentage)
        };
    } catch (error) {
        throw new Error(`Failed to check disk space: ${error.message}`);
    }
}

// Service health checks
async function checkServiceHealth(service) {
    const startTime = Date.now();
    try {
        const response = await fetch(service.url);
        const responseTime = Date.now() - startTime;

        return {
            status: response.ok ? 'healthy' : 'unhealthy',
            responseTime,
            lastChecked: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message,
            lastChecked: new Date().toISOString()
        };
    }
}

// Express middleware for response time monitoring
function responseTimeMiddleware(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > config.responseTimeThreshold) {
            console.warn(`Slow response time (${duration}ms) for ${req.method} ${req.url}`);
        }
    });
    next();
}

// Express route handler
function healthCheckHandler(req, res) {
    checkSystemHealth()
        .then(health => {
            const statusCode = health.status === 'healthy' ? 200 : 
                             health.status === 'warning' ? 200 : 500;
            res.status(statusCode).json(health);
        })
        .catch(error => {
            res.status(500).json({
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        });
}

module.exports = {
    checkSystemHealth,
    checkServiceHealth,
    responseTimeMiddleware,
    healthCheckHandler,
    config
};
