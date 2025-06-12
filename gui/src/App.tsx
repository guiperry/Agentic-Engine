import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <Router>
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
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agents" element={<AgentManager />} />
              <Route path="/capabilities" element={<CapabilityStore />} />
              <Route path="/targets" element={<TargetManager />} />
              <Route path="/orchestrator" element={<InferenceOrchestrator />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;