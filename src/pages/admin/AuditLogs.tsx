
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, Search, Calendar, Loader2 } from 'lucide-react';
import { AuditLog } from '@/integrations/supabase/custom-types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('');
  const [tableFilter, setTableFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  
  useEffect(() => {
    fetchAuditLogs();
  }, [sortField, sortDirection, actionTypeFilter, tableFilter]);
  
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (actionTypeFilter) {
        query = query.eq('action_type', actionTypeFilter);
      }
      
      if (tableFilter) {
        query = query.eq('table_name', tableFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Fetch user emails for all user IDs in the logs
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(log => log.user_id))];
        await fetchUserEmails(userIds);
        
        // Properly type the data to match our AuditLog interface
        const typedData: AuditLog[] = data.map(log => ({
          id: log.id,
          action_type: log.action_type,
          table_name: log.table_name,
          record_id: log.record_id,
          old_values: log.old_values,
          new_values: log.new_values,
          user_id: log.user_id,
          created_at: log.created_at,
          ip_address: log.ip_address,
          user_email: userEmails[log.user_id] || undefined
        }));
        
        setLogs(typedData);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserEmails = async (userIds: string[]) => {
    try {
      // Since profiles doesn't have email field directly, we'll use full_name for now
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name');
      
      if (error) {
        throw error;
      }
      
      const emailMap: Record<string, string> = {};
      data?.forEach(user => {
        // Use full_name as a stand-in for email
        emailMap[user.id] = user.full_name || 'Unknown';
      });
      
      setUserEmails(emailMap);
    } catch (error) {
      console.error('Error fetching user emails:', error);
    }
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };
  
  const filteredLogs = logs.filter(log => {
    const searchableValues = [
      log.action_type,
      log.table_name,
      log.record_id,
      JSON.stringify(log.old_values),
      JSON.stringify(log.new_values),
      log.user_id,
      userEmails[log.user_id] || '',
    ].join(' ').toLowerCase();
    
    return searchableValues.includes(searchTerm.toLowerCase());
  });
  
  const renderValueChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return 'No changes';
    
    if (!oldValues) {
      return <pre className="text-xs max-w-md overflow-auto">{JSON.stringify(newValues, null, 2)}</pre>;
    }
    
    if (!newValues) {
      return <pre className="text-xs max-w-md overflow-auto">{JSON.stringify(oldValues, null, 2)}</pre>;
    }
    
    const changes = [];
    
    // Find changed values
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          key,
          old: oldValues[key],
          new: newValues[key],
        });
      }
    }
    
    return (
      <div className="text-xs max-w-md overflow-auto">
        {changes.length === 0 ? (
          <span>No changes detected</span>
        ) : (
          changes.map((change, index) => (
            <div key={index} className="mb-1">
              <strong>{change.key}:</strong>{' '}
              <span className="text-red-500">{JSON.stringify(change.old)}</span>{' '}
              → {' '}
              <span className="text-green-500">{JSON.stringify(change.new)}</span>
            </div>
          ))
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <Button onClick={fetchAuditLogs}>Refresh</Button>
      </div>
      
      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {[...new Set(logs.map(log => log.action_type))].map(action => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tables</SelectItem>
              {[...new Set(logs.map(log => log.table_name))].map(table => (
                <SelectItem key={table} value={table}>
                  {table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No audit logs found</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <button 
                      className="flex items-center" 
                      onClick={() => handleSort('created_at')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Timestamp
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-4 w-4" /> : 
                          <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center" 
                      onClick={() => handleSort('action_type')}
                    >
                      Action
                      {sortField === 'action_type' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-4 w-4" /> : 
                          <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center" 
                      onClick={() => handleSort('table_name')}
                    >
                      Table
                      {sortField === 'table_name' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-4 w-4" /> : 
                          <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.filter(log => {
                  const searchableValues = [
                    log.action_type,
                    log.table_name,
                    log.record_id,
                    JSON.stringify(log.old_values),
                    JSON.stringify(log.new_values),
                    log.user_id,
                    userEmails[log.user_id] || '',
                  ].join(' ').toLowerCase();
                  
                  return searchableValues.includes(searchTerm.toLowerCase());
                }).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.action_type === 'INSERT' ? 'bg-green-100 text-green-800' : 
                        log.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 
                        log.action_type === 'DELETE' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action_type}
                      </span>
                    </TableCell>
                    <TableCell>{log.table_name}</TableCell>
                    <TableCell className="font-mono text-xs">{log.record_id}</TableCell>
                    <TableCell>
                      {renderValueChanges(log.old_values, log.new_values)}
                    </TableCell>
                    <TableCell>{userEmails[log.user_id] || log.user_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
