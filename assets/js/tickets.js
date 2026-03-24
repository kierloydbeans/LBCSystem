// Tickets Page JavaScript

// Global variables
let currentPage = 0;
const ticketsPerPage = 12;
let allTickets = [];
let filteredTickets = [];
let currentFilters = {
    status: ''
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFilters();
    loadTickets();
    initializeModal();
});

// Navigation functionality
function initializeNavigation() {
    // Handle scroll effect
    const navbar = document.getElementById('navbar');
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
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
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
    
    // Check authentication
    checkAuth();
}

// Filter functionality
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
        });
    }
}

// Load tickets from API
function loadTickets(reset = true) {
    const ticketsGrid = document.getElementById('ticketsGrid');
    const ticketsLoading = document.getElementById('ticketsLoading');
    
    if (!ticketsGrid || !ticketsLoading) return;
    
    // Show loading state
    ticketsLoading.style.display = 'block';
    ticketsGrid.innerHTML = '';
    
    if (reset) {
        currentPage = 0;
        allTickets = [];
    }
    
    // Get user authentication
    const authToken = localStorage.getItem('lbc_token') || sessionStorage.getItem('lbc_token');
    if (!authToken) {
        renderNoTickets();
        ticketsLoading.style.display = 'none';
        return;
    }
    
    // Fetch tickets from API
    fetch(`../api/tickets.php?auth_token=${authToken}&limit=50`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.tickets.length > 0) {
            if (reset) {
                allTickets = data.data.tickets;
            }
            
            filteredTickets = filterTickets(allTickets);
            renderTickets(filteredTickets);
            
            // Hide loading
            ticketsLoading.style.display = 'none';
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = filteredTickets.length > ticketsPerPage ? 'block' : 'none';
            }
        } else {
            renderNoTickets();
            ticketsLoading.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error loading tickets:', error);
        renderError();
        ticketsLoading.style.display = 'none';
    });
}

// Filter tickets based on current filters
function filterTickets(tickets) {
    return tickets.filter(ticket => {
        // Status filter
        if (currentFilters.status && ticket.status !== currentFilters.status) {
            return false;
        }
        
        return true;
    });
}

// Apply filters
function applyFilters() {
    loadTickets(true);
}

// Clear filters
function clearFilters() {
    currentFilters = {
        status: ''
    };
    
    // Reset filter controls
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.value = '';
    
    loadTickets(true);
}

// Render tickets
function renderTickets(tickets) {
    const ticketsGrid = document.getElementById('ticketsGrid');
    if (!ticketsGrid) return;
    
    const ticketsToShow = tickets.slice(0, (currentPage + 1) * ticketsPerPage);
    
    const ticketsHTML = ticketsToShow.map(ticket => {
        const statusClass = `status-${ticket.status}`;
        const formattedDate = new Date(ticket.formatted_event_date).toLocaleDateString();
        const formattedTime = ticket.formatted_event_time;
        
        return `
            <div class="ticket-card ${statusClass}" onclick="showTicketDetails(${ticket.id})">
                <div class="ticket-header">
                    <div class="ticket-number">
                        <h3>${ticket.ticket_number}</h3>
                        <span class="ticket-status">${ticket.status_display}</span>
                    </div>
                    <div class="ticket-date">
                        <div class="date-badge">
                            <div>${new Date(ticket.formatted_event_date).getDate()}</div>
                            <div>${new Date(ticket.formatted_event_date).toLocaleDateString('en', { month: 'short' })}</div>
                        </div>
                    </div>
                </div>
                
                <div class="ticket-details">
                    <h3>${ticket.event_title}</h3>
                    <div class="ticket-info">
                        <div class="ticket-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="ticket-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${formattedTime}</span>
                        </div>
                        <div class="ticket-info-item">
                            <i class="fas fa-user"></i>
                            <span>${ticket.ticket_holder_name}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-price">
                        <div class="price-amount">₱${parseFloat(ticket.total_amount).toFixed(2)}</div>
                    </div>
                    
                    <button class="ticket-action" onclick="event.stopPropagation(); showTicketDetails(${ticket.id})">
                        <i class="fas fa-ticket-alt"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    ticketsGrid.innerHTML = ticketsHTML;
}

// Render no tickets state
function renderNoTickets() {
    const ticketsGrid = document.getElementById('ticketsGrid');
    if (!ticketsGrid) return;
    
    ticketsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; transform: rotate(-1deg);">
            <i class="fas fa-ticket-alt" style="font-size: 3rem; color: #0066ff; margin-bottom: 1rem; text-shadow: 2px 2px 0px #000; animation: flicker 3s infinite; transform: rotate(-5deg);"></i>
            <h3 style="font-family: 'Permanent Marker', cursive; color: #0066ff; margin-bottom: 1rem; font-size: 2rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(0, 102, 255, 0.5); transform: rotate(-2deg);">No Tickets Yet!!!</h3>
            <p style="font-family: 'Special Elite', cursive; color: #66b3ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">You haven't purchased any tickets yet!!!</p>
            <a href="events.html" class="btn-primary" style="display: inline-block; margin-top: 1rem;">Browse Events</a>
        </div>
    `;
}

// Render error state
function renderError() {
    const ticketsGrid = document.getElementById('ticketsGrid');
    if (!ticketsGrid) return;
    
    ticketsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; transform: rotate(1deg);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #0066ff; margin-bottom: 1rem; text-shadow: 2px 2px 0px #000; animation: flicker 3s infinite; transform: rotate(-5deg);"></i>
            <h3 style="font-family: 'Permanent Marker', cursive; color: #0066ff; margin-bottom: 1rem; font-size: 2rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(0, 102, 255, 0.5); transform: rotate(-2deg);">Unable to Load Tickets!!!</h3>
            <p style="font-family: 'Special Elite', cursive; color: #66b3ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Please try again later or contact support!!!</p>
            <button onclick="loadTickets()" style="margin-top: 1rem; background: linear-gradient(45deg, #0066ff, #003d99); color: white; border: 3px solid #0066ff; padding: 0.75rem 1.5rem; border-radius: 0; cursor: pointer; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 2px; text-shadow: 1px 1px 0px #000; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(-1deg);">Try Again</button>
        </div>
    `;
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('ticketModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Show ticket details modal
function showTicketDetails(ticketId) {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Populate modal with ticket data
    document.getElementById('modalTicketNumber').textContent = ticket.ticket_number;
    document.getElementById('modalEventTitle').textContent = ticket.event_title;
    document.getElementById('modalEventDate').textContent = `${ticket.formatted_event_date} at ${ticket.formatted_event_time}`;
    document.getElementById('modalHolderName').textContent = ticket.ticket_holder_name;
    document.getElementById('modalHolderPhone').textContent = ticket.ticket_holder_phone;
    document.getElementById('modalPurchaseDate').textContent = ticket.formatted_purchase_date;
    document.getElementById('modalIssuedDate').textContent = ticket.formatted_issued_date;
    document.getElementById('modalPrice').textContent = `₱${parseFloat(ticket.total_amount).toFixed(2)}`;
    
    // Set status badge
    const statusBadge = document.getElementById('modalStatusBadge');
    statusBadge.textContent = ticket.status_display;
    statusBadge.className = `ticket-status status-${ticket.status}`;
    
    // Set QR code
    const qrCode = document.getElementById('modalQRCode');
    const qrLink = document.getElementById('modalQRLink);
    if (qrCode && qrLink) {
        qrCode.src = ticket.qr_code_url;
        qrLink.href = ticket.qr_code_url;
    }
    
    // Configure download button
    const downloadBtn = document.getElementById('downloadTicketBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadTicket(ticket);
    }
    
    // Show modal
    document.getElementById('ticketModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

// Download ticket
function downloadTicket(ticket) {
    // Create a simple text version of the ticket (in production, this would generate a PDF)
    const ticketContent = `
========================================
LOST BOYS CLUB - EVENT TICKET
========================================

Ticket Number: ${ticket.ticket_number}
Event: ${ticket.event_title}
Date: ${ticket.formatted_event_date} at ${ticket.formatted_event_time}
Holder: ${ticket.ticket_holder_name}
Phone: ${ticket.ticket_holder_phone}
Status: ${ticket.status_display}
Price: ₱${parseFloat(ticket.total_amount).toFixed(2)}
Purchase Date: ${ticket.formatted_purchase_date}
Issued Date: ${ticket.formatted_issued_date}

========================================
This is a digital ticket. Please present this at the venue entrance.
========================================
    `;
    
    // Create download link
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${ticket.ticket_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Ticket downloaded successfully!', 'success');
}

// Check authentication
function checkAuth() {
    const authToken = localStorage.getItem('lbc_token') || sessionStorage.getItem('lbc_token');
    const userMenu = document.getElementById('userMenu');
    const loginRegisterBtns = document.getElementById('loginRegisterBtns');

    if (authToken) {
        // User is authenticated, show user menu
        if (userMenu) userMenu.style.display = 'flex';
        if (loginRegisterBtns) loginRegisterBtns.style.display = 'none';
    } else {
        // User is not authenticated, hide user menu
        if (userMenu) userMenu.style.display = 'none';
        if (loginRegisterBtns) loginRegisterBtns.style.display = 'flex';
    }
}

// Show notification
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
    
    // Add punk styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0;
        color: white;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(100%) rotate(2deg);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        font-family: 'Special Elite', cursive;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-shadow: 1px 1px 0px #000;
        border: 3px solid #000;
        box-shadow: 3px 3px 0px #000, 6px 6px 0px rgba(0, 0, 0, 0.3);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #00ff00, #00cc00)';
            notification.style.borderColor = '#00cc00';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #ff3333, #cc0000)';
            notification.style.borderColor = '#cc0000';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(45deg, #0066ff, #003d99)';
            notification.style.borderColor = '#003d99';
            break;
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0) rotate(2deg)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%) rotate(2deg)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
