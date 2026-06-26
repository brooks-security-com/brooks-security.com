---
title: "GRC Tools"
bookHidden: true
---

<style>
.roadmap {
  margin: 2rem 0;
}
.roadmap-intro {
  margin-bottom: 2rem;
}
.roadmap-path {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  align-items: stretch;
  justify-content: center;
  margin: 2rem 0;
}
.roadmap-node {
  position: relative;
  flex: 1 1 200px;
  min-width: 180px;
  max-width: 280px;
  background: var(--gray-100);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.roadmap-node:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: var(--color-link, #0a66c2);
}
.roadmap-node-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-link, #0a66c2);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}
.roadmap-node h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}
.roadmap-node p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--gray-500, #57606a);
  line-height: 1.4;
}
.roadmap-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 40px;
  color: var(--gray-200);
  font-size: 1.5rem;
  font-weight: 300;
}
@media (max-width: 700px) {
  .roadmap-path {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .roadmap-node {
    max-width: 100%;
  }
  .roadmap-arrow {
    width: auto;
    height: 30px;
    transform: rotate(90deg);
  }
}

.roadmap-tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}
.tier-card {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.tier-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}
.tier-card h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}
.tier-card .tier-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  margin-bottom: 0.5rem;
}
.tier-badge.startup { background: #ddf4ff; color: #0a66c2; }
.tier-badge.growth { background: #dafbe1; color: #1a7f37; }
.tier-badge.enterprise { background: #f5e6ff; color: #8250df; }
.tier-card ul {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  color: var(--gray-500, #57606a);
}
.tier-card li {
  margin-bottom: 0.2rem;
}

.roadmap-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}
.roadmap-link-card {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--color-link, #0a66c2);
  border-radius: 8px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
  display: block;
}
.roadmap-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10,102,194,0.1);
  text-decoration: none;
}
.roadmap-link-card h4 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
}
.roadmap-link-card p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--gray-500, #57606a);
}
</style>

<div class="roadmap">

<div class="roadmap-intro">
<p>Open-source GRC policy templates, tool evaluations, and operational guides — built from real deployment experience. Framework-aligned with NIST 800-53, SOC 2, and ISO 27001.</p>
</div>

<h2>Build your program</h2>

<div class="roadmap-path">
  <a class="roadmap-node" href="/grc-tools/guides/getting-started/">
    <span class="roadmap-node-number">1</span>
    <h3>Pick your tier</h3>
    <p>Are you a startup, growing, or enterprise? Determine what you actually need.</p>
  </a>
  <div class="roadmap-arrow">→</div>
  <a class="roadmap-node" href="/grc-tools/policy-templates/">
    <span class="roadmap-node-number">2</span>
    <h3>Select policies</h3>
    <p>32 ready-to-use templates. Policies + procedures + implementation READMEs.</p>
  </a>
  <div class="roadmap-arrow">→</div>
  <a class="roadmap-node" href="/grc-tools/guides/">
    <span class="roadmap-node-number">3</span>
    <h3>Choose your tools</h3>
    <p>Vendor-neutral evaluations: log management, SIEM, EDR, vaults, and more.</p>
  </a>
  <div class="roadmap-arrow">→</div>
  <a class="roadmap-node" href="/grc-tools/resources/">
    <span class="roadmap-node-number">4</span>
    <h3>Run your program</h3>
    <p>Risk register, vendor questionnaire, annual review checklist, evidence guides.</p>
  </a>
</div>

<h2>Implementation tiers</h2>

<div class="roadmap-tiers">
  <div class="tier-card">
    <span class="tier-badge startup">Startup</span>
    <h4>1–20 people</h4>
    <ul>
      <li>8 core policies</li>
      <li>Password manager + MFA</li>
      <li>Encrypted storage</li>
      <li>~$50–200/mo</li>
    </ul>
  </div>
  <div class="tier-card">
    <span class="tier-badge growth">Growth</span>
    <h4>20–200 people</h4>
    <ul>
      <li>22 policies total</li>
      <li>Log management + EDR</li>
      <li>Quarterly access reviews</li>
      <li>~$500–2,000/mo</li>
    </ul>
  </div>
  <div class="tier-card">
    <span class="tier-badge enterprise">Enterprise</span>
    <h4>200+ people</h4>
    <ul>
      <li>32 policies total</li>
      <li>SIEM + penetration testing</li>
      <li>Continuous monitoring</li>
      <li>~$5,000–20,000/mo</li>
    </ul>
  </div>
</div>

<h2>Explore</h2>

<div class="roadmap-links">
  <a class="roadmap-link-card" href="/grc-tools/guides/framework-mapping/">
    <h4>Framework Mapping</h4>
    <p>Every policy cross-referenced to NIST 800-53, SOC 2, and ISO 27001.</p>
  </a>
  <a class="roadmap-link-card" href="/grc-tools/guides/log-management/">
    <h4>Log Management Guide</h4>
    <p>OpenObserve, Loki, Elastic, Splunk compared by cost and scale.</p>
  </a>
  <a class="roadmap-link-card" href="/grc-tools/resources/vendor-questionnaire/">
    <h4>Vendor Questionnaire</h4>
    <p>Standardized security assessment for third-party vendors.</p>
  </a>
  <a class="roadmap-link-card" href="/grc-tools/resources/risk-register-template/">
    <h4>Risk Register Template</h4>
    <p>Likelihood × impact scoring model with pre-built examples.</p>
  </a>
</div>

</div>
