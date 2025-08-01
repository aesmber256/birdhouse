//@ts-check
import {
    API_KEY_ID,
    attachErrorAlerts
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
} from "./api.mjs";

const api = new BirdhouseAPI();
document.getElementById("login-btn")?.addEventListener("click", async () => {
    sessionStorage.removeItem(API_KEY_ID)
    let result = prompt("Enter passcode");
    if (result === null) {
        return;
    }
    
    if (! await api.tryAuth(result.trim())) {
        alert("Failed to authenticate");
        return;
    }        
    
    sessionStorage.setItem(API_KEY_ID, result);
    location.replace("./index.html");
})