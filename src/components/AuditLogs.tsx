import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, ShieldAlert } from 'lucide-react';
import apiClient from '../../utils/apiClient';

export default function AuditLogs() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => (await apiClient.get('/audit')).data,
  });
  const logs = response?.data || [];

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
      <div>
        <h1
          className="text-2xl font-bold flex items-center gap-2"
          style={{ color: 'var(--secondary)' }}
        >
          <History size={28} className="text-primary" /> Audit Trails
        </h1>
        <p className="text-muted mt-1">Immutable ledger of all critical operations globally.</p>
      </div>

      <div className="card flex-1 overflow-hidden p-0">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Timestamp</th>
              <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Action</th>
              <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Entity</th>
              <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Details</th>
              <th className="p-4 font-semibold text-gray-500 text-xs uppercase">User ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-xs font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.action === 'CREATE' ? 'bg-green-100 text-green-700' : log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-sm text-gray-700">{log.entity}</td>
                  <td className="p-4 text-sm text-gray-600">{log.details}</td>
                  <td className="p-4 font-mono text-xs">{log.userId || 'System'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
