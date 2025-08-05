
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_article') {
   
    let articleText = '';
 
    const article = document.querySelector('article');
    if (article) {
      articleText = article.innerText;
    } else {
      
      const paragraphs = Array.from(document.querySelectorAll('p'));
      if (paragraphs.length > 0) {
      
        paragraphs.sort((a, b) => b.innerText.length - a.innerText.length);
        articleText = paragraphs.map(p => p.innerText).join('\n\n');
      } else {
        articleText = document.body.innerText;
      }
    }
   
    articleText = articleText.slice(0, 4000);
    sendResponse({ articleText });
    return true; 
  }
});
