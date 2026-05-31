import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import UpcomingEvents from '../components/UpcomingEvents';
import Gallery from '../components/Gallery';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Header />
      <Hero />
      <UpcomingEvents />
      <Services />
      <About />
      <Gallery />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;