export function init3DProcessCards() {
    const cards = document.querySelectorAll('.process-card-3d');
    
    cards.forEach(card => {
        const inner = card.querySelector('.process-card-inner');
        if (!inner) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg tilt
            const rotateY = ((x - centerX) / centerX) * 15;
            
            // Adjust glare
            const glare = card.querySelector('.glare');
            if(glare) {
                const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI - 90;
                glare.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 80%)`;
            }

            inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = `rotateX(0deg) rotateY(0deg)`;
            const glare = card.querySelector('.glare');
            if(glare) {
                glare.style.background = `none`;
            }
        });
    });
}
