// Chess.com Auto-Next Content Script
(function() {
  // Only run on puzzle pages
  const allowedPaths = ['/puzzles', '/puzzles/rated'];
  const currentPath = window.location.pathname;
  if (!allowedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'))) {
    return; // Exit if not on a puzzle page
  }

  let settings = { enabled: true, delay: 5 };
  let hasClicked = false;
  let toggleButton = null;

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'delay'], (result) => {
    settings.enabled = result.enabled !== undefined ? result.enabled : true;
    settings.delay = result.delay !== undefined ? result.delay : 5;
    // Don't call updateToggleButton here - toggle doesn't exist yet
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.delay) settings.delay = changes.delay.newValue;
    updateToggleState(); // Use updateToggleState directly since toggle should exist by now
  });

  // Create toggle next to settings icon in bottom right
  let layoutObserver = null;
  let positionUpdateTimeout = null;
  let resizeHandler = null;
  let scrollHandler = null;

  function normalizeText(value) {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function isReadyToClick(element) {
    if (!element) return false;
    if (element.offsetParent === null) return false;
    if (element.disabled) return false;
    if (element.getAttribute('aria-disabled') === 'true') return false;
    const className = normalizeText(element.className || '');
    if (className.includes('disabled')) return false;
    const computed = window.getComputedStyle(element);
    if (computed.pointerEvents === 'none') return false;
    if (computed.visibility === 'hidden') return false;
    return true;
  }
  
  function injectToggleIntoSettings() {
    if (document.getElementById('chess-auto-next-toggle')) return;

    // Find the Next Move button with multiple selector strategies
    let nextMoveBtn = null;
    
    // Try multiple selectors in order of preference
    const selectors = [
      'button[aria-label="Next Move"]',
      'button[data-cy="next-move-arrow"]',
      'button[aria-label*="Next"]',
      'button[title*="Next"]',
      'button[aria-label*="Próximo lance"]',
      'button[aria-label*="Proximo lance"]',
      'button[aria-label*="Próximo"]',
      'button[aria-label*="Proximo"]',
      'button[title*="Próximo lance"]',
      'button[title*="Proximo lance"]',
      'button[title*="Próximo"]',
      'button[title*="Proximo"]',
      // Fallback: look for buttons with "next" in text (case-insensitive)
      () => {
        const buttons = document.querySelectorAll('button');
        return Array.from(buttons).find(btn => {
          const text = normalizeText(btn.textContent);
          const ariaLabel = normalizeText(btn.getAttribute('aria-label'));
          return (
            text.includes('next move') ||
            ariaLabel.includes('next move') ||
            text.includes('proximo lance') ||
            ariaLabel.includes('proximo lance')
          ) && btn.offsetParent !== null;
        });
      }
    ];
    
    for (const selector of selectors) {
      try {
        if (typeof selector === 'function') {
          nextMoveBtn = selector();
        } else {
          nextMoveBtn = document.querySelector(selector);
        }
        if (nextMoveBtn && nextMoveBtn.offsetParent !== null) {
          break;
        }
      } catch (e) {
        // Continue to next selector
        continue;
      }
    }
    
    if (!nextMoveBtn || !nextMoveBtn.offsetParent) {
      console.log('Chess Auto-Next: Next Move button not found, retrying in 500ms...');
      setTimeout(injectToggleIntoSettings, 500);
      return;
    }

    console.log('Chess Auto-Next: Found Next Move button', nextMoveBtn);

    // Create container row with Flexbox
    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'chess-auto-next-toggle';
    
    toggleContainer.style.cssText = `
      position: fixed;
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
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        settings.enabled = e.target.checked;
        chrome.storage.sync.set({ enabled: settings.enabled }, () => {
          updateToggleState();
        });
      });
    }

    // Ensure document.body exists before appending
    if (!document.body) {
      console.warn('Chess Auto-Next: document.body not available, waiting...');
      setTimeout(injectToggleIntoSettings, 500);
      return;
    }

    try {
      document.body.appendChild(toggleContainer);
      toggleButton = toggleContainer;
    } catch (e) {
      console.error('Chess Auto-Next: Failed to append toggle container', e);
      return;
    }

    // Helper function to find Next Move button (reuse same logic as injection)
    const findNextMoveButton = () => {
      const selectors = [
        'button[aria-label="Next Move"]',
        'button[data-cy="next-move-arrow"]',
        'button[aria-label*="Next Move"]',
        'button[aria-label*="Next"]',
        'button[aria-label*="Próximo lance"]',
        'button[aria-label*="Proximo lance"]',
        'button[aria-label*="Próximo"]',
        'button[aria-label*="Proximo"]'
      ];
      
      for (const selector of selectors) {
        try {
          const btn = document.querySelector(selector);
          if (btn && btn.offsetParent !== null) {
            return btn;
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    };

    // Update position on window resize and scroll
    const updatePosition = () => {
      try {
        const targetBtn = findNextMoveButton();
        
        if (!toggleContainer || !targetBtn) {
          return; // Silently return if button not found or toggle not initialized
        }
        
        const newRect = targetBtn.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Validate viewport dimensions
        if (viewportWidth <= 0 || viewportHeight <= 0) {
          return;
        }
        
        // Remove right and bottom to avoid conflicts
        toggleContainer.style.right = 'auto';
        toggleContainer.style.bottom = 'auto';
        
        // Calculate desired position (140px to the left, 6px lower)
        let desiredLeft = newRect.left - 140;
        let desiredTop = newRect.top + 6;
        
        // Get toggle container dimensions (with fallback estimates)
        const toggleRect = toggleContainer.getBoundingClientRect();
        const toggleWidth = toggleRect.width || 120; // Approximate width: "Auto-Next" text + toggle
        const toggleHeight = toggleRect.height || 22;
        
        // Bounds checking: ensure toggle stays within viewport
        // Minimum left position (with some padding)
        const minLeft = 10;
        // Maximum left position (toggle shouldn't go off right edge)
        const maxLeft = Math.max(minLeft, viewportWidth - toggleWidth - 10);
        // Minimum top position
        const minTop = 10;
        // Maximum top position
        const maxTop = Math.max(minTop, viewportHeight - toggleHeight - 10);
        
        // Clamp the position to viewport bounds
        desiredLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));
        desiredTop = Math.max(minTop, Math.min(desiredTop, maxTop));
        
        // Apply the position
        toggleContainer.style.left = `${desiredLeft}px`;
        toggleContainer.style.top = `${desiredTop}px`;
      } catch (e) {
        console.error('Chess Auto-Next: Error updating toggle position', e);
      }
    };
    
    // Set initial position with a small delay to ensure layout is settled
    setTimeout(() => {
      updatePosition();
      // Also update after a brief delay to catch any late layout changes
      setTimeout(updatePosition, 100);
    }, 100);
    
    // Clean up any existing observers/listeners before creating new ones
    if (layoutObserver) {
      layoutObserver.disconnect();
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
    }
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler, true);
    }
    if (positionUpdateTimeout) {
      clearTimeout(positionUpdateTimeout);
    }
    
    // Debounce resize/scroll events for better performance
    const debouncedUpdatePosition = () => {
      if (positionUpdateTimeout) {
        clearTimeout(positionUpdateTimeout);
      }
      positionUpdateTimeout = setTimeout(updatePosition, 50);
    };
    
    resizeHandler = debouncedUpdatePosition;
    scrollHandler = debouncedUpdatePosition;
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', scrollHandler, true);
    
    // Also watch for layout changes that might affect button position
    layoutObserver = new MutationObserver(debouncedUpdatePosition);
    layoutObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  // Update toggle state
  function updateToggleState() {
    if (!toggleButton) return;
    const checkbox = toggleButton.querySelector('input[type="checkbox"]');
    const slider = toggleButton.querySelector('.toggle-slider');
    const sliderCircle = toggleButton.querySelector('.toggle-circle');
    
    if (checkbox) checkbox.checked = settings.enabled;
    if (slider) {
      slider.style.backgroundColor = settings.enabled ? '#81b64c' : '#ccc';
    }
    if (sliderCircle) {
      sliderCircle.style.transform = `translateX(${settings.enabled ? '18px' : '0'})`;
    }
  }

  // Update toggle button appearance (legacy function name)
  function updateToggleButton() {
    updateToggleState();
  }

  function findClickableNextButton() {
    const selectors = [
      'button[data-cy="next-move-arrow"]',
      'button[aria-label="Next"]',
      'button[aria-label="Continue"]',
      'button[aria-label*="Próximo"]',
      'button[aria-label*="Proximo"]',
      'button[aria-label*="Continuar"]',
      'button[aria-label*="Seguinte"]',
      'a[aria-label="Next"]',
      'a[aria-label="Continue"]',
      '.puzzle-next-button',
      '[data-cy="next-puzzle"]'
    ];

    for (const selector of selectors) {
      try {
        const candidate = document.querySelector(selector);
        if (isReadyToClick(candidate)) {
          return candidate;
        }
      } catch (e) {
        // Ignore invalid selector results
      }
    }

    const buttons = document.querySelectorAll('button, a[role="button"], a.button');
    return Array.from(buttons).find(btn => {
      if (!isReadyToClick(btn)) return false;

      const text = normalizeText(btn.textContent);
      const ariaLabel = normalizeText(btn.getAttribute('aria-label'));
      const className = normalizeText(btn.className);

      const hasNext =
        text.includes('next') ||
        ariaLabel.includes('next') ||
        text.includes('proximo') ||
        ariaLabel.includes('proximo') ||
        text.includes('seguinte') ||
        ariaLabel.includes('seguinte');
      const hasContinue = (text.includes('continue') && !text.includes('continue solving')) ||
                         (ariaLabel.includes('continue') && !ariaLabel.includes('continue solving')) ||
                         text.includes('continuar') ||
                         ariaLabel.includes('continuar');
      const hasNextClass = className.includes('next');

      return (hasNext || hasContinue || hasNextClass);
    }) || null;
  }

  // Function to find and click the Next/Continue button
  function clickNextButton() {
    if (!settings.enabled || hasClicked) return false;
    const button = findClickableNextButton();

    if (isReadyToClick(button)) {
      hasClicked = true;
      console.log('Chess.com Auto-Next: Clicking button after', settings.delay, 'ms');
      
      setTimeout(() => {
        // Re-resolve at click time because Chess.com frequently re-renders this node.
        const liveButton = findClickableNextButton();
        if (!isReadyToClick(liveButton)) {
          hasClicked = false;
          return;
        }
        liveButton.click();
        liveButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        // Reset after a delay to allow for next puzzle
        setTimeout(() => { hasClicked = false; }, CLICK_LOCK_MS);
      }, settings.delay);
      
      return true;
    }
    
    return false;
  }

  const completionIndicators = [
    '.puzzle-complete',
    '.puzzle-success',
    '[class*="result"]',
    '[class*="success"]',
    '[class*="complete"]',
    '[class*="corret"]',
    'button[aria-label="Next"]',
    'button[data-cy="next-move-arrow"]:not([disabled])',
    'button[aria-label*="Próximo"]',
    'button[aria-label*="Proximo"]',
    'button[aria-label*="Continue"]',
    'button[aria-label*="Continuar"]'
  ];

  function hasCompletionIndicator() {
    for (const indicator of completionIndicators) {
      if (document.querySelector(indicator)) return true;
    }
    return false;
  }

  let clickRetryTimer = null;
  let clickRetryAttempts = 0;
  const CLICK_RETRY_INTERVAL_MS = 150;
  const CLICK_RETRY_MAX_ATTEMPTS = 30;
  const CLICK_LOCK_MS = 900;

  function stopClickRetry() {
    if (clickRetryTimer) {
      clearInterval(clickRetryTimer);
      clickRetryTimer = null;
    }
    clickRetryAttempts = 0;
  }

  function startClickRetry() {
    if (clickRetryTimer || !settings.enabled) return;

    clickRetryAttempts = 0;
    clickRetryTimer = setInterval(() => {
      clickRetryAttempts += 1;
      const clicked = clickNextButton();

      if (clicked || !hasCompletionIndicator() || clickRetryAttempts >= CLICK_RETRY_MAX_ATTEMPTS) {
        stopClickRetry();
      }
    }, CLICK_RETRY_INTERVAL_MS);
  }

  // Watch for puzzle completion indicators
  const observer = new MutationObserver((mutations) => {
    // Look for success/completion messages or result screens
    if (hasCompletionIndicator()) {
      const clicked = clickNextButton();
      if (!clicked) startClickRetry();
    }

    // Check if any mutation added a "Next" button
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const text = normalizeText(node.textContent);
            if (
              text.includes('next') ||
              text.includes('continue') ||
              text.includes('proximo') ||
              text.includes('continuar') ||
              text.includes('correto') ||
              text.includes('correct')
            ) {
              const clicked = clickNextButton();
              if (!clicked) startClickRetry();
            }
          }
        });
      }
    }
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-disabled', 'class', 'style']
  });

  // Watch for settings menus to appear and inject toggle
  const settingsObserver = new MutationObserver(() => {
    if (!document.getElementById('chess-auto-next-toggle')) {
      injectToggleIntoSettings();
    }
  });


  // Start observing for settings button to appear
  if (document.body) {
    // Try initial injection with multiple attempts
    const tryInject = () => {
      if (!document.getElementById('chess-auto-next-toggle')) {
        injectToggleIntoSettings();
      }
    };
    
    setTimeout(tryInject, 500);
    setTimeout(tryInject, 1500);
    setTimeout(tryInject, 3000);
    
    // Watch for dynamically added buttons
    settingsObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        setTimeout(() => {
          if (!document.getElementById('chess-auto-next-toggle')) {
            injectToggleIntoSettings();
          }
        }, 500);
        settingsObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
        bodyObserver.disconnect();
      }
    });
    bodyObserver.observe(document.documentElement, { childList: true });
  }

  console.log('Chess.com Auto-Next extension loaded');
})();
