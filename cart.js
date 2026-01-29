// Cart management system
let cart = [];

// Initialize cart from session storage (temporary alternative)
function initCart() {
  // Cart is kept in memory for this session
  updateCartDisplay();
}
let products = JSON.parse(localStorage.getItem('myProducts')) ||  [
  { name: "Sample Watch", stock: 20, price: 150, img: "https://via.placeholder.com/300x200" }
];

window.addToCart = function(productIndex) {
  // Get products from the global scope (defined in cardstorage.js)
  if (typeof products === 'undefined') {
    notify.error("Products not loaded yet. Please refresh the page.");
    return;
  }

  const product = products[productIndex];
  const qtyInput = document.getElementById(`qty-${productIndex}`);
  const quantity = parseInt(qtyInput?.value || 1);

  if (quantity > product.stock) {
    notify.warning(`Only ${product.stock} items available.`);
    return;
  }

  // Check if product already in cart
  const existingItem = cart.find(item => item.name === product.name);
  
  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      notify.warning(`Cannot add more. Only ${product.stock} items available.`);
      return;
    }
    existingItem.quantity = newQty;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      quantity: quantity,
      img: product.img,
      productIndex: productIndex
    });
  }

  updateCartDisplay();
  notify.success(`${quantity} x ${product.name} added to cart!`);
}

window.removeFromCart = function(cartIndex) {
  cart.splice(cartIndex, 1);
  updateCartDisplay();
}

window.toggleCart = function() {
  const cartPopup = document.getElementById('cart-popup');
  if (cartPopup) {
    cartPopup.classList.toggle('active');
  }
}

window.clearCart = function() {
  notify.confirm("Clear all items from cart?", () => {
    cart = [];
    updateCartDisplay();
    notify.success("Cart cleared successfully!");
  });
}

// Generate unique purchase ID
function generatePurchaseId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `PUR-${timestamp}-${random}`;
}

// Save purchase to localStorage
function savePurchase(purchaseData) {
  let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
  purchases.push(purchaseData);
  localStorage.setItem('purchases', JSON.stringify(purchases));
}

// Show QR Code Modal
function showQRCodeModal(purchaseId, items, total) {
  const modal = document.createElement('div');
  modal.className = 'qr-modal';
  modal.id = 'qr-modal';
  
  const itemsList = items.map(item => 
    `${item.quantity}x ${item.name} @ ₦${item.price}`
  ).join('<br>');
  
  modal.innerHTML = `
    <div class="qr-modal-content">
      <div class="qr-header">
        <h2>✓ Purchase Successful!</h2>
        <button onclick="closeQRModal()" class="close-modal">×</button>
      </div>
      <div class="qr-body">
        <div class="purchase-info">
          <p><strong>Purchase ID:</strong></p>
          <p class="purchase-id">${purchaseId}</p>
          <p class="items-list">${itemsList}</p>
          <p class="total-amount"><strong>Total:</strong> ₦${total.toFixed(2)}</p>
        </div>
        <div class="qr-code-container">
          <div id="qrcode"></div>
          <p class="qr-instruction">Show this QR code or ID to admin for verification</p>
        </div>
        <div class="modal-actions">
          <button onclick="downloadQR('${purchaseId}')" class="btn-download">Download QR</button>
          <button onclick="closeQRModal()" class="btn-done">Done</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Generate QR Code using QRCode.js library
  new QRCode(document.getElementById("qrcode"), {
    text: purchaseId,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  
  setTimeout(() => modal.classList.add('active'), 10);
}

window.closeQRModal = function() {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

window.downloadQR = function(purchaseId) {
  const canvas = document.querySelector('#qrcode canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = `purchase-${purchaseId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
}

window.proceedToPayment = function() {
  if (cart.length === 0) {
    notify.warning("Your cart is empty!");
    return;
  }

  const total = calculateTotal();
  const purchaseId = generatePurchaseId();
  
  // Paystack integration
  const handler = PaystackPop.setup({
    key: 'pk_test_d2c21aba4dc227c848ffca6dd5f44c50e75526b3', // Replace with your Paystack public key
    email: 'customer@email.com', // You can get this from user authentication
    amount: total * 100, // Amount in kobo (multiply by 100)
    currency: 'NGN',
    ref: purchaseId,
    metadata: {
      custom_fields: [
        {
          display_name: "Purchase ID",
          variable_name: "purchase_id",
          value: purchaseId
        }
      ]
    },
    callback: function(response) {
      // Payment successful
      console.log('Payment successful. Reference: ' + response.reference);
      
      // Deduct stock
      cart.forEach(item => {
        const product = products[item.productIndex];
        product.stock -= item.quantity;
      });
      
      // Save products to localStorage
      localStorage.setItem('myProducts', JSON.stringify(products));
      
      // Save purchase details
      const purchaseData = {
        id: purchaseId,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: total,
        date: new Date().toISOString(),
        reference: response.reference,
        verified: false
      };
      
      savePurchase(purchaseData);
      
      // Update display
      if (typeof renderCardsCustomer === 'function') {
        renderCardsCustomer();
      }
      
      // Show QR code modal
      showQRCodeModal(purchaseId, cart, total);
      
      // Clear cart
      cart = [];
      updateCartDisplay();
      toggleCart();
    },
    onClose: function() {
      notify.info('Payment window closed.');
    }
  });
  
  handler.openIframe();
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }

  let grandTotal = 0;

  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<p style="text-align:center; padding: 20px;">Your cart is empty.</p>';
      if (cartTotal) {
        cartTotal.innerText = "₦0.00";
      }
      return;
    } else {
      cartItems.innerHTML = cart.map((item, index) => {
        // Convert price to number for calculation
        const priceNum = parseFloat(item.price);
        const subtotal = priceNum * item.quantity;
        grandTotal += subtotal;
        
        return `
        <div class="cart-item">
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <p>${item.quantity} x ₦${priceNum.toFixed(2)}</p>
          </div>
          <div class="cart-item-price">
            <span>₦${subtotal.toFixed(2)}</span>
            <button class="btn-remove-small" onclick="removeFromCart(${index})">×</button>
          </div>
        </div>
        `;
      }).join('');
    }
  }

  if (cartTotal) {
    cartTotal.innerText = `₦${grandTotal.toFixed(2)}`;
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize cart on page load
initCart();
