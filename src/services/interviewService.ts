import { useApi } from '../context/AuthContext';
import { useCallback } from 'react';

export interface SessionData {
  aptitudeScore: number;
  technicalCode: string;
  technicalLanguage: string;
  technicalTestResults: { name: string; passed: boolean }[];
  hrResponse: string;
  totalTimeUsed: number;
  type?: string;
}

export function useInterviewService() {
  const authFetch = useApi();

  const generateReport = useCallback(async (data: SessionData) => {
    return authFetch('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [authFetch]);

  const saveSession = useCallback(async (sessionData: SessionData, reportData: any) => {
    return authFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        session_data: sessionData,
        report_data: reportData
      }),
    });
  }, [authFetch]);

  const getRecentSessions = useCallback(async () => {
    return authFetch('/api/sessions');
  }, [authFetch]);

  return { generateReport, saveSession, getRecentSessions };
}
