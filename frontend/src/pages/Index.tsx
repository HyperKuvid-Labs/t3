
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import LandingPage from '@/components/LandingPage';
import ChatInterface from '@/components/ChatInterface';
import AIRoom from '@/components/AIRoom';
import ProjectBuilder from '@/components/ProjectBuilder';
import Footer from '@/components/Footer';

const Index = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <LandingPage />;
      case 'chat':
        return <ChatInterface />;
      case 'room':
        return <AIRoom />;
      case 'builder':
        return <ProjectBuilder />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-neon-dark flex flex-col">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className={`flex-1 ${currentView !== 'home' ? 'pt-16' : ''}`}>
        {renderCurrentView()}
      </div>
      {currentView === 'home' && <Footer />}
    </div>
  );
};

export default Index;
