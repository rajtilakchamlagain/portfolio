document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Interactive Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorGlow = document.querySelector('.cursor-glow');
    const interactables = document.querySelectorAll('a, .glass-card, .glass-btn');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderCursor() {
        // Fast follow for dot
        dotX += (mouseX - dotX) * 0.5;
        dotY += (mouseY - dotY) * 0.5;
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;

        // Slow smooth follow for glow
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;

        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // --- Vanilla Tilt (3D Glass Effect) ---
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.3,
            scale: 1.02
        });
    }

    // --- GSAP Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Initial Navbar animation
    gsap.to('.glass-nav', { y: 0, opacity: 1, duration: 1, ease: "power3.out" });

    // Fade-in-up staggering
    const fadeElements = gsap.utils.toArray('.fade-in-up');
    fadeElements.forEach(el => {
        let delayVal = 0;
        if (el.classList.contains('delay-1')) delayVal = 0.1;
        if (el.classList.contains('delay-2')) delayVal = 0.2;
        if (el.classList.contains('delay-3')) delayVal = 0.3;
        if (el.classList.contains('delay-4')) delayVal = 0.4;

        gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: delayVal,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // --- Three.js WebGL Aurora / Water Fluid Background ---
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Plane Geometry for the Shader
    const geometry = new THREE.PlaneGeometry(10, 10, 128, 128);

    // Dynamic Shader Material (Aurora/Water ripples)
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: `
            uniform float uTime;
            uniform vec2 uMouse;
            varying vec2 vUv;
            varying float vElevation;

            // Simplex noise function approximation
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  0.366025403784439, -0.577350269189626,  0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vUv = uv;
                
                // Add mouse interaction displacement
                float dist = distance(uv, uMouse);
                float mouseForce = max(0.0, 1.0 - dist * 3.0) * 0.5;
                
                // Noise based elevation (water ripples / aurora waves)
                float elevation = snoise(vec2(position.x * 0.5 + uTime * 0.1, position.y * 0.5 + uTime * 0.2)) * 0.5;
                elevation += mouseForce * sin(uTime * 5.0 - dist * 20.0);
                
                vElevation = elevation;
                
                vec3 newPosition = position;
                newPosition.z += elevation;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            varying float vElevation;
            
            void main() {
                // Color palette (Cyan, Blue, Green)
                vec3 color1 = vec3(0.0, 0.94, 1.0); // Aero Cyan
                vec3 color2 = vec3(0.0, 0.4, 1.0);  // Aero Blue
                vec3 color3 = vec3(0.0, 1.0, 0.53); // Aero Green
                
                float mixFactor = (vElevation + 0.5) * 0.8;
                
                // Mix colors based on elevation
                vec3 finalColor = mix(color2, color1, mixFactor);
                finalColor = mix(finalColor, color3, sin(vUv.x * 5.0 + uTime) * 0.5 + 0.5);
                
                // Add some dark base
                finalColor = mix(vec3(0.0, 0.03, 0.08), finalColor, 0.3 + (vElevation * 0.2));
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse Interaction Updates
    document.addEventListener('mousemove', (e) => {
        material.uniforms.uMouse.value.x = e.clientX / window.innerWidth;
        material.uniforms.uMouse.value.y = 1.0 - (e.clientY / window.innerHeight); // Invert Y
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();
        
        // Update uniforms
        material.uniforms.uTime.value = elapsedTime;
        
        // Render
        renderer.render(scene, camera);
        
        // Request next frame
        window.requestAnimationFrame(tick);
    }
    
    tick();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

});
