import { observable } from "mobx";

export const authStore = observable({
  isLoggedIn: false,

  async login(id, password) {
    return new Promise((resolve) => {
      if (id === "admin" && password === "admin") {
        this.isLoggedIn = true;
      } else this.isLoggedIn = false;

      resolve(this.isLoggedIn);
    });
  },

  async logout() {
    return new Promise((resolve) => {
      this.isLoggedIn = false;
      resolve(true);
    });
  },
});
