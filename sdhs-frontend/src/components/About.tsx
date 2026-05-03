function About() {
  return (
    <>
      <section id="about" className="section-padding">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <span className="sdhs-section-label">About SDHS</span>
              <h2 className="fw-bold mt-3">Serving humanity with love and dedication</h2>
              <p className="text-muted mt-3">
                Sri Datta Humane Services is a volunteer organization dedicated to serving humanity
                through social, charitable, spiritual, and medical programs in India and abroad.
              </p>
              <p className="text-muted">
                Discipline, Dedication, Devotion, and Discretion are the four pillars of strength
                of this volunteer force.
              </p>
            </div>

            <div className="col-lg-6" data-aos="fade-left">
              <div className="sdhs-info-card">
                <h4>Our Vision</h4>
                <p>
                  Service is our Religion. We serve humanity without barriers of caste, creed,
                  race, or religion.
                </p>

                <h4 className="mt-4">Who We Are</h4>
                <p>
                  Volunteers from different backgrounds come together with one purpose:
                  to serve communities with compassion, discipline, and devotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sdhs-counts">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-lg-3">
              <h2>65+</h2>
              <p>SDHS Centers</p>
            </div>
            <div className="col-6 col-lg-3">
              <h2>3009+</h2>
              <p>Total Volunteers</p>
            </div>
            <div className="col-6 col-lg-3">
              <h2>1559+</h2>
              <p>Male Volunteers</p>
            </div>
            <div className="col-6 col-lg-3">
              <h2>1450+</h2>
              <p>Female Volunteers</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;