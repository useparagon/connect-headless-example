import { useContext } from 'react';
import { createContext } from 'react';

type CredentialProviderState = {
  selectedCredentialId: string | undefined;
};

const initialState: CredentialProviderState = {
  selectedCredentialId: undefined,
};

export const CredentialProviderContext =
  createContext<CredentialProviderState>(initialState);

export function useCredential() {
  const context = useContext(CredentialProviderContext);

  if (context === undefined) {
    throw new Error('useCredential must be used within a CredentialProvider');
  }

  return context;
}
