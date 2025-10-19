import { useEffect } from 'react';
import TodoList from './components/TodoList';
import Logger from './observability/logger';
import { initializeTracing } from './observability/tracing';
import { initPerformanceMonitoring } from './observability/performance';
import './App.css';

const logger = new Logger('App');

function App() {
  useEffect(() => {
    // Initialize observability
    logger.info('Application starting...');
    
    try {
      initializeTracing();
      initPerformanceMonitoring();
      logger.info('Observability initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize observability', { error: error.message });
    }

    logger.info('Application ready');
  }, []);

  return (
    <div className="App">
      <TodoList />
    </div>
  );
}

export default App;
