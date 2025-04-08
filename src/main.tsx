
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupStorage } from './utils/setupStorage';

// Initialize storage buckets with better error handling
setupStorage().catch(error => {
  console.error("Storage setup error:", error);
  // Continue loading the app even if storage setup fails
});

createRoot(document.getElementById("root")!).render(<App />);
