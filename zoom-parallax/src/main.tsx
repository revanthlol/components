import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import DefaultDemo from "./components/ui/demo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DefaultDemo />
  </StrictMode>
);
