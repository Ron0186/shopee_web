import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userId: null,
    username: null,
    token: null,
    roles: [],
  }),
  actions: {
    setUserData({ userId, username, token, roles }) {
      this.userId = userId;
      this.username = username;
      this.token = token;
      this.roles = roles;
    },
    clearUser() {
      this.userId = null;
      this.username = null;
      this.token = null;
      this.roles = [];
    },
  },
  getters: {
    isUser: (state) => state.roles.includes("USER"),
    isSeller: (state) => state.roles.includes("SELLER"),
  },
});
