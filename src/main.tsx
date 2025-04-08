
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupStorage } from './utils/setupStorage';

// Initialize storage buckets
setupStorage().then(success => {
  if (success) {
    console.log("Storage setup complete");
  } else {
    console.error("Storage setup failed");
  }
});

createRoot(document.getElementById("root")!).render(<App />);
