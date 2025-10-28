import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "54172c58196485.lhr.life",
      ".lhr.life", // Cho phép tất cả subdomain của lhr.life
    ],
  },
});
