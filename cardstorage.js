import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAiUCMpCNYkOQZ7zLxFjkpHTh-Nk3QN3gw",
    authDomain: "cloexlogin-d466a.firebaseapp.com",
    projectId: "cloexlogin-d466a",
    storageBucket: "cloexlogin-d466a.firebasestorage.app",
    messagingSenderId: "87844737437",
    appId: "1:87844737437:web:11f79d9b262d042d915f74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// In-memory storage (replaces localStorage for Claude.ai compatibility)
let products = JSON.parse(localStorage.getItem('myProducts')) ||  [
  { name: "Sample Watch", stock: 20, price: 150, img: "https://via.placeholder.com/300x200" }
];

// Auth state observer
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    cartKey = `cart_${user.uid}`;
    console.log("User logged in:", user.email);
  } else {
    cartKey = "guestCart";
    console.log("User logged out");
  }
});

// Render functions
function renderCardsAdmin() {
  const container = document.getElementById('product-container-admin');
  if (!container) return;

  container.innerHTML = products.map((p, index) => `
    <div class="card">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>₦${p.price}</p>
      <p>Stock: <strong>${p.stock}</strong></p>
      <button class="btn-edit" onclick="editProduct(${index})">Edit</button>
      <button class="btn-delete" onclick="deleteProduct(${index})">Delete</button>
    </div>
  `).join('');
}

function renderCardsCustomer() {
  const container = document.getElementById('product-container-customer');
  if (!container) return;

  container.innerHTML = products.map((p, index) => `
    <div class="card">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>₦${p.price}</p>
      <p class="stock-label">${p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}</p>
      
      <div class="qty-selector">
        <button onclick="changeQty(${index}, -1)">-</button>
        <input type="number" id="qty-${index}" value="${p.stock > 0 ? 1 : 0}" max="${p.stock}" readonly>
        <button onclick="changeQty(${index}, 1)">+</button>
      </div>

      <button class="btn-buy" 
              onclick="addToCart(${index})" 
              ${p.stock <= 0 ? 'disabled' : ''}>
        ${p.stock > 0 ? 'Add to Cart' : 'Sold Out'}
      </button>
    </div>
  `).join('');
}

function renderCardsHome() {
  const container = document.getElementById('product-container-home');
  if (!container) return;

  container.innerHTML = products.map((p, index) => `
    <div class="card">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>₦${p.price}</p>
      <p class="stock-label">${p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}</p>
      <button class="btn-buy" onclick="redirectToLoginPage()">Add To Cart</button>
    </div>
  `).join('');
}

// Product management
window.saveProduct = function() {
  const name = document.getElementById('p-name').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const stock = parseInt(document.getElementById('p-stock').value);
  const img = document.getElementById('p-img').value.trim();
  const editIndex = document.getElementById('edit-index').value;

  if (!name || !price || isNaN(stock) || stock < 0) {
    notify.error("Please fill in all fields correctly. Stock must be a non-negative number.");
    return;
  }

  const productData = { name, price, stock, img: img || "https://via.placeholder.com/300x200" };

  if (editIndex === "") {
    products.push(productData);
    notify.success("Product added successfully!");
  } else {
    products[editIndex] = productData;
    document.getElementById('edit-index').value = "";
    notify.success("Product updated successfully!");
  }

  renderAll();
  clearInputs();
  localStorage.setItem('myProducts', JSON.stringify(products));
  document.getElementById('save-btn').innerText = "Save Product";
}

window.deleteProduct = function(index) {
  const product = products[index];
  notify.confirm(`Delete "${product.name}"?`, () => {
    products.splice(index, 1);
    renderAll();
    localStorage.setItem('myProducts', JSON.stringify(products));
    notify.success("Product deleted successfully!");
  });
}

window.editProduct = function(index) {
  const p = products[index];
  
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-img').value = p.img;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('edit-index').value = index;
  document.getElementById('save-btn').innerText = "Update Product";
}

function clearInputs() {
  const fields = ['p-name', 'p-price', 'p-img', 'p-stock', 'edit-index'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

window.changeQty = function(index, delta) {
  const input = document.getElementById(`qty-${index}`);
  const product = products[index];
  let currentVal = parseInt(input.value) || 1;
  let newVal = currentVal + delta;

  if (newVal >= 1 && newVal <= product.stock) {
    input.value = newVal;
  } else if (newVal > product.stock) {
    notify.warning(`Only ${product.stock} items available in stock.`);
  }
}

// Logout functionality
window.handleLogout = function() {
  signOut(auth).then(() => {
    window.location.href = 'home.html';
  }).catch((error) => {
    console.error("Logout error:", error);
    notify.error("Error logging out. Please try again.");
  });
}

// Redirect functions
window.redirectToLoginPage = function() {
  window.location.href = 'login.html'; // Update with your actual login page
}

window.redirectToAdminPage = function() {
  window.location.href = 'adminlogin.html';
}

// Helper function to render all views
function renderAll() {
  renderCardsAdmin();
  renderCardsCustomer();
  renderCardsHome();
}

// Initialize on page load
function init() {
  renderAll();
  
  // Setup logout buttons
  const logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}