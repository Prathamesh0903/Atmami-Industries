const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://atmamii.com', 'https://www.atmamii.com'] 
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// URL Encryption/Decryption functions
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!!';
const ALGORITHM = 'aes-256-cbc';

function encryptRoute(route) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(route, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptRoute(encryptedRoute) {
    try {
        const parts = encryptedRoute.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return null;
    }
}

// Route mapping for encryption
const routeMap = {
    'home': '/',
    'about': '/about',
    'sustainability': '/sustainability',
    'enquiry': '/enquiry',
    'gdp': '/gdp',
    'ims': '/ims'
};

// Generate encrypted routes
const encryptedRoutes = {};
Object.keys(routeMap).forEach(key => {
    encryptedRoutes[key] = encryptRoute(routeMap[key]);
});

// Public routes - Serve HTML pages with encrypted URLs
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/sustainability', (req, res) => {
    res.sendFile(path.join(__dirname, 'sustainability.html'));
});

app.get('/enquiry', (req, res) => {
    res.sendFile(path.join(__dirname, 'enquiry.html'));
});

app.get('/gdp', (req, res) => {
    res.sendFile(path.join(__dirname, 'gdp.html'));
});

app.get('/ims', (req, res) => {
    res.sendFile(path.join(__dirname, 'Ims.html'));
});

// Handle encrypted routes
Object.entries(encryptedRoutes).forEach(([key, encryptedRoute]) => {
    app.get('/' + encryptedRoute, (req, res) => {
        const routeMap = {
            'home': '/',
            'about': '/about',
            'sustainability': '/sustainability',
            'enquiry': '/enquiry',
            'gdp': '/gdp',
            'ims': '/ims'
        };
        
        const targetRoute = routeMap[key];
        if (targetRoute) {
            console.log(`🔐 Serving encrypted route: /${encryptedRoute} → ${targetRoute}`);
            res.sendFile(path.join(__dirname, targetRoute === '/' ? 'index.html' : targetRoute.substring(1) + '.html'));
        } else {
            res.status(404).json({ error: 'Route not found' });
        }
    });
});

// API endpoint to get encrypted routes (for frontend use)
app.get('/api/routes', (req, res) => {
    res.json({
        routes: encryptedRoutes,
        message: 'Encrypted routes generated successfully'
    });
});

// Serve route encryption script through encrypted route
app.get('/route-encryption.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'route-encryption.js'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Block direct HTML file access and redirect to encrypted routes
app.get('*.html', (req, res) => {
    const requestedFile = req.path;
    
    // Map HTML files to their corresponding routes
    const htmlToRouteMap = {
        '/index.html': '/',
        '/about.html': '/about',
        '/sustainability.html': '/sustainability',
        '/enquiry.html': '/enquiry',
        '/gdp.html': '/gdp',
        '/Ims.html': '/ims'
    };
    
    const route = htmlToRouteMap[requestedFile];
    if (route) {
        // Find the encrypted version of this route
        for (const [key, encryptedRoute] of Object.entries(encryptedRoutes)) {
            const routeMap = {
                'home': '/',
                'about': '/about',
                'sustainability': '/sustainability',
                'enquiry': '/enquiry',
                'gdp': '/gdp',
                'ims': '/ims'
            };
            
            if (routeMap[key] === route) {
                console.log(`🔄 Redirecting ${requestedFile} → /${encryptedRoute}`);
                return res.redirect('/' + encryptedRoute);
            }
        }
    }
    
    // If no mapping found, redirect to home
    console.log(`🔄 Redirecting ${requestedFile} → /`);
    res.redirect('/');
});

// Serve static files (images, CSS, JS) but not HTML files
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        // Block direct access to HTML files
        if (path.endsWith('.html')) {
            res.status(403).send('Direct access to HTML files is not allowed. Use encrypted routes.');
        }
    }
}));

// Handle 404 for all other routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Page not found',
        message: 'The requested page does not exist. Please use the navigation menu to access available pages.',
        availableRoutes: Object.keys(encryptedRoutes)
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔐 Encryption Key: ${ENCRYPTION_KEY ? 'Configured' : 'Using default'}`);
    console.log(`🌐 Access the application at: http://localhost:${PORT}`);
    console.log(`🔒 Encrypted Routes:`);
    Object.keys(encryptedRoutes).forEach(key => {
        console.log(`   ${key}: /${encryptedRoutes[key]}`);
    });
});

module.exports = app;
