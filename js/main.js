/**
 * Portfolio - Main JavaScript
 * Handles all interactive elements and animations
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loader = document.querySelector('.loader');
    const loaderProgress = document.querySelector('.loader-progress');
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const header = document.querySelector('.header');
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const txtRotateElements = document.querySelectorAll('.txt-rotate');

    // Initialize the loader
    initLoader();
    
    // Show the page content after a short delay
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    /**
     * Initialize all page functionality
     */
    function initPage() {
        try {
            // Only initialize cursor for non-touch devices
            if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
                initCustomCursor(cursor, cursorFollower);
            }
            initNavToggle(navToggle, navList, navLinks);
            initScrollReveal(sections);
            initTextRotation(txtRotateElements);
            initSmoothScroll(header);
            initScrollSpy(sections, navLinks);
            
            // Make sure the page is visible
            document.body.style.visibility = 'visible';
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }

    /**
     * Initialize page loader with smooth transition
     */
    function initLoader() {
        // If no loader is present, just initialize the page
        if (!loader) {
            initPage();
            return;
        }
        
        const progressBar = document.querySelector('.loader-progress');
        const progressText = document.querySelector('.loader-text');
        
        // Show the loader with animation
        loader.classList.add('visible');
        void loader.offsetWidth; // Trigger reflow
        loader.style.opacity = '1';
        document.body.style.overflow = 'hidden';
        
        let progress = 0;
        const minTime = 800; // Minimum loading time in ms
        const startTime = performance.now();
        
        const updateProgress = (currentTime) => {
            // Calculate elapsed time
            const elapsed = currentTime - startTime;
            
            // Calculate progress (0-100)
            progress = Math.min(100, (elapsed / minTime) * 100);
            
            // Update progress bar
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Update progress text
            if (progressText) {
                progressText.textContent = `Loading ${Math.round(progress)}%`;
            }
            
            // Check if loading is complete
            if (progress >= 100 && elapsed >= minTime) {
                // Hide loader with fade out
                loader.style.transition = 'opacity 0.6s ease-out';
                loader.style.opacity = '0';
                
                // Initialize page before hiding loader
                initPage();
                
                // Hide loader and show page content
                setTimeout(() => {
                    loader.style.opacity = '0';
                    document.body.style.overflow = 'visible';
                    
                    // Remove loader after animation completes
                    setTimeout(() => {
                        loader.classList.remove('visible');
                        loader.style.display = 'none';
                    }, 600);
                }, 300);
                
                return; // Stop the animation
            }
            
            // Continue animation
            requestAnimationFrame(updateProgress);
        };
        
        // Start the progress animation
        requestAnimationFrame(updateProgress);
        
        // Fallback in case the animation doesn't complete
        setTimeout(() => {
            if (loader.style.opacity !== '0') {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    document.body.style.overflow = 'visible';
                    initPage();
                }, 600);
            }
        }, minTime + 1000); // Fallback timeout
    }

    /**
     * Initialize custom cursor with smooth animations and hover effects
     * @param {HTMLElement} cursor - The cursor element
     * @param {HTMLElement} follower - The cursor follower element
     */
    function initCustomCursor(cursor, follower) {
        if (!cursor || !follower) return;

        let mouseX = 0;
        let mouseY = 0;
        let posX = 0;
        let posY = 0;
        let isHovered = false;
        let isVisible = false;
        let rafId;

        // Show cursor when mouse enters the document
        const showCursor = () => {
            if (isVisible) return;
            isVisible = true;
            cursor.style.opacity = '1';
            follower.style.opacity = '0.8';
        };

        // Hide cursor when mouse leaves the document
        const hideCursor = () => {
            if (!isVisible) return;
            isVisible = false;
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
            cancelAnimationFrame(rafId);
        };

        // Update cursor position
        const updateCursor = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isVisible) showCursor();
        };

        // Handle mouse movement
        document.addEventListener('mousemove', updateCursor);
        document.addEventListener('mouseenter', showCursor);
        document.addEventListener('mouseleave', hideCursor);

        // Animate cursor
        const animate = () => {
            // Ease out animation for smooth following
            posX += (mouseX - posX) / 5;
            posY += (mouseY - posY) / 5;

            // Update cursor positions with hardware acceleration
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${isHovered ? 1.5 : 1})`;
            follower.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${isHovered ? 0.5 : 1})`;
            
            rafId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Add hover effect on interactive elements
        const interactiveElements = [
            'a', 'button', '[role="button"]', 'input', 'textarea', 
            'select', '.btn', '.nav-link', '.project-card', '[data-cursor-hover]'
        ].join(',');
        
        const elements = document.querySelectorAll(interactiveElements);
        
        const handleHoverStart = () => {
            isHovered = true;
            cursor.classList.add('cursor-hover');
            follower.classList.add('cursor-follower-hover');
        };
        
        const handleHoverEnd = () => {
            isHovered = false;
            cursor.classList.remove('cursor-hover');
            follower.classList.remove('cursor-follower-hover');
        };

        elements.forEach(element => {
            element.addEventListener('mouseenter', handleHoverStart);
            element.addEventListener('mouseleave', handleHoverEnd);
            element.addEventListener('focus', handleHoverStart);
            element.addEventListener('blur', handleHoverEnd);
        });

        // Add click effect
        const handleMouseDown = () => {
            cursor.classList.add('cursor-click');
            follower.classList.add('cursor-click');
        };

        const handleMouseUp = () => {
            cursor.classList.remove('cursor-click');
            follower.classList.remove('cursor-click');
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
    }

    /**
     * Mobile navigation toggle functionality
     */
    function initNavToggle(toggleEl, navListEl, navLinkEls) {
        if (!toggleEl || !navListEl) return;
        
        toggleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEl.classList.toggle('active');
            navListEl.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a nav link
        navLinkEls.forEach(link => {
            link.addEventListener('click', () => {
                navListEl.classList.remove('active');
                toggleEl.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navListEl.contains(e.target) && !toggleEl.contains(e.target)) {
                navListEl.classList.remove('active');
                toggleEl.classList.remove('active');
            }
        });
    }

    /**
     * Initialize scroll reveal animations
     */
    function initScrollReveal(elements) {
        if (!('IntersectionObserver' in window) || !elements.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => observer.observe(el));
    }

    /**
     * Initialize text rotation effect
     */
    function initTextRotation(elements) {
        if (!elements.length) return;
        
        class TextRotator {
            constructor(el, toRotate, period) {
                this.el = el;
                this.toRotate = toRotate;
                this.period = parseInt(period, 10) || 2000;
                this.loopNum = 0;
                this.txt = '';
                this.isDeleting = false;
                this.tick();
            }
            
            tick() {
                const i = this.loopNum % this.toRotate.length;
                const fullTxt = this.toRotate[i];
                
                if (this.isDeleting) {
                    this.txt = fullTxt.substring(0, this.txt.length - 1);
                } else {
                    this.txt = fullTxt.substring(0, this.txt.length + 1);
                }
                
                this.el.textContent = this.txt;
                
                let delta = 200 - Math.random() * 100;
                
                if (this.isDeleting) delta /= 2;
                
                if (!this.isDeleting && this.txt === fullTxt) {
                    delta = this.period;
                    this.isDeleting = true;
                } else if (this.isDeleting && this.txt === '') {
                    this.isDeleting = false;
                    this.loopNum++;
                    delta = 500;
                }
                
                setTimeout(() => this.tick(), delta);
            }
        }
        
        elements.forEach(el => {
            const toRotate = JSON.parse(el.getAttribute('data-rotate'));
            const period = el.getAttribute('data-period') || 2000;
            
            if (toRotate) {
                new TextRotator(el, toRotate, period);
            }
        });
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScroll(headerEl) {
        const headerHeight = headerEl ? headerEl.offsetHeight : 80;
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            // Skip if it's not a navigation link
            if (!anchor.classList.contains('nav-link') && !anchor.closest('.nav-list')) {
                return;
            }
            
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '#!') return;
                
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    const navToggle = document.querySelector('.nav-toggle');
                    const navList = document.querySelector('.nav-list');
                    if (navToggle && navList) {
                        navToggle.classList.remove('active');
                        navList.classList.remove('active');
                    }
                    
                    // Calculate scroll position
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // 20px extra space
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without adding to history
                    history.replaceState(null, null, targetId);
                }
            });
        });
    }

    /**
     * Initialize scroll spy for navigation highlighting
     */
    function initScrollSpy(sectionEls, navLinkEls) {
        if (!sectionEls.length || !navLinkEls.length) return;
        
        // Get header height for offset
        const headerEl = document.querySelector('.header');
        const headerHeight = headerEl ? headerEl.offsetHeight : 80;
        
        // Set up intersection observer
        const observer = new IntersectionObserver((entries) => {
            let foundActive = false;
            
            // First pass: find the first intersecting section
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const correspondingNav = document.querySelector(`.nav-link[href="#${id}"]`);
                    
                    if (correspondingNav) {
                        // Remove active class from all nav links
                        navLinkEls.forEach(link => link.classList.remove('active'));
                        // Add active class to current nav link
                        correspondingNav.classList.add('active');
                        foundActive = true;
                        break;
                    }
                }
            }
            
            // If no section is intersecting and we're at the top, highlight the first nav item
            if (!foundActive && window.scrollY < 100) {
                navLinkEls.forEach(link => link.classList.remove('active'));
                if (navLinkEls[0]) navLinkEls[0].classList.add('active');
            }
            
        }, {
            rootMargin: `-${headerHeight}px 0px -70% 0px`,
            threshold: 0.1
        });
        
        // Observe all sections
        sectionEls.forEach(section => {
            observer.observe(section);
        });
        
        // Initial check in case page loads with a hash
        const hash = window.location.hash;
        if (hash) {
            const targetSection = document.querySelector(hash);
            if (targetSection) {
                setTimeout(() => {
                    window.scrollTo(0, 0); // Reset scroll to top first
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'auto'
                    });
                }, 100);
            }
        }
        
        // Update on window resize (in case header height changes)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Re-query sections in case they've changed
                const newSections = document.querySelectorAll('section[id]');
                if (newSections.length > 0) {
                    // Re-observe all sections
                    sectionEls.forEach(section => observer.unobserve(section));
                    newSections.forEach(section => observer.observe(section));
                    sectionEls = newSections;
                }
            }, 250);
        });
    }
});
