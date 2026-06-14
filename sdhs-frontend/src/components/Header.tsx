import { useEffect, useState } from 'react';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sdhs-header">
      <nav className={`navbar navbar-expand-lg fixed-top sdhs-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#home">
            <img src="/assets/img/logo.png" alt="SDHS Logo" width="44" height="44" />
            <span>Sri Datta Humane Services</span>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#sdhsNavbar"
            aria-controls="sdhsNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="sdhsNavbar">
            <ul className="navbar-nav ms-auto align-items-lg-center mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="#home">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#events">Events</a></li>
              <li className="nav-item"><a className="nav-link" href="#gallery">Gallery</a></li>
              <li className="nav-item"><a className="nav-link" href="#faq">FAQ</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
              <li className="nav-item">
                <a className="btn btn-outline-primary ms-lg-3 mt-2 mt-lg-0" href="/join-us">Join Us</a>
              </li>
              <li className="nav-item">
                <a className="btn btn-primary ms-lg-3 mt-2 mt-lg-0" href="/login">Login</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
