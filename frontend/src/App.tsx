import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ResearchOverviewPage } from './pages/ResearchOverviewPage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';
import { RadioAnalysisPage } from './pages/RadioAnalysisPage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { DataFusionLabPage } from './pages/DataFusionLabPage';
import { QuantumMLLabPage } from './pages/QuantumMLLabPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { TargetDetectionPage } from './pages/TargetDetectionPage';
import { ExperimentResultsPage } from './pages/ExperimentResultsPage';
import { ResearchInsightsPage } from './pages/ResearchInsightsPage';
import { AboutResearchPage } from './pages/AboutResearchPage';
import { fetchDatasetSummary } from './services/api';
import { DatasetSummary } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);

  useEffect(() => {
    fetchDatasetSummary()
      .then(data => setDatasetSummary(data))
      .catch(err => console.error('Error initializing dataset info:', err));
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ResearchOverviewPage onNavigate={setActiveTab} datasetStats={datasetSummary} />;
      case 'dataset':
        return <DatasetExplorerPage onDatasetUpdated={setDatasetSummary} />;
      case 'radio':
        return <RadioAnalysisPage />;
      case 'image':
        return <ImageAnalysisPage />;
      case 'fusion':
        return <DataFusionLabPage />;
      case 'quantum':
        return <QuantumMLLabPage />;
      case 'comparison':
        return <ModelComparisonPage />;
      case 'detection':
        return <TargetDetectionPage />;
      case 'experiments':
        return <ExperimentResultsPage />;
      case 'insights':
        return <ResearchInsightsPage />;
      case 'about':
        return <AboutResearchPage />;
      default:
        return <ResearchOverviewPage onNavigate={setActiveTab} datasetStats={datasetSummary} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header activeTab={activeTab} datasetType={datasetSummary?.dataset_type} />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
