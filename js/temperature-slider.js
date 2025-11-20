// Temperature Slider
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('temperatureSlider');
  const temperatureValue = document.getElementById('temperatureValue');
  const sliderFill = document.getElementById('sliderFill');
  const sliderThumb = document.getElementById('sliderThumb');
  const sliderContainer = document.querySelector('.slider-container');

  function updateSlider() {
    const value = parseFloat(slider.value);
    const percentage = (value / 1) * 100;
    
    // Update display value
    temperatureValue.textContent = value.toFixed(1);
    
    // Update fill width
    sliderFill.style.width = percentage + '%';
    
    // Update thumb position
    sliderThumb.style.left = 'calc(' + percentage + '% - 9px)';
  }

  // Initialize slider position
  updateSlider();

  // Update on input
  slider.addEventListener('input', updateSlider);
  
  // Add active class when dragging
  slider.addEventListener('mousedown', function() {
    sliderContainer.classList.add('slider-active');
  });
  
  slider.addEventListener('mouseup', function() {
    sliderContainer.classList.remove('slider-active');
  });
});

