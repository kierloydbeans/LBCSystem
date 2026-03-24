// Events Page JavaScript

// Global variables
let currentPage = 0;
const eventsPerPage = 12;
let allEvents = [];
let filteredEvents = [];
let currentFilters = {
    genre: '',
    month: '',
    price: '',
    availability: ''
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeFilters();
    loadEvents();
    initializeModal();
    initializeTicketPurchaseModal();
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

// Smooth scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
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

// Filter functionality
function initializeFilters() {
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Add change listeners to filters
    ['genreFilter', 'monthFilter', 'priceFilter', 'availabilityFilter'].forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', function() {
                currentFilters[filterId.replace('Filter', '')] = this.value;
            });
        }
    });
}

// Load events from API
function loadEvents(reset = true) {
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsLoading = document.getElementById('eventsLoading');
    
    if (!eventsGrid || !eventsLoading) return;
    
    // Show loading state
    eventsLoading.style.display = 'block';
    eventsGrid.innerHTML = '';
    
    if (reset) {
        currentPage = 0;
        allEvents = [];
    }
    
    // Fetch events from API
    fetch('../api/events.php?upcoming=true&limit=50', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.events.length > 0) {
            if (reset) {
                allEvents = data.data.events;
            }
            
            filteredEvents = filterEvents(allEvents);
            renderEvents(filteredEvents);
            
            // Hide loading
            eventsLoading.style.display = 'none';
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = filteredEvents.length > eventsPerPage ? 'block' : 'none';
            }
        } else {
            renderNoEvents();
            eventsLoading.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error loading events:', error);
        renderError();
        eventsLoading.style.display = 'none';
    });
}

// Filter events based on current filters
function filterEvents(events) {
    return events.filter(event => {
        // Genre filter
        if (currentFilters.genre) {
            const hasGenre = event.bands.some(band => 
                band.genre.toLowerCase().includes(currentFilters.genre.toLowerCase())
            );
            if (!hasGenre) return false;
        }
        
        // Month filter
        if (currentFilters.month) {
            const eventDate = new Date(event.event_date);
            const eventMonth = eventDate.toISOString().slice(0, 7);
            if (eventMonth !== currentFilters.month) return false;
        }
        
        // Price filter
        if (currentFilters.price) {
            const price = parseFloat(event.base_price);
            switch (currentFilters.price) {
                case '0-200':
                    if (price >= 200) return false;
                    break;
                case '200-300':
                    if (price < 200 || price >= 300) return false;
                    break;
                case '300-400':
                    if (price < 300 || price >= 400) return false;
                    break;
                case '400+':
                    if (price < 400) return false;
                    break;
            }
        }
        
        // Availability filter
        if (currentFilters.availability) {
            if (currentFilters.availability === 'available' && event.status !== 'available') {
                return false;
            }
            if (currentFilters.availability === 'limited' && event.status !== 'limited') {
                return false;
            }
        }
        
        return true;
    });
}

// Apply filters
function applyFilters() {
    loadEvents(true);
}

// Clear filters
function clearFilters() {
    currentFilters = {
        genre: '',
        month: '',
        price: '',
        availability: ''
    };
    
    // Reset filter selects
    ['genreFilter', 'monthFilter', 'priceFilter', 'availabilityFilter'].forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
    
    loadEvents(true);
}

// Render events
function renderEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    const eventsToShow = events.slice(0, (currentPage + 1) * eventsPerPage);
    
    const eventsHTML = eventsToShow.map(event => {
        const bandsHTML = event.bands.map(band => 
            `<span class="band-tag ${band.is_headliner ? 'headliner' : ''}">${band.name}</span>`
        ).join('');
        
        const statusBadge = getStatusBadge(event.status);
        
        return `
            <div class="event-card" onclick="showEventDetails(${event.id})">
                <div class="event-poster">
                    ${event.poster_image_url ? 
                        `<img src="../assets/images/${event.poster_image_url}" alt="${event.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` +
                        `<div style="display:none; align-items: center; justify-content: center; height: 100%; color: #0066ff; font-size: 3rem;">
                            <i class="fas fa-music"></i>
                        </div>` :
                        `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #0066ff; font-size: 3rem;">
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
                        ₱${parseFloat(event.base_price).toFixed(2)}
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
            background: rgba(0, 102, 255, 0.2);
            border: 1px solid rgba(0, 102, 255, 0.3);
            border-radius: 0;
            font-size: 0.85rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            color: #66b3ff;
            font-family: 'Special Elite', cursive;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 1px 1px 0px #000;
        }
        .band-tag.headliner {
            background: rgba(0, 102, 255, 0.3);
            border-color: #0066ff;
            color: #0066ff;
            font-weight: 600;
        }
    `;
    document.head.appendChild(bandTagStyle);
}

// Get status badge HTML
function getStatusBadge(status) {
    switch (status) {
        case 'sold_out':
            return '<span style="background: linear-gradient(45deg, #ff3333, #cc0000); color: white; padding: 0.25rem 0.5rem; border-radius: 0; font-size: 0.75rem; margin-left: 0.5rem; font-family: \'Special Elite\', cursive; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #000; box-shadow: 1px 1px 0px #000, 2px 2px 0px rgba(204, 0, 0, 0.3);">SOLD OUT</span>';
        case 'limited':
            return '<span style="background: linear-gradient(45deg, #ff8800, #cc6600); color: white; padding: 0.25rem 0.5rem; border-radius: 0; font-size: 0.75rem; margin-left: 0.5rem; font-family: \'Special Elite\', cursive; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #000; box-shadow: 1px 1px 0px #000, 2px 2px 0px rgba(204, 102, 0, 0.3);">LIMITED</span>';
        default:
            return '';
    }
}

// Render no events state
function renderNoEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; transform: rotate(-1deg);">
            <i class="fas fa-calendar-times" style="font-size: 3rem; color: #0066ff; margin-bottom: 1rem; text-shadow: 2px 2px 0px #000; animation: flicker 3s infinite; transform: rotate(-5deg);"></i>
            <h3 style="font-family: 'Permanent Marker', cursive; color: #0066ff; margin-bottom: 1rem; font-size: 2rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(0, 102, 255, 0.5); transform: rotate(-2deg);">No Events Found!!!</h3>
            <p style="font-family: 'Special Elite', cursive; color: #66b3ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Try adjusting your filters or check back later!!!</p>
        </div>
    `;
}

// Render error state
function renderError() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; transform: rotate(1deg);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff3333; margin-bottom: 1rem; text-shadow: 2px 2px 0px #000; animation: flicker 3s infinite; transform: rotate(-5deg);"></i>
            <h3 style="font-family: 'Permanent Marker', cursive; color: #ff3333; margin-bottom: 1rem; font-size: 2rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(255, 51, 51, 0.5); transform: rotate(-2deg);">Unable to Load Events!!!</h3>
            <p style="font-family: 'Special Elite', cursive; color: #66b3ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Please try again later or contact support!!!</p>
            <button onclick="loadEvents()" style="margin-top: 1rem; background: linear-gradient(45deg, #0066ff, #003d99); color: white; border: 3px solid #0066ff; padding: 0.75rem 1.5rem; border-radius: 0; cursor: pointer; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 2px; text-shadow: 1px 1px 0px #000; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(-1deg);">Try Again</button>
        </div>
    `;
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('eventModal');
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

// Show event details modal
function showEventDetails(eventId) {
    console.log('showEventDetails called with eventId:', eventId);
    
    const event = allEvents.find(e => e.id === eventId);
    if (!event) {
        console.log('Event not found for eventId:', eventId);
        return;
    }
    
    console.log('Event found:', event);
    
    // Populate modal with event data
    const modalTitle = document.getElementById('modalEventTitle');
    const modalDate = document.getElementById('modalEventDate');
    const modalDescription = document.getElementById('modalEventDescription');
    const modalDay = document.getElementById('modalEventDay');
    const modalMonth = document.getElementById('modalEventMonth');
    const modalPrice = document.getElementById('modalEventPrice');
    const modalAvailability = document.getElementById('modalEventAvailability');
    const modalVenueName = document.getElementById('modalVenueName');
    const modalVenueAddress = document.getElementById('modalVenueAddress');
    const modalVenueCapacity = document.getElementById('modalVenueCapacity');
    
    if (modalTitle) modalTitle.textContent = event.title;
    if (modalDate) modalDate.textContent = `${event.formatted_date} at ${event.formatted_time}`;
    if (modalDescription) modalDescription.textContent = event.description;
    if (modalDay) modalDay.textContent = event.day;
    if (modalMonth) modalMonth.textContent = event.month;
    if (modalPrice) modalPrice.textContent = `₱${parseFloat(event.base_price).toFixed(2)}`;
    if (modalAvailability) modalAvailability.textContent = `${event.available_tickets} / ${event.total_tickets}`;
    if (modalVenueName) modalVenueName.textContent = event.venue_name;
    if (modalVenueAddress) modalVenueAddress.textContent = event.venue_address;
    if (modalVenueCapacity) modalVenueCapacity.textContent = `Capacity: ${event.venue_capacity}`;
    
    // Set poster image
    const posterImg = document.getElementById('modalEventPoster');
    if (posterImg) {
        if (event.poster_image_url) {
            posterImg.src = `../assets/images/${event.poster_image_url}`;
            posterImg.alt = event.title;
            posterImg.style.display = 'block';
        } else {
            posterImg.style.display = 'none';
        }
    }
    
    // Populate bands
    const bandsContainer = document.getElementById('modalEventBands');
    if (bandsContainer) {
        const bandsHTML = event.bands.map(band => `
            <div class="modal-band ${band.is_headliner ? 'headliner' : ''}">
                <h4>${band.name} ${band.is_headliner ? '(Headliner)' : ''}</h4>
                <p>${band.genre}</p>
                ${band.facebook_url ? `<a href="${band.facebook_url}" target="_blank" class="band-link">Facebook</a>` : ''}
            </div>
        `).join('');
        bandsContainer.innerHTML = bandsHTML;
    }
    
    // Configure purchase button
    const purchaseBtn = document.getElementById('purchaseTicketBtn');
    if (purchaseBtn) {
        if (event.status === 'sold_out') {
            purchaseBtn.textContent = 'Sold Out';
            purchaseBtn.disabled = true;
            purchaseBtn.style.background = 'linear-gradient(45deg, #666666, #333333)';
        } else {
            purchaseBtn.textContent = 'Get Tickets';
            purchaseBtn.disabled = false;
            purchaseBtn.style.background = '';
            purchaseBtn.onclick = () => purchaseTicket(eventId);
        }
    }
    
    // Show modal
    const eventModal = document.getElementById('eventModal');
    console.log('Event modal element:', eventModal);
    if (eventModal) {
        eventModal.classList.add('active');
        console.log('Modal should now be visible');
    } else {
        console.log('Modal element not found!');
    }
}

// Close modal
function closeModal() {
    document.getElementById('eventModal').classList.remove('active');
}

// Purchase ticket
function purchaseTicket(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    // Populate ticket purchase modal with event data
    document.getElementById('ticketModalEventTitle').textContent = event.title;
    document.getElementById('ticketModalEventDate').textContent = `${event.formatted_date} at ${event.formatted_time}`;
    document.getElementById('unitPrice').value = `₱${parseFloat(event.base_price).toFixed(2)}`;
    document.getElementById('summaryEvent').textContent = event.title;
    document.getElementById('summaryPrice').textContent = `₱${parseFloat(event.base_price).toFixed(2)}`;
    
    // Store event data for form submission
    window.currentEvent = event;
    
    // Show ticket purchase modal
    showTicketPurchaseModal();
}

// Ticket Purchase Modal functionality
function initializeTicketPurchaseModal() {
    console.log('Initializing ticket purchase modal...');
    
    const modal = document.getElementById('ticketPurchaseModal');
    const modalOverlay = document.getElementById('ticketModalOverlay');
    const modalClose = document.getElementById('ticketModalClose');
    const cancelBtn = document.getElementById('cancelTicketPurchase');
    const form = document.getElementById('ticketPurchaseForm');
    const quantityInput = document.getElementById('quantity');
    const receiptInput = document.getElementById('receiptImage');
    const removeReceiptBtn = document.getElementById('removeReceipt');
    
    console.log('Modal elements found:', {
        modal: !!modal,
        modalOverlay: !!modalOverlay,
        modalClose: !!modalClose,
        cancelBtn: !!cancelBtn,
        form: !!form,
        quantityInput: !!quantityInput,
        receiptInput: !!receiptInput,
        removeReceiptBtn: !!removeReceiptBtn
    });
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => hideTicketPurchaseModal());
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', () => hideTicketPurchaseModal());
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideTicketPurchaseModal());
    }
    
    if (form) {
        console.log('Adding submit event listener to form');
        form.addEventListener('submit', function(e) {
            console.log('Form submit event triggered');
            handleTicketPurchase(e);
        });
    } else {
        console.log('Form not found!');
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('input', updateTotalAmount);
    }
    
    if (receiptInput) {
        receiptInput.addEventListener('change', handleReceiptUpload);
    }
    
    if (removeReceiptBtn) {
        removeReceiptBtn.addEventListener('click', removeReceiptImage);
    }
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            hideTicketPurchaseModal();
        }
    });
    
    console.log('Ticket purchase modal initialization complete');
}

function showTicketPurchaseModal() {
    const modal = document.getElementById('ticketPurchaseModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideTicketPurchaseModal() {
    const modal = document.getElementById('ticketPurchaseModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetTicketForm();
    }
}

function updateTotalAmount() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const unitPrice = parseFloat(window.currentEvent.base_price) || 0;
    const total = quantity * unitPrice;
    
    document.getElementById('totalAmount').value = `₱${total.toFixed(2)}`;
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summaryTotal').textContent = `₱${total.toFixed(2)}`;
}

function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('receiptPreview');
                const img = document.getElementById('receiptPreviewImg');
                img.src = e.target.result;
                preview.style.display = 'block';
                document.querySelector('.file-upload-label').style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            showNotification('Please select an image file', 'error');
            e.target.value = '';
        }
    }
}

function removeReceiptImage() {
    document.getElementById('receiptImage').value = '';
    document.getElementById('receiptPreview').style.display = 'none';
    document.getElementById('receiptPreviewImg').src = '';
    document.querySelector('.file-upload-label').style.display = 'block';
}

function resetTicketForm() {
    const form = document.getElementById('ticketPurchaseForm');
    if (form) {
        form.reset();
        document.getElementById('quantity').value = '1';
        document.getElementById('unitPrice').value = `₱${parseFloat(window.currentEvent.base_price).toFixed(2)}`;
        document.getElementById('totalAmount').value = `₱${parseFloat(window.currentEvent.base_price).toFixed(2)}`;
        document.getElementById('summaryQuantity').textContent = '1';
        document.getElementById('summaryTotal').textContent = `₱${parseFloat(window.currentEvent.base_price).toFixed(2)}`;
        removeReceiptImage();
    }
}

function handleTicketPurchase(e) {
    e.preventDefault();
    
    console.log('Ticket purchase form submitted');
    
    const formData = new FormData(e.target);
    const receiptFile = document.getElementById('receiptImage').files[0];
    
    console.log('Form data:', Object.fromEntries(formData));
    console.log('Receipt file:', receiptFile);
    
    if (!receiptFile) {
        showNotification('Please upload a receipt image', 'error');
        return;
    }
    
    // Get user authentication
    const authToken = localStorage.getItem('lbc_token') || sessionStorage.getItem('lbc_token');
    console.log('Auth token:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
        showNotification('Please login to purchase tickets', 'error');
        hideTicketPurchaseModal();
        // Redirect to login
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitTicketPurchase');
    if (!submitBtn) {
        console.error('Submit button not found!');
        return;
    }
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    console.log('Sending to API...');
    
    // Create form data for file upload
    const uploadFormData = new FormData();
    uploadFormData.append('event_id', window.currentEvent.id);
    uploadFormData.append('account_name', formData.get('account_name'));
    uploadFormData.append('phone_number', formData.get('phone_number'));
    uploadFormData.append('quantity', formData.get('quantity'));
    uploadFormData.append('unit_price', parseFloat(window.currentEvent.base_price));
    uploadFormData.append('total_amount', parseFloat(formData.get('quantity')) * parseFloat(window.currentEvent.base_price));
    uploadFormData.append('payment_method', formData.get('payment_method'));
    uploadFormData.append('receipt_image', receiptFile);
    uploadFormData.append('notes', formData.get('notes'));
    uploadFormData.append('auth_token', authToken);
    
    // Submit to API
    fetch('../api/ticket_purchase.php', {
        method: 'POST',
        body: uploadFormData
    })
    .then(response => {
        console.log('API response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('API response data:', data);
        if (data.success) {
            showNotification('Ticket purchase submitted successfully! We will confirm your payment shortly.', 'success');
            hideTicketPurchaseModal();
            // Refresh events to update available tickets
            loadEvents();
        } else {
            showNotification(data.message || 'Failed to submit ticket purchase', 'error');
        }
    })
    .catch(error => {
        console.error('Ticket purchase error:', error);
        showNotification('Network error. Please try again.', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
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
