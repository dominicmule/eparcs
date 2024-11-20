export const config = {
  mapbox: {
    publicKey: import.meta.env.VITE_MAPBOX_PUBLIC_KEY,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL,
  },
} as const;