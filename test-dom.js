const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('customer-dashboard.html', 'utf8');
const dom = new JSDOM(html);
const window = dom.window;
const document = window.document;

// Mock showToast
window.showToast = function(a,b,c) { console.log('TOAST:', a, b, c); };

// Execute main.js
const mainJs = fs.readFileSync('assets/main.js', 'utf8');
try {
  eval(mainJs);
  console.log('main.js evaluated successfully');
  
  if (typeof startMain === 'function') {
    startMain();
    console.log('startMain executed');
  } else {
    console.log('startMain not found');
  }
} catch (e) {
  console.error('ERROR in main.js:', e);
}

const form = document.querySelector('.concierge-chat-form');
if (form) {
  const input = form.querySelector('input');
  input.value = ''; // empty
  
  console.log('Dispatching submit event...');
  const event = new window.Event('submit', { bubbles: true, cancelable: true });
  const cancelled = !form.dispatchEvent(event);
  
  console.log('Submit event cancelled (preventDefault called)?', cancelled);
  console.log('Redirect location:', window.location.href);
} else {
  console.log('Form not found');
}
