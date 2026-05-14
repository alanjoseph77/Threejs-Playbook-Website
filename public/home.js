// Home Page JavaScript
document.addEventListener('DOMContentLoaded', function () {

    // Page Loader
    const pageLoader = document.getElementById('page-loader');

    // Hide loader after page loads
    window.addEventListener('load', function () {
        setTimeout(() => {
            pageLoader.classList.add('hidden');
        }, 1000);
    });

    // Mobile Navigation and Sidebar
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    let isNavOpen = false;

    // Toggle mobile navigation
    if (hamburgerBtn && navOverlay) {
        hamburgerBtn.addEventListener('click', function () {
            isNavOpen = !isNavOpen;
            hamburgerBtn.classList.toggle('active', isNavOpen);
            navOverlay.classList.toggle('active', isNavOpen);
            document.body.style.overflow = isNavOpen ? 'hidden' : '';
        });
    }

    // Note: Create board form code removed as form-overlay doesn't exist in HTML
    // The Explore button should navigate normally to explore.html

    // Ensure Explore button works on mobile devices
    const exploreButton = document.querySelector('.create-board-btn');
    if (exploreButton) {
        // Add explicit click handler for mobile reliability
        exploreButton.addEventListener('click', function (e) {
            // Let the default anchor behavior work
            // This ensures navigation happens even if there are touch event issues
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Fallback navigation for mobile if default fails
                setTimeout(() => {
                    if (!document.hidden) {
                        window.safeRedirect ? window.safeRedirect(href) : window.location.href = href;
                    }
                }, 100);
            }
        }, { passive: true });

        // Also handle touch events explicitly for better mobile support
        exploreButton.addEventListener('touchend', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                window.safeRedirect ? window.safeRedirect(href) : window.location.href = href;
            }
        }, { passive: false });
    }

    // Close overlays with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (isNavOpen) {
                isNavOpen = false;
                hamburgerBtn.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Close nav when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            isNavOpen = false;
            hamburgerBtn.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Hero Canvas Interactive Drawing
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas size
        function resizeCanvas() {
            heroCanvas.width = heroCanvas.offsetWidth;
            heroCanvas.height = heroCanvas.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Drawing functions
        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = getMousePos(e);
        }

        function draw(e) {
            if (!isDrawing) return;

            const [currentX, currentY] = getMousePos(e);

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = '#a0d2eb'; // Ice blue drawing color
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            [lastX, lastY] = [currentX, currentY];
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function getMousePos(e) {
            const rect = heroCanvas.getBoundingClientRect();
            return [
                e.clientX - rect.left,
                e.clientY - rect.top
            ];
        }

        // Mouse events
        heroCanvas.addEventListener('mousedown', startDrawing);
        heroCanvas.addEventListener('mousemove', draw);
        heroCanvas.addEventListener('mouseup', stopDrawing);
        heroCanvas.addEventListener('mouseleave', stopDrawing);

        // Touch events for mobile
        heroCanvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            heroCanvas.dispatchEvent(mouseEvent);
        });

        heroCanvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            heroCanvas.dispatchEvent(mouseEvent);
        });

        heroCanvas.addEventListener('touchend', function (e) {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            heroCanvas.dispatchEvent(mouseEvent);
        });

        // Canvas click effect (like hearts)
        heroCanvas.addEventListener('click', function (e) {
            const [x, y] = getMousePos(e);
            addLikeEffect(x, y);
        });

        function addLikeEffect(x, y) {
            // Create heart effect
            ctx.save();
            ctx.font = '24px Arial';
            ctx.fillStyle = '#a0d2eb';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', x, y);
            ctx.restore();

            // Fade out effect
            setTimeout(() => {
                // You could add more sophisticated animation here
            }, 1000);
        }
    }

    // ========== FEATURES SECTION FUNCTIONALITY ==========

    // Feature card interactions
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // Feature buttons functionality
    const featureButtons = document.querySelectorAll('.feature-btn');
    featureButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const buttonText = this.textContent.trim();
            const originalText = buttonText;

            // Button loading states
            this.style.pointerEvents = 'none';

            switch (buttonText) {
                case 'Get Started':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Ready! 🚀';
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 1500);
                    }, 800);
                    break;

                case 'Learn More':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Awesome! 📱';
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 1500);
                    }, 800);
                    break;

                case 'See Examples':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Amazing! ⚡';
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 1500);
                    }, 800);
                    break;

                case 'Explore':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Exploring! 🌟';
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 1500);
                    }, 800);
                    break;

                case 'Join Us':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Welcome! 🤝';
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 1500);
                    }, 800);
                    break;

                case 'Case Studies':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Impressive! 📈';
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 1500);
                    }, 800);
                    break;
            }
        });
    });

    // CTA Buttons functionality
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const buttonText = this.textContent.trim();
            const originalText = buttonText;

            this.style.pointerEvents = 'none';

            if (buttonText === 'Start Building') {
                this.textContent = 'Initializing...';
                setTimeout(() => {
                    this.textContent = "Let's Build! 🔨";
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.pointerEvents = 'auto';
                    }, 2000);
                }, 1000);
            } else if (buttonText === 'View Documentation') {
                this.textContent = 'Loading Docs...';
                setTimeout(() => {
                    this.textContent = 'Documentation! 📚';
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.pointerEvents = 'auto';
                    }, 2000);
                }, 1000);
            }
        });
    });

    // Feature icons rotation on scroll
    const featureIcons = document.querySelectorAll('.feature-icon');

    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;

        featureIcons.forEach((icon, index) => {
            const rate = scrolled * -0.1 * (index + 1);
            icon.style.transform = `rotate(${rate}deg)`;
        });
    }, 16));

    // Animated counters for features (if any numbers are present)
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            element.textContent = Math.floor(start);

            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    }

    // Feature card ripple effect
    featureCards.forEach(card => {
        card.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('feature-ripple');

            // Add CSS for feature ripple if not present
            if (!document.querySelector('#feature-ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'feature-ripple-styles';
                style.textContent = `
                    .feature-ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(160, 210, 235, 0.3);
                        transform: scale(0);
                        animation: feature-ripple-animation 0.8s ease-out;
                        pointer-events: none;
                    }
                    
                    @keyframes feature-ripple-animation {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 800);
        });
    });

    // Hero Scroll Button
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', function () {
            const createBoardSection = document.getElementById('create-board');
            if (createBoardSection) {
                createBoardSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Create Board Form
    const createBoardForm = document.querySelector('.create-board-form');
    const boardInput = document.querySelector('.board-input');

    if (createBoardForm && boardInput) {
        // Dynamic placeholder for desktop
        if (window.innerWidth >= 768) {
            const placeholders = [
                "Another meeting? Don't get board!",
                "Why did the chicken cross the road? To create a board!",
                "What do you call two close boards? Neighboards!",
                "Chuck Norris approves your board!",
                "The one board to name them all",
                "R2D2 says be-board be-board",
                "Open the doors to Boardania",
                "Your personal board of directors",
                "The Mothership is taking off, please board now!"
            ];

            const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
            boardInput.placeholder = randomPlaceholder;
        }

        // Form submission
        createBoardForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const boardName = boardInput.value.trim();

            if (boardName) {
                // Simulate board creation (replace with actual API call)
                const boardUrl = `/create?boardName=${encodeURIComponent(boardName)}`;

                // Add loading state
                const submitBtn = document.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '...';
                submitBtn.disabled = true;

                // Simulate API delay
                setTimeout(() => {
                    // In a real app, you would make an API call here
                    console.log('Creating board:', boardName);
                    window.safeRedirect ? window.safeRedirect(boardUrl) : window.location.href = boardUrl;
                }, 1000);
            }
        });

        // Input focus effects
        boardInput.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        boardInput.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    }

    // Smooth scroll for navigation links
    const allNavLinks = document.querySelectorAll('a[href^="#"]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.section-heading, .create-board-form, .star-wrapper, .feature-card, .features-cta');
    animateElements.forEach((el, index) => {
        // Add staggered delay for feature cards
        if (el.classList.contains('feature-card')) {
            el.style.animationDelay = `${index * 0.1}s`;
        }
        observer.observe(el);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Escape key to clear canvas
        if (e.key === 'Escape' && heroCanvas) {
            const ctx = heroCanvas.getContext('2d');
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        }

        // Enter key to focus on board input
        if (e.key === 'Enter' && e.ctrlKey && boardInput) {
            boardInput.focus();
        }
    });

    // Performance optimization: Throttle scroll events
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttled scroll handler for better performance
    const throttledScrollHandler = throttle(function () {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.documentElement.style.setProperty('--scroll-percent', scrollPercent + '%');
    }, 16);

    window.addEventListener('scroll', throttledScrollHandler);

    // Error handling for missing images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function () {
            console.warn('Failed to load image:', this.src);
            // You could set a fallback image here
            // this.src = 'path/to/fallback-image.png';
        });
    });

    // Console welcome message
    console.log('%c🎨 Welcome to Three.js Home!', 'color: #a0d2eb; font-size: 20px; font-weight: bold;');
    console.log('%cTry drawing on the hero canvas or creating a new board!', 'color: #2E2E2E; font-size: 14px;');

    // Contact Form Handler - Direct Email Sending
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#FFA500';

            const formData = new FormData(contactForm);

            // Add Web3Forms access key
            formData.append('access_key', '8ece4856-1221-45b5-916f-e7a4815e5045');
            formData.append('subject', 'New Contact Form Message from Three.js Website');
            formData.append('from_name', formData.get('name'));

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    // Success
                    submitBtn.textContent = '✓ Message Sent!';
                    submitBtn.style.backgroundColor = '#4CAF50';
                    contactForm.reset();

                    // Show success notification
                    showNotification('Message sent successfully! We will get back to you soon.', 'success');
                } else {
                    // Error
                    submitBtn.textContent = '✗ Failed';
                    submitBtn.style.backgroundColor = '#f44336';
                    showNotification('Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                submitBtn.textContent = '✗ Error';
                submitBtn.style.backgroundColor = '#f44336';
                showNotification('An error occurred. Please try emailing directly to otaga2k25@gmail.com', 'error');
            }

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
            }, 3000);
        });
    }

    // Notification function
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `form-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-family: 'Poppins', sans-serif;
        `;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add animation styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========== RETRO MONITOR INTERACTIVE FUNCTIONALITY ==========

    // Interactive Panels
    const interactivePanels = document.querySelectorAll('.interactive-panel');
    const clickableItems = document.querySelectorAll('.clickable-item');

    // Panel click effects
    interactivePanels.forEach(panel => {
        panel.addEventListener('click', function () {
            const interactiveType = this.dataset.interactive;

            // Remove active class from all panels
            interactivePanels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked panel
            this.classList.add('active');

            // Special effects based on interactive type
            switch (interactiveType) {
                case 'expand':
                    this.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 300);
                    break;

                case 'glow':
                    this.style.boxShadow = '0 0 30px rgba(255, 244, 79, 0.8)';
                    setTimeout(() => {
                        this.style.boxShadow = '';
                    }, 1000);
                    break;

                case 'shake':
                    this.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        this.style.animation = '';
                    }, 500);
                    break;

                case 'flip':
                    this.style.transform = 'rotateY(180deg)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 600);
                    break;

                case 'pulse':
                    this.style.animation = 'pulsePanel 1s ease-in-out';
                    setTimeout(() => {
                        this.style.animation = '';
                    }, 1000);
                    break;

                case 'matrix':
                    const matrixRain = this.querySelector('.matrix-rain');
                    if (matrixRain) {
                        matrixRain.style.animationDuration = '0.3s';
                        matrixRain.style.opacity = '1';
                        setTimeout(() => {
                            matrixRain.style.animationDuration = '2s';
                            matrixRain.style.opacity = '0.3';
                        }, 2000);
                    }
                    break;

                case 'chart':
                    const chartBars = this.querySelectorAll('.chart-bar');
                    chartBars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.animation = 'chartPulse 0.5s ease-in-out';
                            setTimeout(() => {
                                bar.style.animation = '';
                            }, 500);
                        }, index * 100);
                    });
                    break;
            }
        });
    });

    // Clickable Items (System Monitoring)
    clickableItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();

            const action = this.dataset.action;

            // Remove active class from all items
            clickableItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Handle different actions
            switch (action) {
                case 'cpu':
                    const cpuValue = this.querySelector('.action-value');
                    if (cpuValue) {
                        const randomCPU = Math.floor(Math.random() * 50) + 25;
                        cpuValue.textContent = randomCPU + '%';
                        cpuValue.style.color = randomCPU > 70 ? '#ff5f56' : '#a0d2eb';
                    }
                    break;

                case 'memory':
                    const memValue = this.querySelector('.action-value');
                    if (memValue) {
                        const randomMem = Math.floor(Math.random() * 40) + 40;
                        memValue.textContent = randomMem + '%';
                        memValue.style.color = randomMem > 80 ? '#ff5f56' : '#a0d2eb';
                    }
                    break;

                case 'network':
                    const netValue = this.querySelector('.action-value');
                    if (netValue) {
                        const statuses = ['Online', 'Connecting...', 'Stable', 'High Speed'];
                        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                        netValue.textContent = randomStatus;
                        netValue.style.color = '#a0d2eb';
                    }
                    break;

                case 'files':
                    const fileCount = this.querySelector('.file-count');
                    if (fileCount) {
                        const randomFiles = Math.floor(Math.random() * 200) + 100;
                        fileCount.textContent = randomFiles + ' files';
                        fileCount.style.color = '#a0d2eb';
                    }
                    break;
            }

            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Action Buttons Enhanced
    const enhancedActionButtons = document.querySelectorAll('.action-button');
    enhancedActionButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();

            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            // Button specific actions
            const buttonText = this.textContent.trim();

            switch (buttonText) {
                case '+ Explore 3D World':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Exploring! ✨';
                        setTimeout(() => {
                            this.textContent = '+ Explore 3D World';
                        }, 2000);
                    }, 1000);
                    break;

                case 'Launch Project':
                    this.textContent = 'Launching...';
                    setTimeout(() => {
                        this.textContent = 'Success! 🚀';
                        setTimeout(() => {
                            this.textContent = 'Launch Project';
                        }, 2000);
                    }, 1500);
                    break;

                case 'Initialize':
                    this.textContent = 'Initializing...';
                    setTimeout(() => {
                        this.textContent = 'Ready! ⚡';
                        setTimeout(() => {
                            this.textContent = 'Initialize';
                        }, 2000);
                    }, 1200);
                    break;

                case 'Render Scene':
                    this.textContent = 'Rendering...';
                    setTimeout(() => {
                        this.textContent = 'Rendered! 🎨';
                        setTimeout(() => {
                            this.textContent = 'Render Scene';
                        }, 2000);
                    }, 800);
                    break;

                case 'Connect':
                    this.textContent = 'Connecting...';
                    setTimeout(() => {
                        this.textContent = 'Connected! 🌐';
                        setTimeout(() => {
                            this.textContent = 'Connect';
                        }, 2000);
                    }, 1000);
                    break;

                case 'Enter Matrix':
                    this.textContent = 'Entering...';
                    setTimeout(() => {
                        this.textContent = 'Welcome! 🔴💊';
                        setTimeout(() => {
                            this.textContent = 'Enter Matrix';
                        }, 2000);
                    }, 1200);
                    break;

                case 'View Details':
                    this.textContent = 'Loading...';
                    setTimeout(() => {
                        this.textContent = 'Analyzed! 📊';
                        setTimeout(() => {
                            this.textContent = 'View Details';
                        }, 2000);
                    }, 800);
                    break;
            }

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Auto-animations for visual appeal
    setInterval(() => {
        // Random panel glow effect
        const randomPanel = interactivePanels[Math.floor(Math.random() * interactivePanels.length)];
        if (randomPanel && !randomPanel.classList.contains('active')) {
            randomPanel.style.boxShadow = '0 0 15px rgba(255, 244, 79, 0.2)';
            setTimeout(() => {
                randomPanel.style.boxShadow = '';
            }, 1000);
        }
    }, 5000);

    // Dynamic status updates
    setInterval(() => {
        const statusDots = document.querySelectorAll('.status-dot.active');
        statusDots.forEach(dot => {
            dot.style.animationDuration = (Math.random() * 1 + 1) + 's';
        });

        const connectionDots = document.querySelectorAll('.connection-dot');
        connectionDots.forEach((dot, index) => {
            dot.style.animationDelay = (Math.random() * 0.5) + 's';
        });
    }, 3000);

    // Monitor screen flicker effect
    const monitorScreen = document.querySelector('.monitor-screen');
    if (monitorScreen) {
        const flickerInterval = setInterval(() => {
            if (Math.random() < 0.02) { // 2% chance every interval
                monitorScreen.style.filter = 'brightness(1.2) contrast(1.1)';
                setTimeout(() => {
                    monitorScreen.style.filter = 'none';
                }, 50);
            }
        }, 100);
    }

    // CRT scan line animation
    const scanlines = document.querySelector('.crt-scanlines');
    if (scanlines) {
        let scanlinePosition = 0;

        function animateScanlines() {
            scanlinePosition += 0.5;
            if (scanlinePosition > 100) scanlinePosition = 0;
            scanlines.style.transform = `translateY(${scanlinePosition}px)`;
            requestAnimationFrame(animateScanlines);
        }
        animateScanlines();
    }

    // Window controls functionality
    const controls = document.querySelectorAll('.control');
    controls.forEach(control => {
        control.addEventListener('click', function () {
            const action = this.classList[1]; // minimize, maximize, close

            switch (action) {
                case 'minimize':
                    if (monitorScreen) {
                        monitorScreen.style.transform = 'scale(0.8)';
                        monitorScreen.style.opacity = '0.7';
                        setTimeout(() => {
                            monitorScreen.style.transform = 'scale(1)';
                            monitorScreen.style.opacity = '1';
                        }, 500);
                    }
                    break;

                case 'maximize':
                    if (monitorScreen) {
                        monitorScreen.style.transform = 'scale(1.05)';
                        setTimeout(() => {
                            monitorScreen.style.transform = 'scale(1)';
                        }, 300);
                    }
                    break;

                case 'close':
                    if (monitorScreen) {
                        monitorScreen.style.opacity = '0';
                        setTimeout(() => {
                            monitorScreen.style.opacity = '1';
                        }, 500);
                    }
                    break;
            }
        });
    });

    // Panel interactions
    const panels = document.querySelectorAll('.panel-section, .actions-panel, .purple-panel');
    panels.forEach(panel => {
        panel.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px) scale(1.02)';
            this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        });

        panel.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
    });

    // Action buttons with ripple effect
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();

            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            // Add CSS for ripple effect if not already present
            if (!document.querySelector('#ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    .ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.4);
                        transform: scale(0);
                        animation: ripple-animation 0.6s linear;
                        pointer-events: none;
                    }
                    
                    @keyframes ripple-animation {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Monitor brand indicator pulse
    const brandIndicator = document.querySelector('.brand-indicator');
    if (brandIndicator) {
        setInterval(() => {
            brandIndicator.style.boxShadow = `0 0 ${Math.random() * 20 + 10}px var(--ice-blue)`;
        }, 2000);
    }

    // Random glitch effects for monitor
    if (monitorScreen) {
        setInterval(() => {
            if (Math.random() < 0.01) { // 1% chance
                monitorScreen.style.filter = 'hue-rotate(180deg) brightness(1.5) contrast(2)';
                monitorScreen.style.transform = monitorScreen.style.transform + ' skew(1deg)';

                setTimeout(() => {
                    monitorScreen.style.filter = 'none';
                    monitorScreen.style.transform = monitorScreen.style.transform.replace(' skew(1deg)', '');
                }, 50);
            }
        }, 1000);
    }
});

// Utility functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, wait) {
    let timeout;
    let previous = 0;
    return function executedFunction(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

// ========== FEATURES SCROLL ANIMATIONS ==========

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Feature Cards Scroll Animation (Tab-like style)
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on a screen wide enough for the animation
    if (window.innerWidth >= 768) {
        // Get all feature cards
        const featureCards = gsap.utils.toArray('.feature-card');

        // Only proceed if we have feature cards
        if (featureCards.length > 0) {
            // Set initial state - hide all cards
            gsap.set(featureCards, {
                opacity: 0,
                y: 30,
                scale: 0.95,
                rotationX: -10
            });

            // Create a scroll-triggered animation that reveals cards in sequence
            // similar to the tab switching effect in animation.html
            ScrollTrigger.create({
                trigger: ".features-section",
                start: "top 80%",
                end: "bottom 20%",
                onEnter: () => {
                    // Animate cards in sequence like tabs switching
                    featureCards.forEach((card, i) => {
                        gsap.to(card, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotationX: 0,
                            duration: 0.8,
                            ease: "back.out(1.2)",
                            delay: i * 0.15
                        });
                    });
                },
                onEnterBack: () => {
                    // Re-animate when scrolling back
                    featureCards.forEach((card, i) => {
                        gsap.to(card, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotationX: 0,
                            duration: 0.8,
                            ease: "back.out(1.2)",
                            delay: i * 0.15
                        });
                    });
                }
            });

            // Add individual scroll triggers for each card for more dynamic effects
            featureCards.forEach((card, i) => {
                ScrollTrigger.create({
                    trigger: card,
                    start: "top 90%",
                    end: "bottom 10%",
                    onEnter: () => {
                        // Add a subtle emphasis effect when card comes into view
                        gsap.to(card, {
                            scale: 1.03,
                            duration: 0.3,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.inOut"
                        });
                    },
                    onEnterBack: () => {
                        // Same effect when scrolling back
                        gsap.to(card, {
                            scale: 1.03,
                            duration: 0.3,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.inOut"
                        });
                    }
                });
            });
        }
    }

    // Advanced Features Section Animation (similar to animation.html)
    ScrollTrigger.matchMedia({
        "(min-width: 992px)": function () {
            // Pin the features intro text section
            ScrollTrigger.create({
                trigger: ".features-advanced-section .features-intro-wrapper",
                start: "top top",
                end: "bottom top",
                pin: "#features-pin",
                pinSpacing: false
            });

            // Create a ScrollTrigger for the advanced features tabs section
            const advancedFeaturesTabsTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: ".features-advanced-section .features-tabs-sticky-wrapper",
                    scrub: true,
                    start: "top top",
                    end: "bottom bottom",
                    onUpdate: self => {
                        const progress = self.progress;
                        const numSections = 3;
                        const activeIndex = Math.min(numSections, Math.floor(progress * numSections) + 1);

                        document.querySelectorAll('.features-advanced-section .features-tabs-content').forEach((el, i) => {
                            el.classList.toggle('is-1', i + 1 === activeIndex);
                        });
                        document.querySelectorAll('.features-advanced-section .features-tabs-visual').forEach((el, i) => {
                            el.classList.toggle('is-1', i + 1 === activeIndex);
                        });
                    }
                }
            });


        },
        // For smaller screens, handle simple class toggling if needed
        "(max-width: 991px)": function () {
            // On mobile, the scroll-based logic is disabled by default via CSS.
            // You could add click-based tab functionality here if desired.
        }
    });
});

// Features button interactions for advanced section
const advancedFeaturesButton = document.querySelector('.features-advanced-section .features-button');
if (advancedFeaturesButton) {
    advancedFeaturesButton.addEventListener('click', function () {
        // Scroll to the next section or back to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animate performance bars when they come into view for advanced section
const advancedPerformanceFills = document.querySelectorAll('.features-advanced-section .performance-fill');
if (advancedPerformanceFills.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = targetWidth;
                }, 800);
            }
        });
    }, { threshold: 0.5 });

    advancedPerformanceFills.forEach(fill => {
        observer.observe(fill);
    });
}


