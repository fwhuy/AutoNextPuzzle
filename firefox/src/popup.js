document.addEventListener('DOMContentLoaded', () => {
  const delayInput = document.getElementById('delayInput');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  extensionStorage.get(['delay'], result => {
    let delay = result.delay;

    if (delay === undefined || delay === 800) {
      delay = 5;
      extensionStorage.set({ delay });
    }

    delayInput.value = delay;
  });

  saveBtn.addEventListener('click', () => {
    const delay = Number.parseInt(delayInput.value, 10);

    if (!Number.isInteger(delay) || delay < 0 || delay > 10000) {
      showStatus('Enter a delay between 0 and 10000 ms.', false);
      return;
    }

    extensionStorage.set({ delay }, () => {
      showStatus('Settings saved successfully.', true);
    });
  });

  function showStatus(message, isSuccess) {
    status.textContent = message;
    status.className = `status show ${isSuccess ? 'success' : 'error'}`;

    window.setTimeout(() => {
      status.classList.remove('show');
    }, 2500);
  }

  delayInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') saveBtn.click();
  });
});
