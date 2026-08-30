import { useEffect } from 'react';
import HeroSection from './components/HeroSection';
import SimulationSection from './components/SimulationSection';
import NetworkVisualization from './components/NetworkVisualization';
import ExplanationPanel from './components/ExplanationPanel';
import FailureSection from './components/FailureSection';
import InvisibleVisibleSection from './components/InvisibleVisibleSection';
import FinalCTA from './components/FinalCTA';
import SoundToggle from './components/SoundToggle';
import { useSimulation } from './hooks/useSimulation';
import { useSound } from './hooks/useSound';

function App() {
  const sim = useSimulation();
  const sound = useSound();

  // Play sounds on state transitions
  useEffect(() => {
    if (!sound.isMuted) {
      const { state } = sim;
      if (state === 'DEVICE_TO_ROUTER' || state === 'ROUTER_TO_ISP' || 
          state === 'ISP_TO_INTERNET' || state === 'INTERNET_TO_SERVER' || 
          state === 'SERVER_TO_DESTINATION') {
        sound.playHop();
      }
      if (state === 'DELIVERED') {
        sound.playSuccess();
      }
    }
  }, [sim.state]);

  // Play error sound on failure
  useEffect(() => {
    if (sim.toastMessage?.type === 'danger' && !sound.isMuted) {
      sound.playError();
    }
  }, [sim.toastMessage]);

  return (
    <div className="min-h-screen bg-[#05060A]">
      <SoundToggle isMuted={sound.isMuted} toggleMute={sound.toggleMute} />

      <main>
        <HeroSection />

        <SimulationSection
          state={sim.state}
          message={sim.message}
          setMessage={sim.setMessage}
          isRunning={sim.isRunning}
          send={sim.send}
          reset={sim.reset}
          packetsSent={sim.packetsSent}
        >
          <NetworkVisualization
            state={sim.state}
            progress={sim.progress}
            activePath={sim.activePath}
            failedPath={sim.failedPath}
            activeNode={sim.getActiveNode()}
            isRunning={sim.isRunning || sim.state === 'DELIVERED'}
          />
          <ExplanationPanel
            currentStepIndex={sim.getCurrentStepIndex()}
            state={sim.state}
            progress={sim.getOverallProgress()}
            activePath={sim.activePath}
            hops={sim.hops}
            isRunning={sim.isRunning}
            message={sim.message}
          />
        </SimulationSection>

        <FailureSection
          failedPath={sim.failedPath}
          simulateFailure={sim.simulateFailure}
          restoreNetwork={sim.restoreNetwork}
          toastMessage={sim.toastMessage}
        />

        <InvisibleVisibleSection />

        <FinalCTA packetsSent={sim.packetsSent} />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-[rgba(255,255,255,0.05)]">
        <p className="text-[#8B93A7]/50 text-xs">
          PACKET — An interactive visualization of internet data flow.
          All network data shown is simulated for educational purposes.
        </p>
      </footer>
    </div>
  );
}

export default App;
