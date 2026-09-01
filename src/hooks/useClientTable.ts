import {
  deleteClientAction,
  updateClientAction,
} from '@/app/actions/client.actions';
import { ClientInput } from '@/schemas/client.schema';
import { Client } from '@prisma/client';
import { useMemo, useState } from 'react';
import { useAction } from './useAction';

export function useClientTable(clients: Client[]) {

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isPending, executionAction } = useAction();

  const onUpdate = (id: string, data: ClientInput) =>
    executionAction(updateClientAction(id, data), () => setEditingClient(null));

  const onDelete = () => {
    if (deletingClient) {
      executionAction(deleteClientAction(deletingClient.id), () =>
        setDeletingClient(null),
      );
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const lowercasedTerm = searchTerm.toLowerCase();

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercasedTerm) ||
        client.nip.includes(lowercasedTerm),
    );
  }, [clients, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredClients,
    editingClient,
    setEditingClient,
    deletingClient,
    setDeletingClient,
    isPending,
    onUpdate,
    onDelete,
  };
}
