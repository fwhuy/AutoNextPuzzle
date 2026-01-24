// Chess.com Auto-Next Content Script
(function() {
  let settings = { enabled: true, delay: 800 };
  let hasClicked = false;

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'delay'], (result) => {
    settings.enabled = result.enabled !== undefined ? result.enabled : true;
    settings.delay = result.delay !== undefined ? result.delay : 800;
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.delay) settings.delay = changes.delay.newValue;
  });

  // Function to find and click the Next/Continue button
  function clickNextButton() {
    if (!settings.enabled || hasClicked) return;

    // Common selectors for Chess.com puzzle buttons
    const selectors = [
      'button[aria-label="Next"]',
      'button:has-text("Next")',
      'button.ui_v5-button-component:contains("Next")',
      'button[class*="next"]',
      'button:has-text("Continue")',
      'a[aria-label="Next"]',
      '.puzzle-next-button',
      '[data-cy="next-puzzle"]'
    ];

    for (const selector of selectors) {
      try {
        // Try standard querySelector
        let button = document.querySelector(selector);
        
        // Fallback: search by text content
        if (!button) {
          const buttons = document.querySelectorAll('button');
          button = Array.from(buttons).find(btn => 
            btn.textContent.trim().toLowerCase().includes('next') ||
            btn.textContent.trim().toLowerCase().includes('continue')
          );
        }

        if (button && button.offsetParent !== null) {
          hasClicked = true;
          console.log('Chess.com Auto-Next: Clicking button after', settings.delay, 'ms');
          
          setTimeout(() => {
            button.click();
            // Reset after a delay to allow for next puzzle
            setTimeout(() => { hasClicked = false; }, 2000);
          }, settings.delay);
          
          return true;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    return false;
  }

  // Watch for puzzle completion indicators
  const observer = new MutationObserver((mutations) => {
    // Look for success/completion messages or result screens
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

    // Check if any mutation added a "Next" button
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const text = node.textContent?.toLowerCase() || '';
            if (text.includes('next') || text.includes('continue')) {
              clickNextButton();
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
    attributes: false
  });

  console.log('Chess.com Auto-Next extension loaded');
})();
