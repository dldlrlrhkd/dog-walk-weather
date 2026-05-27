import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import config from "../granite.config.ts";
import App from "./App.tsx";
import "./index.css";

const isInTossApp = typeof window !== 'undefined' && 'ReactNativeWebView' in window;
const rootEl = document.getElementById("root")!;

if (isInTossApp) {
  import("@toss/tds-mobile-ait").then(({ TDSMobileAITProvider }) => {
    createRoot(rootEl).render(
      <StrictMode>
        <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>
          <App />
        </TDSMobileAITProvider>
      </StrictMode>,
    );
  });
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
