import { useState, useEffect } from 'react';
import type { User } from '../types';
import { createUser } from '../api/client';

const STORAGE_KEY = 'hazmat_user';

export function useUser() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveUser = async (data: Omit<User, 'id'>) => {
    try {
      const saved = await createUser(data);
      const userWithId = { ...data, id: saved.id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithId));
      setUser(userWithId);
      return userWithId;
    } catch {
      // Still save locally even if API fails
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUser(data);
      return data;
    }
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, saveUser, clearUser };
}
