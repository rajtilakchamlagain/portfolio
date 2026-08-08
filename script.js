document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Fade up animations for sections
    const fadeElements = gsap.utils.toArray('.fade-up');
    
    fadeElements.forEach(element => {
        // Handle delays based on class
        let delayAmount = 0;
        if (element.classList.contains('delay-1')) {
            delayAmount = 0.2;
        }

        gsap.fromTo(element, 
            { 
                y: 40, 
                opacity: 0 
            },
            {
                y: 0, 
                opacity: 1,
                duration: 1.2,
                delay: delayAmount,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Smooth hover on project cards (Optional: minor scale)
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { backgroundColor: '#f4f3ed', duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { backgroundColor: 'transparent', duration: 0.3 });
        });
    });
});
