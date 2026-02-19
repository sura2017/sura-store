/**
 * ABSOLUTE FINAL PROFESSIONAL FRONTEND SCRIPT
 * Features: Toast Notifications, Interactive Ratings, Smart Search, 
 * Hard Bag Reset, and Confident Green Success Page.
 */
// This is your LIVE Backend link
const API_URL = "https://sura-store.onrender.com/api";
const BASE_URL = "https://sura-store.onrender.com"; 

// ... the rest of your code stays the same

// --- 0. THE TOAST NOTIFICATION SYSTEM (No more alerts!) ---
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-times-circle';
    if(type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// --- 1. HOME PAGE: FETCH & RENDER SERIES ---
async function fetchProducts() {
    const list = document.getElementById('product-list');
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error("Server connection error");
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        if (list) {
            list.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <i class="fas fa-mug-hot fa-spin" style="font-size: 3rem; color: var(--primary);"></i>
                    <h3 style="margin-top:20px;">Waking up the store...</h3>
                    <p style="color:var(--text-muted);">Please wait 30 seconds for the server to start.</p>
                </div>`;
            setTimeout(fetchProducts, 5000); // Auto-retry
        }
    }
}

function renderProducts(products) {
    const list = document.getElementById('product-list');
    if (!list) return;

    if (products.length === 0) {
        list.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 50px;'>No items found in store.</p>";
        return;
    }

    list.innerHTML = products.map(p => {
        const fullStars = Math.floor(p.rating || 0);
        let starsHTML = "";
        for (let i = 0; i < 5; i++) {
            starsHTML += `<i class="${i < fullStars ? 'fas' : 'far'} fa-star"></i>`;
        }
        
        const prices = p.variants ? p.variants.map(v => v.price) : [0];
        const minPrice = Math.min(...prices);
        const displayBrand = p.brand || "Premium"; 

        return `
        <div class="card">
            <span class="status-badge available">${displayBrand}</span>
            <div class="img-container">
                <img src="${p.variants && p.variants[0] ? p.variants[0].image : 'https://placehold.co/400'}" alt="${p.name}" onerror="this.src='https://placehold.co/400'">
            </div>
            <div class="card-info">
                <div class="rating-stars">${starsHTML} <span>(${p.rating || 0})</span></div>
                <div class="bought-count">${p.boughtLastMonth || 0}+ bought last month</div>
                <h3>${p.name}</h3>
                <p class="price-tag">From $${minPrice}</p>
                <button class="see-options-btn" onclick="window.openCatalogModal('${p._id}')" ${!p.isAvailable ? 'disabled style="background:#94a3b8"' : ''}>
                    <i class="fas fa-layer-group"></i> ${p.isAvailable ? `See ${p.variants.length} Models` : 'Out of Stock'}
                </button>
            </div>
        </div>`;
    }).join('');
}

// --- 2. CATALOG MODAL & DYNAMIC RATING LOGIC ---
window.openCatalogModal = function(id) {
    const product = allProducts.find(p => p._id === id);
    if (!product) return;
    const modal = document.getElementById('variant-modal');
    const body = document.getElementById('modal-body');
    modal.style.display = "block";

    body.innerHTML = `
        <div class="catalog-container">
            <div class="series-header" style="text-align: left; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: var(--dark);">${product.brand || ''} - ${product.name}</h2>
                <div class="bought-count" style="margin-top:5px;">${product.boughtLastMonth || 0}+ units sold recently</div>
            </div>

            <div class="about-section" style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
                <h4 style="margin-top: 0;"><i class="fas fa-info-circle"></i> About this item</h4>
                <p style="font-size: 0.85rem; color: #475569; line-height: 1.5;">${product.about}</p>
            </div>

            <div class="rating-box" style="margin-bottom:20px; padding:15px; background:#fffbeb; border:1px solid #fef3c7; border-radius:15px; text-align:left;">
                <p style="margin:0; font-size:0.8rem; font-weight:700; color:#92400e;">Click a star to rate this brand:</p>
                <div class="interactive-stars" style="color:#fbbf24; font-size:1.8rem; cursor:pointer; margin:5px 0;">
                    <i class="far fa-star" onclick="window.submitRating('${product._id}', 1)"></i>
                    <i class="far fa-star" onclick="window.submitRating('${product._id}', 2)"></i>
                    <i class="far fa-star" onclick="window.submitRating('${product._id}', 3)"></i>
                    <i class="far fa-star" onclick="window.submitRating('${product._id}', 4)"></i>
                    <i class="far fa-star" onclick="window.submitRating('${product._id}', 5)"></i>
                </div>
                <small style="color:#b45309; font-weight:600;">Current: ${product.rating} / 5.0 (${product.numRatings || 0} reviews)</small>
            </div>

            <h4 style="text-align: left; margin-bottom: 15px;">Available Models:</h4>
            <div class="modal-catalog-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; max-height:300px; overflow-y: auto;">
                ${product.variants.map((v, index) => `
                    <div class="model-selection-card" onclick="window.selectModel('${product._id}', ${index}, this)" 
                         style="border: 2px solid #f1f5f9; border-radius: 15px; padding: 12px; cursor: pointer; text-align: center; background: white;">
                        <img src="${v.image}" style="width: 100%; height: 80px; object-fit: contain;">
                        <h5 style="margin: 5px 0;">${v.optionName}</h5>
                        <p style="font-weight: 800; color: #10b981;">$${v.price}</p>
                    </div>`).join('')}
            </div>
            <div class="catalog-footer" style="margin-top: 25px; border-top: 1px solid #eee; pt-3;">
                <button id="add-to-cart-catalog" disabled style="background:#94a3b8; color:white; width:100%; padding:12px; border-radius:12px; border:none; font-weight:700;">Select a Model Above</button>
            </div>
        </div>`;
}

window.submitRating = async function(id, value) {
    try {
        const res = await fetch(`${API_URL}/products/${id}/rate`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ starValue: value })
        });
        const result = await res.json();
        if(result.success) {
            window.showToast(`✅ Rated ${value} Stars!`, "success");
            setTimeout(() => location.reload(), 1200);
        }
    } catch (err) { window.showToast("Rating failed.", "error"); }
}

window.selectModel = function(productId, variantIndex, element) {
    const product = allProducts.find(p => p._id === productId);
    const variant = product.variants[variantIndex];
    document.querySelectorAll('.model-selection-card').forEach(el => { el.style.borderColor = "#f1f5f9"; el.style.background = "white"; });
    element.style.borderColor = "#10b981"; element.style.background = "#f0fdf4";
    const btn = document.getElementById('add-to-cart-catalog');
    btn.disabled = false; btn.style.background = "#10b981";
    btn.innerHTML = `<i class="fas fa-cart-plus"></i> Add ${variant.optionName} to Cart`;
    btn.onclick = () => {
        const brandPrefix = product.brand ? product.brand + " " : "";
        window.addToCart(productId, `${brandPrefix}${variant.optionName}`, variant.price);
        window.closeModal();
    };
}

window.closeModal = function() { document.getElementById('variant-modal').style.display = "none"; }

// --- 3. SEARCH & FILTER (Smart Search) ---
window.filterProducts = function() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const cat = document.getElementById('category').value;
    const filtered = allProducts.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchTerm);
        const brandMatch = p.brand ? p.brand.toLowerCase().includes(searchTerm) : false;
        const catMatch = p.category ? p.category.toLowerCase().includes(searchTerm) : false;
        const matchesSearch = nameMatch || brandMatch || catMatch;
        const matchesCat = (cat === "All" || p.category === cat);
        return matchesSearch && matchesCat;
    });
    renderProducts(filtered);
}

// --- 4. CART & BAG LOGIC ---
window.addToCart = function(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ id, name, price }); 
    localStorage.setItem('cart', JSON.stringify(cart));
    window.updateCartCount();
    window.showToast(`✅ Added ${name} to bag!`, "success");
}

window.updateCartCount = function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const el = document.getElementById('cart-count');
    if (el) el.innerText = cart.length;
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items');
    const box = document.getElementById('checkout-box');
    const totalEl = document.getElementById('total-price');

    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div class="card" style="padding:40px; text-align:center;"><p><i class="fas fa-shopping-basket"></i> Your bag is currently empty.</p></div>`;
        if (box) box.style.display = "none";
        return;
    }
    if (box) box.style.display = "block";
    container.innerHTML = cart.map((item, index) => `
        <div class="card" style="flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 15px; border-radius:12px;">
            <div style="text-align:left;">
                <span style="font-weight: 600; display:block;">${item.name}</span>
                <span style="font-weight: 800; color: #10b981;">$${item.price}</span>
            </div>
            <button onclick="window.removeItem(${index})" style="width: auto; background: #ef4444; color:white; border:none; padding:8px; border-radius:8px; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </div>`).join('');
    document.getElementById('total-price').innerText = cart.reduce((sum, item) => sum + item.price, 0);
}

window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart(); window.updateCartCount();
    window.showToast("Item removed.", "warning");
}

// --- 5. CHECKOUT (HARD WIPE SUCCESS SCREEN) ---
window.placeOrderWithScreenshot = async function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const fileInput = document.getElementById('payScreenshot');
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const addr = document.getElementById('custAddr').value;

    if (cart.length === 0) return window.showToast("Your bag is empty!", "warning");
    if (!name || !phone || !addr || !fileInput.files[0]) return window.showToast("Complete all fields!", "warning");

    const formData = new FormData();
    formData.append('order', JSON.stringify({ items: cart, total: cart.reduce((s, i) => s + i.price, 0), customer: { name, phone, address: addr } }));
    formData.append('screenshot', fileInput.files[0]);

    try {
        const response = await fetch(`${API_URL}/orders`, { method: 'POST', body: formData });
        const result = await response.json();
        
        if (response.ok && result.success) {
            // THE WIPE: Clear Bag immediately
            localStorage.setItem('cart', JSON.stringify([])); 
            window.updateCartCount();

            // THE GREEN SUCCESS PAGE TRANSFORMATION
            const container = document.getElementById('cart-items');
            if (container) {
                container.innerHTML = `
                    <div class="card" style="padding:60px; text-align:center; border: 3px solid #10b981; background:#f0fdf4; border-radius:32px;">
                        <i class="fas fa-check-circle" style="font-size: 5.5rem; color: #10b981; margin-bottom: 25px;"></i>
                        <h2 style="color: #065f46; font-size:1.8rem; margin-bottom: 10px;">${result.message}</h2>
                        <div style="text-align:left; background:white; padding:25px; border-radius:20px; border:1px solid #d1fae5; margin-top:20px;">
                            <h4 style="margin:0; border-bottom:1px solid #eee; padding-bottom:10px;">Delivery Confirmation</h4>
                            <p style="margin:10px 0;"><strong>Recipient:</strong> ${name}</p>
                            <p style="margin:10px 0;"><strong>Phone:</strong> ${phone}</p>
                            <p style="margin:10px 0;"><strong>Deliver To:</strong> ${addr}</p>
                        </div>
                        <p style="color: #1e293b; font-size: 0.95rem; margin-top:20px;">
                            We are verifying your payment receipt. Our team will call you shortly to confirm the delivery time.
                        </p>
                        <button onclick="window.location.href='index.html'" style="margin-top: 30px; background: #065f46; width: auto; padding: 15px 45px; border-radius:15px; border:none; color:white; font-weight:700; cursor:pointer;">
                           <i class="fas fa-home"></i> Return to Store
                        </button>
                    </div>`;
            }
            if(document.getElementById('checkout-box')) document.getElementById('checkout-box').style.display = 'none';
            if(document.getElementById('page-header')) document.getElementById('page-header').style.display = 'none';

            window.showToast("🚀 Order Success!", "success");
        }
    } catch (err) { window.showToast("Connection issue.", "error"); }
}

// --- 6. ADMIN TOOLS ---
window.adminDeleteProduct = async (id, btn) => {
    if (btn.innerText === "Confirm?") {
        const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if (res.ok) { window.showToast("✅ Deleted", "success"); setTimeout(() => location.reload(), 1000); }
    } else {
        btn.innerText = "Confirm?"; btn.style.background = "black";
        setTimeout(() => { if (btn) { btn.innerText = "Delete"; btn.style.background = "#ef4444"; } }, 3000);
    }
}

window.deleteOrder = async (id, btn) => {
    if (btn.innerText.includes("Confirm")) {
        const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
        if(res.ok) { window.showToast("Order removed.", "success"); setTimeout(() => location.reload(), 1000); }
    } else {
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Confirm?';
        btn.style.background = "#000";
        setTimeout(() => { if(btn) { btn.innerHTML = '<i class="fas fa-trash"></i> Delete Order'; btn.style.background = "#ef4444"; } }, 3000);
    }
}

window.fetchAdminData = async function() {
    try {
        const oRes = await fetch(`${API_URL}/orders`);
        const orders = await oRes.json();
        const orderContainer = document.getElementById('admin-orders');
        if (orderContainer) {
            orderContainer.innerHTML = orders.map(o => {
                // Cloudinary URL logic: no BASE_URL prefix if link starts with http
                const imgSource = o.paymentScreenshot.startsWith('http') ? o.paymentScreenshot : `${BASE_URL}/uploads/${o.paymentScreenshot}`;
                
                return `
                <div class="card" style="text-align: left; border-left: 6px solid #10b981; margin-bottom: 20px; padding: 25px;">
                    <h4 style="margin:0;"><i class="fas fa-user"></i> ${o.customer.name}</h4>
                    <p style="margin:5px 0;"><strong>Phone:</strong> ${o.customer.phone}</p>
                    <p style="background: #fffbeb; padding: 12px; border-radius: 10px; border: 1px solid #fef3c7;"><strong>Address:</strong> ${o.customer.address}</p>
                    <p><strong>Selection:</strong> ${o.items.map(i => i.name).join(', ')}</p>
                    <p style="font-size: 1.1rem; font-weight:800;">Total: $${o.total}</p>
                    <a href="${imgSource}" target="_blank" style="color:#3b82f6; font-weight:700;">View Receipt</a>
                    <button onclick="window.deleteOrder('${o._id}', this)" class="delete-btn" style="width:auto; padding:8px 15px; margin-top:10px;">Delete Order</button>
                </div>`;
            }).join('');
        }

        const pRes = await fetch(`${API_URL}/products`);
        const prods = await pRes.json();
        const prodContainer = document.getElementById('admin-product-list');
        if (prodContainer) {
            prodContainer.innerHTML = prods.map(p => `
                <div class="card" style="text-align: center; padding: 15px;">
                    <img src="${p.variants && p.variants[0] ? p.variants[0].image : ''}" style="height: 50px; object-fit: contain;">
                    <h4 style="font-size:0.85rem; margin:0;">${p.brand || ''} ${p.name}</h4>
                    <p style="font-size:0.75rem; color:#10b981; font-weight:700; margin:5px 0;">${p.boughtLastMonth} Sold</p>
                    <div style="display: flex; gap: 5px; justify-content: center; margin-top:10px;">
                        <button onclick="window.toggleAvailability('${p._id}')" style="background: orange; font-size: 0.6rem; padding: 6px; border:none; color:white; border-radius:5px; cursor:pointer;">Stock</button>
                        <button onclick="window.adminDeleteProduct('${p._id}', this)" style="background: #ef4444; font-size: 0.6rem; padding: 6px; border:none; color:white; border-radius:5px; cursor:pointer;">Delete</button>
                    </div>
                </div>`).join('');
        }
    } catch (err) { console.error(err); }
}

window.toggleAvailability = async (id) => {
    await fetch(`${API_URL}/products/${id}/status`, { method: 'PUT' });
    location.reload();
}

window.onload = () => {
    window.updateCartCount();
    if (document.getElementById('product-list')) fetchProducts();
    if (document.getElementById('cart-items')) displayCart();
    if (document.getElementById('admin-orders')) window.fetchAdminData();
};