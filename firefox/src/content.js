(() => {
  const allowedPaths = ['/puzzles', '/puzzles/rated'];
  const currentPath = window.location.pathname;

  if (!allowedPaths.some(path => currentPath === path || currentPath.startsWith(`${path}/`))) {
    return;
  }

  let settings = { enabled: true, delay: 5 };
  let hasClicked = false;
  let toggleButton = null;

  extensionStorage.get(['enabled', 'delay'], result => {
    settings.enabled = result.enabled !== undefined ? result.enabled : true;
    settings.delay = result.delay !== undefined ? result.delay : 5;
    updateToggleButton();
  });

  extensionStorage.onChanged.addListener(changes => {
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.delay) settings.delay = changes.delay.newValue;
    updateToggleButton();
  });

  function findSettingsButton() {
    const allButtons = Array.from(document.querySelectorAll('button, [role="button"], a[class*="button"]'));
    const potentialSettings = allButtons.filter(button => {
      if (!button.offsetParent) return false;

      const rect = button.getBoundingClientRect();
      const isBottomRight = rect.bottom > window.innerHeight - 100 && rect.right > window.innerWidth - 200;
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
      const text = button.textContent.toLowerCase();
      const hasIcon = button.querySelector('svg, i, [class*="icon"]');
      const className = (button.className || '').toLowerCase();

      return isBottomRight && (
        ariaLabel.includes('setting') ||
        ariaLabel.includes('gear') ||
        ariaLabel.includes('preference') ||
        text.includes('setting') ||
        className.includes('setting') ||
        className.includes('gear') ||
        (hasIcon && (className.includes('icon') || className.includes('cog')))
      );
    });

    if (potentialSettings.length) {
      return potentialSettings.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0];
    }

    const bottomRightButtons = allButtons.filter(button => {
      if (!button.offsetParent) return false;
      const rect = button.getBoundingClientRect();
      return rect.bottom > window.innerHeight - 150 && rect.right > window.innerWidth - 300;
    });

    return bottomRightButtons.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0] || null;
  }

  function injectToggleIntoSettings() {
    if (document.getElementById('chess-auto-next-toggle')) return;

    const settingsButton = findSettingsButton();
    let bottomPosition = '28px';
    let rightPosition = '260px';

    if (settingsButton) {
      const rect = settingsButton.getBoundingClientRect();
      rightPosition = `${window.innerWidth - rect.right + 240}px`;
      bottomPosition = `${window.innerHeight - rect.bottom + 20}px`;
    }

    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'chess-auto-next-toggle';
    toggleContainer.style.cssText = `
      position: fixed;
      right: ${rightPosition};
      bottom: ${bottomPosition};
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      z-index: 10000;
      background: transparent;
      pointer-events: auto;
    `;
    toggleContainer.innerHTML = `
      <span style="font-size: 12px; color: #666; white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">Auto-Next</span>
      <label class="toggle-container" style="position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; flex-shrink: 0;">
        <input type="checkbox" ${settings.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0; position: absolute;">
        <span class="toggle-slider" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.enabled ? '#81b64c' : '#ccc'}; border-radius: 22px; transition: background-color 0.3s;">
          <span class="toggle-circle" style="position: absolute; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: white; border-radius: 50%; transition: transform 0.3s; transform: translateX(${settings.enabled ? '18px' : '0'}); box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></span>
        </span>
      </label>
    `;

    const checkbox = toggleContainer.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', event => {
      settings.enabled = event.target.checked;
      extensionStorage.set({ enabled: settings.enabled }, updateToggleState);
    });

    document.body.appendChild(toggleContainer);
    toggleButton = toggleContainer;

    const updatePosition = () => {
      if (!toggleContainer.isConnected || !settingsButton || !settingsButton.offsetParent) return;
      const rect = settingsButton.getBoundingClientRect();
      toggleContainer.style.right = `${window.innerWidth - rect.right + 240}px`;
      toggleContainer.style.bottom = `${window.innerHeight - rect.bottom + 20}px`;
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
  }

  function updateToggleState() {
    if (!toggleButton) return;

    const checkbox = toggleButton.querySelector('input[type="checkbox"]');
    const slider = toggleButton.querySelector('.toggle-slider');
    const sliderCircle = toggleButton.querySelector('.toggle-circle');

    if (checkbox) checkbox.checked = settings.enabled;
    if (slider) slider.style.backgroundColor = settings.enabled ? '#81b64c' : '#ccc';
    if (sliderCircle) sliderCircle.style.transform = `translateX(${settings.enabled ? '18px' : '0'})`;
  }

  function updateToggleButton() {
    updateToggleState();
  }

  function findNextButton() {
    const selectors = [
      'button[aria-label="Next"]',
      'button[aria-label="Continue"]',
      'a[aria-label="Next"]',
      'a[aria-label="Continue"]',
      '.puzzle-next-button',
      '[data-cy="next-puzzle"]'
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) return button;
    }

    const buttons = document.querySelectorAll('button, a[role="button"], a.button');
    return Array.from(buttons).find(button => {
      const text = button.textContent.trim().toLowerCase();
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
      const className = (button.className || '').toLowerCase();
      const hasNext = text.includes('next') || ariaLabel.includes('next');
      const hasContinue = (text.includes('continue') && !text.includes('continue solving')) ||
        (ariaLabel.includes('continue') && !ariaLabel.includes('continue solving'));
      return (hasNext || hasContinue || className.includes('next')) && button.offsetParent !== null;
    }) || null;
  }

  function clickNextButton() {
    if (!settings.enabled || hasClicked) return false;

    const button = findNextButton();
    if (!button) return false;

    hasClicked = true;
    console.log('Chess.com Auto-Next: Clicking button after', settings.delay, 'ms');

    window.setTimeout(() => {
      button.click();
      window.setTimeout(() => { hasClicked = false; }, 2000);
    }, settings.delay);

    return true;
  }

  const observer = new MutationObserver(mutations => {
    const indicators = [
      '.puzzle-complete',
      '.puzzle-success',
      '[class*="result"]',
      '[class*="success"]',
      '[class*="complete"]',
      'button[aria-label="Next"]'
    ];

    for (const indicator of indicators) {
      if (document.querySelector(indicator)) {
        clickNextButton();
        break;
      }
    }

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const text = node.textContent?.toLowerCase() || '';
        if (text.includes('next') || text.includes('continue')) clickNextButton();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const settingsObserver = new MutationObserver(() => {
    if (!document.getElementById('chess-auto-next-toggle')) injectToggleIntoSettings();
  });

  const tryInject = () => {
    if (!document.getElementById('chess-auto-next-toggle')) injectToggleIntoSettings();
  };

  window.setTimeout(tryInject, 500);
  window.setTimeout(tryInject, 1500);
  window.setTimeout(tryInject, 3000);

  settingsObserver.observe(document.body, { childList: true, subtree: true });
  console.log('Chess.com Auto-Next extension loaded');
})();
