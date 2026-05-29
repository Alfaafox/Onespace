import axios from "axios";





const api = axios.create({

  baseURL:
    process.env.NEXT_PUBLIC_API_URL,

  headers: {

    "Content-Type":
      "application/json",

  },

});





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





export const getPages =
  async (
    workspaceId: number
  ) => {

    const response =
      await api.get(
        `/pages?workspace_id=${workspaceId}`
      );

    return response.data;

};





export const createPage =
  async (

    title: string,

    content: string,

    workspace_id: number,

    parent_page_id:
      number | null

  ) => {

    const response =
      await api.post(
        "/pages",
        {

          title,

          content,

          workspace_id,

          parent_page_id,

        }
      );

    return response.data;

};
