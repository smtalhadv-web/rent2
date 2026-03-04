import { supabase } from './supabase';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'sql-server' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  createdAt: string;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
}

/**
 * Builds a connection string based on database type
 */
export function buildConnectionString(connection: Omit<DatabaseConnection, 'id' | 'createdAt'>): string {
  const { type, host, port, database, username } = connection;
  
  switch (type) {
    case 'mysql':
      return `mysql://${username}@${host}:${port}/${database}`;
    case 'postgresql':
      return `postgresql://${username}@${host}:${port}/${database}`;
    case 'sql-server':
      return `mssql://${username}@${host}:${port}/${database}`;
    case 'sqlite':
      return `sqlite:///${database}`;
    default:
      return '';
  }
}

/**
 * Validates connection parameters
 */
export function validateConnectionString(connection: Omit<DatabaseConnection, 'id' | 'createdAt'>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { name, type, host, port, database, username } = connection;
  
  if (!name || name.trim() === '') {
    errors.push('Connection name is required');
  }
  
  if (!type) {
    errors.push('Database type is required');
  }
  
  if (!database || database.trim() === '') {
    errors.push('Database name is required');
  }
  
  if (type !== 'sqlite') {
    if (!username || username.trim() === '') {
      errors.push('Username is required for this database type');
    }
    if (!host || host.trim() === '') {
      errors.push('Host is required for this database type');
    }
    if (port < 1 || port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Store database connection in Supabase (with localStorage fallback)
 */
export async function saveDatabaseConnection(
  connection: Omit<DatabaseConnection, 'id' | 'createdAt'>
): Promise<{ success: boolean; message: string; connectionId?: string }> {
  try {
    // Validate connection first
    const validation = validateConnectionString(connection);
    if (!validation.valid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    console.log('[v0] Attempting to save connection to Supabase...');

    // Try to store in Supabase
    const { data, error } = await supabase
      .from('database_connections')
      .insert([
        {
          name: connection.name,
          type: connection.type,
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('[v0] Supabase error (using localStorage fallback):', error.message);
      
      // Fallback to localStorage if table doesn't exist or not authenticated
      try {
        const newConnection: DatabaseConnection = {
          id: Math.random().toString(36).substring(2, 11),
          ...connection,
          createdAt: new Date().toISOString(),
        };
        
        const existing = JSON.parse(localStorage.getItem('databaseConnections') || '[]');
        existing.push(newConnection);
        localStorage.setItem('databaseConnections', JSON.stringify(existing));
        
        console.log('[v0] Connection saved to localStorage');
        return {
          success: true,
          message: 'Connection saved locally (Supabase not available)',
          connectionId: newConnection.id,
        };
      } catch (localError) {
        console.error('[v0] localStorage fallback error:', localError);
        return {
          success: false,
          message: `Failed to save connection: ${error.message}`,
        };
      }
    }

    if (data && data.length > 0) {
      console.log('[v0] Connection saved to Supabase');
      return {
        success: true,
        message: 'Database connection saved successfully',
        connectionId: data[0].id,
      };
    }

    return {
      success: false,
      message: 'Failed to save connection - no data returned',
    };
  } catch (error) {
    console.error('[v0] Unexpected error saving connection:', error);
    
    // Final fallback to localStorage
    try {
      const newConnection: DatabaseConnection = {
        id: Math.random().toString(36).substring(2, 11),
        ...connection,
        createdAt: new Date().toISOString(),
      };
      
      const existing = JSON.parse(localStorage.getItem('databaseConnections') || '[]');
      existing.push(newConnection);
      localStorage.setItem('databaseConnections', JSON.stringify(existing));
      
      return {
        success: true,
        message: 'Connection saved locally',
        connectionId: newConnection.id,
      };
    } catch (localError) {
      return {
        success: false,
        message: `Unexpected error: ${(error as any).message || 'Unknown error'}`,
      };
    }
  }
}

/**
 * Get all database connections from Supabase (with localStorage fallback)
 */
export async function getDatabaseConnections(): Promise<DatabaseConnection[]> {
  try {
    console.log('[v0] Fetching database connections from Supabase...');
    
    const { data, error } = await supabase
      .from('database_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[v0] Error fetching from Supabase (using localStorage fallback):', error.message);
      
      // Fallback to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('databaseConnections') || '[]');
        console.log('[v0] Loaded', local.length, 'connections from localStorage');
        return local;
      } catch (localError) {
        console.error('[v0] localStorage read error:', localError);
        return [];
      }
    }

    const mappedData = data?.map((conn: any) => ({
      id: conn.id,
      name: conn.name,
      type: conn.type,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: conn.username,
      createdAt: conn.created_at,
    })) || [];
    
    console.log('[v0] Loaded', mappedData.length, 'connections from Supabase');
    return mappedData;
  } catch (error) {
    console.error('[v0] Unexpected error fetching connections:', error);
    
    // Final fallback to localStorage
    try {
      const local = JSON.parse(localStorage.getItem('databaseConnections') || '[]');
      console.log('[v0] Loaded', local.length, 'connections from localStorage (fallback)');
      return local;
    } catch (localError) {
      console.error('[v0] localStorage fallback error:', localError);
      return [];
    }
  }
}

/**
 * Delete database connection from Supabase (with localStorage fallback)
 */
export async function deleteDatabaseConnection(connectionId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[v0] Deleting connection:', connectionId);
    
    const { error } = await supabase
      .from('database_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      console.warn('[v0] Error deleting from Supabase (using localStorage fallback):', error.message);
      
      // Fallback to localStorage
      try {
        const connections = JSON.parse(localStorage.getItem('databaseConnections') || '[]');
        const filtered = connections.filter((c: DatabaseConnection) => c.id !== connectionId);
        localStorage.setItem('databaseConnections', JSON.stringify(filtered));
        
        console.log('[v0] Connection deleted from localStorage');
        return {
          success: true,
          message: 'Database connection deleted successfully',
        };
      } catch (localError) {
        console.error('[v0] localStorage delete error:', localError);
        return {
          success: false,
          message: `Failed to delete connection: ${error.message}`,
        };
      }
    }

    console.log('[v0] Connection deleted from Supabase');
    return {
      success: true,
      message: 'Database connection deleted successfully',
    };
  } catch (error) {
    console.error('[v0] Unexpected error deleting connection:', error);
    
    // Final fallback to localStorage
    try {
      const connections = JSON.parse(localStorage.getItem('databaseConnections') || '[]');
      const filtered = connections.filter((c: DatabaseConnection) => c.id !== connectionId);
      localStorage.setItem('databaseConnections', JSON.stringify(filtered));
      
      return {
        success: true,
        message: 'Database connection deleted successfully',
      };
    } catch (localError) {
      return {
        success: false,
        message: `Unexpected error: ${(error as any).message || 'Unknown error'}`,
      };
    }
  }
}

/**
 * Test database connection
 * In a real application, this would call a backend API that attempts to connect to the database
 */
export async function testDatabaseConnection(
  connection: Omit<DatabaseConnection, 'id' | 'createdAt'>
): Promise<ConnectionTestResult> {
  try {
    // First validate the connection string
    const validation = validateConnectionString(connection);
    if (!validation.valid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // In production, you would send this to a backend API
    // This is a simulated check for now
    const connectionString = buildConnectionString(connection);
    console.log('[v0] Testing connection:', connectionString);

    // Simulate connection test
    // In real application, call your backend:
    // const response = await fetch('/api/database/test', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(connection)
    // });

    // For now, return success if validation passes
    return {
      success: true,
      message: `Connection parameters validated. Connection string: ${connectionString}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${(error as any).message || 'Unknown error'}`,
    };
  }
}

/**
 * Execute a query on a database connection (requires backend API)
 * This is a placeholder - implement in your backend
 */
export async function executeQuery(
  connectionId: string,
  query: string
): Promise<{ success: boolean; data?: any[]; message: string }> {
  try {
    // This should call your backend API
    // Example:
    // const response = await fetch('/api/database/query', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ connectionId, query })
    // });
    // return response.json();

    console.log('[v0] Execute query not yet implemented - requires backend API');
    return {
      success: false,
      message: 'Execute query functionality requires backend implementation',
    };
  } catch (error) {
    return {
      success: false,
      message: `Query execution failed: ${(error as any).message || 'Unknown error'}`,
    };
  }
}
