// Forgot Password Logic - Show existing password

document.addEventListener('DOMContentLoaded', function() {
  const forgotForm = document.getElementById('forgotPasswordForm');
  
  if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('forgotEmail').value.trim();
      
      if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
      }
      
      // Get users from storage
      let utilizatori = [];
      try {
        const dateStocate = localStorage.getItem('watchly.users');
        utilizatori = dateStocate ? JSON.parse(dateStocate) : [];
      } catch (err) {
        utilizatori = [];
      }
      
      // Find user with this email
      const user = utilizatori.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        showMessage('No account found with this email address', 'error');
        return;
      }
      
      // Show existing password
      showMessage(
        'Account found! Your password is: ' + user.password + 
        '\nYou can change it in your Account settings.',
        'success'
      );
      
      // Redirect to login after 3 seconds
      setTimeout(function() {
        window.location.href = '../html/login.html';
      }, 3000);
    });
  }
  
  function showMessage(text, type) {
    let msgBox = document.querySelector('.forgot-message');
    
    if (!msgBox) {
      msgBox = document.createElement('div');
      msgBox.className = 'forgot-message';
      const form = document.getElementById('forgotPasswordForm');
      form.parentElement.insertBefore(msgBox, form);
    }
    
    msgBox.textContent = text;
    msgBox.className = 'forgot-message ' + (type === 'success' ? 'success' : 'error');
    msgBox.style.display = 'block';
  }
});
