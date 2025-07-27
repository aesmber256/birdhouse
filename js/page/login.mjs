import { delayed, getById, reportValidity, throbber } from "../utils.mjs";

export function run() {
    const nameInput = getById("login-name", "input");
    const pswdInput = getById("login-pswd", "input");
    const btn = getById("login-btn", "");
    const throbberSpan = getById("login-throbber", "span");
    let isDisabled = false;
    /**@type {(() => void) | undefined}*/
    let throbberRemove;

    btn.addEventListener("click", async (ev) => {
        if (isDisabled || !reportValidity(nameInput, pswdInput)) return;
        setState(false);
        delayed(() => { setState(true); alert("Not implemented"); }, 1000);
    })

    /**
     * @param {boolean} enabled
     */
    function setState(enabled) {
        // OMG what is this
        if (btn.classList.toggle("disabled", nameInput.readOnly = pswdInput.readOnly = isDisabled = !enabled)) {
            throbberRemove = throbber(throbberSpan, 100);
        }
        else {
            throbberRemove?.();
        }
    }
}