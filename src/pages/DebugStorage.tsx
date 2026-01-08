import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Database } from 'lucide-react';

export default function DebugStorage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<any[]>([]);

  const loadData = () => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      setElections(JSON.parse(stored));
    } else {
      setElections([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('elections');
    loadData();
  };

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Storage</h1>
        
        <div className="flex gap-4">
          <Button onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
            Reload Data
          </Button>
          <Button variant="destructive" onClick={clearStorage}>
            <Trash2 className="w-4 h-4" />
            Clear Storage
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="official-card p-6">
          <h2 className="text-xl font-semibold mb-4">
            <Database className="inline w-5 h-5 mr-2" />
            Elections in Storage: {elections.length}
          </h2>
          
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(elections, null, 2)}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
