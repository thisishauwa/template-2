"use client";

import React, { createContext, useEffect, useState, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { migrateUserData } from "../firebase/migrationUtils";

interface MigrationContextType {
  hasMigrated: boolean;
  isLoading: boolean;
  migrationComplete: boolean;
  migrationError: Error | null;
}

const MigrationContext = createContext<MigrationContextType>({
  hasMigrated: false,
  isLoading: true,
  migrationComplete: false,
  migrationError: null,
});

export function MigrationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [hasMigrated, setHasMigrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't attempt migration until auth is loaded and we have a user
    if (loading || !user) {
      return;
    }

    const attemptMigration = async () => {
      // Check if migration has been done already
      const migrationFlag = localStorage.getItem(`feelingFlicks_migrated_${user.uid}`);
      if (migrationFlag === 'true') {
        setHasMigrated(true);
        setIsLoading(false);
        setMigrationComplete(true);
        return;
      }

      setIsLoading(true);
      
      try {
        // Attempt data migration
        await migrateUserData(user);
        
        // Mark migration as complete
        localStorage.setItem(`feelingFlicks_migrated_${user.uid}`, 'true');
        setHasMigrated(true);
        setMigrationComplete(true);
        
        console.log("Data migration completed successfully");
      } catch (error) {
        console.error("Error during data migration:", error);
        setMigrationError(error instanceof Error ? error : new Error("Unknown migration error"));
      } finally {
        setIsLoading(false);
      }
    };

    attemptMigration();
  }, [user, loading]);

  return (
    <MigrationContext.Provider
      value={{
        hasMigrated,
        isLoading,
        migrationComplete,
        migrationError,
      }}
    >
      {children}
    </MigrationContext.Provider>
  );
}

export const useMigration = () => useContext(MigrationContext);

export { MigrationContext }; 