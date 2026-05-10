import { useState } from 'react';
import Layout from './components/Layout';
import GearAnimation from './components/GearAnimation';
import PulleySimulator from './components/PulleySimulator';
import MathQuiz from './components/MathQuiz';
import BikeRatio from './components/BikeRatio';
import Recap from './components/Recap';

const MODULES = {
  angrenaje: GearAnimation,
  scripete: PulleySimulator,
  quiz: MathQuiz,
  bicicleta: BikeRatio,
  recap: Recap,
};

export default function App() {
  const [activeModule, setActiveModule] = useState('angrenaje');
  const ActiveComponent = MODULES[activeModule];

  return (
    <Layout activeModule={activeModule} onModuleChange={setActiveModule}>
      <ActiveComponent />
    </Layout>
  );
}
