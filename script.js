document.addEventListener('DOMContentLoaded', () => {
    // --- Slide-out Panel Logic ---
    const panelOverlay = document.getElementById('panel-overlay');
    const slidePanel = document.getElementById('slide-panel');
    const panelCloseBtn = document.getElementById('panel-close-btn');
    const panelTitleText = document.getElementById('panel-title-text');
    const panelIcon = document.getElementById('panel-icon');
    const panelProductGrid = document.getElementById('panel-product-grid');

    const arrowButtons = document.querySelectorAll('.arrow-btn');

    // Open Panel Function
    const openPanel = (categorySection) => {
        // Clear previous content
        panelProductGrid.innerHTML = '';

        // Extract title and icon
        const titleElement = categorySection.querySelector('.section-title-small span');
        const iconElement = categorySection.querySelector('.section-title-small svg');
        
        panelTitleText.textContent = titleElement ? titleElement.textContent : 'All Products';
        
        // Update the panel header icon if possible (using cloned svg)
        if (iconElement) {
            const iconContainer = panelTitleText.previousElementSibling;
            if (iconContainer) {
                iconContainer.replaceWith(iconElement.cloneNode(true));
            }
        }

        // Get all product cards from this section
        const productCards = categorySection.querySelectorAll('.horizontal-list .product-card');
        
        // Clone and append to panel grid
        productCards.forEach(card => {
            const clonedCard = card.cloneNode(true);
            panelProductGrid.appendChild(clonedCard);
        });

        // Show panel and overlay
        panelOverlay.classList.add('active');
        slidePanel.classList.add('active');
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    };

    // Close Panel Function
    const closePanel = () => {
        panelOverlay.classList.remove('active');
        slidePanel.classList.remove('active');
        
        // Restore background scrolling
        document.body.style.overflow = '';
    };

    // Attach click listeners to arrow buttons
    arrowButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const categorySection = this.closest('.category-section');
            if (categorySection) {
                openPanel(categorySection);
            }
        });
    });

    // Attach close listeners
    if (panelCloseBtn) {
        panelCloseBtn.addEventListener('click', closePanel);
    }

    // --- Profile Side Panel Logic ---
    const navProfileBtn = document.getElementById('nav-profile-btn');
    const profilePanel = document.getElementById('profile-panel');
    const profileCloseBtn = document.getElementById('profile-close-btn');

    const openProfilePanel = (e) => {
        if (e) e.preventDefault();
        if (panelOverlay) panelOverlay.classList.add('active');
        if (profilePanel) profilePanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeProfilePanel = () => {
        if (profilePanel) profilePanel.classList.remove('active');
        // Only remove overlay and restore scrolling if main slide panel is not active
        if (slidePanel && !slidePanel.classList.contains('active') && panelOverlay) {
            panelOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (navProfileBtn) {
        navProfileBtn.addEventListener('click', openProfilePanel);
    }
    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', closeProfilePanel);
    }

    if (panelOverlay) {
        panelOverlay.addEventListener('click', () => {
            closePanel();
            closeProfilePanel();
        });
    }

    // --- Auth Modal Logic ---
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerRegisterBtn = document.getElementById('header-register-btn');
    const authOverlay = document.getElementById('auth-overlay');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeBtns = document.querySelectorAll('.close-modal-btn');

    const openModal = (modalElement) => {
        if (authOverlay && modalElement) {
            authOverlay.classList.add('active');
            modalElement.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeAllModals = () => {
        if (authOverlay) authOverlay.classList.remove('active');
        if (loginModal) loginModal.classList.remove('active');
        if (registerModal) registerModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', () => openModal(loginModal));
    }

    if (headerRegisterBtn) {
        headerRegisterBtn.addEventListener('click', () => openModal(registerModal));
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    if (authOverlay) {
        authOverlay.addEventListener('click', closeAllModals);
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            closeAllModals();
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-password-confirm').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            console.log('Register form submitted successfully');
            closeAllModals();
        });
    }

    // Close on Escape key (already partially handled above, let's merge or just handle here)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (typeof slidePanel !== 'undefined' && slidePanel && slidePanel.classList.contains('active')) {
                closePanel();
            }
            if (typeof profilePanel !== 'undefined' && profilePanel && profilePanel.classList.contains('active')) {
                closeProfilePanel();
            }
            if ((loginModal && loginModal.classList.contains('active')) || 
                (registerModal && registerModal.classList.contains('active'))) {
                closeAllModals();
            }
        }
    });

    // --- Google Sign-In Logic ---
    window.handleCredentialResponse = (response) => {
        // Decode JWT token
        const responsePayload = decodeJwtResponse(response.credential);
        
        // Update UI
        const sidebarGreeting = document.getElementById('sidebar-greeting');
        const sidebarUserName = document.getElementById('sidebar-user-name');
        const sidebarUserProfile = document.getElementById('sidebar-user-profile');
        const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
        const authActions = document.querySelector('.auth-actions');
        
        if (sidebarUserName && sidebarUserAvatar) {
            sidebarUserName.textContent = responsePayload.given_name || responsePayload.name;
            sidebarUserAvatar.src = responsePayload.picture;
            
            // Show profile elements
            sidebarGreeting.style.display = 'block';
            sidebarUserProfile.style.display = 'flex';
            
            // Hide login/register buttons
            if (authActions) authActions.style.display = 'none';
            
            // Close modals
            closeAllModals();
        }
    };
    
    function decodeJwtResponse(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const sidebarGreeting = document.getElementById('sidebar-greeting');
            const sidebarUserProfile = document.getElementById('sidebar-user-profile');
            const authActions = document.querySelector('.auth-actions');
            
            if (sidebarGreeting) sidebarGreeting.style.display = 'none';
            if (sidebarUserProfile) sidebarUserProfile.style.display = 'none';
            if (authActions) authActions.style.display = 'flex';
        });
    }

    // Initialize Google API after everything is loaded
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: "599207890796-kvibrbpitddmid16k7i2537jq86rokt7.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        
        const googleBtnContainer = document.getElementById("google-signin-btn");
        if (googleBtnContainer) {
            google.accounts.id.renderButton(
                googleBtnContainer,
                { theme: "outline", size: "large", width: 350 }  // customization attributes
            );
        }
    } else {
        // Fallback initialization if library loads slightly later
        window.onload = function () {
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: "599207890796-kvibrbpitddmid16k7i2537jq86rokt7.apps.googleusercontent.com",
                    callback: handleCredentialResponse
                });
                const googleBtnContainer = document.getElementById("google-signin-btn");
                if (googleBtnContainer) {
                    google.accounts.id.renderButton(
                        googleBtnContainer,
                        { theme: "outline", size: "large", width: 350 } 
                    );
                }
            }
        };
    }
});
