// Space Background Animation
(function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'space-canvas';
    
    // Style the canvas to sit behind everything
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-2';
    canvas.style.pointerEvents = 'none';
    
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    
    // Create 150 stars with varying sizes and speeds
    function initStars() {
        stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5,
                // Gold and white tones
                color: Math.random() > 0.8 ? 'rgba(212, 168, 83, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                speed: Math.random() * 0.3 + 0.05,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                alpha: Math.random()
            });
        }
    }
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initStars();
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < stars.length; i++) {
            let star = stars[i];
            
            // Twinkle effect
            star.alpha += star.twinkleSpeed;
            let currentAlpha = Math.abs(Math.sin(star.alpha));
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            
            // Apply color with twinkle opacity
            ctx.fillStyle = star.color.replace(/[\d.]+\)$/g, currentAlpha + ')');
            ctx.fill();
            
            // Move star slowly upwards
            star.y -= star.speed;
            
            // Reset star if it goes off screen
            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
})();
