import { processSteps } from '../data/siteContent.js'

export default function ProcessSection() {
  return (
    <section className="process-section section-gap">
      <div className="container">
        <div className="process-header">
          <span className="section-label">Quy trình</span>
          <h2 className="section-title">Từ ý tưởng đến sản phẩm</h2>
          <p className="section-desc">Mỗi sản phẩm R.A.W đi qua 4 bước tỉ mỉ, đảm bảo chất lượng và dấu ấn cá nhân của bạn.</p>
        </div>

        <div className="process-steps">
          {processSteps.map((step, i) => (
            <div key={step.step} className="process-step">
              <div className="process-connector" aria-hidden="true">
                {i < processSteps.length - 1 && <div className="connector-line" />}
              </div>
              <div className="process-circle">
                <span className="process-num">{step.step}</span>
              </div>
              <div className="process-content">
                <h3 className="process-title">{step.title}</h3>
                <p className="process-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .process-header { margin-bottom: 48px; }
        .process-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          position: relative;
        }
        .process-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 16px;
          position: relative;
        }
        .process-connector {
          position: absolute;
          top: 32px;
          right: -50%;
          width: 100%;
          z-index: 0;
        }
        .connector-line {
          height: 2px;
          background: linear-gradient(to right, var(--sage-light), var(--border));
          margin: 0 8px;
        }
        .process-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-light) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
          box-shadow: 0 4px 16px rgba(123,45,62,0.25);
        }
        .process-num {
          font-family: var(--font-serif);
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }
        .process-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
          font-family: var(--font-sans);
        }
        .process-desc {
          font-size: 0.88rem;
          color: var(--text-mid);
          line-height: 1.6;
        }
        @media (max-width: 900px) {
          .process-steps { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .process-connector { display: none; }
        }
        @media (max-width: 480px) {
          .process-steps { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
