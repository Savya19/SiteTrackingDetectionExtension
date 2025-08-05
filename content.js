// Listen for messages from the popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_article') {
    // Try to extract the main article text
    let articleText = '';
    // Try common article containers
    const article = document.querySelector('article');
    if (article) {
      articleText = article.innerText;
    } else {
      // Fallback: get the largest <p> block or body text
      const paragraphs = Array.from(document.querySelectorAll('p'));
      if (paragraphs.length > 0) {
        // Sort by length, get the largest
        paragraphs.sort((a, b) => b.innerText.length - a.innerText.length);
        articleText = paragraphs.map(p => p.innerText).join('\n\n');
      } else {
        articleText = document.body.innerText;
      }
    }
    // Limit to 4000 characters for API
    articleText = articleText.slice(0, 4000);
    sendResponse({ articleText });
    return true; // Indicates async response
  }
});
