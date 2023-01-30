import { createRoot } from 'react-dom/client';
import { App } from './app';
import './css/tailwind.css';

(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    div.className = 'userscript-root';

    const root = createRoot(div);

    root.render(<App />);
  });
})();
