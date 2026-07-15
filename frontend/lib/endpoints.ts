export const API = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  PRODUCT: {
    GET_ALL: (
      params?: {
        category?: string;
        gender?: string;
        search?: string;
        page?: number;
        limit?: number;
      }
    ) => {
      if (!params) return "/api/products";

      const q = new URLSearchParams();

      if (params.category) q.set("category", params.category);
      if (params.gender) q.set("gender", params.gender);
      if (params.search) q.set("search", params.search);
      if (params.page !== undefined) q.set("page", String(params.page));
      if (params.limit !== undefined) q.set("limit", String(params.limit));

      const query = q.toString();
      return query ? `/api/products?${query}` : "/api/products";
    },
    GET_BY_ID: (id: string) => `/api/products/${id}`,
  },
  CATEGORY: {
    GET_ALL: "/api/categories",
    GET_BY_SLUG: (slug: string) => `/api/categories/${slug}`,
  },
  CART: {
    GET: "/api/cart",
    ADD_ITEM: "/api/cart/items",
    UPDATE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
    CLEAR: "/api/cart",
  },
  WISHLIST: {
    GET: "/api/wishlist",
    ADD_ITEM: "/api/wishlist",
    REMOVE_ITEM: (productId: string) => `/api/wishlist/${productId}`,
  },
  PROFILE: {
    GET: "/api/profile",
    UPDATE: "/api/profile",
    ADD_ADDRESS: "/api/profile/address",
    GET_ADDRESSES: "/api/profile/address",
  },
  ORDER: {
    CREATE: "/api/orders",
    GET_ALL: "/api/orders",
    GET_BY_ID: (id: string) => `/api/orders/${id}`,
    ESEWA_INITIATE: "/api/orders/esewa/initiate",
    ESEWA_VERIFY: "/api/orders/esewa/verify",
  },
  ADMIN: {
    PRODUCT: {
      GET_ALL: (
        params?: {
          category?: string;
          gender?: string;
          search?: string;
          page?: number;
          limit?: number;
        }
      ) => {
        if (!params) return "/api/admin/products";

        const q = new URLSearchParams();

        if (params.category) q.set("category", params.category);
        if (params.gender) q.set("gender", params.gender);
        if (params.search) q.set("search", params.search);
        if (params.page !== undefined) q.set("page", String(params.page));
        if (params.limit !== undefined) q.set("limit", String(params.limit));

        const query = q.toString();
        return query ? `/api/admin/products?${query}` : "/api/admin/products";
      },
      CREATE: "/api/admin/products",
      UPDATE: (id: string) => `/api/admin/products/${id}`,
      DELETE: (id: string) => `/api/admin/products/${id}`,
    },
    CATEGORY: {
      CREATE: "/api/admin/categories",
    },
    USER: {
      GET_ALL: "/api/admin/users",
    },
  },
};
