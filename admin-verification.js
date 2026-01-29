// Admin verification system
let html5QrCode = null;
let scannerActive = false;

// Toggle QR Scanner
window.toggleScanner = function() {
  const qrReader = document.getElementById('qr-reader');
  const btnText = document.getElementById('scanner-btn-text');
  
  if (!scannerActive) {
    qrReader.style.display = 'block';
    btnText.textContent = 'Stop Scanner';
    startScanner();
    scannerActive = true;
  } else {
    stopScanner();
    qrReader.style.display = 'none';
    btnText.textContent = 'Start Scanner';
    scannerActive = false;
  }
}

function startScanner() {
  html5QrCode = new Html5Qrcode("qr-reader");
  
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      console.log(`QR Code detected: ${decodedText}`);
      verifyPurchase(decodedText);
      stopScanner();
      document.getElementById('qr-reader').style.display = 'none';
      document.getElementById('scanner-btn-text').textContent = 'Start Scanner';
      scannerActive = false;
    },
    (errorMessage) => {
      // Ignore scanning errors
    }
  ).catch((err) => {
    console.error("Unable to start scanner:", err);
    notify.error("Camera access denied or not available. Please use manual ID entry.");
    scannerActive = false;
    document.getElementById('qr-reader').style.display = 'none';
    document.getElementById('scanner-btn-text').textContent = 'Start Scanner';
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    }).catch((err) => {
      console.error("Error stopping scanner:", err);
    });
  }
}

// Verify by manual ID entry
window.verifyPurchaseId = function() {
  const purchaseId = document.getElementById('purchase-id-input').value.trim();
  
  if (!purchaseId) {
    notify.warning("Please enter a purchase ID");
    return;
  }
  
  verifyPurchase(purchaseId);
}

// Main verification function
function verifyPurchase(purchaseId) {
  const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
  const purchase = purchases.find(p => p.id === purchaseId);
  
  const resultDiv = document.getElementById('verification-result');
  
  if (!purchase) {
    resultDiv.style.display = 'block';
    resultDiv.className = 'verification-result error';
    resultDiv.innerHTML = `
      <div class="result-header error-header">
        <h3>❌ Invalid Purchase ID</h3>
      </div>
      <p>No purchase found with ID: <strong>${purchaseId}</strong></p>
      <p class="help-text">Please check the ID and try again.</p>
    `;
    return;
  }
  
  if (purchase.verified) {
    resultDiv.style.display = 'block';
    resultDiv.className = 'verification-result warning';
    resultDiv.innerHTML = `
      <div class="result-header warning-header">
        <h3>⚠️ Already Verified</h3>
      </div>
      <p>This purchase was already verified on:</p>
      <p class="verified-date">${new Date(purchase.verifiedDate).toLocaleString()}</p>
      <div class="purchase-details">
        <p><strong>Purchase ID:</strong> ${purchase.id}</p>
        <p><strong>Total:</strong> ₦${purchase.total.toFixed(2)}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${purchase.items.map(item => `<li>${item.quantity}x ${item.name} @ ₦${item.price}</li>`).join('')}
        </ul>
      </div>
    `;
    return;
  }
  
  // Mark as verified
  purchase.verified = true;
  purchase.verifiedDate = new Date().toISOString();
  localStorage.setItem('purchases', JSON.stringify(purchases));
  
  resultDiv.style.display = 'block';
  resultDiv.className = 'verification-result success';
  resultDiv.innerHTML = `
    <div class="result-header success-header">
      <h3>✅ Purchase Verified Successfully!</h3>
    </div>
    <div class="purchase-details">
      <p><strong>Purchase ID:</strong> ${purchase.id}</p>
      <p><strong>Purchase Date:</strong> ${new Date(purchase.date).toLocaleString()}</p>
      <p><strong>Payment Reference:</strong> ${purchase.reference}</p>
      <p><strong>Total Amount:</strong> <span class="amount">₦${purchase.total.toFixed(2)}</span></p>
      
      <div class="items-purchased">
        <p><strong>Items Purchased:</strong></p>
        <ul>
          ${purchase.items.map(item => `
            <li>
              <span class="item-qty">${item.quantity}x</span>
              <span class="item-name">${item.name}</span>
              <span class="item-price">₦${item.price.toFixed(2)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <button onclick="printReceipt('${purchase.id}')" class="btn-print">Print Receipt</button>
      <button onclick="clearVerification()" class="btn-clear-result">Clear</button>
    </div>
  `;
  
  // Clear input
  document.getElementById('purchase-id-input').value = '';
  
  // Show success notification
  notify.success("Purchase verified successfully!", 3000);
}

// Clear verification result
window.clearVerification = function() {
  document.getElementById('verification-result').style.display = 'none';
}

// Print receipt
window.printReceipt = function(purchaseId) {
  const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
  const purchase = purchases.find(p => p.id === purchaseId);
  
  if (!purchase) {
    notify.error("Purchase not found");
    return;
  }
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${purchase.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .receipt-details {
          margin: 20px 0;
        }
        .receipt-details p {
          margin: 8px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th,
        .items-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        .items-table th {
          background: #f5f5f5;
        }
        .total {
          font-size: 18px;
          font-weight: bold;
          text-align: right;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #333;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <h1>ColEx</h1>
        <h2>Purchase Receipt</h2>
      </div>
      
      <div class="receipt-details">
        <p><strong>Purchase ID:</strong> ${purchase.id}</p>
        <p><strong>Date:</strong> ${new Date(purchase.date).toLocaleString()}</p>
        <p><strong>Payment Reference:</strong> ${purchase.reference}</p>
        <p><strong>Verified:</strong> ${new Date(purchase.verifiedDate).toLocaleString()}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${purchase.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₦${item.price.toFixed(2)}</td>
              <td>₦${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        Total: ₦${purchase.total.toFixed(2)}
      </div>
      
      <div class="footer">
        <p>Thank you for your purchase!</p>
        <p>ColEx - Your trusted marketplace</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
