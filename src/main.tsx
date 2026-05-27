import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import config from "../granite.config.ts";
import App from "./App.tsx";
import "./index.css";

const isInTossApp = typeof window !== 'undefined' && 'ReactNativeWebView' in window;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isInTossApp ? (
      <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>
        <App />
      </TDSMobileAITProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
