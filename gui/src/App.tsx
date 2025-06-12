import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AgentManager } from './components/AgentManager';
import { CapabilityStore } from './components/CapabilityStore';
import { TargetManager } from './components/TargetManager';
import { InferenceOrchestrator } from './components/InferenceOrchestrator';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';

type ActiveView = 'dashboard' | 'agents' | 'capabilities' | 'targets' | 'orchestrator' | 'analytics' | 'settings';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'agents':
        return <AgentManager />;
      case 'capabilities':
        return <CapabilityStore />;
      case 'targets':
        return <TargetManager />;
      case 'orchestrator':
        return <InferenceOrchestrator />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <main className="flex-1 lg:ml-64">
          <div className="lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;