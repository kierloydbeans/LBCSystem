// Admin Panel JavaScript

// Global variables
let currentPage = 0;
const submissionsPerPage = 12;
let allSubmissions = [];
let filteredSubmissions = [];
let currentFilters = {
    status: '',
    search: ''
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFilters();
    loadSubmissions();
    initializeModal();
    updateStats();
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
    const searchFilter = document.getElementById('searchFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
        });
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', function() {
            currentFilters.search = this.value;
        });
    }
}

// Load submissions from API
function loadSubmissions(reset = true) {
    const submissionsGrid = document.getElementById('submissionsGrid');
    const submissionsLoading = document.getElementById('submissionsLoading');
    
    if (!submissionsGrid || !submissionsLoading) return;
    
    // Show loading state
    submissionsLoading.style.display = 'block';
    submissionsGrid.innerHTML = '';
    
    if (reset) {
        currentPage = 0;
        allSubmissions = [];
    }
    
    // Fetch submissions from API
    fetch('../api/admin_submissions.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.submissions.length > 0) {
            if (reset) {
                allSubmissions = data.data.submissions;
            }
            
            filteredSubmissions = filterSubmissions(allSubmissions);
            renderSubmissions(filteredSubmissions);
            updateStats();
            
            // Hide loading
            submissionsLoading.style.display = 'none';
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = filteredSubmissions.length > submissionsPerPage ? 'block' : 'none';
            }
        } else {
            renderNoSubmissions();
            submissionsLoading.style.display = 'none';
            updateStats();
        }
    })
    .catch(error => {
        console.error('Error loading submissions:', error);
        renderError();
        submissionsLoading.style.display = 'none';
    });
}

// Filter submissions based on current filters
function filterSubmissions(submissions) {
    return submissions.filter(submission => {
        // Status filter
        if (currentFilters.status && submission.status !== currentFilters.status) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const searchableFields = [
                submission.account_name,
                submission.phone_number,
                submission.event_title,
                submission.payment_method,
                submission.notes
            ].join(' ').toLowerCase();
            
            if (!searchableFields.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
}

// Apply filters
function applyFilters() {
    loadSubmissions(true);
}

// Clear filters
function clearFilters() {
    currentFilters = {
        status: '',
        search: ''
    };
    
    // Reset filter controls
    const statusFilter = document.getElementById('statusFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    if (statusFilter) statusFilter.value = '';
    if (searchFilter) searchFilter.value = '';
    
    loadSubmissions(true);
}

// Update statistics
function updateStats() {
    const totalSubmissions = document.getElementById('totalSubmissions');
    const pendingSubmissions = document.getElementById('pendingSubmissions');
    const confirmedSubmissions = document.getElementById('confirmedSubmissions');
    const totalRevenue = document.getElementById('totalRevenue');
    
    if (allSubmissions.length > 0) {
        const pending = allSubmissions.filter(s => s.status === 'pending').length;
        const confirmed = allSubmissions.filter(s => s.status === 'confirmed').length;
        const revenue = allSubmissions
            .filter(s => s.status === 'confirmed')
            .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
        
        if (totalSubmissions) totalSubmissions.textContent = allSubmissions.length;
        if (pendingSubmissions) pendingSubmissions.textContent = pending;
        if (confirmedSubmissions) confirmedSubmissions.textContent = confirmed;
        if (totalRevenue) totalRevenue.textContent = `₱${revenue.toFixed(2)}`;
    } else {
        if (totalSubmissions) totalSubmissions.textContent = '0';
        if (pendingSubmissions) pendingSubmissions.textContent = '0';
        if (confirmedSubmissions) confirmedSubmissions.textContent = '0';
        if (totalRevenue) totalRevenue.textContent = '₱0';
    }
}

// Render submissions
function renderSubmissions(submissions) {
    const submissionsGrid = document.getElementById('submissionsGrid');
    if (!submissionsGrid) return;
    
    const submissionsToShow = submissions.slice(0, (currentPage + 1) * submissionsPerPage);
    
    const submissionsHTML = submissionsToShow.map(submission => {
        const statusClass = `status-${submission.status}`;
        const formattedDate = new Date(submission.purchase_date).toLocaleDateString();
        
        return `
            <div class="submission-card" onclick="showSubmissionDetails(${submission.id})">
                <div class="submission-header">
                    <span class="submission-id">#${submission.id.toString().padStart(6, '0')}</span>
                    <span class="submission-status ${statusClass}">${submission.status.toUpperCase()}</span>
                </div>
                
                <div class="submission-details">
                    <h4>${submission.event_title}</h4>
                    <p><strong>Customer:</strong> ${submission.account_name}</p>
                    <p><strong>Phone:</strong> ${submission.phone_number}</p>
                    <p><strong>Quantity:</strong> ${submission.quantity} tickets</p>
                    <p><strong>Total:</strong> ₱${parseFloat(submission.total_amount).toFixed(2)}</p>
                    <p><strong>Method:</strong> ${submission.payment_method}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                </div>
                
                <div class="submission-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); viewReceipt('${submission.receipt_image_url}')">
                        <i class="fas fa-receipt"></i> View Receipt
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    submissionsGrid.innerHTML = submissionsHTML;
}

// Render no submissions state
function renderNoSubmissions() {
    const submissionsGrid = document.getElementById('submissionsGrid');
    if (!submissionsGrid) return;
    
    submissionsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; transform: rotate(-1deg);">
            <i class="fas fa-inbox" style="font-size: 3rem; color: #ff3333; margin-bottom: 1rem; text-shadow: 2px 2px 0px #000; animation: flicker 3s infinite; transform: rotate(-5deg);"></i>
            <h3 style="font-family: 'Permanent Marker', cursive; color: #ff3333; margin-bottom: 1rem; font-size: 2rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(255, 51, 51, 0.5); transform: rotate(-2deg);">No Submissions Found!!!</h3>
            <p style="font-family: 'Special Elite', cursive; color: #ff6666; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">No ticket purchases have been submitted yet!!!</p>
        </div>
    `;
}

// Render error state
function renderError() {
    const submissionsGrid = document.getElementById('submissionsGrid');
    if (!submissionsGrid) return;
    
    submissionsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; transform: rotate(1deg);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff3333; margin-bottom: 1rem; text-shadow: 2px 2px 0px #000; animation: flicker 3s infinite; transform: rotate(-5deg);"></i>
            <h3 style="font-family: 'Permanent Marker', cursive; color: #ff3333; margin-bottom: 1rem; font-size: 2rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(255, 51, 51, 0.5); transform: rotate(-2deg);">Unable to Load Submissions!!!</h3>
            <p style="font-family: 'Special Elite', cursive; color: #ff6666; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Please try again later or check the server logs!!!</p>
            <button onclick="loadSubmissions()" style="margin-top: 1rem; background: linear-gradient(45deg, #ff3333, #cc0000); color: white; border: 3px solid #cc0000; padding: 0.75rem 1.5rem; border-radius: 0; cursor: pointer; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 2px; text-shadow: 1px 1px 0px #000; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(204, 0, 0, 0.3); transform: rotate(-1deg);">Try Again</button>
        </div>
    `;
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('submissionModal');
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

// Show submission details modal
function showSubmissionDetails(submissionId) {
    const submission = allSubmissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    // Populate modal with submission data
    document.getElementById('modalPurchaseId').textContent = `#${submission.id.toString().padStart(6, '0')}`;
    document.getElementById('modalEventName').textContent = submission.event_title;
    document.getElementById('modalQuantity').textContent = submission.quantity;
    document.getElementById('modalTotalAmount').textContent = `₱${parseFloat(submission.total_amount).toFixed(2)}`;
    document.getElementById('modalPurchaseDate').textContent = new Date(submission.purchase_date).toLocaleString();
    document.getElementById('modalAccountName').textContent = submission.account_name;
    document.getElementById('modalPhoneNumber').textContent = submission.phone_number;
    document.getElementById('modalPaymentMethod').textContent = submission.payment_method;
    document.getElementById('modalNotes').textContent = submission.notes || 'None';
    
    // Set status badge
    const statusBadge = document.getElementById('modalStatusBadge');
    statusBadge.textContent = submission.status.toUpperCase();
    statusBadge.className = `submission-status status-${submission.status}`;
    
    // Set receipt image
    const receiptImage = document.getElementById('modalReceiptImage');
    const receiptLink = document.getElementById('modalReceiptLink');
    if (receiptImage && receiptLink) {
        receiptImage.src = `../assets/receipts/${submission.receipt_image_url}`;
        receiptLink.href = `../assets/receipts/${submission.receipt_image_url}`;
    }
    
    // Configure action buttons
    const confirmBtn = document.getElementById('confirmBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    
    if (confirmBtn) {
        confirmBtn.onclick = () => updateSubmissionStatus(submissionId, 'confirmed');
        confirmBtn.style.display = submission.status === 'confirmed' ? 'none' : 'inline-block';
    }
    
    if (rejectBtn) {
        rejectBtn.onclick = () => updateSubmissionStatus(submissionId, 'rejected');
        rejectBtn.style.display = submission.status === 'rejected' ? 'none' : 'inline-block';
    }
    
    // Show modal
    document.getElementById('submissionModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('submissionModal').classList.remove('active');
}

// Update submission status
function updateSubmissionStatus(submissionId, status) {
    const authToken = localStorage.getItem('lbc_token') || sessionStorage.getItem('lbc_token');
    
    if (!authToken) {
        showNotification('Authentication required', 'error');
        return;
    }
    
    fetch('../api/update_submission.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            submission_id: submissionId,
            status: status,
            auth_token: authToken
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Submission ${status} successfully!`, 'success');
            closeModal();
            loadSubmissions(true); // Refresh submissions
        } else {
            showNotification(data.message || 'Failed to update submission', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating submission:', error);
        showNotification('Network error. Please try again.', 'error');
    });
}

// View receipt
function viewReceipt(receiptUrl) {
    window.open(`../assets/receipts/${receiptUrl}`, '_blank');
}

// Refresh submissions
function refreshSubmissions() {
    loadSubmissions(true);
}

// Export data
function exportData() {
    showNotification('Export feature coming soon!', 'info');
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
            notification.style.background = 'linear-gradient(45deg, #ff3333, #cc0000)';
            notification.style.borderColor = '#cc0000';
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
