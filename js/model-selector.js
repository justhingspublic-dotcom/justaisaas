// Model Selector Dropdown
document.addEventListener('DOMContentLoaded', function() {
  const modelSelector = document.getElementById('modelSelector');
  const modelDropdown = document.getElementById('modelDropdown');
  const currentModelLogo = document.getElementById('currentModelLogo');
  const currentModelName = document.getElementById('currentModelName');
  const modelOptions = document.querySelectorAll('.model-option');

  // Prevent scroll propagation
  modelDropdown.addEventListener('wheel', function(e) {
    e.stopPropagation();
    const scrollTop = this.scrollTop;
    const scrollHeight = this.scrollHeight;
    const height = this.clientHeight;
    const delta = e.deltaY;
    
    // Prevent scroll chaining
    if ((delta < 0 && scrollTop <= 0) || (delta > 0 && scrollTop + height >= scrollHeight)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Toggle dropdown
  modelSelector.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = modelSelector.classList.toggle('active');
    
    if (isActive) {
      modelDropdown.style.display = 'block';
      // Trigger reflow to enable animation
      modelDropdown.offsetHeight;
      modelDropdown.classList.add('show');
    } else {
      modelDropdown.classList.remove('show');
      setTimeout(() => {
        modelDropdown.style.display = 'none';
      }, 300); // Match transition duration
    }
  });

  // Select model
  modelOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      const logo = this.getAttribute('data-logo');
      const name = this.getAttribute('data-name');
      
      currentModelLogo.src = logo;
      currentModelName.textContent = name;
      
      modelSelector.classList.remove('active');
      modelDropdown.classList.remove('show');
      setTimeout(() => {
        modelDropdown.style.display = 'none';
      }, 300);
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function() {
    modelSelector.classList.remove('active');
    modelDropdown.classList.remove('show');
    setTimeout(() => {
      modelDropdown.style.display = 'none';
    }, 300);
  });
});

