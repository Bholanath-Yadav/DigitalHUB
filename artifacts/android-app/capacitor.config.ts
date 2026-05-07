import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "np.com.digitalhub.app",
  appName: "Digital HUB",
  webDir: "../gaming-store/dist/public",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
};

export default config;