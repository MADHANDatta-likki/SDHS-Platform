const faqs = [
  {
    q: 'What is the purpose of service?',
    a: 'Seva promotes unity, social harmony, and the common good. It reminds us of our responsibility toward one another.',
  },
  {
    q: 'Why should I become a volunteer?',
    a: 'Volunteering helps us serve the community, learn discipline, practice equality, and contribute meaningfully to society.',
  },
  {
    q: 'How do I sign up as a volunteer?',
    a: 'You can contact SDHS or use the Join Us option. The SDHS team will guide you through the enrollment process.',
  },
  {
    q: 'Are there any age restrictions?',
    a: 'Volunteers from different age groups can participate based on the activity and guidance from the organization.',
  },
];

function FAQ() {
  return (
    <section id="faq" className="section-padding bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <span className="sdhs-section-label">FAQ</span>
          <h2 className="fw-bold mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="accordion sdhs-faq" id="faqAccordion" data-aos="fade-up">
          {faqs.map((item, index) => (
            <div className="accordion-item" key={item.q}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#faq-${index}`}
                >
                  {item.q}
                </button>
              </h2>
              <div
                id={`faq-${index}`}
                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;