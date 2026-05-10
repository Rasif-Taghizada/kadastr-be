export const ROUTES = {
  AUTH: 'auth',
  USERS: 'users',
  UPLOAD: 'upload',
  GIS: 'gis',
} as const;

// Full endpoint map — single source of truth for all API paths
// Base prefix (versioning adds /v1/ automatically): /v1/<route>
export const ENDPOINTS = {
  auth: {
    register: `/${ROUTES.AUTH}/register`,      // POST  — public
    login: `/${ROUTES.AUTH}/login`,            // POST  — public
    logout: `/${ROUTES.AUTH}/logout`,          // POST  — protected
    me: `/${ROUTES.AUTH}/me`,                  // GET   — protected (redirects to users.me)
  },
  users: {
    me: `/${ROUTES.USERS}/me`,                 // GET   — protected
    list: `/${ROUTES.USERS}`,                  // GET   — protected
    byId: (id: string) => `/${ROUTES.USERS}/${id}`,        // GET   — protected
    delete: (id: string) => `/${ROUTES.USERS}/${id}`,      // DELETE — protected
  },
  gis: {
    features: `/${ROUTES.GIS}/features`,                               // GET   — protected
    save: `/${ROUTES.GIS}/features/save`,                              // POST  — protected
    upload: `/${ROUTES.GIS}/features/upload`,                          // POST  — protected
    batchDelete: `/${ROUTES.GIS}/features/batch`,                      // DELETE — protected
    deleteById: (id: string) => `/${ROUTES.GIS}/features/${id}`,       // DELETE — protected
  },
} as const;
