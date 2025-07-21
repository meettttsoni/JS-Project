// Global cart array
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    updateCartCount();
    updateWishlistCount();
    initCategorySlider();
    updateCartDisplay();
});

// Display products
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    productsToShow.forEach(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image" onclick="viewProductDetails(${product.id})">
                ${product.image}
                <div class="product-badge">${product.badge}</div>
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id}, event)">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    <span class="original-price">₹${product.originalPrice}</span>
                    <span class="discount">${product.discount}% OFF</span>
                </div>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 ? '☆' : ''}</span>
                    <span>(${product.rating})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="buy-now" onclick="buyNow(${product.id})">Buy Now</button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Filter products
function filterProducts(category) {
    currentFilter = category;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and display products
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    displayProducts(filteredProducts);
}

// View product details
function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        sessionStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product-detail.html';
    }
}

// Add to cart
function addToCart(productId) {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        sessionStorage.setItem('pendingCartItem', productId);
        toggleAuthModal();
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    updateCartDisplay();
    showNotification('Item added to cart!', 'success');
}

// Buy now
function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    sessionStorage.setItem('buyNowProduct', JSON.stringify({...product, quantity: 1}));
    window.location.href = 'checkout.html';
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Toggle cart modal
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    if (cartModal.style.display === 'block') {
        updateCartDisplay();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Your cart is empty</p>';
        document.getElementById('cartTotal').innerHTML = '';
        return;
    }

    let cartHTML = '';
    let total = 0;

    cart.forEach(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;

        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `;
    });

    cartItems.innerHTML = cartHTML;
    
    const cartTotal = document.getElementById('cartTotal');
    cartTotal.innerHTML = `
        <div class="cart-total-row">
            <span>Total:</span>
            <span>₹${total}</span>
        </div>
    `;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = (item.quantity || 1) + change;
        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Item removed from cart!', 'success');
}

// Proceed to checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Save cart data to localStorage before redirecting
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Default position if no click event
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }, 100);
}

// Category slider functionality
let currentSlide = 0;
const cardsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
const totalCards = 10;
const maxSlides = Math.ceil(totalCards / cardsPerView) - 1;

function initCategorySlider() {
    const categorySlider = document.getElementById('categorySlider');
    const categoryDots = document.getElementById('categoryDots');
    
    if (!categorySlider || !categoryDots) return;
    
    // Create dots
    categoryDots.innerHTML = '';
    for (let i = 0; i <= maxSlides; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(i);
        categoryDots.appendChild(dot);
    }
}

function slideCategories(direction) {
    const categorySlider = document.getElementById('categorySlider');
    if (!categorySlider) return;
    
    if (direction === 'next') {
        currentSlide = currentSlide >= maxSlides ? 0 : currentSlide + 1;
    } else {
        currentSlide = currentSlide <= 0 ? maxSlides : currentSlide - 1;
    }
    
    const translateX = -currentSlide * (280 + 32) * cardsPerView; // card width + gap
    categorySlider.style.transform = `translateX(${translateX}px)`;
    
    updateDots();
}

function goToSlide(slideIndex) {
    const categorySlider = document.getElementById('categorySlider');
    if (!categorySlider) return;
    
    currentSlide = slideIndex;
    const translateX = -currentSlide * (280 + 32) * cardsPerView;
    categorySlider.style.transform = `translateX(${translateX}px)`;
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Smooth scrolling for navigation
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

// Sort products
function sortProducts() {
    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect.value;
    
    let sortedProducts = [...products];
    
    switch(sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // For 'default', keep original order
            sortedProducts = [...products];
    }

    // Apply current category filter if any
    if (currentFilter !== 'all') {
        sortedProducts = sortedProducts.filter(product => product.category === currentFilter);
    }

    displayProducts(sortedProducts);
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let searchedProducts = products;

    if (searchTerm !== '') {
        searchedProducts = products.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.badge.toLowerCase().includes(searchTerm)
            );
        });
    }

    // Apply current category filter if any
    if (currentFilter !== 'all') {
        searchedProducts = searchedProducts.filter(product => product.category === currentFilter);
    }

    // Apply current sort if any
    const sortSelect = document.getElementById('sortSelect');
    const currentSort = sortSelect.value;
    if (currentSort !== 'default') {
        switch(currentSort) {
            case 'price-low':
                searchedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                searchedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                searchedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                searchedProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
    }

    displayProducts(searchedProducts);

    // Show a message if no products found
    const productGrid = document.getElementById('productGrid');
    if (searchedProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products-message" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                <h3>No products found</h3>
                <p>Try different search terms or filters</p>
            </div>
        `;
    }
}

// Wishlist functions
function toggleWishlist(productId, event) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const index = wishlist.findIndex(item => item.id === productId);
    
    if (index === -1) {
        // Add to wishlist
        wishlist.push(product);
        showNotification('Added to Wishlist!', event);
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showNotification('Removed from Wishlist!', event);
    }

    // Save to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Update UI
    updateWishlistCount();
    displayProducts(currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter));
}

function updateWishlistCount() {
    const wishlistCount = document.querySelector('.wishlist .count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// Toggle wishlist modal
function toggleWishlistModal() {
    const existingModal = document.getElementById('wishlistModal');
    if (existingModal) {
        existingModal.remove();
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'wishlistModal';
    modal.className = 'wishlist-modal';
    
    let modalContent = `
        <div class="wishlist-content">
            <div class="wishlist-header">
                <h3>My Wishlist (${wishlist.length})</h3>
                <button class="close-wishlist" onclick="toggleWishlistModal()">&times;</button>
            </div>
            <div class="wishlist-items">
    `;

    if (wishlist.length === 0) {
        modalContent += `
            <div class="empty-wishlist">
                <p>Your wishlist is empty</p>
                <button onclick="toggleWishlistModal()" class="continue-shopping">Continue Shopping</button>
            </div>
        `;
    } else {
        modalContent += wishlist.map(item => `
            <div class="wishlist-item">
                <div class="wishlist-item-image">${item.image}</div>
                <div class="wishlist-item-details">
                    <h4>${item.name}</h4>
                    <div class="wishlist-item-price">
                        <span class="current-price">₹${item.price}</span>
                        <span class="original-price">₹${item.originalPrice}</span>
                        <span class="discount">${item.discount}% OFF</span>
                    </div>
                    <div class="wishlist-item-actions">
                        <button onclick="moveToCart(${item.id})">Move to Cart</button>
                        <button class="remove-wishlist" onclick="removeFromWishlist(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    modalContent += `
            </div>
        </div>
    `;

    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            toggleWishlistModal();
        }
    });
}

// Move item from wishlist to cart
function moveToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if item already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        showNotification('This item is already in your cart!');
        return;
    }

    // Add to cart
    cart.push({...product, quantity: 1});
    updateCartCount();
    updateCartDisplay();

    // Remove from wishlist
    removeFromWishlist(productId);
    
    showNotification('Item moved to cart!');
}

// Remove item from wishlist
function removeFromWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index !== -1) {
        wishlist.splice(index, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        showNotification('Removed from Wishlist!');
        
        // Refresh the wishlist modal
        const modal = document.getElementById('wishlistModal');
        if (modal) {
            toggleWishlistModal(); // Close current modal
            toggleWishlistModal(); // Open updated modal
        }
        
        // Update product display to reflect wishlist changes
        displayProducts(currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter));
    }
}

// Add click event to wishlist icon in header
document.addEventListener('DOMContentLoaded', function() {
    const wishlistIcon = document.querySelector('.wishlist');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', toggleWishlistModal);
    }
});

// Close cart when clicking outside
window.addEventListener('click', (e) => {
    const cartModal = document.getElementById('cartModal');
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});








