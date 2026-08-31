// This file contains JavaScript code for the e-commerce functionalities, including the shopping cart logic, product detail modal, and toast notifications for adding items to the cart.

document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>${item.name}</div>
                <div>₹${item.price} x <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button> ${item.quantity} <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button></div>
                <div>₹${item.price * item.quantity}</div>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        cartTotalValue.textContent = `₹${total}`;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.id;
            const productName = button.dataset.name;
            const productPrice = parseFloat(button.dataset.price);
            const existingProduct = cart.find(item => item.id === productId);

            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            showToast(`${productName} added to cart!`);
            cartDrawer.classList.add('open');
        });
    });

    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const productId = button.dataset.id;
            const existingProduct = cart.find(item => item.id === productId);

            if (action === 'increase') {
                existingProduct.quantity++;
            } else if (action === 'decrease' && existingProduct.quantity > 1) {
                existingProduct.quantity--;
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        });
    });

    updateCartDisplay();
});