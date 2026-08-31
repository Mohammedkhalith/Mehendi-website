// ===========================
// Preloader
// ===========================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 600);
    }
});
// ===========================
// Navbar scroll effect
// ===========================
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    // Hide header on scroll down, show on scroll up
    /*
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.classList.add('hide');
    } else {
        navbar.classList.remove('hide');
    }
    */
    lastScroll = currentScroll;
});
// ===========================
// Mobile menu toggle
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if(hamburger) hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});
// Close menu on link click
if(navLinks) navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});
// ===========================
// Active nav link on scroll
// ===========================
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}
window.addEventListener('scroll', updateActiveNav);
// ===========================
// Scroll animations
// ===========================
const animatedElements = document.querySelectorAll('[data-animate]');
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animated');
            }, index * 80);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
animatedElements.forEach(el => observer.observe(el));
// ===========================
// Counter animation
// ===========================
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-count'));
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
counters.forEach(counter => counterObserver.observe(counter));
function animateCounter(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}
// ===========================
// Gallery filter
// ===========================
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeIn 0.4s ease forwards';
            } else {
                item.classList.add('hidden');
            }
        });
    });
});
// Add fadeIn keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);
// ===========================
// ===========================
// Testimonial Slider
// ===========================
const track = document.getElementById('testimonialTrack');
const cards = track ? track.querySelectorAll('.testimonial-card') : [];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('sliderDots');
let currentSlide = 0;
const totalSlides = cards.length;
// Create dots
if (dotsContainer) {
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
}
function goToSlide(index) {
    if (!track) return;
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dotsContainer) {
        dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}
if(prevBtn) prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
});
if(nextBtn) nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
});
// Auto-play
let autoPlay;
if (totalSlides > 0) {
    autoPlay = setInterval(() => {
        goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
    }, 5000);
}
// Pause on hover
const sliderArea = document.querySelector('.testimonials-slider');
if(sliderArea) sliderArea.addEventListener('mouseenter', () => clearInterval(autoPlay));
if(sliderArea) sliderArea.addEventListener('mouseleave', () => {
    if (totalSlides > 0) {
        autoPlay = setInterval(() => {
            goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
        }, 5000);
    }
});
// ===========================
// Contact / Booking Form
// ===========================
const contactForm = document.getElementById('contactForm');
const dateInput = document.getElementById('date');
// Prevent booking a session in the past
if (dateInput) {
    if(dateInput) dateInput.min = new Date().toISOString().split('T')[0];
}
const validators = {
    name: (v) => v.trim().length >= 2 || 'Please enter your full name',
    phone: (v) => /^[0-9+\-\s()]{7,15}$/.test(v.trim()) || 'Enter a valid phone number',
    email: (v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address',
    service: (v) => v !== '' || 'Please choose a service',
    date: (v) => v !== '' || 'Please choose a preferred date',
    time: (v) => v !== '' || 'Please choose a preferred time',
    location: (v) => v.trim().length >= 3 || 'Please enter a valid location'
};
function validateField(field) {
    const rule = validators[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    const errorEl = document.getElementById(field.id + 'Error');
    if (result === true) {
        field.classList.remove('invalid');
        if (errorEl) errorEl.classList.remove('visible');
        return true;
    }
    field.classList.add('invalid');
    if (errorEl) {
        errorEl.textContent = result;
        errorEl.classList.add('visible');
    }
    return false;
}
if(contactForm) contactForm.querySelectorAll('input, select').forEach(field => {
    if (!validators[field.name]) return;
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
    });
});
if(contactForm) contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    if(contactForm) contactForm.querySelectorAll('input, select').forEach(field => {
        if (validators[field.name] && !validateField(field)) {
            isValid = false;
        }
    });
    if (!isValid) {
        contactForm.querySelector('.invalid')?.focus();
        return;
    }
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('span:first-child');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    // Send form data to Formspree
    const formData = new FormData(contactForm);
    fetch(contactForm.action, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(async (response) => {
        if (response.status === 200) {
            btnText.textContent = 'Session Requested!';
            contactForm.reset();
        } else {
            btnText.textContent = 'Something went wrong!';
        }
    })
    .catch(error => {
        console.log(error);
        btnText.textContent = 'Error sending message';
    })
    .finally(() => {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        setTimeout(() => {
            btnText.textContent = 'Book Session';
            submitBtn.disabled = false;
        }, 3000);
    });
});
// ===========================
// Smooth scroll for anchor links
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
/* ============ PRODUCT DATA ============ */
const PRODUCTS = [
  {
    id: "nail-cone",
    name: "Nail cone",
    price: 30,
    category: "organic",
    image: "photos/practice-cone.jpg",
    stock: 50,
  },
  {
    id: "normal-cone",
    name: "Normal henna cones",
    price: 20,
    category: "organic",
    image: "photos/normal-cone.jpg",
    stock: 50,
  },
  {
    id: "bridal-cone",
    name: "Bridal henna cone",
    price: 30,
    category: "bridal",
    image: "photos/bridal-cone.jpg",
    stock: 50,
  },
  {
    id: "henna-dip",
    name: "Henna dip",
    price: 40,
    category: "colored",
    image: "photos/henna-dip.jpg",
    stock: 50,
  },
  {
    id: "henna-powder-100g",
    name: "Henna Powder 100g",
    price: 75,
    category: "organic",
    image: "photos/henna-powder.jpg",
    stock: 50,
  },
  {
    id: "aftercare-balm",
    name: "Aftercare balm",
    price: 30,
    category: "organic",
    image: "photos/aftercare-balm.jpg",
    stock: 50,
  },
];

const SHIPPING_FLAT = 30;

/* ============ STATE ============ */
let cart = loadCart();
let activeFilter = "all";

/* ============ DOM REFS ============ */
const productGrid = document.getElementById("productGrid");
const filterRow = document.getElementById("filterRow");
const cartCount = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutModal = document.getElementById("checkoutModal");
const checkoutItemsEl = document.getElementById("checkoutItems");
const summarySubtotalEl = document.getElementById("summarySubtotal");
const summaryShippingEl = document.getElementById("summaryShipping");
const summaryTotalEl = document.getElementById("summaryTotal");
const checkoutForm = document.getElementById("checkoutForm");

const confirmOverlay = document.getElementById("confirmOverlay");
const confirmModal = document.getElementById("confirmModal");
const confirmName = document.getElementById("confirmName");
const confirmOrderId = document.getElementById("confirmOrderId");
const confirmTotal = document.getElementById("confirmTotal");
const confirmDelivery = document.getElementById("confirmDelivery");

/* ============ CART STORAGE ============ */
function loadCart() {
  try {
    const raw = localStorage.getItem("henna_cart");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveCart() {
  localStorage.setItem("henna_cart", JSON.stringify(cart));
}

/* ============ RENDER PRODUCTS ============ */
function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = "";
  const list = PRODUCTS.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  list.forEach((product) => {
    const outOfStock = product.stock <= 0;
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">
        ${outOfStock ? '<span class="stock-badge out">Out of stock</span>' : product.stock <= 5 ? `<span class="stock-badge">Only ${product.stock} left</span>` : ""}
        ${product.image.match(/\.(jpg|jpeg|png|webp)$/i) ? `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">` : `Image: ${product.image}`}
      </div>
      <div class="product-body">
        <div class="product-name">${product.name}</div>
        <div class="product-price">₹${product.price.toFixed(2)}</div>
        <div class="qty-row">
          <button class="btn-add" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
            ${outOfStock ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // add to cart
  productGrid.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const qty = 1;
      addToCart(id, qty);

      const original = btn.textContent;
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("added");
      }, 1200);
    });
  });

  // Apply border glow to newly created product cards
  if (typeof window.initBorderGlow === 'function') {
    window.initBorderGlow('.product-card');
  }
}

if (filterRow) {
  filterRow.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;
    filterRow.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    activeFilter = pill.dataset.filter;
    renderProducts();
  });
}

/* ============ CART LOGIC ============ */
function addToCart(productId, qty) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: Math.min(qty, product.stock) });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function updateQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  const product = PRODUCTS.find((p) => p.id === productId);
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  } else if (product) {
    item.qty = Math.min(item.qty, product.stock);
  }
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  saveCart();
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartTotalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ============ RENDER CART ============ */
function renderCart() {
  if (cartCount) cartCount.textContent = cartTotalItems();

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <button id="emptyShopBtn">Shop Now</button>
      </div>
    `;
    cartFooter.style.display = "none";
    document.getElementById("emptyShopBtn")?.addEventListener("click", closeCart);
    return;
  }

  cartFooter.style.display = "flex";
  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.image.match(/\.(jpg|jpeg|png|webp)$/i) ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">` : item.image}
      </div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="stepper-btn" data-action="dec" data-id="${item.id}">−</button>
          <span class="stepper-val">${item.qty}</span>
          <button class="stepper-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="remove-btn" data-id="${item.id}">Remove</button>
    </div>
  `
    )
    .join("");

  if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${cartSubtotal().toFixed(2)}`;

  cartItemsEl.querySelectorAll(".stepper-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      updateQty(id, btn.dataset.action === "inc" ? 1 : -1);
    });
  });
  cartItemsEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
}

/* ============ CART DRAWER OPEN/CLOSE ============ */
function openCart() {
  renderCart();
  if (cartDrawer) cartDrawer.classList.add("open");
  if (overlay) overlay.classList.add("visible");
}
function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove("open");
  if (overlay) overlay.classList.remove("visible");
}
const cartTrigger = document.getElementById("cartTrigger");
if (cartTrigger) cartTrigger.addEventListener("click", openCart);
const closeCartBtn = document.getElementById("closeCart");
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
const continueShoppingBtn = document.getElementById("continueShopping");
if (continueShoppingBtn) continueShoppingBtn.addEventListener("click", closeCart);
if (overlay) overlay.addEventListener("click", closeCart);

/* ============ TOAST ============ */
let toastTimer;
function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ============ CHECKOUT ============ */
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();

  if (checkoutItemsEl) {
    checkoutItemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="summary-item">
        <span>${item.name} × ${item.qty}</span>
        <span>₹${(item.price * item.qty).toFixed(2)}</span>
      </div>
    `
      )
      .join("");
  }

  const subtotal = cartSubtotal();
  const total = subtotal + SHIPPING_FLAT;
  if (summarySubtotalEl) summarySubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (summaryShippingEl) summaryShippingEl.textContent = `₹${SHIPPING_FLAT.toFixed(2)}`;
  if (summaryTotalEl) summaryTotalEl.textContent = `₹${total.toFixed(2)}`;

  if (checkoutModal) checkoutModal.classList.add("open");
  if (checkoutOverlay) checkoutOverlay.classList.add("visible");
}
function closeCheckout() {
  if (checkoutModal) checkoutModal.classList.remove("open");
  if (checkoutOverlay) checkoutOverlay.classList.remove("visible");
}
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckout);
const closeCheckoutBtn = document.getElementById("closeCheckout");
if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckout);
if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeCheckout);

/* ============ PLACE ORDER ============ */
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Placing Order...";
    submitBtn.disabled = true;

    try {
      const formData = new FormData(checkoutForm);
      const customer = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        city: formData.get("city"),
        pin: formData.get("pin")
      };
      const paymentMethod = formData.get("payment");
      
      if (paymentMethod === "upi" && !checkoutForm.dataset.upiConfirmed) {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        const total = cartSubtotal() + SHIPPING_FLAT;
        const upiId = "samihasam559@okhdfcbank";
        const name = "pwrettiehenna";
        const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${total.toFixed(2)}&cu=INR`;
        
        const upiOverlay = document.getElementById("upiOverlay");
        const upiModal = document.getElementById("upiModal");
        if (upiOverlay && upiModal) {
          document.getElementById("upiAmountText").textContent = total.toFixed(2);
          document.getElementById("upiQrCode").src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
          document.getElementById("upiAppBtn").href = upiLink;
          
          closeCheckout();
          upiModal.classList.add("open");
          upiOverlay.classList.add("visible");
          
          return;
        }
      }
      
      checkoutForm.dataset.upiConfirmed = "";
      
      const totalAmount = cartSubtotal() + SHIPPING_FLAT;
      const orderId = "HN" + Math.floor(100000 + Math.random() * 900000);
      
      const payload = {
        orderId: orderId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: `${customer.address}, ${customer.city} - ${customer.pin}`,
        paymentMethod: paymentMethod,
        orderTotal: `₹${totalAmount.toFixed(2)}`,
        items: cart.map(item => `${item.name} (x${item.qty})`).join(', ')
      };

      const response = await fetch('https://formspree.io/f/mzebzzzj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      const deliveryStr = deliveryDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

      if (confirmName) confirmName.textContent = `, ${customer.name}`;
      if (confirmOrderId) confirmOrderId.textContent = orderId;
      if (confirmTotal) confirmTotal.textContent = `₹${totalAmount.toFixed(2)}`;
      if (confirmDelivery) confirmDelivery.textContent = deliveryStr;

      closeCheckout();
      if (confirmModal) confirmModal.classList.add("open");
      if (confirmOverlay) confirmOverlay.classList.add("visible");

      cart = [];
      saveCart();
      renderCart();
      updateCartBadge();
    } catch (err) {
      console.error(err);
      showToast("Unable to place your order. Please try again.");
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

const confirmUpiPaymentBtn = document.getElementById("confirmUpiPayment");
if (confirmUpiPaymentBtn) {
  confirmUpiPaymentBtn.addEventListener("click", () => {
    document.getElementById("upiModal").classList.remove("open");
    document.getElementById("upiOverlay").classList.remove("visible");
    
    checkoutForm.dataset.upiConfirmed = "true";
    checkoutForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });
}

const closeUpiBtn = document.getElementById("closeUpi");
if (closeUpiBtn) {
  closeUpiBtn.addEventListener("click", () => {
    document.getElementById("upiModal").classList.remove("open");
    document.getElementById("upiOverlay").classList.remove("visible");
  });
}

const confirmCloseBtn = document.getElementById("confirmClose");
if (confirmCloseBtn) confirmCloseBtn.addEventListener("click", closeConfirm);
if (confirmOverlay) confirmOverlay.addEventListener("click", closeConfirm);
function closeConfirm() {
  if (confirmModal) confirmModal.classList.remove("open");
  if (confirmOverlay) confirmOverlay.classList.remove("visible");
}

/* ============ INIT ============ */
renderProducts();
renderCart();

// Check for payment success redirect
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('payment') === 'success') {
  const oId = urlParams.get('orderId');
  if (confirmOrderId) confirmOrderId.textContent = oId;
  if (confirmName) confirmName.textContent = ""; // We might not have the name in memory anymore
  if (confirmTotal) confirmTotal.textContent = ""; // Or fetch from a status endpoint if needed
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  if (confirmDelivery) confirmDelivery.textContent = deliveryDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  
  if (confirmModal) confirmModal.classList.add("open");
  if (confirmOverlay) confirmOverlay.classList.add("visible");
  
  cart = [];
  saveCart();
  renderCart();
  
  window.history.replaceState({}, document.title, window.location.pathname);
}

// ==========================================
// FAQ Accordion Logic
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      // Close other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
        }
      });
      // Toggle current item
      item.classList.toggle("active");
    });
  });
});
