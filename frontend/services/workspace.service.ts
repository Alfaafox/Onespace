import axios from "axios";



/* =========================
   AXIOS INSTANCE
========================= */

const api = axios.create({

  baseURL:
    process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type":
      "application/json",
  },

});





/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(

  (config) => {

    if (
      typeof window !== "undefined"
    ) {

      const token =
        localStorage.getItem(
          "token"
        );

      if (token) {

        config.headers.Authorization =
          `Bearer ${token}`;

      }

    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);





/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    if (
      error.response?.status === 401
    ) {

      if (
        typeof window !== "undefined"
      ) {

        localStorage.removeItem(
          "token"
        );

        window.location.href =
          "/login";

      }

    }

    return Promise.reject(error);

  }

);





/* =========================
   GET WORKSPACES
========================= */

export const getWorkspaces =
  async () => {

    const response =
      await api.get(
        "/workspaces"
      );

    return response.data;

};





/* =========================
   CREATE WORKSPACE
========================= */

export const createWorkspace =
  async (
    name: string,
    description: string
  ) => {

    const response =
      await api.post(
        "/workspaces",
        {
          name,
          description,
        }
      );

    return response.data;

};
