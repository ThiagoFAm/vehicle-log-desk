// Lightweight shim that adapts supabase-like calls to the local Flask API
// This is a temporary compatibility layer so the frontend code that expects
// `supabase.from(...).select().insert().update().delete().eq()` keeps working
// while we migrate to our Python backend.

type MaybeError = { data?: any; error?: any };

const mapFrontendToBackend = (obj: any) => {
  // frontend uses owner_name, extension, department, color
  // backend expects name, ramal, setor, cor
  const mapped: any = { ...obj };
  if ('owner_name' in obj) mapped.name = obj.owner_name;
  if ('extension' in obj) mapped.ramal = obj.extension;
  if ('department' in obj) mapped.setor = obj.department;
  if ('color' in obj) mapped.cor = obj.color;
  return mapped;
};

// Subscribers for auth state changes
const authSubscribers = new Set<any>();

const mapBackendToFrontend = (d: any) => {
  if (!d) return d;
  return {
    ...d,
    owner_name: d.name ?? d.owner_name,
    extension: d.ramal ?? d.extension,
    department: d.setor ?? d.department,
    color: d.cor ?? d.color,
  };
};

export const supabase = {
  auth: {
    // Lightweight in-memory auth simulation so frontend routing behaves.
    // Persists a tiny session in localStorage under 'supabase_session'.
    async getSession() {
      const session = JSON.parse(localStorage.getItem('supabase_session') || 'null');
      return { data: { session } };
    },
    onAuthStateChange(callback: any) {
      // Store subscribers and return an object compatible with supabase API
      authSubscribers.add(callback);
      const subscription = {
        unsubscribe: () => authSubscribers.delete(callback),
      };
      return { data: { subscription } };
    },
    async signInWithPassword({ email }: { email?: string } = {}) {
      // Create a fake session and persist
      const session = { user: { id: 'local-user', email: email || 'user@local' } };
      localStorage.setItem('supabase_session', JSON.stringify(session));
      // notify subscribers
      authSubscribers.forEach((cb) => cb('SIGNED_IN', session));
      return { data: { session }, error: null };
    },
    async signUp({ email }: { email?: string } = {}) {
      const session = { user: { id: 'local-user', email: email || 'user@local' } };
      localStorage.setItem('supabase_session', JSON.stringify(session));
      authSubscribers.forEach((cb) => cb('SIGNED_UP', session));
      return { data: { session }, error: null };
    },
    async signOut() {
      localStorage.removeItem('supabase_session');
      authSubscribers.forEach((cb) => cb('SIGNED_OUT', null));
      return { data: null, error: null };
    },
  },

  from(table: string) {
  const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

    return {
      async select(_cols?: string) {
        try {
          const res = await fetch(`${baseUrl}/${table}`);
          const data = await res.json();
          // map backend fields to frontend shape if necessary
          const mapped = Array.isArray(data)
            ? data.map((d: any) => mapBackendToFrontend(d))
            : mapBackendToFrontend(data);
          return { data: mapped, error: null } as MaybeError;
        } catch (e) {
          return { data: null, error: e } as MaybeError;
        }
      },

      async insert(payload: any) {
        try {
          const body = Array.isArray(payload) ? payload.map(mapFrontendToBackend) : mapFrontendToBackend(payload);
          const res = await fetch(`${baseUrl}/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          return { data: [data], error: null } as MaybeError;
        } catch (e) {
          return { data: null, error: e } as MaybeError;
        }
      },

      update(payload: any) {
        // return an object with eq method
        return {
          eq: async (field: string, value: any) => {
            try {
              const mapped = mapFrontendToBackend(payload);
              const res = await fetch(`${baseUrl}/${table}/${value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mapped),
              });
              const data = await res.json();
              return { data: [data], error: null } as MaybeError;
            } catch (e) {
              return { data: null, error: e } as MaybeError;
            }
          },
        };
      },

      delete() {
        return {
          eq: async (field: string, value: any) => {
            try {
              const res = await fetch(`${baseUrl}/${table}/${value}`, {
                method: 'DELETE',
              });
              const data = await res.json();
              return { data, error: null } as MaybeError;
            } catch (e) {
              return { data: null, error: e } as MaybeError;
            }
          },
        };
      },

      order() {
        // no-op for now; keep chainable
        return this;
      },
    };
  },
};

export default supabase;
