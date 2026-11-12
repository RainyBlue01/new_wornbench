import { createPinia } from "pinia";

import webSiteConfigStore from "./modules/settings";

const pinia = createPinia();

export { webSiteConfigStore };
export default pinia;
