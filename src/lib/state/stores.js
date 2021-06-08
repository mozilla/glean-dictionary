import { writable } from "svelte/store";

export const pageState = writable({
    itemType: "metrics",
    showExpired: false,
    search: ""
});
