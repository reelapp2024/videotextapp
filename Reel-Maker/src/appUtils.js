// App helpers: script loading, layout dimensions

export const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const getAspectRatioDimensions = (ratio) => {
  const makeEven = (n) => Math.max(2, Math.round(n / 2) * 2);
  switch (ratio) {
    case '1080x1920': return { width: 1080, height: 1920 };
    case '720x1280': return { width: 720, height: 1280 };
    case '1920x1080': return { width: 1920, height: 1080 };
    case '1280x720': return { width: 1280, height: 720 };
    case '1:1': return { width: 1080, height: 1080 };
    case '2:3': return { width: 1080, height: 1620 };
    case '4:5': return { width: 1080, height: 1350 };
    default:
      if (typeof ratio === 'string' && ratio.includes('x')) {
        const [w, h] = ratio.split('x').map(Number);
        if (w && h) return { width: makeEven(w), height: makeEven(h) };
      }
      return { width: 1080, height: 1920 };
  }
};
