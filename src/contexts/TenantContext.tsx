"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types/firestore';

interface TenantContextValue {
  user: User | null;
  tenantId: string | null;
  loading: boolean;
  firebaseUser: FirebaseUser | null;
}

const TenantContext = createContext<TenantContextValue>({
  user: null,
  tenantId: null,
  loading: true,
  firebaseUser: null,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            setTenantId(userData.tenantId);
          } else {
            console.warn('User document not found in Firestore for:', firebaseUser.uid);
            setUser(null);
            setTenantId(null);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUser(null);
          setTenantId(null);
        }
      } else {
        setUser(null);
        setTenantId(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <TenantContext.Provider value={{ user, tenantId, loading, firebaseUser }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
