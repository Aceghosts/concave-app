'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, DbClient } from '@/lib/supabase';

export interface Client {
  id: string;
  name: string;
  industry: string;
  metaConnected: boolean;
}

function fromDb(row: DbClient): Client {
  return { id: row.id, name: row.name, industry: row.industry, metaConnected: row.meta_connected };
}

interface ClientContextValue {
  clients: Client[];
  activeClient: Client | null;
  loading: boolean;
  setActiveClient: (c: Client | null) => void;
  addClient: (name: string, industry: string) => Promise<Client>;
  removeClient: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  function loadFromLocalStorage(): Client[] {
    try {
      return JSON.parse(localStorage.getItem('concave-clients') || '[]');
    } catch { return []; }
  }

  function saveToLocalStorage(list: Client[]) {
    localStorage.setItem('concave-clients', JSON.stringify(list));
  }

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const mapped = data.map(fromDb);
        setClients(mapped);
        saveToLocalStorage(mapped);
        setActiveClient(prev => {
          if (prev && mapped.find(c => c.id === prev.id)) return prev;
          return mapped[0] ?? null;
        });
      } else {
        // Supabase unavailable — fall back to localStorage
        const local = loadFromLocalStorage();
        setClients(local);
        setActiveClient(local[0] ?? null);
      }
    } catch {
      // Network error — fall back to localStorage
      const local = loadFromLocalStorage();
      setClients(local);
      setActiveClient(local[0] ?? null);
    }
    setLoading(false);
  }

  useEffect(() => { fetchClients(); }, []);

  async function addClient(name: string, industry: string): Promise<Client> {
    const client: Client = {
      id: crypto.randomUUID(),
      name: name.trim(),
      industry,
      metaConnected: false,
    };

    // Try Supabase first, fall back to localStorage
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({ name: client.name, industry, meta_connected: false })
        .select()
        .single();
      if (!error && data) {
        const saved = fromDb(data as DbClient);
        setClients(prev => {
          const updated = [...prev, saved];
          if (updated.length === 1) setActiveClient(saved);
          saveToLocalStorage(updated);
          return updated;
        });
        return saved;
      }
    } catch { /* fall through to localStorage */ }

    // localStorage fallback
    setClients(prev => {
      const updated = [...prev, client];
      if (updated.length === 1) setActiveClient(client);
      saveToLocalStorage(updated);
      return updated;
    });
    return client;
  }

  async function removeClient(id: string) {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch { /* fall through */ }

    setClients(prev => {
      const updated = prev.filter(c => c.id !== id);
      setActiveClient(cur => (cur?.id === id ? (updated[0] ?? null) : cur));
      saveToLocalStorage(updated);
      return updated;
    });
  }

  return (
    <ClientContext.Provider value={{ clients, activeClient, loading, setActiveClient, addClient, removeClient, refetch: fetchClients }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClients must be used inside ClientProvider');
  return ctx;
}
