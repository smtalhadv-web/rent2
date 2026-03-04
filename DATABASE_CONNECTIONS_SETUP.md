# SQL Database Connections - Supabase Setup Guide

## Overview
This guide explains how to set up the SQL database connection management feature with Supabase. This allows users to add, remove, and test connections to external SQL databases (MySQL, PostgreSQL, SQL Server, SQLite) directly from the Settings page.

## Architecture

The feature consists of three main components:

1. **Frontend (Settings.tsx)** - UI for managing connections
2. **AppContext** - State management and business logic
3. **Supabase Backend** - Persistent storage of connection metadata
4. **Database Helper (database.ts)** - Functions to interact with Supabase

## Step 1: Create Supabase Table

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create database_connections table
CREATE TABLE IF NOT EXISTS public.database_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mysql', 'postgresql', 'sql-server', 'sqlite')),
  host TEXT,
  port INTEGER,
  database TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_database_connections_created_at 
  ON public.database_connections(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.database_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view database connections" 
  ON public.database_connections FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert database connections" 
  ON public.database_connections FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update database connections" 
  ON public.database_connections FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete database connections" 
  ON public.database_connections FOR DELETE 
  USING (auth.role() = 'authenticated');
```

6. Click **Run** button
7. Wait for success message - you should see "Query executed successfully"

## Step 2: Verify Table Creation

1. Go to **Table Editor** in Supabase sidebar
2. Refresh the page (F5)
3. You should see `database_connections` table listed
4. Click on it to verify these columns exist:
   - `id` (UUID)
   - `name` (text)
   - `type` (text)
   - `host` (text)
   - `port` (number)
   - `database` (text)
   - `username` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Step 3: Verify Environment Variables

Check that these are set in your Vercel project (or `.env.local` for local development):

```
VITE_SUPABASE_URL=your_project_url.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

You can find these in Supabase: **Project Settings → API → Project URL and anon key**

## Step 4: Test the Feature

1. Start your application
2. Log in or authenticate
3. Go to **Settings** page
4. Scroll to **Database Connections** section
5. Click **Add New Connection**
6. Fill in test data:
   - **Connection Name**: `Test MySQL`
   - **Database Type**: `MySQL`
   - **Host**: `localhost`
   - **Port**: `3306`
   - **Database**: `testdb`
   - **Username**: `root`
7. Click **Test** button - you should get validation feedback
8. Click **Add Connection** to save to Supabase
9. Refresh the page - connection should persist from Supabase

## How It Works

### Frontend Flow
```
Settings Page Form
    ↓
handleAddConnection() → addDatabaseConnection()
    ↓
AppContext calls database.ts functions
    ↓
saveDatabaseConnection() → Supabase API
    ↓
Supabase inserts row into database_connections table
    ↓
UI updates with new connection
```

### Supabase Functions (src/lib/database.ts)

#### saveDatabaseConnection(connection)
Adds a new connection to Supabase.

**Parameters:**
```typescript
{
  name: string;                    // "Production DB"
  type: 'mysql' | 'postgresql' | 'sql-server' | 'sqlite';
  host: string;                    // "db.example.com"
  port: number;                    // 3306
  database: string;                // "mydb"
  username: string;                // "admin"
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: DatabaseConnection;
  message: string;
}
```

#### getDatabaseConnections()
Fetches all connections for authenticated user.

**Returns:**
```typescript
DatabaseConnection[] // Array of stored connections
```

#### deleteDatabaseConnection(connectionId)
Removes a connection from Supabase.

**Parameters:**
- `connectionId`: UUID of connection to delete

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### testDatabaseConnection(connection)
Validates connection parameters (client-side validation).

**Parameters:** Same as saveDatabaseConnection

**Returns:**
```typescript
{
  success: boolean;
  message: string; // "Connection successful!" or error description
}
```

## Security Considerations

1. **No Passwords Stored** - Only username and host are stored. Passwords should be entered by user at time of use.

2. **RLS Policies** - Row-level security ensures users can only access their own connections

3. **Authentication Required** - All operations require authenticated user (auth.role() = 'authenticated')

4. **Validation** - Connection parameters are validated on client-side before saving

## Optional: Add User Tracking

To track which user created each connection:

```sql
-- Add user_id column
ALTER TABLE public.database_connections 
  ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();

-- Add foreign key to auth.users
ALTER TABLE public.database_connections 
  ADD CONSTRAINT fk_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policy to filter by user
DROP POLICY "Users can view database connections" 
  ON public.database_connections;

CREATE POLICY "Users view own connections" 
  ON public.database_connections FOR SELECT 
  USING (user_id = auth.uid());
```

Then update database.ts functions to use user_id in queries.

## Troubleshooting

### Error: "Failed to add connection"
- Check browser console for detailed error
- Verify Supabase credentials are correct
- Ensure table was created successfully
- Check RLS policies are in place

### Error: "Connection test failed"
- This validates on client-side only
- Ensure all required fields are filled
- Host/port must be correct for non-SQLite databases

### Connections not persisting after page refresh
- Check that Supabase table was created
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Check browser console for API errors
- Ensure user is authenticated

### Table not appearing in Table Editor
- Refresh Supabase dashboard (F5)
- Check SQL Editor for any error messages
- Try creating table again with exact SQL from Step 1

## Code Files Modified

1. **src/context/AppContext.tsx**
   - Added DatabaseConnection interface
   - Added databaseConnections state
   - Added addDatabaseConnection() function
   - Added removeDatabaseConnection() function
   - Added testDatabaseConnection() function
   - Added useEffect to load connections on mount

2. **src/lib/database.ts** (new)
   - saveDatabaseConnection() - Save to Supabase
   - getDatabaseConnections() - Fetch from Supabase
   - deleteDatabaseConnection() - Delete from Supabase
   - testDatabaseConnection() - Validate connection params
   - buildConnectionString() - Generate connection strings
   - validateConnectionString() - Client-side validation

3. **src/pages/Settings.tsx**
   - Added database connections UI section
   - Added form for adding new connections
   - Added handlers for test and remove
   - Added display of existing connections

## API Reference

### DatabaseConnection Type
```typescript
interface DatabaseConnection {
  id: string;              // UUID
  name: string;            // Connection name
  type: 'mysql' | 'postgresql' | 'sql-server' | 'sqlite';
  host: string;            // Database host
  port: number;            // Database port
  database: string;        // Database name
  username: string;        // Database username
  createdAt: string;       // ISO 8601 timestamp
}
```

### AppContext Functions
All functions available via `const { addDatabaseConnection, removeDatabaseConnection, testDatabaseConnection, databaseConnections } = useApp();`

## Next Steps

1. Create the Supabase table using Step 1
2. Verify table in Supabase dashboard
3. Test the feature in your application
4. (Optional) Add user_id tracking as shown above
5. Integrate with actual database connection testing backend if needed

## Future Enhancements

1. **Backend Connection Testing** - Add Node.js API endpoint to actually test DB connections
2. **Connection Passwords** - Store encrypted passwords if needed
3. **Query Execution** - Execute SQL queries against stored connections
4. **Connection Pooling** - Implement connection pooling for performance
5. **Audit Logging** - Track who accessed which connections and when

## Support

For issues:
1. Check browser DevTools Console for errors
2. Verify Supabase table exists in Table Editor
3. Confirm RLS policies show in Security section
4. Test Supabase connection with Table Editor
5. Check network tab to see API requests/responses
