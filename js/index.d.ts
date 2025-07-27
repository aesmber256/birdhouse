import { BirdhouseAPI } from "./api.mjs"
import { UserRole } from "./login.mjs";

declare global {
    interface Window {
        Birdhouse: {
            api: BirdhouseAPI;
            role: UserRole;
            content: HTMLElement;
            
        }
    }
}