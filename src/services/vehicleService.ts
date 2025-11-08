const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

type FrontendVehicle = {
  id?: number | string;
  owner_name?: string;
  extension?: string;
  department?: string;
  plate?: string;
  model?: string;
  color?: string;
};

const mapToBackend = (v: FrontendVehicle) => ({
  name: v.owner_name,
  ramal: v.extension,
  setor: v.department,
  plate: v.plate,
  model: v.model,
  cor: v.color,
});

const mapToFrontend = (b: any): FrontendVehicle => {
  if (!b) return b;
  return {
    id: b.id,
    owner_name: b.name ?? b.owner_name,
    extension: b.ramal ?? b.extension,
    department: b.setor ?? b.department,
    plate: b.plate,
    model: b.model,
    color: b.cor ?? b.color,
  };
};

export const vehicleService = {
  async getVehicles() {
    const res = await fetch(`${API_URL}/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapToFrontend) : [];
  },

  async createVehicle(v: FrontendVehicle) {
    const body = mapToBackend(v);
    const res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to create vehicle');
    }
    const data = await res.json();
    return mapToFrontend(data);
  },

  async updateVehicle(id: number | string, v: FrontendVehicle) {
    const body = mapToBackend(v);
    const res = await fetch(`${API_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to update vehicle');
    }
    const data = await res.json();
    return mapToFrontend(data);
  },

  async deleteVehicle(id: number | string) {
    const res = await fetch(`${API_URL}/vehicles/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to delete vehicle');
    }
    return await res.json();
  },
};

export default vehicleService;
