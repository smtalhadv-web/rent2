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
CREATE INDEX IF NOT EXISTS idx_database_connections_created_at ON public.database_connections(created_at DESC);

-- Enable RLS (Row Level Security) for security
ALTER TABLE public.database_connections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view connections
CREATE POLICY "Users can view their own database connections" ON public.database_connections
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert connections
CREATE POLICY "Users can insert database connections" ON public.database_connections
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete connections
CREATE POLICY "Users can delete database connections" ON public.database_connections
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update connections
CREATE POLICY "Users can update database connections" ON public.database_connections
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
