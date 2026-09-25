import { Header } from './components/Layout/Header';
import { ToastContainer } from './components/Toast/Toast';
import { GeneratorPage } from './pages/GeneratorPage';
import { FooterCredits } from './components/Footer/FooterCredits';

function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <ToastContainer />
      <main style={{ flex: 1, padding: '80px var(--space-6) var(--space-6)', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <GeneratorPage />
      </main>
      <FooterCredits />
    </div>
  );
}

export default App;
