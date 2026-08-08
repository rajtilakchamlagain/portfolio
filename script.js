document.addEventListener('DOMContentLoaded', () => {
    
    // --- Preloader Logic ---
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 2000);

    // --- Custom Cursor Logic ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('.magnetic-link, .work-card, .exp-box, .timeline-row');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant cursor move
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Smooth follower move
    function animateCursor() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states for cursor
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        link.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });

    // --- GSAP Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Fade up elements
    gsap.utils.toArray('.fade-in-up').forEach(element => {
        gsap.fromTo(element, 
            { y: 50, opacity: 0 },
            {
                y: 0, 
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                }
            }
        );
    });

    // Split Text animation for massive headers
    if (typeof SplitText !== "undefined") {
        const splits = document.querySelectorAll(".split-text");
        splits.forEach(split => {
            const splitText = new SplitText(split, {type: "chars"});
            gsap.from(splitText.chars, {
                opacity: 0,
                y: 50,
                rotateX: -90,
                stagger: 0.05,
                duration: 1,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: split,
                    start: "top 80%"
                }
            });
        });
    } else {
        // Fallback if SplitText (premium plugin) isn't available
        gsap.from(".split-text", {
            opacity: 0, y: 50, duration: 1.5, stagger: 0.2, ease: "power4.out"
        });
    }

    // Work Section Parallax/Stagger
    gsap.from(".work-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".work-gallery",
            start: "top 70%"
        }
    });

    // --- Three.js WebGL Interactive Background (Neural Network / Particles) ---
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x22d3ee, // Cyan accent
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lines connecting close particles (Neural Network effect)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.15
    });

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX / window.innerWidth) * 2 - 1;
        targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        // Rotate particles slowly
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Mouse Parallax effect
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        window.requestAnimationFrame(tick);
    }
    
    tick();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

});
