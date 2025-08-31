# 🔐 Secured Routes - URL Encryption System

## Overview
This system implements URL encryption/obfuscation for ATMAMI Industries website routes. All internal navigation links are automatically encrypted to prevent direct URL access and enhance security.

## How It Works

### 1. Route Encryption
- All internal routes are encrypted using AES-256-CBC encryption
- Each route gets a unique encrypted string that changes on server restart
- Original routes are mapped to encrypted versions automatically

### 2. Route Mapping
```
Original Routes → Encrypted Routes
/              → /[encrypted-string]
/about         → /[encrypted-string]
/sustainability → /[encrypted-string]
/enquiry       → /[encrypted-string]
/gdp           → /[encrypted-string]
/ims           → /[encrypted-string]
```

### 3. Automatic Link Updates
- The `route-encryption.js` script automatically updates all navigation links
- Links are updated when the page loads
- External links, anchors, and special links (mailto:, tel:) are preserved

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `config.env`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# URL Encryption Configuration
ENCRYPTION_KEY=your-32-character-secret-key-here!!

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Access the Application
- Main site: `http://localhost:3000`
- Encrypted routes will be displayed in the console on startup

## Security Features

### 🔒 URL Encryption
- AES-256-CBC encryption for all routes
- Unique encryption key per server instance
- Routes are obfuscated and not easily guessable

### 🛡️ Security Headers
- Helmet.js for security headers
- Content Security Policy (CSP)
- XSS protection
- Clickjacking protection

### ⚡ Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable limits in `config.env`

### 🌐 CORS Protection
- Configured for production domains
- Prevents unauthorized cross-origin requests

## API Endpoints

### Get Encrypted Routes
```
GET /api/routes
```
Returns all encrypted routes for frontend use.

## Frontend Integration

### 1. Include the Script
Add to your HTML files:
```html
<script src="route-encryption.js"></script>
```

### 2. Automatic Link Updates
The script automatically:
- Fetches encrypted routes from `/api/routes`
- Updates all internal navigation links
- Preserves external links and anchors

### 3. Manual Link Updates
```javascript
// Update specific link
window.routeEncryption.updateSpecificLink('.my-link', '/about');

// Get encrypted URL
const encryptedUrl = window.routeEncryption.getEncryptedUrl('/about');
```

## File Structure
```
├── server.js              # Main Express server with encryption
├── route-encryption.js    # Frontend route encryption handler
├── package.json           # Dependencies
├── config.env             # Configuration
├── index.html             # Home page
├── about.html             # About page
├── sustainability.html    # Sustainability page
├── enquiry.html           # Enquiry page
├── gdp.html              # GDP page
├── Ims.html              # IMS page
└── SECURED_ROUTES_README.md # This file
```

## Production Deployment

### 1. Environment Variables
Set production environment variables:
```env
NODE_ENV=production
ENCRYPTION_KEY=your-production-32-char-key!!
PORT=3000
```

### 2. Security Considerations
- Change the default encryption key
- Use HTTPS in production
- Configure proper CORS origins
- Set up proper rate limiting

### 3. Monitoring
- Monitor server logs for encryption status
- Check encrypted routes on startup
- Verify link updates in browser console

## Troubleshooting

### Routes Not Encrypting
1. Check if `route-encryption.js` is loaded
2. Verify `/api/routes` endpoint is accessible
3. Check browser console for errors

### Links Not Updating
1. Ensure links have proper `href` attributes
2. Check if links are internal (not external)
3. Verify route mapping in `route-encryption.js`

### Server Issues
1. Check if all dependencies are installed
2. Verify `config.env` configuration
3. Check server logs for errors

## Benefits

### 🔐 Enhanced Security
- Prevents direct URL access
- Obfuscates internal structure
- Makes URL enumeration difficult

### 🛡️ Protection Against
- URL enumeration attacks
- Directory traversal
- Direct file access attempts

### 📈 SEO Friendly
- Original routes still work
- Search engines can still crawl
- No impact on SEO rankings

## Support
For issues or questions about the secured routes system, check the server logs and browser console for detailed error messages.
