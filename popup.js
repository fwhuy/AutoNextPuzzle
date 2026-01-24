// Chess.com Auto-Next Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const delayInput = document.getElementById('delayInput');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');
  const toggleStatus = document.getElementById('toggleStatus');

  // Load current settings and default to enabled
  chrome.storage.sync.get(['enabled', 'delay'], (result) => {
    const enabled = result.enabled !== undefined ? result.enabled : true;
    const delay = result.delay !== undefined ? result.delay : 800;
    
    enableToggle.checked = enabled;
    delayInput.value = delay;
    
    updateToggleStatus(enabled);
    
    // If settings don't exist, save defaults
    if (result.enabled === undefined || result.delay === undefined) {
      chrome.storage.sync.set({ 
        enabled: true, 
        delay: 800 
      }, () => {
        console.log('Default settings saved');
      });
    }
  });

  // Update toggle status display
  function updateToggleStatus(enabled) {
    if (enabled) {
      toggleStatus.className = 'toggle-status active';
      toggleStatus.innerHTML = '<span class="dot"></span><span>Active - will auto-click Next</span>';
    } else {
      toggleStatus.className = 'toggle-status inactive';
      toggleStatus.innerHTML = '<span class="dot"></span><span>Inactive - manual clicking required</span>';
    }
  }

  // Update status when checkbox changes
  enableToggle.addEventListener('change', () => {
    updateToggleStatus(enableToggle.checked);
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const enabled = enableToggle.checked;
    const delay = parseInt(delayInput.value, 10);

    // Validate delay
    if (isNaN(delay) || delay < 0) {
      showStatus('⚠️ Please enter a valid delay value', false);
      return;
    }

    // Save to storage
    chrome.storage.sync.set({ enabled, delay }, () => {
      showStatus('✅ Settings saved successfully!', true);
      console.log('Settings saved:', { enabled, delay });
    });
  });

  // Show status message
  function showStatus(message, isSuccess) {
    status.textContent = message;
    status.className = 'status show' + (isSuccess ? ' success' : '');
    
    setTimeout(() => {
      status.classList.remove('show');
    }, 2500);
  }

  // Allow Enter key to save
  delayInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });
});
