// Global functions for Modals and Tabs so they can be called from inline HTML attributes
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function openTab(event, tabId) {
    // Hide all tab content
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all buttons
    const tabBtns = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove('active');
    }
    
    // Show current tab and add active class to button
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Close modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    // Intersection Observer for scroll animations (fade-up)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Frutiger Aero Water Drops / Bubbles Generator
    const waterDropsContainer = document.getElementById('water-drops');
    
    function createBubble() {
        if (!waterDropsContainer) return;
        
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        const size = Math.random() * 40 + 10; 
        const left = Math.random() * 100; 
        const animationDuration = Math.random() * 10 + 10; 
        const delay = Math.random() * 5; 
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = `-50px`;
        bubble.style.position = 'absolute';
        
        bubble.style.borderRadius = '50%';
        bubble.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.1) 60%, transparent)';
        bubble.style.boxShadow = 'inset 0 0 10px rgba(255,255,255,0.5), inset 2px 0 5px rgba(34, 211, 238, 0.3)';
        bubble.style.backdropFilter = 'blur(2px)';
        bubble.style.opacity = '0';
        
        bubble.style.animation = `float-up ${animationDuration}s linear ${delay}s infinite`;
        
        waterDropsContainer.appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
            createBubble();
        }, (animationDuration + delay) * 1000);
    }
    
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float-up {
            0% {
                transform: translateY(0) scale(1) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            50% {
                transform: translateY(-50vh) scale(1.1) translateX(20px);
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(-100vh) scale(1) translateX(-20px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Generate initial bubbles
    for (let i = 0; i < 20; i++) {
        createBubble();
    }
});
