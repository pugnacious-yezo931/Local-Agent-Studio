import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installMockLocalAgent } from "./mockLocalAgent";
import "./styles.css";

installMockLocalAgent();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
