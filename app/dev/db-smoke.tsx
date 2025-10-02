import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { runSqliteSmokeTest } from '@/src/db/sqlite';

type Status = 'idle' | 'running' | 'success' | 'error';

const STATUS_COLORS: Record<Status, string> = {
  idle: '#64748b',
  running: '#f97316',
  success: '#16a34a',
  error: '#dc2626',
};

export default function DbSmokeScreen() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState(
    'Run the smoke test to validate SQLite migrations and CRUD helpers.'
  );

  const runTest = async () => {
    setStatus('running');
    setMessage('Running migrations and smoke inserts...');
    try {
      await runSqliteSmokeTest();
      setStatus('success');
      setMessage('SQLite smoke test passed. Schema and helpers look good.');
    } catch (error) {
      console.error('[sqlite] Smoke test failed', error);
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unexpected error. Check Metro logs for full details.'
      );
    }
  };

  useEffect(() => {
    if (__DEV__) {
      runTest();
    }
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      style={{ backgroundColor: '#0f172a' }}>
      <View
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 28,
          backgroundColor: '#ffffff',
          padding: 24,
          gap: 16,
        }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>SQLite Smoke Test</Text>
        <Text style={{ fontSize: 16, lineHeight: 22, color: '#334155' }}>{message}</Text>
        <View
          style={{
            borderRadius: 16,
            padding: 12,
            backgroundColor: STATUS_COLORS[status],
          }}>
          <Text style={{ textAlign: 'center', fontWeight: '600', color: '#f8fafc' }}>{status}</Text>
        </View>
        <Text
          onPress={runTest}
          style={{
            textAlign: 'center',
            fontWeight: '600',
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: '#2563eb',
            color: '#f8fafc',
          }}>
          Run Again
        </Text>
      </View>
    </ScrollView>
  );
}
