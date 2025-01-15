import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@/assets/styles/index.css";
import InnerApp from "./InnerApp";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/theme-provider";

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
