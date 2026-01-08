import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('[main.tsx] Starting React app bootstrap');

const rootElement = document.getElementById("root");

if (!rootElement) {
	console.error('[main.tsx] Failed to find root element with id="root"');
} else {
	console.log('[main.tsx] Root element found, creating React root');
	createRoot(rootElement).render(
		<App />
	);
	console.log('[main.tsx] React root rendered <App />');
}
