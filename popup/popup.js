
function getCurrentTabOrigin(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url) {
      const origin = new URL(tabs[0].url).origin;
      callback(origin);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  
  const clearBtn = document.getElementById('clear-history-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'clear_history' }, function() {
        location.reload();
      });
    });
  }

  getCurrentTabOrigin(function(origin) {
    chrome.runtime.sendMessage({ action: 'get_trackers', origin }, function(response) {
      const trackers = response && response.trackers ? response.trackers : {};
      const list = document.getElementById('tracker-list');
      list.innerHTML = '';
      const keys = Object.keys(trackers);
      if (keys.length === 0) {
        list.innerHTML = '<li>No known trackers detected on this site.</li>';
      } else {
        keys.forEach(domain => {
          const info = trackers[domain];
          const li = document.createElement('li');
          li.innerHTML = `<strong>${domain}</strong><br>
            <small>Type: ${info.category} | Company: ${info.company} | Count: ${info.count}</small>`;
          list.appendChild(li);
        });
      }
    });
  });
});

