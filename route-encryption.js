// Route Encryption Handler for ATMAMI Industries
class RouteEncryption {
    constructor() {
        this.encryptedRoutes = {};
        this.init();
    }

    async init() {
        try {
            // Fetch encrypted routes from server
            const response = await fetch('/api/routes');
            const data = await response.json();
            this.encryptedRoutes = data.routes;
            
            // Update all navigation links
            this.updateNavigationLinks();
            
            console.log('🔐 Route encryption initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize route encryption:', error);
        }
    }

    updateNavigationLinks() {
        // Update all navigation links with encrypted routes
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            // Remove leading slash for comparison
            const cleanHref = href.startsWith('/') ? href : '/' + href;
            
            // Find matching encrypted route
            for (const [key, encryptedRoute] of Object.entries(this.encryptedRoutes)) {
                const routeMap = {
                    'home': '/',
                    'about': '/about',
                    'sustainability': '/sustainability',
                    'enquiry': '/enquiry',
                    'gdp': '/gdp',
                    'ims': '/ims'
                };
                
                if (routeMap[key] === cleanHref) {
                    link.href = '/' + encryptedRoute;
                    break;
                }
            }
        });
    }

    // Method to get encrypted URL for a specific route
    getEncryptedUrl(route) {
        const routeMap = {
            'home': '/',
            'about': '/about',
            'sustainability': '/sustainability',
            'enquiry': '/enquiry',
            'gdp': '/gdp',
            'ims': '/ims'
        };
        
        for (const [key, encryptedRoute] of Object.entries(this.encryptedRoutes)) {
            if (routeMap[key] === route) {
                return '/' + encryptedRoute;
            }
        }
        
        return route; // Return original if not found
    }

    // Method to update specific links programmatically
    updateSpecificLink(selector, route) {
        const link = document.querySelector(selector);
        if (link) {
            link.href = this.getEncryptedUrl(route);
        }
    }
}

// Initialize route encryption when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.routeEncryption = new RouteEncryption();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteEncryption;
}
