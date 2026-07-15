import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero/Hero';
import { Duality } from './sections/Duality/Duality';
import { Flow } from './sections/Flow/Flow';
import { Infrastructure } from './sections/Infrastructure/Infrastructure';
import { Metrics } from './sections/Metrics/Metrics';
import { Security } from './sections/Security/Security';
import { Footer } from './sections/Footer/Footer';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Duality />
        <Flow />
        <Infrastructure />
        <Metrics />
        <Security />
      </main>
      <Footer />
    </>
  );
}

export default App;
