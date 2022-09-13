import { createRoot } from 'react-dom/client';
import { App } from './app';
import './css/root.css';

window.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.querySelector('#root');
  if (rootElement === null) {
    alert('root element \'#root\' is not found');
    return;
  }

  const root = createRoot(rootElement);
  root.render(<>
        <App />
  </>);
});
