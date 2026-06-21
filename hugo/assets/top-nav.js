(function(){
  document.addEventListener('click', function(e){
    var trigger = e.target.closest('.top-nav__trigger');
    if (!trigger) {
      // Close all dropdowns when clicking outside
      document.querySelectorAll('.top-nav__dropdown.open').forEach(function(d){
        d.classList.remove('open');
        d.querySelector('.top-nav__trigger').setAttribute('aria-expanded', 'false');
      });
      return;
    }
    e.preventDefault();
    var dropdown = trigger.closest('.top-nav__dropdown');
    var isOpen = dropdown.classList.contains('open');
    // Close all others first
    document.querySelectorAll('.top-nav__dropdown.open').forEach(function(d){
      d.classList.remove('open');
      d.querySelector('.top-nav__trigger').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
})();
