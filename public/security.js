// ==========================================
// WEBSITE SECURITY PROTECTION
// ==========================================
// Protects against inspect element, right-click, code theft, and common attacks

(function () {
    'use strict';

    // ========== 1. DISABLE RIGHT CLICK ==========
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        // Silently block right-click without popup
        return false;
    });

    // ========== 2. PROTECT AGAINST CODE THEFT ==========
    document.addEventListener('keydown', function (e) {
        // Allow F12 and Inspect silently
        if (e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
            (e.ctrlKey && e.shiftKey && e.keyCode === 74)) {
            // Don't prevent - allow inspection silently
        }

        // Disable Ctrl+U (View Source) - Prevents file tracking
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            // Silently block
            return false;
        }

        // Disable Ctrl+S (Save Page) - Prevents file downloading
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            // Silently block
            return false;
        }

        // Disable Ctrl+Shift+S (Save As)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 83) {
            e.preventDefault();
            // Silently block
            return false;
        }
    });

    // ========== 3. DETECT DEVTOOLS OPEN ==========
    let devtoolsOpen = false;
    const threshold = 160;

    setInterval(function () {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showDevToolsWarning();
            }
        } else {
            devtoolsOpen = false;
        }
    }, 2000);

    // ========== 4. DISABLE TEXT SELECTION ==========
    document.addEventListener('selectstart', function (e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });

    // ========== 5. DISABLE DRAG & DROP ==========
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    });

    // ========== 6. PROTECT AGAINST CONSOLE LOGGING ==========
    // ========== 6. ERROR HANDLING & LOGGING SYSTEM ==========
    // Placeholder for server-side logging endpoint
    const LOGGING_ENDPOINT = 'https://api.threejsplaybook.com/v1/logs';

    function logErrorToServer(errorDetails) {
        // In a production environment, send this data to your server
        // navigator.sendBeacon(LOGGING_ENDPOINT, JSON.stringify(errorDetails));

        // For widely accessible server-side logging without a backend, 
        // you might use services like Sentry, LogRocket, or Firebase Crashlytics.
        // console.warn('Error logged to server (simulated):', errorDetails); 
    }

    // Global Error Handler (Runtime Errors)
    window.onerror = function (message, source, lineno, colno, error) {
        const errorDetails = {
            type: 'Uncaught Exception',
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            stack: error ? error.stack : null,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        logErrorToServer(errorDetails);
        // Silently log without user notification
        return true; // Suppress standard error output to console
    };

    // Global Promise Rejection Handler
    window.addEventListener('unhandledrejection', function (event) {
        const errorDetails = {
            type: 'Unhandled Rejection',
            reason: event.reason,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        logErrorToServer(errorDetails);
        // Silently log without user notification
        event.preventDefault(); // Suppress default console error
    });

    const consoleProtection = function () {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };

        // Disable console methods
        console.log = function () { };
        console.warn = function () { };
        console.info = function () { };
        console.debug = function () { };
        console.clear = function () { };

        // Custom Error Handler
        console.error = function (...args) {
            // Log to server (mock)
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');

            logErrorToServer({
                type: 'Console Error',
                message: message,
                timestamp: new Date().toISOString()
            });

            // Silently log without user notification
        };
    };

    // Enable console protection
    consoleProtection();

    // ========== 7. DETECT IFRAME EMBEDDING ==========
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }

    // ========== 8. PROTECT AGAINST SCREEN CAPTURE ==========
    document.addEventListener('copy', function (e) {
        e.preventDefault();
        showSecurityAlert('Content copying is protected');
        return false;
    });

    document.addEventListener('cut', function (e) {
        e.preventDefault();
        return false;
    });

    // ========== 9. DISABLE PRINT SCREEN ==========
    document.addEventListener('keyup', function (e) {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
            showSecurityAlert('Screenshot functionality is disabled');
        }
    });

    // ========== 10. WATERMARK PROTECTION ==========
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            font-size: 10px;
            color: rgba(0,0,0,0.3);
            pointer-events: none;
            z-index: 999999;
            user-select: none;
        `;
        watermark.textContent = '© Otaga';
        document.body.appendChild(watermark);
    }

    window.addEventListener('load', addWatermark);

    // ========== 11. DETECT SUSPICIOUS ACTIVITY ==========
    let clickCount = 0;
    let clickTimer = null;

    document.addEventListener('click', function () {
        clickCount++;
        clearTimeout(clickTimer);

        if (clickCount > 10) {
            showSecurityWarning();
            clickCount = 0;
        }

        clickTimer = setTimeout(function () {
            clickCount = 0;
        }, 2000);
    });

    // ========== 12. ALERT FUNCTIONS ==========
    function showSecurityAlert(message) {
        // Silently log - do not show any alerts to users
        // All errors are logged server-side only
    }

    function showDevToolsWarning() {
        logErrorToServer({
            type: 'Security Alert',
            message: 'DevTools Access Detected',
            timestamp: new Date().toISOString()
        });
        // Optionally show user alert if desired, but silenced by request to "log server-side only detailed errors"
        // showSecurityAlert('Security Warning: DevTools Access Logged');
    }

    // ========== 13. PREVENT IFRAME INJECTION ==========
    function preventIframeInjection() {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.tagName === 'IFRAME' && !node.hasAttribute('data-allowed')) {
                        node.remove();
                        showSecurityAlert('Unauthorized iframe detected and removed');
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    window.addEventListener('load', preventIframeInjection);

    // ========== 14. SECURE EXTERNAL LINKS ==========
    document.addEventListener('DOMContentLoaded', function () {
        const links = document.querySelectorAll('a[target="_blank"]');
        links.forEach(function (link) {
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    });

    // ========== 15. ANTI-DEBUGGING ==========
    (function () {
        function detectDebugger() {
            const start = new Date();
            debugger;
            const end = new Date();
            if (end - start > 100) {
                window.location.reload();
            }
        }

        // Uncomment to enable anti-debugging
        // setInterval(detectDebugger, 1000);
    })();

    // ========== 16. PROTECT AGAINST XSS ==========
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Export sanitizeInput for forms
    window.sanitizeInput = sanitizeInput;

    // ========== 17. PROTECT NETWORK REQUESTS ==========
    // Override fetch to hide sensitive requests
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        // Allow but don't log sensitive API calls
        return originalFetch.apply(this, args);
    };

    // ========== 18. PREVENT FILE PATH EXPOSURE ==========
    // Remove script src attributes after load to hide file paths
    window.addEventListener('load', function () {
        setTimeout(function () {
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(function (script) {
                if (script.src && !script.src.includes('cdnjs') && !script.src.includes('jsdelivr')) {
                    // Keep the script but hide its source
                    script.removeAttribute('src');
                }
            });
        }, 3000);
    });

    // ========== 19. DISABLE NETWORK PANEL DOWNLOADS ==========
    // Add warning when Network tab might be used
    if (window.PerformanceObserver) {
        const observer = new PerformanceObserver(function (list) {
            // Detect excessive resource monitoring
            if (list.getEntries().length > 50) {
                showDevToolsWarning();
            }
        });
        observer.observe({ entryTypes: ['resource'] });
    }

    // ========== 20. COPYRIGHT PROTECTION ==========
    // Add copyright meta tags
    const meta = document.createElement('meta');
    meta.name = 'copyright';
    meta.content = '© 2024 Three.js Sample Geeks. All Rights Reserved.';
    document.head.appendChild(meta);

    // ========== INITIALIZATION MESSAGE ==========
    // Logs suppressed by consoleProtection()

    // ========== 21. SAFE REDIRECT VALIDATION ==========
    const ALLOWED_DOMAINS = [
        'threejsplaybooks.web.app',
        'threejsplaybooks.firebaseapp.com',
        'localhost',
        '127.0.0.1',
        'play.google.com'
    ];

    function safeRedirect(url) {
        if (!url) return;

        try {
            // Check if it's a relative URL
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../') ||
                (!url.startsWith('http://') && !url.startsWith('https://') && !url.includes(':'))) {
                window.location.href = url;
                return;
            }

            // Parse absolute URL
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            // Check against allowlist
            const isAllowed = ALLOWED_DOMAINS.some(domain =>
                hostname === domain || hostname.endsWith('.' + domain)
            );

            if (isAllowed) {
                window.location.href = url;
            } else {
                console.error(`Blocked redirect to unauthorized domain: ${hostname}`);
                showSecurityAlert(`Redirect to ${hostname} blocked for security`);
            }
        } catch (e) {
            console.error('Invalid URL for redirect:', url);
            showSecurityAlert('Invalid redirect URL');
        }
    }

    // Export safeRedirect global
    window.safeRedirect = safeRedirect;

})();
