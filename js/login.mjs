/**
 * @typedef {typeof USER_ROLES[keyof typeof USER_ROLES]} UserRole
 */

/**
 * @readonly
 * @enum {string}
 */
export const USER_ROLES = Object.freeze({
    NONE: "none",
    PLAYER: "player",
    STAFF: "staff"
});