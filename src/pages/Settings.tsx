import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

interface DatabaseConnectionForm {
  name: string;
  type: 'mysql' | 'postgresql' | 'sql-server' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
}

export function Settings() {
  const { settings, updateSettings, databaseConnections, addDatabaseConnection, removeDatabaseConnection, testDatabaseConnection } = useApp();
  
  const [plazaName, setPlazaName] = useState(settings?.plazaName || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [headerText, setHeaderText] = useState(settings?.headerText || '');
  const [footerText, setFooterText] = useState(settings?.footerText || '');
  const [saved, setSaved] = useState(false);

  const [showAddConnection, setShowAddConnection] = useState(false);
  const [connectionForm, setConnectionForm] = useState<DatabaseConnectionForm>({
    name: '',
    type: 'mysql',
    host: '',
    port: 3306,
    database: '',
    username: '',
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    updateSettings({
      plazaName: plazaName,
      address: address,
      phone: phone,
      email: email,
      headerText: headerText,
      footerText: footerText,
      logo: settings?.logo || '',
      whatsappTemplate: settings?.whatsappTemplate || '',
    });
    
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 3000);
  }

  async function handleAddConnection(e: React.FormEvent) {
    e.preventDefault();
    const success = await addDatabaseConnection(connectionForm);
    
    if (success) {
      setConnectionForm({
        name: '',
        type: 'mysql',
        host: '',
        port: 3306,
        database: '',
        username: '',
      });
      setShowAddConnection(false);
      setSaved(true);
      setTimeout(function() { setSaved(false); }, 3000);
    }
  }

  async function handleTestConnection(connectionId: string) {
    setTestingConnection(connectionId);
    const connection = databaseConnections.find((c) => c.id === connectionId);
    
    if (connection) {
      const result = await testDatabaseConnection({
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
      });
      setTestResult({ id: connectionId, ...result });
      setTimeout(() => setTestResult(null), 5000);
    }
    
    setTestingConnection(null);
  }

  async function handleRemoveConnection(connectionId: string) {
    if (window.confirm('Are you sure you want to remove this database connection?')) {
      await removeDatabaseConnection(connectionId);
      setSaved(true);
      setTimeout(function() { setSaved(false); }, 3000);
    }
  }

  function handlePortChange(value: string) {
    const port = parseInt(value) || 3306;
    setConnectionForm({ ...connectionForm, port });
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h1>

        {saved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">🏢 Plaza / Property Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plaza / Property Name *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={plazaName}
                  onChange={function(e) { setPlazaName(e.target.value); }}
                  placeholder="e.g., ABC Commercial Plaza"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={phone}
                  onChange={function(e) { setPhone(e.target.value); }}
                  placeholder="e.g., 0300-1234567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={address}
                  onChange={function(e) { setAddress(e.target.value); }}
                  placeholder="e.g., Main Boulevard, Gulberg, Lahore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value); }}
                  placeholder="e.g., info@plaza.com"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">📄 Invoice / Receipt Templates</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Header Text (appears on invoices)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={headerText}
                  onChange={function(e) { setHeaderText(e.target.value); }}
                  placeholder="e.g., Trusted Property Management Since 2010"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text (appears on receipts)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={footerText}
                  onChange={function(e) { setFooterText(e.target.value); }}
                  placeholder="e.g., Thank you for your payment! For queries contact management."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">📱 Preview</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="text-xl font-bold text-blue-600">{plazaName || 'Plaza Name'}</h3>
              <p className="text-gray-600">{address || 'Address'}</p>
              <p className="text-gray-600">Phone: {phone || 'N/A'} | Email: {email || 'N/A'}</p>
              {headerText && <p className="text-gray-500 text-sm mt-2">{headerText}</p>}
              <hr className="my-4" />
              <p className="text-gray-500 text-sm">{footerText || 'Footer text will appear here'}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            💾 Save Settings
          </button>
        </form>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">🗄️ Database Connections</h2>
          
          {databaseConnections.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Connected Databases</h3>
              <div className="space-y-3">
                {databaseConnections.map((conn) => (
                  <div key={conn.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{conn.name}</h4>
                        <p className="text-sm text-gray-600">{conn.type.toUpperCase()} - {conn.host}:{conn.port}/{conn.database}</p>
                        <p className="text-xs text-gray-500 mt-1">User: {conn.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTestConnection(conn.id)}
                          disabled={testingConnection === conn.id}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                        >
                          {testingConnection === conn.id ? 'Testing...' : 'Test'}
                        </button>
                        <button
                          onClick={() => handleRemoveConnection(conn.id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {testResult?.id === conn.id && (
                      <div className={`mt-3 p-2 rounded text-sm ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowAddConnection(!showAddConnection)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 mb-4"
          >
            {showAddConnection ? '❌ Cancel' : '➕ Add New Connection'}
          </button>

          {showAddConnection && (
            <form onSubmit={handleAddConnection} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-3">New Database Connection</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={connectionForm.name}
                    onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
                    placeholder="e.g., Main Database, Backup DB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database Type *</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={connectionForm.type}
                    onChange={(e) => {
                      const type = e.target.value as 'mysql' | 'postgresql' | 'sql-server' | 'sqlite';
                      const port = type === 'postgresql' ? 5432 : type === 'sql-server' ? 1433 : 3306;
                      setConnectionForm({ ...connectionForm, type, port });
                    }}
                    required
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="sql-server">SQL Server</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>

                {connectionForm.type !== 'sqlite' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={connectionForm.host}
                        onChange={(e) => setConnectionForm({ ...connectionForm, host: e.target.value })}
                        placeholder="e.g., localhost, db.example.com"
                        required={connectionForm.type !== 'sqlite'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port *</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2"
                        value={connectionForm.port}
                        onChange={(e) => handlePortChange(e.target.value)}
                        placeholder="3306"
                        required={connectionForm.type !== 'sqlite'}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database Name *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={connectionForm.database}
                    onChange={(e) => setConnectionForm({ ...connectionForm, database: e.target.value })}
                    placeholder={connectionForm.type === 'sqlite' ? '/path/to/database.db' : 'database_name'}
                    required
                  />
                </div>

                {connectionForm.type !== 'sqlite' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={connectionForm.username}
                      onChange={(e) => setConnectionForm({ ...connectionForm, username: e.target.value })}
                      placeholder="e.g., root, admin"
                      required={connectionForm.type !== 'sqlite'}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  ✅ Add Connection
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddConnection(false)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
