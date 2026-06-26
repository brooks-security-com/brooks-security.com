/**
 * grc-tools client auth helper
 * Loaded on /grc-tools/* pages. Handles logout and auth state display.
 */
(function() {
  // Check if we're authenticated by reading the grc_session cookie
  // (HttpOnly — we can't read its value, but we can check if it exists
  // by looking at whether the page rendered, since Lambda@Edge blocks
  // unauthenticated access).
  //
  // If this JS is running, we're behind the auth gate.
  
  function createAuthBanner() {
    var banner = document.createElement('div');
    banner.className = 'grc-auth-banner';
    banner.style.cssText = [
      'background: var(--gray-100, #f8f9fa)',
      'border: 1px solid var(--gray-200, #e9ecef)',
      'border-radius: 8px',
      'padding: 0.5rem 0.75rem',
      'margin-bottom: 1.5rem',
      'display: flex',
      'align-items: center',
      'justify-content: space-between',
      'font-size: 0.82rem',
      'color: var(--gray-500, #57606a)',
    ].join(';');

    var status = document.createElement('span');
    status.textContent = '🔒 Authenticated';
    banner.appendChild(status);

    var logout = document.createElement('a');
    logout.href = 'https://auth-brooks-security.auth.us-east-1.amazoncognito.com/logout?' + [
      'client_id=CLIENT_ID_PLACEHOLDER',
      'logout_uri=' + encodeURIComponent('https://brooks-security.com/')
    ].join('&');
    logout.textContent = 'Log out';
    logout.style.cssText = [
      'color: var(--color-link, #0a66c2)',
      'text-decoration: none',
      'font-weight: 500',
    ].join(';');
    logout.addEventListener('click', function(e) {
      e.preventDefault();
      // Clear session cookie and redirect
      document.cookie = 'grc_session=; Path=/grc-tools; Max-Age=0; Secure; SameSite=Lax';
      window.location.href = logout.href;
    });
    banner.appendChild(logout);

    // Insert at the top of the book-page
    var page = document.querySelector('.book-page');
    if (page) {
      page.insertBefore(banner, page.firstChild);
    }
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAuthBanner);
  } else {
    createAuthBanner();
  }
})();
