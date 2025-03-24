import { defineStore } from 'pinia';

export const useCouponStore = defineStore('coupon', {
    state: () => ({
        redeemedUpdated: false,
    }),
    actions: {
        markRedeemed() {
            this.redeemedUpdated = !this.redeemedUpdated;
        }
    }
});