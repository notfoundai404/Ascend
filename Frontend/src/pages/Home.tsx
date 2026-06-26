import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import News from '../components/News';
import Join from '../components/Join';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};

function Home() {
  return (
    <div className="w-full bg-black min-h-screen select-none">
      <Navbar />
      <Hero />
      <motion.div {...fadeInUp}>
        <About />
      </motion.div>
      <motion.div {...fadeInUp}>
        <News />
      </motion.div>
      <motion.div {...fadeInUp}>
        <Join />
      </motion.div>
      <Footer />
    </div>
  );
}

export default Home;
