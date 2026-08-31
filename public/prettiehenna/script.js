// script.js

document.addEventListener("DOMContentLoaded", function() {
    // Navigation toggle for mobile
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    hamburger.addEventListener("click", function() {
        navLinks.classList.toggle("active");
    });

    // Preloader
    const preloader = document.getElementById("preloader");
    window.addEventListener("load", function() {
        preloader.style.display = "none";
    });

    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: "smooth" });
        });
    });

    // Stats animation
    const stats = document.querySelectorAll('.stat-num');
    const animateStats = () => {
        stats.forEach(stat => {
            const count = parseInt(stat.getAttribute('data-count'));
            let currentCount = 0;
            const increment = Math.ceil(count / 100);
            const updateCount = setInterval(() => {
                if (currentCount < count) {
                    currentCount += increment;
                    stat.textContent = currentCount > count ? count : currentCount;
                } else {
                    clearInterval(updateCount);
                }
            }, 10);
        });
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    });

    const statsSection = document.querySelector('.hero-stats');
    observer.observe(statsSection);
});