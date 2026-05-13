import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const rootEl = document.getElementById("root") as HTMLElement | null;
if (!rootEl) {
	throw new Error("Missing #root");
}

createRoot(rootEl).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
