---
title: Introduction
type: docs
bookToc: false
---

<img src="/grahambrooks.png" alt="Graham Brooks" style="float: left; max-width: min(160px, 32%); height: auto; margin: 0.35rem 1.25rem 0.75rem 0;" />

My name is Graham Brooks. I am a Security and Infrastructure technologist who likes to talk to people and solve hard problems. I am a [CISSP](https://www.isc2.org/certifications/cissp) and hold professional certifications in [Linux Server Automation, Cloud Computing, and Security Administration](https://brooks-security.com/docs/curriculum-vitae/credentials/). Currently, I work as the Site Reliability Engineer and as the Security Officer for [AvatarFleet](https://avatarfleet.com), where we provide HR and logistics support to the largest names in the transportation industry. 

Beyond work, I am a husband, father, and community activist. In my free time, I enjoy running, hiking, powerlifting, and all kinds of analog fun.

I believe it's important to document your work and reflect on what you learn along the way. This site serves as both a portfolio of personal and professional projects and a traditional blog where I share ideas that interest me. Topics range from emerging IT trends and technical tutorials to personal perspectives on the industry and random philosophy thoughts.

<div class="home-connect">
  <div class="home-connect__links">
    <h2>Where to Find Me</h2>
    <a href="https://linkedin.com/in/grahamwbrooks/">
      <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></span>LinkedIn</a>
    <a href="https://github.com/littleseneca">
      <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.36.81 1.08.81 2.18 0 1.58-.01 2.85-.01 3.24 0 .32.22.69.83.57A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z"/></svg></span>GitHub</a>
    <a href="https://x.com/little_seneca">
      <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span>X</a>
    <a href="/docs/services/contact-me/">
      <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></span>Email</a>
  </div>
  <div class="home-connect__activity">
    <h2>GitHub Activity</h2>
    {{< github-heatmap >}}
  </div>
</div>

## Featured Projects

<div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: stretch; margin-top: 0.5rem;">
  <div style="flex: 1 1 320px; background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 12px; padding: 1rem 1.1rem;">
    <h3 style="margin-top: 0;">This Website!</h3>
    <p>Anyone can build on AWS. But cost optimizing what you build without breaking functionality is the real proof of knowledge. This whole website (plus the underlying infrastructure and CI/CD pipelines) costs me $1.05 per month to run, despite using all of the AWS best practice tooling. And, it's brutally simple to maintain!</p>
    <p><a href="/docs/portfolio/gitops/">View Git-Ops project</a></p>
  </div>
  <div style="flex: 1 1 320px; background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 12px; padding: 1rem 1.1rem;">
    <h3 style="margin-top: 0;">Jarvis - Executive Summary Agent</h3>
    <p>One-shot containerized agent that delivers a daily AI-generated executive brief to Slack. Jarvis aggregates data from many sources, including AWS, GitHub, Gmail, Drata, and more, using a drop-in plugin architecture where new sources are easy to add. Each plugin can leverage per-plugin LLM inference via Groq with plugin-defined settings for customization.</p>
    <p><a href="/docs/portfolio/automation/">View Jarvis project</a></p>
  </div>
</div>
