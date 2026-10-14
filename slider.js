/**
 * Image Slider Library
 * Vanilla JavaScript component with dynamic dots and infinite directional wrapping.
 */
(() => {
  'use strict';

  class ImageSlider {
    constructor(root) {
      this.root = root;
      this.track = root.querySelector('[data-track]');
      this.slides = Array.from(this.track.querySelectorAll('.slide'));
      this.previousButton = root.querySelector('[data-previous]');
      this.nextButton = root.querySelector('[data-next]');
      this.dotsContainer = root.querySelector('[data-dots]');
      this.counter = root.querySelector('[data-counter]');
      this.index = 0;
      this.isAnimating = false;
      this.duration = 550;

      if (!this.track || this.slides.length === 0) return;
      this.createDots();
      this.bindEvents();
      this.update(false);
    }

    createDots() {
      const fragment = document.createDocumentFragment();
      this.slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', `Go to image ${index + 1}`);
        dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => this.goTo(index));
        fragment.appendChild(dot);
      });
      this.dotsContainer.replaceChildren(fragment);
      this.dots = Array.from(this.dotsContainer.querySelectorAll('.slider__dot'));
    }

    bindEvents() {
      this.previousButton.addEventListener('click', () => this.move(-1));
      this.nextButton.addEventListener('click', () => this.move(1));

      // Keyboard navigation is available when the slider region has focus.
      this.root.tabIndex = 0;
      this.root.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') this.move(-1);
        if (event.key === 'ArrowRight') this.move(1);
      });
    }

    move(direction) {
      if (this.slides.length < 2 || this.isAnimating) return;
      const nextIndex = (this.index + direction + this.slides.length) % this.slides.length;
      this.goTo(nextIndex, direction);
    }

    goTo(targetIndex, direction = null) {
      if (targetIndex === this.index || this.isAnimating) return;
      const count = this.slides.length;

      // For end-to-start navigation, temporarily position the track at a cloned
      // boundary slide, animate in the requested direction, then normalize.
      if (direction === 1 && this.index === count - 1 && targetIndex === 0) {
        this.animateBoundary('next');
        return;
      }
      if (direction === -1 && this.index === 0 && targetIndex === count - 1) {
        this.animateBoundary('previous');
        return;
      }

      this.index = targetIndex;
      this.update(true);
    }

    animateBoundary(direction) {
      const count = this.slides.length;
      const clone = direction === 'next' ? this.slides[0].cloneNode(true) : this.slides[count - 1].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');

      this.isAnimating = true;
      if (direction === 'next') {
        this.track.appendChild(clone);
        this.track.style.transition = `transform ${this.duration}ms cubic-bezier(.22,.75,.25,1)`;
        this.track.style.transform = `translateX(-${count * 100}%)`;
      } else {
        this.track.insertBefore(clone, this.slides[0]);
        this.track.style.transition = 'none';
        this.track.style.transform = 'translateX(-100%)';
        // Force layout so the no-transition starting position is applied first.
        void this.track.offsetWidth;
        this.track.style.transition = `transform ${this.duration}ms cubic-bezier(.22,.75,.25,1)`;
        this.track.style.transform = 'translateX(0%)';
      }

      window.setTimeout(() => {
        this.track.style.transition = 'none';
        if (direction === 'next') {
          clone.remove();
          this.track.style.transform = 'translateX(0%)';
        } else {
          clone.remove();
          this.track.style.transform = `translateX(-${(count - 1) * 100}%)`;
        }
        this.index = direction === 'next' ? 0 : count - 1;
        this.updateDotsAndCounter();
        void this.track.offsetWidth;
        this.track.style.transition = '';
        this.isAnimating = false;
      }, this.duration);
      this.index = direction === 'next' ? 0 : count - 1;
      this.updateDotsAndCounter();
    }

    update(animate = true) {
      this.track.style.transition = animate ? '' : 'none';
      this.track.style.transform = `translateX(-${this.index * 100}%)`;
      this.updateDotsAndCounter();
      if (!animate) {
        void this.track.offsetWidth;
        this.track.style.transition = '';
      }
    }

    updateDotsAndCounter() {
      this.dots.forEach((dot, index) => {
        const active = index === this.index;
        dot.setAttribute('aria-current', String(active));
      });
      this.counter.textContent = `${String(this.index + 1).padStart(2, '0')} / ${String(this.slides.length).padStart(2, '0')}`;
    }
  }

  document.querySelectorAll('[data-slider]').forEach((slider) => new ImageSlider(slider));
})();
