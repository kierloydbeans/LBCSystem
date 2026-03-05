// Bands Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Load bands
    loadBands();
    
    // Setup event listeners
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userMenu = document.getElementById('userMenu');
    
    if (token) {
        // User is logged in
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userMenu) {
            userMenu.style.display = 'flex';
            
            // Update user avatar with initials
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && userData.first_name) {
                const initials = userData.first_name.charAt(0) + 
                                (userData.last_name ? userData.last_name.charAt(0) : '');
                userAvatar.textContent = initials.toUpperCase();
            }
        }
    } else {
        // User is not logged in, but still allow access to bands page
        // Just hide user menu
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
}

// Load bands from API
async function loadBands() {
    const bandsGrid = document.getElementById('bandsGrid');
    
    try {
        const response = await axios.get('../api/bands.php');
        
        if (response.data.success && response.data.data && response.data.data.bands) {
            displayBands(response.data.data.bands);
        } else {
            showError(response.data.message || 'No bands found');
        }
    } catch (error) {
        console.error('Error loading bands:', error);
        showError('Failed to load bands. Please try again.');
    }
}

// Display bands in grid
function displayBands(bands) {
    const bandsGrid = document.getElementById('bandsGrid');
    
    if (!bands || bands.length === 0) {
        bandsGrid.innerHTML = `
            <div class="no-bands">
                <i class="fas fa-music"></i>
                <h3>No Bands Found</h3>
                <p>Check back soon for new bands and performances!</p>
            </div>
        `;
        return;
    }
    
    const bandsHTML = bands.map(band => `
        <div class="band-card" onclick="showBandDetails(${band.id})">
            <div class="band-card-image">
                ${band.band_image ? 
                    `<img src="${band.band_image}" alt="${band.name}" onerror="this.parentElement.innerHTML='<div class=\\'band-image-placeholder\\'><i class=\\'fas fa-users\\'></i></div>'">` :
                    `<div class="band-image-placeholder">
                        <i class="fas fa-users"></i>
                    </div>`
                }
            </div>
            <div class="band-card-content">
                <h3 class="band-name">${band.name}</h3>
                <p class="band-genre">${band.genre || 'Unknown Genre'}</p>
                <div class="band-card-footer">
                    ${band.is_lbc_band ? '<span class="lbc-badge">LBC Band</span>' : ''}
                    ${band.is_active ? '<span class="active-badge">Active</span>' : '<span class="inactive-badge">Inactive</span>'}
                </div>
            </div>
        </div>
    `).join('');
    
    bandsGrid.innerHTML = bandsHTML;
}

// Show band details in modal
async function showBandDetails(bandId) {
    const modal = document.getElementById('bandModal');
    
    try {
        // Get band details (you could create a separate API endpoint for this)
        const response = await axios.get('../api/bands.php');
        
        if (response.data.success && response.data.data && response.data.data.bands) {
            const band = response.data.data.bands.find(b => b.id === bandId);
            
            if (band) {
                populateModal(band);
                modal.style.display = 'flex';
            } else {
                showNotification('Band not found', 'error');
            }
        } else {
            showNotification(response.data.message || 'Failed to load band details', 'error');
        }
    } catch (error) {
        console.error('Error loading band details:', error);
        showNotification('Failed to load band details', 'error');
    }
}

// Populate modal with band details
function populateModal(band) {
    document.getElementById('modalBandName').textContent = band.name;
    document.getElementById('modalBandGenre').textContent = band.genre || 'Unknown Genre';
    document.getElementById('modalBandDescription').textContent = band.description || 'No description available.';
    
    // Handle band image
    const modalBandImage = document.getElementById('modalBandImage');
    if (band.band_image) {
        modalBandImage.src = band.band_image;
        modalBandImage.style.display = 'block';
        modalBandImage.onerror = function() {
            this.style.display = 'none';
        };
    } else {
        modalBandImage.style.display = 'none';
    }
    
    // Handle Facebook URL
    const facebookUrl = document.getElementById('modalFacebookUrl');
    if (band.facebook_url) {
        facebookUrl.href = band.facebook_url;
        facebookUrl.style.display = 'inline-flex';
    } else {
        facebookUrl.style.display = 'none';
    }
    
    // Handle Spotify embed
    const spotifyEmbed = document.getElementById('modalSpotifyEmbed');
    if (band.spotify_embed_url) {
        spotifyEmbed.innerHTML = `
            <iframe src="${band.spotify_embed_url}" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy">
            </iframe>
        `;
        spotifyEmbed.style.display = 'block';
    } else {
        spotifyEmbed.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Modal close button
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('bandModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('bandModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle logout
async function handleLogout() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            await axios.post('../api/logout.php', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Redirect to login
        window.location.href = '../index.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        // Even if API call fails, clear local storage and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show error message
function showError(message) {
    const bandsGrid = document.getElementById('bandsGrid');
    bandsGrid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>
    `;
}
