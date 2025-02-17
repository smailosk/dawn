document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener(
    'touchmove',
    function (e) {
      if (e.target.closest('.product-slider__track')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
  const sliders = document.querySelectorAll('.product-slider');

  sliders.forEach(initializeSlider);

  function initializeSlider(slider) {
    const container = slider.querySelector('.product-slider__container');
    const track = slider.querySelector('.product-slider__track');
    const prevButton = slider.querySelector('.slider-prev');
    const nextButton = slider.querySelector('.slider-next');
    const cards = track.querySelectorAll('.product-card');

    if (!cards.length) return;

    let currentIndex = 0;
    let startX;
    let scrollLeft;
    let isDragging = false;

    const cardWidth = cards[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 24;
    const slideWidth = cardWidth + gap;

    function updateSliderPosition(index, smooth = true) {
      currentIndex = index;
      const translateX = -currentIndex * slideWidth;
      track.style.transition = smooth ? 'transform 0.5s ease' : 'none';
      track.style.transform = `translateX(${translateX}px)`;

      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex >= cards.length - getVisibleCards();
    }

    function getVisibleCards() {
      return Math.floor(container.offsetWidth / slideWidth);
    }

    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        updateSliderPosition(currentIndex - 1);
      }
    });

    nextButton.addEventListener('click', () => {
      if (currentIndex < cards.length - getVisibleCards()) {
        updateSliderPosition(currentIndex + 1);
      }
    });

    function startDragging(e) {
      isDragging = true;
      startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
      scrollLeft = track.scrollLeft;
      track.style.transition = 'none';
    }

    function stopDragging() {
      isDragging = false;
      track.style.transition = 'transform 0.5s ease';

      const movement = track.scrollLeft - scrollLeft;
      const slideThreshold = slideWidth / 4;
      if (Math.abs(movement) > slideThreshold) {
        const direction = movement > 0 ? 1 : -1;
        updateSliderPosition(Math.max(0, Math.min(currentIndex + direction, cards.length - getVisibleCards())));
      } else {
        updateSliderPosition(currentIndex);
      }
    }

    function doDrag(e) {
      if (!isDragging) return;

      const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
      const diff = x - startX;
      const newTranslateX = -currentIndex * slideWidth + diff;

      if (newTranslateX > 0 || newTranslateX < -(cards.length - getVisibleCards()) * slideWidth) {
        const resistance = 0.25;
        track.style.transform = `translateX(${newTranslateX * resistance}px)`;
      } else {
        track.style.transform = `translateX(${newTranslateX}px)`;
      }
    }

    track.addEventListener('mousedown', startDragging);
    track.addEventListener('touchstart', startDragging);

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('touchmove', doDrag);

    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);

    function cleanup() {
      track.removeEventListener('mousedown', startDragging);
      track.removeEventListener('touchstart', startDragging);
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('touchmove', doDrag);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    }

    if (Shopify.designMode) {
      document.addEventListener('shopify:section:unload', cleanup);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const maxIndex = Math.max(0, cards.length - getVisibleCards());
        currentIndex = Math.min(currentIndex, maxIndex);
        updateSliderPosition(currentIndex, false);
      }, 250);
    });

    updateSliderPosition(0, false);
  }
});
