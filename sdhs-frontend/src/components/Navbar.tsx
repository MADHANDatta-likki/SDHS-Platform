import { useEffect, useState } from 'react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeNavbar = () => {
    setExpanded(false);
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light fixed-top sdhs-navbar ${
        scrolled ? 'sdhs-navbar-scrolled' : ''
      }`}
    >
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2" href="/">
          <img
            src="/sdhs-logo.png"
            alt="SDHS"
            style={{ height: '48px', width: 'auto' }}
          />

          <div className="d-flex flex-column lh-sm">
            <strong>Sri Datta Humane Services</strong>
          </div>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <a className="nav-link" href="#home" onClick={closeNavbar}>Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#services" onClick={closeNavbar}>Services</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#events" onClick={closeNavbar}>Events</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#gallery" onClick={closeNavbar}>Gallery</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#contact" onClick={closeNavbar}>Contact</a>
            </li>
            <li className="nav-item mt-3 mt-lg-0 ms-lg-2">
              <a className="btn btn-primary px-4" href="/login" onClick={closeNavbar}>
                Volunteer Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
