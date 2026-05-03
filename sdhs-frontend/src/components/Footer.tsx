function Footer() {
  return (
    <footer className="sdhs-footer">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0">
            © Copyright <strong>Sri Datta Humane Services</strong>. All Rights Reserved.
          </p>

          <a
            href="https://www.facebook.com/SriDattaHumaneServices"
            target="_blank"
            rel="noreferrer"
            className="sdhs-social-link"
          >
            <i className="bi bi-facebook"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;