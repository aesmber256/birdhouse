//@ts-check 
//@ts-nocheck
import {
    attachErrorAlerts,
    revealDOM,
    setupStaffAuth
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
} from "./api.mjs";

const api = new BirdhouseAPI();
const isStaff = await setupStaffAuth(api);



revealDOM();