import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

/*strict mode*/
createRoot(document.getElementById("root")).render(<App />);
