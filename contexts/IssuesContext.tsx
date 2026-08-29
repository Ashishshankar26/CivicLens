import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CivicIssue, CreateIssueInput, NearbyDuplicate } from '@/types/issue';
import {
  getIssues,
  createIssue,
  confirmIssueExists,
  confirmIssueGettingWorse,
  confirmIssueResolved,
  getUserActionState,
} from '@/services/issues/issueService';
import { findNearbyDuplicates } from '@/utils/distance';
import { useAuth } from './AuthContext';

interface IssuesContextType {
  issues: CivicIssue[];
  activeIssues: CivicIssue[];
  resolvedIssues: CivicIssue[];
  myReports: CivicIssue[];
  isLoading: boolean;
  refreshIssues: () => Promise<void>;
  reportIssue: (input: CreateIssueInput) => Promise<CivicIssue>;
  confirmExists: (issueId: string) => Promise<{ success: boolean; newCount: number; message: string }>;
  confirmGettingWorse: (issueId: string) => Promise<{ success: boolean; message: string }>;
  markResolved: (issueId: string, resolvedImageUrl?: string) => Promise<{ success: boolean; isResolved: boolean; message: string }>;
  checkDuplicates: (latitude: number, longitude: number, category: string) => NearbyDuplicate[];
  getIssueById: (id: string) => CivicIssue | undefined;
  checkUserActions: (issueId: string) => Promise<{ hasConfirmed: boolean; hasResolved: boolean }>;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getIssues();
      setIssues(data);
    } catch (err) {
      console.warn('Failed to refresh issues:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshIssues();
  }, [refreshIssues]);

  const activeIssues = issues.filter((i) => i.status === 'active');
  const resolvedIssues = issues.filter((i) => i.status === 'resolved');
  const myReports = user ? issues.filter((i) => i.reportedBy === user.uid) : [];

  const reportIssue = async (input: CreateIssueInput): Promise<CivicIssue> => {
    const userId = user?.uid || 'user-anonymous';
    const userName = user?.displayName || 'Citizen';

    const newIssue = await createIssue(input, userId, userName);
    setIssues((prev) => [newIssue, ...prev.filter((i) => i.id !== newIssue.id)]);
    return newIssue;
  };

  const confirmExists = async (issueId: string) => {
    const userId = user?.uid || 'user-anonymous';
    const res = await confirmIssueExists(issueId, userId);
    if (res.success) {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? {
                ...i,
                confirmationCount: res.newCount,
                priorityScore: Math.min(100, (i.priorityScore || 65) + 5),
              }
            : i
        )
      );
    }
    return res;
  };

  const confirmGettingWorse = async (issueId: string) => {
    const userId = user?.uid || 'user-anonymous';
    const res = await confirmIssueGettingWorse(issueId, userId);
    if (res.success) {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? {
                ...i,
                severity: 'high',
                gettingWorseCount: (i.gettingWorseCount || 0) + 1,
                priorityScore: Math.min(100, (i.priorityScore || 70) + 15),
              }
            : i
        )
      );
    }
    return res;
  };

  const markResolved = async (issueId: string, resolvedImageUrl?: string) => {
    const userId = user?.uid || 'user-anonymous';
    const res = await confirmIssueResolved(issueId, userId, resolvedImageUrl);
    if (res.success) {
      setIssues((prev) =>
        prev.map((i) => {
          if (i.id === issueId) {
            return {
              ...i,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedImageUrl: resolvedImageUrl || i.resolvedImageUrl,
            };
          }
          return i;
        })
      );
    }
    return res;
  };

  const checkDuplicates = (
    latitude: number,
    longitude: number,
    category: string
  ): NearbyDuplicate[] => {
    return findNearbyDuplicates(latitude, longitude, category, issues, 50);
  };

  const getIssueById = (id: string): CivicIssue | undefined => {
    return issues.find((i) => i.id === id);
  };

  const checkUserActions = async (issueId: string) => {
    const userId = user?.uid || 'user-anonymous';
    return getUserActionState(issueId, userId);
  };

  return (
    <IssuesContext.Provider
      value={{
        issues,
        activeIssues,
        resolvedIssues,
        myReports,
        isLoading,
        refreshIssues,
        reportIssue,
        confirmExists,
        confirmGettingWorse,
        markResolved,
        checkDuplicates,
        getIssueById,
        checkUserActions,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
}
