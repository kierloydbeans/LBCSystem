document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.querySelector('input[name="remember"]').checked;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate login process
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.textContent;
        
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        // Call PHP backend API
        fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                remember_me: rememberMe
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store token and user data
                if (rememberMe) {
                    localStorage.setItem('lbc_remember', 'true');
                    localStorage.setItem('lbc_email', email);
                    localStorage.setItem('lbc_token', data.data.token);
                    localStorage.setItem('lbc_user', JSON.stringify(data.data.user));
                } else {
                    sessionStorage.setItem('lbc_token', data.data.token);
                    sessionStorage.setItem('lbc_user', JSON.stringify(data.data.user));
                }
                
                showNotification('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    // Redirect to landing page (will be created later)
                    window.location.href = 'pages/landing.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Login failed', 'error');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        });
    });
    
    // Social login handlers
    const facebookBtn = document.querySelector('.social-btn.facebook');
    const googleBtn = document.querySelector('.social-btn.google');
    
    facebookBtn.addEventListener('click', function() {
        showNotification('Facebook login coming soon!', 'info');
    });
    
    googleBtn.addEventListener('click', function() {
        showNotification('Google login coming soon!', 'info');
    });
    
    // Forgot password handler
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        if (!email || !isValidEmail(email)) {
            showNotification('Please enter your email address first', 'error');
            document.getElementById('email').focus();
            return;
        }
        
        // Call password reset API (to be implemented)
        showNotification('Password reset feature coming soon!', 'info');
    });
    
    // Create account handler
    const signupLink = document.querySelector('.signup-link a');
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        showRegistrationModal();
    });
    
    // Gig carousel functionality
    const gigCards = document.querySelectorAll('.gig-card');
    let currentGigIndex = 0;
    
    function showGig(index) {
        gigCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
    }
    
    // Auto-rotate gigs every 5 seconds
    setInterval(() => {
        currentGigIndex = (currentGigIndex + 1) % gigCards.length;
        showGig(currentGigIndex);
    }, 5000);
    
    // Manual gig selection
    gigCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            currentGigIndex = index;
            showGig(index);
        });
    });
    
    // Check for remembered login on page load
    const rememberedEmail = localStorage.getItem('lbc_email');
    const shouldRemember = localStorage.getItem('lbc_remember');
    
    if (rememberedEmail && shouldRemember === 'true') {
        document.getElementById('email').value = rememberedEmail;
        document.querySelector('input[name="remember"]').checked = true;
    }
    
    // Utility functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
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
    
    // Add input animations
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Add floating label effect
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Add parallax effect to background
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const loginLeft = document.querySelector('.login-left');
        if (loginLeft) {
            const translateX = (mouseX - 0.5) * 20;
            const translateY = (mouseY - 0.5) * 20;
            
            loginLeft.style.backgroundPosition = `${translateX}px ${translateY}px`;
        }
    });
    
    // Add loading animation for form inputs
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.style.borderColor = '#4caf50';
            } else {
                this.style.borderColor = '#e1e1e1';
            }
        });
    });
    
    // Registration modal functionality
    function showRegistrationModal() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
            backdrop-filter: blur(3px);
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'registration-modal';
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #000000 0%, #001a33 50%, #000000 100%);
            border: 5px solid #0066ff;
            border-radius: 0;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
            box-shadow: 0 0 50px rgba(0, 102, 255, 0.6), 0 0 100px rgba(0, 102, 255, 0.3), 10px 10px 0px rgba(0, 102, 255, 0.4), 20px 20px 0px rgba(0, 0, 0, 0.3);
            transform: rotate(-2deg) skew(-1deg);
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative;">
                <h2 style="font-family: 'Permanent Marker', cursive; color: #0066ff; margin: 0; font-size: 2.5rem; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000, 0 0 15px rgba(0, 102, 255, 0.5); transform: rotate(-2deg); position: relative; display: inline-block;">
                    Join Lost Boys Club
                    <span style="position: absolute; right: -40px; top: 50%; transform: translateY(-50%) rotate(15deg); font-size: 1.2rem; color: #0066ff; animation: pulse 2s infinite;">!!!</span>
                </h2>
                <button class="close-modal" style="background: linear-gradient(45deg, #0066ff, #003d99); border: 3px solid #000; color: #fff; font-size: 1.8rem; cursor: pointer; width: 50px; height: 50px; border-radius: 0; display: flex; align-items: center; justify-content: center; font-family: 'Special Elite', cursive; box-shadow: 3px 3px 0px #000, 6px 6px 0px rgba(0, 102, 255, 0.3); transform: rotate(45deg); position: relative; overflow: hidden;">&times;</button>
            </div>
            
            <form id="registrationForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; transform: rotate(-1deg);">
                    <div class="form-group">
                        <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">First Name *</label>
                        <input type="text" name="first_name" required style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(-1deg);">
                    </div>
                    <div class="form-group">
                        <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Last Name *</label>
                        <input type="text" name="last_name" required style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(1deg);">
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 1.5rem; transform: rotate(1deg);">
                    <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Email Address *</label>
                    <input type="email" name="email" required style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(-1deg);">
                </div>
                
                <div class="form-group" style="margin-bottom: 1.5rem; transform: rotate(-1deg);">
                    <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Phone Number</label>
                    <input type="tel" name="phone" style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(1deg);">
                </div>
                
                <div class="form-group" style="margin-bottom: 1.5rem; transform: rotate(1deg);">
                    <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Date of Birth</label>
                    <input type="date" name="date_of_birth" style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(-1deg);">
                </div>
                
                <div class="form-group" style="margin-bottom: 1.5rem; transform: rotate(-1deg);">
                    <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Password *</label>
                    <input type="password" name="password" required style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(1deg);">
                    <small style="color: #66b3ff; font-size: 0.8rem; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Minimum 8 characters, must include letters and numbers</small>
                </div>
                
                <div class="form-group" style="margin-bottom: 2rem; transform: rotate(1deg);">
                    <label style="font-family: 'Special Elite', cursive; display: block; margin-bottom: 0.5rem; color: #66b3ff; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0px #000;">Confirm Password *</label>
                    <input type="password" name="confirm_password" required style="width: 100%; padding: 1rem; border: 3px solid #0066ff; border-radius: 0; font-size: 1rem; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 26, 51, 0.8) 100%); color: #fff; font-family: 'Special Elite', cursive; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.3); transform: rotate(-1deg);">
                </div>
                
                <button type="submit" style="width: 100%; padding: 1.2rem; background: linear-gradient(45deg, #0066ff, #003d99); color: #fff; border: 3px solid #0066ff; border-radius: 0; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 2px; font-family: 'Special Elite', cursive; text-shadow: 1px 1px 0px #000; box-shadow: 3px 3px 0px #000, 6px 6px 0px rgba(0, 102, 255, 0.3); transform: rotate(-2deg); position: relative; overflow: hidden;">
                    Create Account
                </button>
            </form>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px) rotate(-2deg) skew(-1deg); opacity: 0; }
                to { transform: translateY(0) rotate(-2deg) skew(-1deg); opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            @keyframes borderGlow {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            .registration-modal::before {
                content: '';
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                background: linear-gradient(45deg, #0066ff, #3399ff, #0066ff, #0052cc, #0066ff);
                z-index: -1;
                animation: borderGlow 3s linear infinite;
            }
            .registration-modal button[type="submit"]::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }
            .registration-modal button[type="submit"]:hover::before {
                left: 100%;
            }
            .registration-modal button[type="submit"]:hover {
                background: linear-gradient(45deg, #0080ff, #0066ff);
                transform: rotate(-2deg) scale(1.05);
                box-shadow: 0 0 20px rgba(0, 102, 255, 0.6), 3px 3px 0px #000, 6px 6px 0px rgba(0, 102, 255, 0.4);
            }
            .registration-modal .close-modal::before {
                content: 'X';
                transform: rotate(-45deg);
            }
            .registration-modal .close-modal:hover {
                background: linear-gradient(45deg, #3399ff, #0066ff);
                transform: rotate(45deg) scale(1.1);
                box-shadow: 0 0 20px rgba(0, 102, 255, 0.6), 3px 3px 0px #000, 6px 6px 0px rgba(0, 102, 255, 0.4);
            }
            .registration-modal input:focus {
                outline: none;
                border-color: #0080ff;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 26, 51, 0.9) 100%);
                box-shadow: 0 0 20px rgba(0, 102, 255, 0.6), 2px 2px 0px #000, 4px 4px 0px rgba(0, 102, 255, 0.4);
                transform: scale(1.02);
            }
            .registration-modal input::placeholder {
                color: rgba(102, 179, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
        
        // Handle form submission
        const registrationForm = document.getElementById('registrationForm');
        registrationForm.addEventListener('submit', handleRegistration);
        
        // Handle close button
        modalOverlay.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            document.head.removeChild(style);
        });
        
        // Handle overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                document.head.removeChild(style);
            }
        });
    }
    
    function handleRegistration(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Validate passwords match
        if (data.password !== data.confirm_password) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Validate password strength
        if (data.password.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }
        
        if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(data.password)) {
            showNotification('Password must contain at least one letter and one number', 'error');
            return;
        }
        
        // Remove confirm_password field
        delete data.confirm_password;
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        // Call registration API
        fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showNotification('Registration successful! Welcome to Lost Boys Club!', 'success');
                
                // Store token and user data
                localStorage.setItem('lbc_token', result.data.token);
                localStorage.setItem('lbc_user', JSON.stringify(result.data.user));
                
                // Close modal
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    document.body.removeChild(modal);
                }
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'pages/landing.html';
                }, 2000);
            } else {
                showNotification(result.message || 'Registration failed', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showNotification('Network error. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
});
