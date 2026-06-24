import { Component } from '@theme/component';

class ProductUrgency extends Component {
  static STORAGE_PREFIX = 'product-urgency-';

  connectedCallback() {
    super.connectedCallback();
    this.#init();
  }

  #init() {
    const id = this.dataset.id || this.getAttribute('data-id') || 'default';
    const minMinutes = parseFloat(this.dataset.minMinutes) || 5;
    const maxMinutes = parseFloat(this.dataset.maxMinutes) || 60;
    const stockMin = parseInt(this.dataset.stockMin, 10) || 3;
    const stockMax = parseInt(this.dataset.stockMax, 10) || 28;
    const expiryText = this.dataset.expiryText || 'Offer expired';
    const hideOnExpiry = this.dataset.hideOnExpiry !== 'false';
    const showDays = this.dataset.showDays !== 'false';
    const showHours = this.dataset.showHours !== 'false';
    const showMinutes = this.dataset.showMinutes !== 'false';
    const showSeconds = this.dataset.showSeconds !== 'false';

    const timerEl = this.refs.timerDisplay;
    const stockEl = this.refs.stockDisplay;

    if (stockEl) {
      const stock = Math.floor(Math.random() * (stockMax - stockMin + 1)) + stockMin;
      const stockText = this.dataset.stockText || 'left in stock';
      stockEl.textContent = `${stock} ${stockText}`;
    }

    if (!timerEl) return;

    const storageKey = `${ProductUrgency.STORAGE_PREFIX}${id}`;
    let endTime = parseInt(localStorage.getItem(storageKey), 10);

    if (!endTime || endTime <= Date.now()) {
      const durationMs = (Math.random() * (maxMinutes - minMinutes) + minMinutes) * 60 * 1000;
      endTime = Date.now() + durationMs;
      localStorage.setItem(storageKey, endTime.toString());
    }

    this.#startTimer(timerEl, endTime, { expiryText, hideOnExpiry, showDays, showHours, showMinutes, showSeconds });
  }

  #startTimer(el, endTime, opts) {
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      let diff = endTime - Date.now();

      if (diff <= 0) {
        el.textContent = opts.expiryText;
        if (opts.hideOnExpiry) {
          this.style.display = 'none';
        }
        if (this.refs.timerLabel) {
          this.refs.timerLabel.style.display = 'none';
        }
        return;
      }

      const days = Math.floor(diff / 86400000);
      diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000);
      diff -= hours * 3600000;
      const minutes = Math.floor(diff / 60000);
      diff -= minutes * 60000;
      const seconds = Math.floor(diff / 1000);

      const parts = [];
      if (opts.showDays && days > 0) parts.push(`${days}d`);
      if (opts.showHours) parts.push(pad(hours));
      if (opts.showMinutes) parts.push(pad(minutes));
      if (opts.showSeconds) parts.push(pad(seconds));

      el.textContent = parts.join(':') || '0s';
    };

    tick();
    this.#tickInterval = setInterval(tick, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#tickInterval) {
      clearInterval(this.#tickInterval);
    }
  }

  #tickInterval = null;
}

if (!customElements.get('product-urgency')) {
  customElements.define('product-urgency', ProductUrgency);
}
