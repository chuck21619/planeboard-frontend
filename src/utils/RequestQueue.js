export class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.lastRealStartTime = 0;
  }
  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    const now = performance.now();
    const timeSinceLastRealStart = now - this.lastRealStartTime;
    const delay = Math.max(0, 100 - timeSinceLastRealStart);
    this.isProcessing = true;
    setTimeout(async () => {
      const { fn, resolve, reject } = this.queue.shift();
      const start = performance.now();
      let duration = 0;
      try {
        const result = await (async () => {
          const innerStart = performance.now();
          const value = await fn();
          duration = performance.now() - innerStart;
          return value;
        })();
        const fromCache = duration < 20;
        if (!fromCache) {
          this.lastRealStartTime = performance.now();
        }
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        this.isProcessing = false;
        this.processQueue();
      }
    }, delay);
  }
}

export const requestQueue = new RequestQueue();
