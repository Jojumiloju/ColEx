// Login menu toggle for home page
function toggleMenu() {
  const loginBox = document.getElementById('loginBox');
  if (loginBox) {
    if (loginBox.style.display === 'none' || loginBox.style.display === '') {
      loginBox.style.display = 'block';
    } else {
      loginBox.style.display = 'none';
    }
  }
}

// Redirect to admin login page
window.redirectToAdminPage = function() {
  window.location.href = 'adminlogin.html';
}

// Redirect to customer login page
window.redirectToLoginPage = function() {
  // Update this to your actual customer login page
  window.location.href = 'login.html';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const loginBox = document.getElementById('loginBox');
  const loginButton = document.querySelector('.login-button');
  
  if (loginBox && loginButton) {
    if (!loginBox.contains(event.target) && !loginButton.contains(event.target)) {
      loginBox.style.display = 'none';
    }
  }
});