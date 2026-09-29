import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { IncidentCenterPage } from './pages/IncidentCenterPage';
import { GuardianMemoryPage } from './pages/GuardianMemoryPage';
import { AIGuardianPage } from './pages/AIGuardianPage';
import { ServerDetailsPage } from './pages/ServerDetailsPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { AzureIntegrationModal } from './components/AzureIntegrationModal';
import { api } from './api';
import { DashboardData, MonitoringData } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedServerId, setSelectedServerId] = useState<string>('DC-SRV-024');
  const [selectedMemoryNum, setSelectedMemoryNum] = useState<number | null>(null);
  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');
  const [aiTargetServer, setAiTargetServer] = useState<string>('');
  const [azureModalOpen, setAzureModalOpen] = useState(false);

  // Live Telemetry states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLiveTelemetry = async () => {
    try {
      const [dash, mon] = await Promise.all([
        api.getDashboard(),
        api.getMonitoring()
      ]);
      setDashboardData(dash);
      setMonitoringData(mon);
    } catch (err) {
      console.error('Error fetching live telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    // Poll telemetry periodically every 4 seconds for live animation
    const interval = setInterval(() => {
      fetchLiveTelemetry();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for cross-page interactions
  const handleSelectServer = (serverId: string) => {
    setSelectedServerId(serverId);
    setActiveTab('server-details');
  };

  const handleSelectIncident = (incidentId: string) => {
    setActiveTab('incidents');
  };

  const handleSelectMemory = (memoryNum: number) => {
    setSelectedMemoryNum(memoryNum);
    setActiveTab('memory');
  };

  const handleInvestigateAI = (query: string, serverId?: string) => {
    setAiInitialQuery(query);
    setAiTargetServer(serverId || '');
    setActiveTab('ai-guardian');
  };

  const handleRunSimulation = (serverId: string) => {
    setSelectedServerId(serverId);
    setActiveTab('simulator');
  };

  return (
    <div className="flex w-full min-h-screen bg-[#060911] text-slate-100 overflow-x-hidden font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedServerId={selectedServerId}
        openAzureModal={() => setAzureModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060911]">
        {/* Sticky Top Bar with Live Search & System Operational Pill */}
        <TopBar
          onSelectServer={handleSelectServer}
          onSelectIncident={handleSelectIncident}
          onSelectMemory={handleSelectMemory}
          openAzureModal={() => setAzureModalOpen(true)}
        />

        {/* View Page Router */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              data={dashboardData}
              loading={loading}
              onSelectServer={handleSelectServer}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'monitoring' && (
            <LiveMonitoringPage
              data={monitoringData}
              loading={loading}
              onSelectServer={handleSelectServer}
              onNavigateTab={setActiveTab}
              onRefresh={fetchLiveTelemetry}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentCenterPage
              onInvestigateAI={handleInvestigateAI}
              onSelectServer={handleSelectServer}
            />
          )}

          {activeTab === 'memory' && (
            <GuardianMemoryPage
              onInvestigateAI={handleInvestigateAI}
              onSelectServer={handleSelectServer}
              selectedMemoryNum={selectedMemoryNum}
            />
          )}

          {activeTab === 'ai-guardian' && (
            <AIGuardianPage
              initialQuery={aiInitialQuery}
              initialServerId={aiTargetServer}
              onSelectServer={handleSelectServer}
              onSelectMemory={handleSelectMemory}
            />
          )}

          {activeTab === 'server-details' && (
            <ServerDetailsPage
              serverId={selectedServerId}
              onSelectServer={setSelectedServerId}
              onInvestigateAI={handleInvestigateAI}
              onRunSimulation={handleRunSimulation}
              onViewIncidents={() => setActiveTab('incidents')}
            />
          )}

          {activeTab === 'simulator' && (
            <WhatIfSimulatorPage
              initialServerId={selectedServerId}
              onInvestigateAI={handleInvestigateAI}
            />
          )}
        </main>
      </div>

      {/* Azure Stack Integration Inspection Modal */}
      <AzureIntegrationModal
        isOpen={azureModalOpen}
        onClose={() => setAzureModalOpen(false)}
      />
    </div>
  );
}

export default App;
