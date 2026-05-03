function Contact() {
  return (
    <section id="contact" className="section-padding">
      <div className="container">
        <div className="text-center mb-5">
          <span className="sdhs-section-label">Contact</span>
          <h2 className="fw-bold mt-2">Get in Touch with SDHS</h2>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="sdhs-contact-card h-100">
              <i className="bi bi-geo-alt-fill"></i>
              <h4>Location</h4>
              <p>
                SDHS, 2-4-52, Beside Ramgopalpet Police Station,
                MG Road, Secunderabad, Telangana - 500003, India.
              </p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="sdhs-contact-card h-100">
              <i className="bi bi-envelope-fill"></i>
              <h4>Email</h4>
              <p>mail@sdhs.in<br />sridattahumaneservices@gmail.com</p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="sdhs-contact-card h-100">
              <i className="bi bi-telephone-fill"></i>
              <h4>Phone</h4>
              <p>+91 9392008644<br />040-27840027</p>
            </div>
          </div>
        </div>

        <div id="join" className="text-center mt-5">
          <a
            href="https://forms.gle/X3PKMjXcrh4WjttEA"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-lg"
          >
            Want to Join Us?
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;