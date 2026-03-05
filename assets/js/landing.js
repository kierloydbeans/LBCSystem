document.addEventListener('DOMContentLoaded', function() {
    // Initialize user authentication
    initializeAuth();
    
    // Load events
    loadEvents();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize animations
    initializeAnimations();
});

// Authentication functionality
function initializeAuth() {
    const token = localStorage.getItem('lbc_token') || sessionStorage.getItem('lbc_token');
    const userData = localStorage.getItem('lbc_user') || sessionStorage.getItem('lbc_user');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            updateUserInterface(user);
            
            // Verify token with server
            verifyToken(token);
        } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
        }
    } else {
        // Redirect to login if not authenticated
        window.location.href = '../index.html';
    }
}

function updateUserInterface(user) {
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userAvatar) {
        // Get initials from user name
        const initials = getInitials(user.first_name, user.last_name);
        userAvatar.textContent = initials;
        userAvatar.title = `${user.first_name} ${user.last_name}`;
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (first + last) || 'U';
}

function verifyToken(token) {
    fetch('../api/check_auth.php', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            logout();
        }
    })
    .catch(error => {
        console.error('Token verification error:', error);
        logout();
    });
}

function logout() {
    const token = localStorage.getItem('lbc_token') || sessionStorage.getItem('lbc_token');
    
    if (token) {
        fetch('../api/logout.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
    }
    
    // Clear local storage
    localStorage.removeItem('lbc_token');
    localStorage.removeItem('lbc_user');
    localStorage.removeItem('lbc_remember');
    localStorage.removeItem('lbc_email');
    
    sessionStorage.removeItem('lbc_token');
    sessionStorage.removeItem('lbc_user');
    
    // Redirect to login
    window.location.href = '../index.html';
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Handle scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Handle mobile menu toggle
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }
}

// Smooth scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const ctaLinks = document.querySelectorAll('.hero-cta a[href^="#"]');
    
    [...navLinks, ...ctaLinks].forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Load events from API
function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!eventsGrid) return;
    
    // Show loading state
    eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div style="display: inline-block; width: 50px; height: 50px; border: 3px solid #60a5fa; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 1rem; color: #9ca3af;">Loading events...</p>
        </div>
    `;
    
    // Add spinning animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Fetch events from API
    fetch('../api/events.php?upcoming=true&limit=6', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.events.length > 0) {
            renderEvents(data.data.events);
        } else {
            renderNoEvents();
        }
    })
    .catch(error => {
        console.error('Error loading events:', error);
        renderError();
    })
    .finally(() => {
        // Remove loading animation
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    });
}

function renderEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    
    const eventsHTML = events.map(event => {
        const bandsHTML = event.bands.map(band => 
            `<span class="band-tag ${band.is_headliner ? 'headliner' : ''}">${band.name}</span>`
        ).join('');
        
        const statusBadge = getStatusBadge(event.status);
        
        return `
            <div class="event-card" onclick="viewEventDetails(${event.id})">
                <div class="event-poster">
                    ${event.poster_image_url ? 
                        `<img src="${event.poster_image_url}" alt="${event.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` +
                        `<div style="display:none; align-items: center; justify-content: center; height: 100%; color: #60a5fa; font-size: 3rem;">
                            <i class="fas fa-music"></i>
                        </div>` :
                        `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #60a5fa; font-size: 3rem;">
                            <i class="fas fa-music"></i>
                        </div>`
                    }
                    <div class="event-date-badge">
                        <div>${event.day}</div>
                        <div style="font-size: 0.8rem;">${event.month}</div>
                    </div>
                </div>
                <div class="event-details">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-bands">${bandsHTML}</div>
                    <div class="event-info">
                        <div class="event-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${event.formatted_date}</span>
                        </div>
                        <div class="event-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${event.formatted_time}</span>
                        </div>
                        <div class="event-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.venue_name}</span>
                        </div>
                    </div>
                    <div class="event-price">
                        ₱${event.base_price.toFixed(2)}
                        ${statusBadge}
                    </div>
                    <button class="event-action" onclick="event.stopPropagation(); purchaseTicket(${event.id})">
                        ${event.status === 'sold_out' ? 'Sold Out' : 'Get Tickets'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    eventsGrid.innerHTML = eventsHTML;
    
    // Add band tag styles
    const bandTagStyle = document.createElement('style');
    bandTagStyle.textContent = `
        .band-tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(96, 165, 250, 0.2);
            border: 1px solid rgba(96, 165, 250, 0.3);
            border-radius: 20px;
            font-size: 0.85rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            color: #93c5fd;
        }
        .band-tag.headliner {
            background: rgba(59, 130, 246, 0.3);
            border-color: #3b82f6;
            color: #60a5fa;
            font-weight: 600;
        }
    `;
    document.head.appendChild(bandTagStyle);
}

function getStatusBadge(status) {
    switch (status) {
        case 'sold_out':
            return '<span style="background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">SOLD OUT</span>';
        case 'limited':
            return '<span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">LIMITED</span>';
        default:
            return '';
    }
}

function renderNoEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-calendar-times" style="font-size: 3rem; color: #60a5fa; margin-bottom: 1rem;"></i>
            <h3 style="color: #fff; margin-bottom: 1rem;">No Upcoming Events</h3>
            <p style="color: #9ca3af;">Check back soon for new events and performances!</p>
        </div>
    `;
}

function renderError() {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
            <h3 style="color: #fff; margin-bottom: 1rem;">Unable to Load Events</h3>
            <p style="color: #9ca3af;">Please try again later or contact support.</p>
            <button onclick="loadEvents()" style="margin-top: 1rem; background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

// Event interaction functions
function viewEventDetails(eventId) {
    // Redirect to event page (to be created)
    showNotification(`Event details for event ${eventId} - Feature coming soon!`, 'info');
}

function purchaseTicket(eventId) {
    // Redirect to ticket purchase (to be created)
    showNotification(`Ticket purchase for event ${eventId} - Feature coming soon!`, 'info');
}

// Notification system (reused from login.js)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #4caf50, #45a049)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #f44336, #da190b)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(45deg, #3b82f6, #1e40af)';
            break;
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize animations
function initializeAnimations() {
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.event-card, .feature');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}
