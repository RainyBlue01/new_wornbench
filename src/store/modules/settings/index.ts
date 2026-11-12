import { defineStore } from "pinia";
import type { WebSiteConfig } from "./types";
const win = window as any;
const webSiteConfigStore = defineStore("webSiteConfigStore", {
  state: (): WebSiteConfig => ({
    title: "",
    logo: "",
  }),

  getters: {
    getTitle(): string {
      if (this.title) {
        return this.title;
      }
      return this.getConfig ? this.getConfig.title : '';
    },
    getLogo(): string {
      if (this.logo) {
        return (this.logo ? (win.api.dowUrl +
          this.logo +
          "&token=" +
          localStorage.getItem("wornbench_token")) : ''

        );
      }
      const config = this.getConfig;
      if (config && config.logo) {
        return (
          config.logo ? (win.api.dowUrl +
            config.logo +
            "&token=" +
            localStorage.getItem("wornbench_token")) : ''
        );
      }
      return '';
    },
    getConfig(): WebSiteConfig {
      return JSON.parse(localStorage.getItem("webSiteConfig") + "");
    },
  },

  actions: {
    setWebSiteConfig(data: any) {
      this.title = data.title;
      this.logo = data.logo;
      document.title = this.title;
      localStorage.setItem("webSiteConfig", JSON.stringify(data));
    },
  },
});

export default webSiteConfigStore;
