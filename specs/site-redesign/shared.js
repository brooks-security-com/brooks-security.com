/* Content snapshot and helpers for the knowledge-graph reference (index.html).
   The copy is lifted from hugo/content for the mockup: two posts are full, the rest
   are excerpts, and the heatmap is seeded sample data in the contributions.json shape.
   The port should read the real content instead. Some helpers here served the other
   mockup directions and are unused by index.html. */
(() => {
const S = (window.SITE = {});
const LIVE = 'https://www.brooks-security.com';

S.profile = {
  name: 'Graham Brooks',
  role: 'Sales Engineer & Solutions Architect',
  location: 'Moscow, Idaho',
  relocate: 'Happy to relocate for the right role',
  email: 'graham@brooks-security.com',
  linkedin: 'https://linkedin.com/in/grahamwbrooks/',
  github: 'https://github.com/littleseneca',
  repo: 'https://github.com/LittleSeneca/brooks-security.com',
  site: LIVE,
  photo: 'assets/graham.jpg',
  seeking: 'Sales Engineering or Solutions Architecture roles in platform security, blue-team tooling, or cloud infrastructure',
  headline: ['Your hardest technical buyer', 'used to be me.'],
  badges: ['CISSP', 'AWS Certified Solutions Architect', 'RHCE'],
  resumeTxt: LIVE + '/downloads/graham-brooks-resume.txt',
};

S.lead = [
  'I am a sales engineer and solutions architect, ten years into a career in IT. I have worked both ends of the security sales cycle.',
  'I have been the security engineer writing the RFP, and the vendor engineer answering it. I have sent the security questionnaire, and I have sat down and filled one in. I have run the proof of concept as the customer, deciding whether a tool survived contact with our environment, and as the vendor, with the deal riding on the result.',
  'So when I am in front of a customer’s security team, I am not guessing at what they need to hear. I still write those questions: I vetoed a vendor recently for turning up without a SOC 2 Type 2. I know what wins deals, how to position a product, and I know how to hunt for the yes but find the quick no.',
  'I have made that case from our stage at Black Hat, in customer workshops, and in a university lecture hall in India.',
];

S.sides = {
  buyer: ['Wrote the RFP', 'Sent the security questionnaire', 'Ran the POC as the customer, deciding whether a tool survived our environment', 'Vetoed a vendor for turning up without a SOC 2 Type 2'],
  vendor: ['Answered the RFP', 'Filled in the questionnaire', 'Ran the POC as the vendor, with the deal riding on the result', 'Presales on deals worth half the company’s revenue in year one'],
};

S.metrics = [
  { id: 'rev', value: '50%', label: 'of company revenue came through deals I supported in my first year', src: 'Syxsense, 2021-22' },
  { id: 'logos', value: '100+', label: 'new logos through proofs of concept and RFI and RFP responses', src: 'Syxsense, 2021-24' },
  { id: 'deals', value: '$1M+', label: 'deals where I was the primary presales support', src: 'Syxsense' },
  { id: 'soc2', value: '0', label: 'adverse findings on SOC 2 Type 2, from a program I built from nothing', src: 'AvatarFleet, 2024-26' },
  { id: 'cost', value: '$1', label: 'a month to run this site, contact form and all, on AWS', src: 'This site' },
  { id: 'years', value: '10', label: 'years in IT, the last six in security', src: '2016-2026' },
];

S.revenue = {
  points: [
    { year: '2021-22', role: 'Solutions Architect', pct: 50 },
    { year: '2022-23', role: 'Senior Security Solutions Architect', pct: 40 },
    { year: '2023-24', role: 'Lead Solutions Architect', pct: 30 },
  ],
  caption: 'Share of Syxsense revenue on deals where I was the presales support. The number was supposed to go down: I was hiring and training the sales engineering team, and the work of that period was getting the number to stop depending on any one person.',
};

S.story = [
  'I started on the operations side, with about a year at Schweitzer Engineering Laboratories doing Linux endpoint security, hardening the fleet to CIS benchmarks with Chef and standardizing the Linux build the company ran on.',
  'For three years after that at Syxsense I ran the technical side of the sales cycle: proofs of concept, RFI and RFP responses, architecture sessions in critical infrastructure and government, and webinars when marketing needed one.',
  'I was one of three sales engineers, and I was thrown in without much of a ramp. In my first year I was the presales support on deals representing 50 percent of the company’s total revenue, including deals north of a million dollars. Over the next two years that share went to 40 percent and then 30 percent, which was the goal. I was hiring and training the sales engineering team by then, and the work of that period was getting the number to stop depending on any one person.',
  'Since March 2024 I have been at AvatarFleet as senior security and systems engineer, on the buying end of the same market. I built the security program from nothing, led it through SOC 2 Type 1 and Type 2 with zero adverse findings, and wrote the Terraform and Ansible that enforce the controls. I have also been the person answering the security questionnaires and clearing the vendor reviews that block enterprise deals, which is the same paperwork your customers will point at your product.',
  'In a POC that means I can scope against a stack I have had to operate myself, write the integration instead of filing a feature request, and answer a customer’s security team without escalating.',
];

S.why = [
  'The last two and a half years have been spent deep inside one organization’s security program, and I have learned more doing it than in any stretch before. What I have missed is having technical work attached directly to whether the business grows. In presales the line between a conversation on Tuesday and a deal that closes is short enough to see, and I want to be back on it.',
  'The other half of it is that I do not want to stop building. Plenty of roles that touch strategy at an organizational scale turn into slide decks and forecast calls. Sales engineering is one of the few where scoping the architecture and writing the integration that proves it land on the same person.',
  'That is the combination I am looking for again.',
];

S.fit = [
  { title: 'The technical seat in the sales cycle', body: 'Discovery, POC design and delivery, architecture review, RFI and RFP response, competitive positioning, and the webinar or conference talk when marketing needs one. I ran that cycle at Syxsense for three years and led the team that ran it with me. I am the person the customer’s security team gets to question directly, which is the part of the job I like.' },
  { title: 'Blue-team depth', body: 'Vulnerability management, patch and configuration management at scale, SIEM and log pipelines, endpoint controls, IAM design and audit, incident response, and the compliance evidence that has to come out the other end. I have owned each of those in production and been audited on most of them.' },
];

S.background = [
  { label: 'Industries', body: 'Critical infrastructure, government, banking, education, SaaS.' },
  { label: 'Stack', body: 'AWS for five years, heaviest in IAM, EC2, ECS, RDS and VPC. Terraform, Ansible, Python, Bash. Linux for twelve.' },
  { label: 'Certifications', body: 'CISSP, AWS Certified Solutions Architect, RHCE, RHCSA, Security+. BS in Civil Engineering, Washington State University.' },
  { label: 'Writing', body: 'A blog on Linux, automation, compliance, and getting useful work out of AI agents. The longest piece is the SOC 2 Field Manual.' },
];

S.context = [
  'I am a solutions architect and sales engineer in the security space, holding a CISSP, an AWS Certified Solutions Architect, and a Red Hat Certified Engineer. Ten years in IT, the last six of them in security.',
  'In a pre-sales conversation that means I can scope the deployment, write the integration myself, and answer the customer’s security and compliance people without escalating. I have done this across SaaS, critical infrastructure, government, education, and banking.',
];

// side: which end of the sales cycle the role sat on.
S.roles = [
  { id: 'avatarfleet', title: 'Senior Security & Systems Engineer', org: 'AvatarFleet', start: '2024-03', end: null, dates: 'Mar 2024 to Present', where: 'Moscow, Idaho · Remote', side: 'buyer', bullets: [
    ['SOC 2 Type 2 accreditation', 'Led AvatarFleet through SOC 2 Type 1 and Type 2 by establishing the security policies and procedures behind them. Achieved Type 2 with no adverse findings.'],
    ['Security program', 'Built the initial security program from nothing, including foundational policies, procedures, and a security-aware culture in an early-stage startup.'],
    ['Security reviews', 'Owned responses to customer security questionnaires and vendor risk reviews, clearing the reviews that block enterprise deals.'],
    ['Cloud security enforcement', 'Drove AWS security improvements through Terraform and Ansible, standardizing controls and automating compliance evidence collection.'],
    ['Enterprise infrastructure', 'Architected and built the organization’s enterprise infrastructure from the ground up, replacing legacy infrastructure with minimal downtime.'],
  ] },
  { id: 'syx-lead', title: 'Lead Solutions Architect', org: 'Syxsense', start: '2023-03', end: '2024-03', dates: 'Mar 2023 to Mar 2024', where: 'Moscow, Idaho · Remote', side: 'vendor', bullets: [
    ['Team leadership', 'Hired, trained, and led the sales engineering team, with three direct reports.'],
    ['Revenue contribution', 'Presales support on deals representing 30% of total company revenue, with the balance increasingly carried by the team I built.'],
    ['Hybrid and multi-cloud', 'Led the design and implementation of security solutions across hybrid and multi-cloud environments, focused on automation.'],
    ['Automation', 'Oversaw deployment of automated security solutions using Ansible and Python, reducing manual overhead and improving response times.'],
    ['Industry advocacy', 'Presented to audiences in the hundreds from the booth stage at Black Hat USA, led hands-on workshops with dozens of customers at a time, and taught a week-long seminar at VIT-AP University in India.'],
  ] },
  { id: 'syx-senior', title: 'Senior Security Solutions Architect', org: 'Syxsense', start: '2022-04', end: '2023-03', dates: 'Apr 2022 to Mar 2023', where: 'Salt Lake City, Utah', side: 'vendor', bullets: [
    ['Revenue contribution', 'Presales support on deals representing 40% of total company revenue.'],
    ['Solutions engineering', 'Designed security automation for critical infrastructure customers, using Ansible and Python to bring AWS-hosted EC2 workloads into the platform.'],
    ['Vulnerability management', 'Built vulnerability management frameworks for Linux servers in regulated on-premises environments with tens of thousands of endpoints under management.'],
    ['Platform engineering', 'Committed Bash and Python to improve Linux endpoint availability and reliability, and contributed to the platform user guide.'],
  ] },
  { id: 'syx-sa', title: 'Solutions Architect', org: 'Syxsense', start: '2021-04', end: '2022-04', dates: 'Apr 2021 to Apr 2022', where: 'Salt Lake City, Utah', side: 'vendor', bullets: [
    ['Revenue contribution', 'One of three sales engineers. Presales support on deals representing 50% of total company revenue in my first year, including deals north of $1 million.'],
    ['Sales engineering', 'Directly managed more than 100 new logos through proofs of concept and RFI and RFP responses.'],
    ['Solutions architecture', 'Co-architected deployments to match customer environments.'],
    ['Marketing', 'Developed and delivered educational webinars for the marketing team.'],
  ] },
  { id: 'sel-analyst', title: 'Associate IT Analyst', org: 'Schweitzer Engineering Laboratories', start: '2020-09', end: '2021-04', dates: 'Sep 2020 to Apr 2021', where: 'Pullman, Washington', side: 'ops', bullets: [
    ['Security operations', 'Partnered with Security Operations to apply CIS benchmarks to Linux endpoints using Chef.'],
    ['Platform development', 'Created a standardized, domain-integrated Ubuntu Linux distribution for the company.'],
    ['Operations support', 'Supported Linux users across the organization.'],
  ] },
  { id: 'sel-tech', title: 'IT Technician', org: 'Schweitzer Engineering Laboratories', start: '2018-08', end: '2020-09', dates: 'Aug 2018 to Sep 2020', where: 'Pullman, Washington', side: 'ops', bullets: [
    ['Desktop support and migration', 'Provided desktop support and played a key role in the move from Windows 7 to Windows 10.'],
  ] },
  { id: 'wsu', title: 'IT Technician', org: 'Washington State University', start: '2016-11', end: '2018-08', dates: 'Nov 2016 to Aug 2018', where: 'Pullman, Washington · Part-time', side: 'ops', bullets: [
    ['Department IT support', 'Desktop and physical networking support for the Chemistry department while completing undergraduate studies.'],
  ] },
];

S.certs = [
  { abbr: 'CISSP', name: 'Certified Information Systems Security Professional', issuer: 'ISC2', earned: 'Jun 2026', year: 2026 },
  { abbr: 'AWS SA', name: 'AWS Certified Solutions Architect, Associate', issuer: 'Amazon Web Services', earned: 'Jan 2024', year: 2024 },
  { abbr: 'RHCE', name: 'Red Hat Certified Engineer', issuer: 'Red Hat', earned: 'Mar 2023', year: 2023 },
  { abbr: 'RHCP', name: 'Red Hat Certified Professional', issuer: 'Red Hat', earned: 'Apr 2022', year: 2022 },
  { abbr: 'Sec+', name: 'CompTIA Security+', issuer: 'CompTIA', earned: 'Feb 2022', year: 2022 },
  { abbr: 'RHCSA', name: 'Red Hat Certified System Administrator', issuer: 'Red Hat', earned: 'Sep 2020', year: 2020 },
];
S.degree = { name: 'BS, Civil Engineering', school: 'Washington State University', earned: 'May 2018' };

// years: null means ongoing / not counted in years.
S.platforms = [
  { group: 'Cloud and virtualization', items: [
    ['Amazon Web Services', 5, 'Production, security, and automation work. Strongest in IAM administration and audit, EC2, ECS, SQS, DynamoDB, Bedrock, RDS, Route 53, VPC, and Textract.'],
    ['Microsoft Azure', 2, 'Customer environments and personal projects, mostly SQL, virtual machines, and containers.'],
    ['Proxmox', 5, 'My homelab: clean KVM and LXC workflows, solid snapshots and backups, none of the licensing pain.'],
    ['VMware vSphere', 2, 'Used heavily in customer environments. Not since the Broadcom acquisition, so treat it as historical depth.'],
  ] },
  { group: 'Containers', items: [
    ['Amazon ECS', 5, 'Production clusters, services, task definitions, networking, and operations.'],
    ['Docker Compose', 3, 'Multi-container stacks in the homelab, smaller production deployments, and local development.'],
    ['Portainer', 1, 'Docker frontend in the homelab.'],
  ] },
  { group: 'Code and CI/CD', items: [
    ['GitHub', 4, 'Day-to-day source control and collaboration across work and personal projects.'],
    ['GitHub Actions', 4, 'Pull request checks, Terraform plan workflows, and production deploys.'],
    ['GitLab', 2, 'Homelab projects, including the X as Code labs.'],
    ['Bitbucket', 2, 'Projects at a prior employer.'],
  ] },
  { group: 'Configuration and IaC', items: [
    ['Terraform', 3, 'PR-locked production workflows, including the infrastructure behind this site.'],
    ['Ansible', 2, 'Configured and maintained customer EC2 fleets with hundreds of assets under management.'],
    ['Syxsense Cortex', 3, 'Windows and Linux patch management at a prior employer.'],
    ['Chef Infra', 1, 'Linux configuration management at a prior employer.'],
  ] },
  { group: 'Data and secrets', items: [
    ['PostgreSQL', 3, 'Production administration across on-prem and cloud-backed environments.'],
    ['Aurora RDS (PostgreSQL)', 3, 'Managed PostgreSQL in AWS, including production operations.'],
    ['HashiCorp Vault', 4, 'Centralized secrets for internal Proxmox projects.'],
    ['AWS Secrets Manager', 4, 'Application and infrastructure secrets in production.'],
    ['Infisical', 1, 'Secrets for internal tooling workflows.'],
  ] },
  { group: 'Edge and load balancing', items: [
    ['Nginx', 5, 'Homelab and production across multiple projects.'],
    ['AWS Application Load Balancer', 3, 'HTTP routing, TLS termination, and service front doors in production.'],
    ['Caddy', 2, 'Reverse proxy and TLS edge in production. Great for when ALB is too much overhead.'],
  ] },
  { group: 'Languages', items: [
    ['Bash', 5, 'The ad-hoc work that does not justify a full Ansible workflow.'],
    ['Python', 5, 'Internal automation, reports, audits, and API glue: Boto3, Atlassian libraries, and similar.'],
  ] },
  { group: 'AI tooling', items: [
    ['Claude Code', 2, 'Debugging, technical drafting, and implementation options in domains I already know.'],
    ['Cursor', 2, 'Daily coding and issue investigation. Customer-facing output stays human-authored.'],
    ['Groq', null, 'Fast API inference inside Python and automation workflows.'],
  ] },
  { group: 'Operating systems', items: [
    ['Linux (RHEL and Debian)', 12, 'What got me into computers. Most real work still happens over SSH on Linux hosts.'],
    ['macOS', 5, 'Daily driver, an M4 MacBook Pro with SSH-first workflows into Linux.'],
    ['Windows', 4, 'Endpoint support, a Windows 7 to 10 migration, and three years of fleet patching through Syxsense.'],
  ] },
];

const GH = 'https://github.com/LittleSeneca/';
S.projects = [
  { slug: 'this-site', name: 'brooks-security.com', kind: 'GitOps', featured: true, repo: GH + 'brooks-security.com',
    one: 'This site, end to end. Content and the Terraform that runs it live in one public repository, and it ships itself to S3 and CloudFront for about a dollar a month.',
    stack: ['Terraform', 'CloudFront', 'S3', 'Lambda', 'API Gateway', 'GitHub Actions'],
    body: [
      'This site builds and ships itself. One public repository holds both the content and the Terraform that runs the AWS infrastructure serving it. I push to main, and GitHub Actions takes it from there: build the site, sync it to S3, invalidate CloudFront, and reconcile the cloud with terraform apply.',
      'I build in the open on purpose. That is Kerckhoffs’s Principle: a system should stay secure even when everyone can see exactly how it works. The secrecy lives in the keys, not in the design. Read every line of Terraform and stand up your own copy. You still can’t break mine, because you don’t hold my keys.',
      'The contact form added a real backend without adding a server. One CloudFront behavior routes /api/contact to an API Gateway HTTP API, so the browser posts to the same origin it loaded from. A Lambda checks a secret header only CloudFront injects, scores the reCAPTCHA Enterprise token, and publishes to an SNS topic that emails me.',
    ] },
  { slug: 'soc2-field-manual', name: 'SOC 2 Field Manual', kind: 'Compliance', featured: true, post: 'soc-2-field-manual-seed-stage',
    one: 'What a seed stage SaaS team actually has to build before its first SOC 2 engagement, organized by platform and budget.',
    stack: ['SOC 2', 'AWS', 'Azure', 'GCP', 'Drata', 'Vanta'],
    body: [
      'Controls domain by domain, how to pick an auditor, the compliance calendar, and a straight read on Drata, Vanta, Secureframe, and doing it in a spreadsheet.',
      'Long, and written from audits I have sat through.',
    ] },
  { slug: 'jarvis', name: 'Jarvis', kind: 'Automation', featured: true, repo: GH + 'jarvis-executive-summary',
    one: 'A containerized agent that reads 24 hours of activity across Security Hub, billing, GitHub, Gmail, Drata, and monitoring, and posts one Slack brief.',
    stack: ['Python', 'Docker', 'Groq', 'Slack Block Kit'],
    body: [
      'Jarvis is a containerized Python tool that reads the last 24 hours of activity from a set of data sources, summarizes each one through Groq-hosted inference, posts a single executive brief to Slack, and then exits. One container, one run, one clean morning digest.',
      'On startup it runs every enabled plugin at once. Each plugin pulls its own data (Site24x7, AWS Security Hub, AWS Billing, Drata, Gmail, GitHub, weather, news, stocks, and a few more), sends the payload through a rate-limited Groq queue with its own prompt and temperature, and the results get assembled into one Slack Block Kit message.',
      'Every data source is a self-contained folder that implements a single contract. Adding a source means dropping in a folder and adding its name to ENABLED_PLUGINS. And if a plugin fails, the brief still goes out with a note about what broke. A partial brief beats silence.',
    ] },
  { slug: 'local-nvd', name: 'Local NVD Database', kind: 'Security', featured: true, repo: GH + 'local-nvd',
    one: 'The full NIST National Vulnerability Database in your own PostgreSQL, so CVE data can be joined against a real asset inventory.',
    stack: ['PostgreSQL', 'Python', 'NVD API'],
    body: [
      'This project automates pulling down the full NIST National Vulnerability Database, minus the current year, and loads it into PostgreSQL. It sets up the server, creates the tables, and runs the scripts that collect the data and push it in.',
      'The reason to want this is control. Once the NVD lives in your own database, you can query it, join it against your asset inventory, and run the kind of analysis the public web interface will not give you.',
    ] },
  { slug: 'agentic-skills', name: 'Agentic Skills', kind: 'AI Agents', repo: GH + 'agentic-skills',
    one: 'A marketplace of Claude Code skills and read-only cloud plugins that front-load standards, so an agent produces defensible output instead of improvising.',
    stack: ['Claude Code', 'AWS', 'Azure', 'GCP', 'NIST SP 800-53'],
    body: [
      'A marketplace of skills and plugins for Claude Code that front-load the knowledge an agent needs before it starts a task. Spend the token budget on the work, not the warm-up.',
      'The plugins are read-only by default and hand back any write operation as a command for me to run myself, which is exactly the posture I want for cloud access. The skills carry the domain knowledge: policy drafting in the right house format, control writing grounded in NIST SP 800-53, and process and plan writing built on NIST and ISO.',
    ] },
  { slug: 'hard-drive-auditor', name: 'Hard Drive Auditor', kind: 'Automation', repo: GH + 'hard-drive-auditor',
    one: 'Triage for the drawer of unlabeled drives: learn what a mystery disk holds in seconds instead of an afternoon.',
    stack: ['Python', 'BitLocker', 'NTFS'],
    body: [
      'Most offices have a pile of old hard drives in a drawer somewhere, and half of them are unlabeled. You cannot protect data you do not know you still have.',
      'Point it at a Windows drive and it pulls the hostname from the registry and shows the user folders. Point it at a BitLocker drive and it asks for the recovery password, unlocks the volume, and scans it the same way.',
    ] },
  { slug: 'clonezilla-builder', name: 'Clonezilla Image Builder', kind: 'Automation', repo: GH + 'clonezilla-builder',
    one: 'Unpacks and repacks Clonezilla images cleanly, turning a plain imaging disk into something tailored per deployment.',
    stack: ['Bash', 'syslinux', 'EFI'],
    body: [
      'Unpacking and repacking a Clonezilla image by hand is tedious and easy to get wrong. This tool does it cleanly, with changes to the syslinux, live, home, EFI, and boot folders.',
      'Right now it adds a boot menu entry that pulls a GitHub repo you choose and offers to run a script from it.',
    ] },
  { slug: 'local-k8s', name: 'Local Kubernetes Cluster', kind: 'X as Code', repo: GH + 'localk8_vpc',
    one: 'A real cluster to break things on, stood up with Terraform, Ansible, Vault, Proxmox, and AWS.',
    stack: ['Terraform', 'Ansible', 'Vault', 'Proxmox', 'Kubernetes'],
    body: [
      'Stands up a local Kubernetes cluster with Terraform, Ansible, HashiCorp Vault, Proxmox, and AWS. Built for a single host, laid out so it spreads across as many physical nodes as you want.',
    ] },
  { slug: 'rhce-lab', name: 'DigitalOcean RHCE Lab', kind: 'X as Code', repo: GH + 'digitalocean-rhcelab',
    one: 'Five disposable VMs for RHCE study: one controller, four workers, torn down when you are done.',
    stack: ['Terraform', 'Ansible', 'DigitalOcean'],
    body: [
      'Terraform spins up five VMs as a study lab for the RHCE 8 exam: one controller and four workers, one with a second disk for storage practice. Ansible then handles networking, installs Ansible on the controller, and creates an admin login reachable only from the controller.',
    ] },
];

S.site = {
  layers: [
    ['Content', 'Static pages, generated at build time'],
    ['Infrastructure as code', 'Terraform'],
    ['Hosting', 'Private S3 origin behind CloudFront'],
    ['DNS and TLS', 'Route 53 and ACM, DNS-validated'],
    ['Access portal', 'IAM Identity Center behind a CloudFront 301'],
    ['Scheduled jobs', 'EventBridge to Lambda, nightly heatmap refresh'],
    ['Contact form', 'API Gateway HTTP API, reCAPTCHA Enterprise, SNS email'],
    ['Secrets', 'SSM Parameter Store'],
    ['CI/CD', 'GitHub Actions on GitHub-hosted runners'],
  ],
  costs: [
    ['Route 53 hosted zone', '$0.50'],
    ['S3 storage and requests', '$0.01'],
    ['CloudFront, two distributions', '$0.01'],
    ['Lambda, API Gateway, EventBridge', '$0.00'],
    ['SNS contact emails', '$0.00'],
    ['ACM, SSM, IAM, Identity Center', '$0.00'],
  ],
  total: '~$1 a month',
  controls: [
    ['Private origin', 'The bucket blocks all public access. Only CloudFront can read it, through Origin Access Control.'],
    ['Plan on PR, apply on merge', 'terraform plan runs read-only on pull requests. apply runs only after merge, behind a production approval gate.'],
    ['Secrets in SSM', 'The GitHub token and reCAPTCHA keys live in Parameter Store and never enter Terraform state.'],
    ['CloudFront-only backend', 'The Lambda rejects any request missing a secret header that only CloudFront injects.'],
    ['Bot protection', 'reCAPTCHA Enterprise scoring plus a honeypot field, before anything reaches the inbox.'],
    ['Least-privilege IAM', 'Each Lambda role and the deploy credentials are scoped to the few actions they need.'],
  ],
  // Request paths through the architecture, used by the diagram mockups.
  flows: {
    page: { label: 'Load a page', steps: [
      ['Visitor', 'A browser asks for www.brooks-security.com.'],
      ['Route 53', 'The apex and www records resolve to CloudFront.'],
      ['CloudFront', 'TLS from ACM. An edge function rewrites /posts/foo/ to its index.html key.'],
      ['S3', 'Private bucket, read through Origin Access Control on a cache miss.'],
      ['Visitor', 'The page comes back from the edge. Most requests never reach S3.'],
    ] },
    contact: { label: 'Send the contact form', steps: [
      ['Visitor', 'The form gets a reCAPTCHA Enterprise token and posts JSON to /api/contact.'],
      ['CloudFront', 'The /api/contact behavior forwards to API Gateway and injects a shared-secret header.'],
      ['API Gateway', 'HTTP API with proxy integration. About $1 per million requests.'],
      ['Lambda', 'Checks the secret header, the honeypot, and the reCAPTCHA assessment score.'],
      ['SNS', 'Publishes the message to a topic that emails me.'],
    ] },
    nightly: { label: 'Nightly heatmap refresh', steps: [
      ['EventBridge', 'A cron rule fires at 09:00 UTC.'],
      ['Lambda', 'Reads a GitHub token from SSM and dispatches the deploy workflow.'],
      ['GitHub Actions', 'Queries the GitHub GraphQL API and re-bakes the contribution data. Fail-soft.'],
      ['S3', 'The rebuilt site syncs to the bucket.'],
      ['CloudFront', 'The cache is invalidated and the new heatmap is live.'],
    ] },
  },
};

S.poc = {
  intro: [
    'I have run technical evaluations from both ends: for prospects at Syxsense, and on the buying side at AvatarFleet, deciding whether a vendor’s tool was going to survive our environment.',
    'Most of the ones I have watched go badly did not go badly on the technology. They went badly because the evaluation started before anyone agreed what would count as success, and a few weeks in nobody could say whether it had worked. So the part I care most about happens before anything gets installed.',
  ],
  steps: [
    { title: 'Agree what yes looks like', short: 'Three to five written criteria, each with a system name and a threshold.', body: [
      'I want three to five criteria written down, each specific enough that the customer and I can look at the same result and agree on whether it happened. Something with a system name and a threshold in it, rather than “improves our security posture.”',
      'A customer who cannot describe what would make them buy usually has not finished deciding internally, and running an evaluation into that burns a month. When I hit it I would rather go back to discovery than start the clock.',
      'I also want to know who signs off besides my champion. In security tooling that list is longer than the champion tends to think: their security team, whoever owns budget, and some vendor-risk process that has not come up yet.',
    ] },
    { title: 'While it runs', short: 'New requirements get written down and sorted, not absorbed.', body: [
      'New requirements surface once people have hands on the product. I write them down and sort them into either this evaluation or the conversation after it. The point is not to refuse them, it is to stop the thing we agreed to be measured on from quietly changing underneath us.',
      'I would rather test against their real environment than a clean one, even when that makes the POC look worse in week one. A tool that works on sample data and falls over on their actual log volume has not proven anything yet.',
    ] },
    { title: 'The security review', short: 'Where enterprise deals stall, and where my background is most useful.', body: [
      'Enterprise deals stall in vendor risk more often than they stall on features. A questionnaire arrives, or a request for a SOC 2 report and a penetration test summary, or a question about exactly what data leaves the customer’s tenancy and where it lands.',
      'I have run that process from the other side: written the policies, built the controls, produced the evidence package, and taken a SOC 2 Type 2 through with no adverse findings. So I can usually tell a genuine blocker from a question the customer’s template asks every vendor regardless of fit.',
    ] },
    { title: 'Closing it out', short: 'A written result against each criterion, forwardable as is.', body: [
      'A short written result against each criterion, in language my champion can forward internally without editing it first. Including whatever did not work, because that surfaces whether I raise it or not, and I would rather it surfaced while I am in the room.',
      'Then a clean handoff: what was configured, what was a POC shortcut that needs redoing for production, and what the first month should look like.',
    ] },
  ],
  outro: 'None of this is novel and most experienced SEs run some version of it. The part I would argue for is doing the criteria work properly even when everyone is impatient to start, because that is the step that gets skipped and it is the one that decides how the rest goes.',
};

S.talks = {
  intro: 'I have worked most of the formats a sales engineer gets asked to cover: recorded webinars, trade show floors, hands-on customer workshops, a university lecture hall, and the room where a deal on the critical path gets negotiated.',
  video: { src: LIVE + '/downloads/Presentation-Artifact.mp4', poster: 'assets/poster.jpg', title: 'Spotlight: Realtime Management', sub: 'A Syxsense Master Class on realtime endpoint management, delivered as the vendor’s technical presenter. This is the format I ran for prospects and at industry events.' },
  rooms: [
    { name: 'Black Hat USA', scale: 'Hundreds at a time', body: 'From the stage in our booth amphitheater, one of the largest on the show floor. Most of the skill is qualifying a stream of strangers quickly and deciding which conversations are worth the next thirty minutes.' },
    { name: 'Customer workshops', scale: 'Dozens at a time', body: 'Working live in their own environment rather than a canned demo, which means the session goes wherever their configuration takes it.' },
    { name: 'VIT-AP University', scale: 'A week-long seminar', body: 'Taught in Vijayawada, India, as a visiting industry partner.' },
    { name: 'Critical-path negotiations', scale: 'The room that decides', body: 'Where the technical answer decides whether the deal moves, and the person giving it has to be willing to say no when the honest answer is no.' },
  ],
  live: 'If you want a live version rather than a recording, I am happy to walk through any project on this site, or to take a scenario and present it back.',
};

S.contactCopy = [
  'I am currently open to Sales Engineering and Solutions Architecture roles in platform security, blue-team tooling, or cloud infrastructure. I am based in Moscow, Idaho, and happy to relocate for the right role.',
  'If you are hiring for that seat, send a note about the product and the team and I will tell you whether I think I am a fit. If you just want to talk shop about SOC 2, Terraform, vulnerability management, or getting AI agents to do something useful, that works too.',
  'Everything here lands in my inbox. I read all of it and usually reply within a couple of business days.',
];

S.author = 'Graham Brooks. CISSP, AWS Certified Solutions Architect, RHCE. Three years as a sales engineer and solutions architect in security software, then in-house at AvatarFleet building the security program: SOC 2 Type 1 and Type 2 with zero adverse findings, controls written in Terraform. I am looking for a Sales Engineering or Solutions Architecture role in platform security, blue-team tooling, or cloud infrastructure.';

S.skills = [
  ['Presales and solutions architecture', 'Technical discovery, proof of concept scoping and delivery, RFI and RFP response, security questionnaire and vendor risk review response, competitive positioning, technical webinars and conference speaking, customer architecture design'],
  ['Security and compliance', 'SOC 2 Type 1 and Type 2, NIST SP 800-53, ISO 27001, HIPAA, policy and procedure authoring, risk assessment, vulnerability management, incident response, evidence collection, audit management, IAM design and audit, endpoint hardening, CIS Benchmarks'],
  ['Cloud and infrastructure', 'AWS (IAM, EC2, ECS, RDS, Aurora, VPC, Route 53, S3, CloudFront, Lambda, API Gateway, Security Hub, Secrets Manager, SSM Parameter Store), Microsoft Azure, Proxmox, VMware vSphere'],
  ['Automation and engineering', 'Terraform, Ansible, Python, Bash, Docker, GitHub Actions, CI/CD, infrastructure as code, configuration management, HashiCorp Vault, PostgreSQL, Nginx, Caddy'],
  ['Operating systems', 'Linux (RHEL, Debian, Ubuntu), Windows, macOS'],
];
S.summary = 'Sales engineer and solutions architect with ten years in information technology, split between presales for a security software vendor and hands-on security engineering on the buying side. Three years running the technical side of the sales cycle at Syxsense: proofs of concept, RFI and RFP responses, architecture sessions, and technical webinars. As one of three sales engineers, provided presales support on deals representing 50% of total company revenue in the first year, including deals north of $1 million, then hired and led the sales engineering team as Lead Solutions Architect. Since 2024, built and ran a security program in-house, taking it through SOC 2 Type 1 and Type 2 with zero adverse findings.';

S.posts = [
 {
  "slug": "soc-2-field-manual-seed-stage",
  "title": "SOC 2 Field Manual for Seed Stage SaaS",
  "date": "2026-07-15",
  "desc": "What you actually need to build before your first SOC 2 engagement, organized by platform and budget. No fluff, no vendor pitches, just the things that take real time.",
  "cat": "Security",
  "tags": [
   "soc 2",
   "compliance",
   "aws",
   "azure",
   "gcp",
   "open source",
   "startup",
   "seed stage"
  ],
  "mins": 47,
  "body": "<p>Most seed stage SOC 2 advice is a list of policies you should write. That is backwards. Policies are the easy part. You can draft an access control policy in an hour with Claude. You cannot stand up centralized logging in an hour. You cannot build a working backup and restore pipeline in an hour. You definitely cannot run a disaster recovery test from scratch in an hour.</p><p>There is a trap here with AI policy writing that nobody talks about. Claude will happily generate a complete set of SOC 2 policies for you. Access control, change management, incident response, the whole catalog. They will look polished. They will sound authoritative. And they will almost certainly contradict each other in ways you will not catch until the auditor does. The access control policy will reference a quarterly review process. The onboarding policy will describe a monthly cadence. The incident response policy will name a role that does not exist in your org chart. The policies will read like they belong to a different company, because they do. They were generated from patterns that assume a mature security program with dedicated headcount, not a seed stage team where the CTO is also the on-call engineer and the person who provisions laptops.</p>",
  "full": false
 },
 {
  "slug": "why-i-moved-to-hermes",
  "title": "Why I Moved to Hermes (and What It Cost)",
  "date": "2026-06-25",
  "desc": "ChatGPT. Cursor. Claude. I ran through them all, and I kept hitting the same walls. An open-source agent harness, a model nobody was talking about, and a $6.78 bill later, I am shipping five times what I used to. Here is the whole stack.",
  "cat": "Engineering",
  "tags": [
   "ai",
   "ai agents",
   "hermes",
   "obsidian",
   "open source",
   "deepseek",
   "cursor",
   "claude",
   "wispr",
   "voice",
   "productivity"
  ],
  "mins": 14,
  "body": "<p>I have been using AI aggressively since the day ChatGPT launched. GPT-3.5. I signed up the first week and I have not stopped since. I have burned through platforms. I have handed my credit card to multiple companies and told myself the bill was worth it because the velocity was real. And I have hit the same walls over and over until I stopped trying to fix the platforms and started assembling my own.</p><p>This is the story of that stack. What it cost. What it replaced. And why I am putting the whole thing out in the open so anyone can copy it.</p>",
  "full": false
 },
 {
  "slug": "ai-agents-are-writing-my-code-now",
  "title": "AI Agents Are Writing My Code Now",
  "date": "2026-06-21",
  "desc": "After a decade learning Bash, Python, Ansible, and Terraform, I have not written a line of production code in months. AI agents do the implementation now. The job changed. Here is what that actually feels like.",
  "cat": "Engineering",
  "tags": [
   "ai",
   "ai agents",
   "software engineering",
   "career",
   "philosophy"
  ],
  "mins": 11,
  "body": "<p>I used to write code every day. Bash scripts for automation. Python for tooling. <a href=\"https://www.brooks-security.com/posts/why-ansible-outshines-chef-and-puppet-for-configuration-management/\">Ansible playbooks</a> that ran across fleets. Terraform modules that built cloud infrastructure from nothing. For the better part of a decade, that was the job. Know your tools. Write clean code. Ship it.</p><p>I have not written a line of production code in months.</p>",
  "full": false
 },
 {
  "slug": "europe-isnt-behind-on-ai-its-running-a-different-race",
  "title": "Europe Isn't Behind on AI. It's Running a Different Race.",
  "date": "2026-06-14",
  "desc": "Everyone says Europe is losing the AI race. But it chose a different finish line: privacy, dignity, and human flourishing over growth for its own sake.",
  "cat": "Philosophy",
  "tags": [
   "ai",
   "ai governance",
   "europe",
   "privacy",
   "philosophy",
   "policy"
  ],
  "mins": 13,
  "body": "<p>Every few weeks someone publishes the same article. Europe is losing the AI race. Europe missed the boat. Europe regulated itself into irrelevance while America and China built the future. The numbers get cited, the graphs get posted, and everyone nods.</p><p>The numbers are real. I am not going to pretend otherwise.</p>",
  "full": false
 },
 {
  "slug": "spec-driven-development",
  "title": "Spec Driven Development",
  "date": "2026-04-22",
  "desc": "Most software fails from unclear expectations, not weak code. How spec-driven development sharpens requirements and makes AI-assisted work reliable.",
  "cat": "Engineering",
  "tags": [
   "spec-driven development",
   "ai",
   "cursor",
   "claude code",
   "engineering"
  ],
  "mins": 3,
  "body": "<p>Most software failures are not caused by a lack of coding ability. They are caused by unclear expectations.</p><p>If your requirements are vague, your output will be vague. That was true before AI, and it is even more true now.</p><p>Spec Driven Development is the process I use to avoid that trap:</p><ol><li>Handwrite a specification that fully defines the work.</li><li>Hand that spec to Claude Code or Cursor to execute.</li><li>Grade the result against the spec.</li></ol><p>That loop sounds simple, but it changes everything.</p><h2>Why specs matter now</h2><p>With AI-assisted coding, you can generate implementation quickly. The bottleneck is no longer typing speed. The bottleneck is <strong>clarity</strong>.</p><p>I think people miss this: everything an LLM does is a form of hallucination. It is always trying to predict the next most likely token based on training data and context. So when people say \"the model made a mistake,\" I usually read that as \"we gave it weak guidance.\" The model did what models do.</p><p>A good spec removes ambiguity:</p><ul><li>What problem are we solving?</li><li>What does success look like?</li><li>What is explicitly out of scope?</li><li>How should the result be written (style, tone, constraints)?</li></ul><p>When those are explicit, the implementation gets better. When they are not, you get polished nonsense.</p><p>Clear specs improve outcomes because they constrain the hallucination space. If you give precise expectations, the model is more likely to \"hallucinate\" the solution you actually wanted. LLMs do not think like humans; they move outputs closer to or farther from your desired outcome one token at a time.</p><h2>How I write specs</h2><p>I handwrite specs in plain language first. Not because handwritten text is magical, but because it slows me down enough to think clearly.</p><p>The spec should be specific enough that another engineer can execute it without guessing. My baseline template:</p><ul><li>Objective</li><li>Scope and non-scope</li><li>Inputs and outputs</li><li>Constraints (security, compliance, performance, style)</li><li>Acceptance criteria</li><li>Test and validation plan</li></ul><p>If I cannot define acceptance criteria, I am not ready to build.</p><h2>Execution with Claude Code or Cursor</h2><p>Once the spec is solid, I hand it to Claude Code or Cursor and have it execute.</p><p>At that point, the AI is not deciding the product direction. It is executing a contract.</p><p>That is an important difference. The spec owns the intent. The model handles implementation speed.</p><p>My practical loop usually looks like this:</p><ol><li>Prompt with the full spec.</li><li>Review the output for alignment.</li><li>Modify prompt or code.</li><li>Run tests.</li><li>Modify again.</li><li>Commit when acceptance criteria are met.</li></ol><p>I frankly do not write most code from scratch anymore. It is mostly prompting, modifying, testing, and committing. The spec keeps that process grounded.</p><h2>Team workflow: design specs together first</h2><p>If multiple people are involved, collaborate on the spec before implementation starts.</p><p>This avoids the classic engineering problem where everyone \"agrees\" but each person imagines a different outcome.</p><p>Shared spec design gives you:</p><ul><li>Early alignment across engineering, security, and operations</li><li>Faster implementation once coding starts</li><li>Better review quality because reviewers compare against a known contract</li></ul><p>You can still split implementation work across people and tools, but everyone is building to the same target.</p><h2>Grade output against the spec</h2><p>After implementation, grade it against the spec. Do not grade by vibes.</p><p>I use a simple pass/fail checklist tied to acceptance criteria:</p><ul><li>Functional behavior matches the spec</li><li>Security and compliance constraints are met</li><li>Tests pass for required cases</li><li>Documentation and handoff requirements are complete</li></ul><p>If it misses criteria, it is not done. No matter how polished it looks.</p><p>This is the part many teams skip, and it is exactly where quality control lives.</p><h2>Example sanitized spec</h2><p>Here is a sanatized example of a spec I generated for a client of mine:</p><ul><li><a href=\"https://www.brooks-security.com/specs/pmapper-platform-deployment-spec.md\">IAM Graph Analysis Platform Deployment Spec</a></li></ul><h2>Final thought</h2><p>Spec Driven Development is not anti-AI. It is how you make AI useful without losing engineering discipline.</p><p>Write clear specs. Execute fast. Validate ruthlessly.</p><p>That is how you get speed without sacrificing quality.</p>",
  "full": true
 },
 {
  "slug": "grand-goals-for-2024",
  "title": "Grand Goals for 2024",
  "date": "2024-01-08",
  "desc": "My 2024 plan: a deliberate sequence of IT and cloud security certifications, and why I committed to finishing them this year.",
  "cat": "Career Development",
  "tags": [
   "grand goals",
   "skills",
   "coding",
   "sysadmin",
   "devops",
   "certifications"
  ],
  "mins": 2,
  "body": "<p>As 2024 kicks off, I find myself facing a set of ambitious but absolutely necessary goals that I cannot afford to put off any longer. This year, I’m committing to a challenging, purposefully selected sequence of professional certifications, each one a stepping stone designed to systematically broaden my expertise and solidify my role as a knowledgeable leader in the realms of IT Security and Cloud Security.</p><p>My approach isn’t just about collecting acronyms for my résumé. Instead, it’s an intentional journey: every certification targets a specific area where I want to deepen my skillset, sharpen real-world problem-solving abilities, and gain credentials that speak to both technical competence and strategic understanding. I’ve identified key milestones that align with current industry needs and my long-term vision of becoming a top-tier expert in security, architecture, and cloud solutions.</p>",
  "full": false
 },
 {
  "slug": "cost-effective-migration-to-the-cloud",
  "title": "Cost-effective Migration to the Cloud",
  "date": "2023-09-15",
  "desc": "Moving from on-prem to the cloud changes both your security model and your bill. Where expert help genuinely lowers cost and risk.",
  "cat": "Career",
  "tags": [
   "coding",
   "sysadmin",
   "devops"
  ],
  "mins": 3,
  "body": "<p>The transition from on-premises data centers to cloud-hosted providers has become increasingly prevalent, offering organizations the benefits of flexibility, scalability, and often, a reduced total cost of ownership. However, with this migration comes unique challenges, particularly in terms of security and cost management. Let’s delve into why enlisting expert assistance during this transition can both reduce costs and enhance security.</p><p>The security paradigm for cloud-hosted services differs significantly from that of traditional on-premises data centers. Here’s why:</p>",
  "full": false
 },
 {
  "slug": "how-im-developing-my-career-the-power-of-goal-oriented-learning",
  "title": "How I'm Developing My Career: The Power of Goal-Oriented Learning",
  "date": "2023-09-06",
  "desc": "How I built an IT security career through goal-oriented certifications, hands-on projects, and roles that matched where I wanted to grow.",
  "cat": "Career",
  "tags": [
   "skills",
   "coding",
   "sysadmin",
   "devops",
   "certifications"
  ],
  "mins": 2,
  "body": "<p>Crafting a career is a journey of choices and learning. As an IT Security Automation specialist with a professional certification in Linux, I've navigated this journey through a mix of goal-oriented certifications, practical projects, and roles that matched my growing interests and skills.</p><p>Certifications gave a concrete form to my learning goals. After earning a degree in Civil Engineering (Which in retrospect - should have been a degree in Computer Science), I transitioned into the IT sector, gaining hands-on experience with various IT tools and platforms.</p>",
  "full": false
 },
 {
  "slug": "why-patching-servers-manually-is-not-safer",
  "title": "Why Patching Servers Manually is not Safer",
  "date": "2023-09-06",
  "desc": "Patching by hand to avoid outages is a common belief and a costly mistake. Why manual patching adds risk to your servers instead of removing it.",
  "cat": "Career",
  "tags": [
   "skills",
   "patching",
   "sysadmin",
   "security",
   "automation"
  ],
  "mins": 2,
  "body": "<p>As part of my job, I frequently talk to IT managers and senior technical staff. A frequent statement I hear sounds like this, “We patch our servers manually to reduce the risk of an outage.\" This stance is understandable. Regrettable, but understandable. Lets dig into it.</p><p>Humans have expertise but are also prone to mistakes. In server patching, these mistakes can be significant:</p>",
  "full": false
 },
 {
  "slug": "the-necessity-of-coding-skills-for-sysadmins-bridging-the-devops-gap",
  "title": "The Necessity of Coding Skills for Sysadmins: Bridging the DevOps Gap",
  "date": "2022-11-17",
  "desc": "The line between development and operations is gone. Why modern sysadmins have to learn to code, and how DevOps made it non-optional.",
  "cat": "Career",
  "tags": [
   "skills",
   "coding",
   "sysadmin",
   "devops"
  ],
  "mins": 2,
  "body": "<p>The role of a System Administrator, or SysAdmin, is evolving. The lines between development and operations are blurring, and the rise of DevOps culture necessitates SysAdmins to add a new skill to their repertoire: coding.</p><p>The tech world is experiencing a fundamental shift as the walls between development and operations start to crumble. This shift is largely driven by the DevOps movement, a cultural phenomenon that encourages greater collaboration and integration between the traditionally separate developer and IT operations teams.</p>",
  "full": false
 },
 {
  "slug": "why-ansible-outshines-chef-and-puppet-for-configuration-management",
  "title": "Why Ansible Outshines Chef and Puppet for Configuration Management",
  "date": "2022-10-17",
  "desc": "Why I pick Ansible over Chef and Puppet for configuration management: an agentless design, Python underneath, and simpler day-to-day operations.",
  "cat": "Automation",
  "tags": [
   "python",
   "ruby",
   "linux",
   "ansible",
   "chef",
   "puppet"
  ],
  "mins": 2,
  "body": "<p>When it comes to configuration management and IT automation, Ansible, Chef, and Puppet are generally the primary topics of conversation. While each has its strengths, Ansible stands out as the preferred choice for many organizations. Its utilization of Python and the lack of an agent-based architecture offer several significant advantages.</p><p>Ansible, powered by Python, reaps all the benefits of the underlying language. Python’s clean syntax and readability make Ansible's Playbooks (its configuration scripts) easier to create, understand, and maintain than Chef's Ruby-based Cookbooks or Puppet's Puppet Manifests. Python's 'batteries-included' philosophy means many features needed for system-level automation are available in the standard library, simplifying the learning curve for system administrators and developers. As a result, teams can quickly ramp up and start using Ansible for configuration management tasks.</p>",
  "full": false
 },
 {
  "slug": "the-strength-of-python-for-linux-automation",
  "title": "The Strength of Python for Linux Automation",
  "date": "2022-09-17",
  "desc": "Python and Ruby both handle automation, but Python has real advantages on Linux: its standard library, its ecosystem, and why I reach for it.",
  "cat": "Automation",
  "tags": [
   "python",
   "ruby",
   "linux"
  ],
  "mins": 1,
  "body": "<p>Python and Ruby offer robust functionality. However, Python holds distinct advantages for Linux automation.</p><p>Python's 'batteries included' philosophy equips it with a robust standard library. This reduces reliance on external modules. Ruby possesses a commendable library, but Python’s is more extensive.</p>",
  "full": false
 },
 {
  "slug": "the-profitability-of-honesty-a-practical-approach-to-ethical-business",
  "title": "The Profitability of Honesty: A Practical Approach to Ethical Business",
  "date": "2022-09-10",
  "desc": "Honesty looks like it costs you sales. In practice it builds the trust that wins long-term contracts. A practical case for ethics in business.",
  "cat": "Career",
  "tags": [
   "ethics",
   "sales",
   "projects"
  ],
  "mins": 2,
  "body": "<p>Doing business is often about numbers, but there's more to it than just profit. Ethics, although often overshadowed by monetary pursuits, stand as the cornerstone of every transaction.</p><p>Truthfulness, a vital ethic, surprisingly yields high returns. Paradoxical as it may sound, honesty can secure sales, even when it seems like it could jeopardize them. The key lies in understanding that short-term profits should not overshadow long-term customer trust.</p><p>The principle is clear: Morals should guide business actions. However, we acknowledge that not everyone operates from a moral standpoint. Therefore, we turn to incentives, which also reinforce ethical behavior.</p><p>The foundational moral law that governs human interactions insists on honesty and fairness. Thus, even in a business landscape where competition is fierce, this principle remains our compass. It is a compelling force, encouraging us to place ethics over gains, ensuring sustainable success.</p><p>To illustrate, allow me to share a personal experience. Once, my company was in the running to secure a project. During the bid, I realized one aspect of our product didn't meet the client's requirements. I faced a dilemma: hide this shortcoming and risk losing trust in the future or be honest about it and possibly lose the contract.</p><p>I chose the path of truth, explaining the situation to the customer. The revelation risked our chances, but it established a strong trust foundation. The customer appreciated our honesty, commenting on the rarity of such transparency in the industry. Despite the product shortfall, they awarded us the contract. They valued trust over perfection.</p><p>This episode reconfirmed my belief: honesty and transparency, while seemingly disadvantageous in the short run, provide a long-term advantage. The benefits aren't just ethical; they also translate into a concrete, tangible gain, fostering customer loyalty and a strong market reputation.</p><p>One might argue that I took a risk, jeopardizing the deal. But ethics in business is about taking the right risks, not the easy ones. By staying truthful, we strengthened our relationship with the customer and demonstrated our commitment to moral principles.</p><p>A contrasting example that strengthens this belief involves a former client of a competing business. This competitor made a promise about specific functionality in their product, a crucial feature for the client. However, when the product failed to deliver, the company not only failed to acknowledge the shortcoming but also denied ever making such a promise, effectively gaslighting the client.</p><p>Feeling manipulated and deceived, the client sought a provider that prioritized honesty over sales gimmicks. Although our platform was more expensive, they approached us because they valued our reputation. The client was willing to pay a premium for honesty and the reassurance of not being manipulated. This relationship, born from another's deceit, has flourished, demonstrating the potency of truthfulness in business.</p><p>Ultimately, the most profitable business strategy is ethical conduct. Profits should not override honesty, but instead align with it, forging a path for enduring success. A sale might bring immediate profit, but the trust earned through honesty will bring lifelong customers. It's a lesson every business, large or small, should imbibe: Truth is the best policy.</p>",
  "full": true
 },
 {
  "slug": "colemak-an-efficient-keyboard-layout",
  "title": "Colemak: An Efficient Keyboard Layout",
  "date": "2020-09-12",
  "desc": "Why I switched from QWERTY to Colemak, what the transition actually felt like, and whether the speed and ergonomics paid off.",
  "cat": "Career",
  "tags": [
   "skills",
   "coding",
   "sysadmin"
  ],
  "mins": 2,
  "body": "<p>Colemak is a keyboard layout devised by Shai Coleman, prioritizing efficiency, speed, and ergonomics. The design situates the most used keys beneath the strongest fingers, reducing finger travel by 35% compared to QWERTY. This reduction in movement increases typing speed, enhances comfort, reduces finger fatigue, and mitigates the risk of Repetitive Strain Injury (RSI).</p><p>Transitioning to Colemak was an absolute commitment, a leap from QWERTY to Colemak. The early phase was challenging, marked by a slow progress of 10 words per minute. The act of retyping passwords acted as a persistent reminder of the learning curve. After a month of consistent practice, however, Colemak began to feel natural, and typing speed and comfort markedly improved.</p>",
  "full": false
 }
];

/* ---------------- helpers ---------------- */

S.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
S.date = (d, o) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', o || { year: 'numeric', month: 'short', day: 'numeric' });
S.post = slug => S.posts.find(p => p.slug === slug);
S.project = slug => S.projects.find(p => p.slug === slug);
S.categories = [...new Set(S.posts.map(p => p.cat))];
S.reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
S.framed = (() => { try { return self !== top; } catch (e) { return true; } })();
S.liveUrl = p => LIVE + '/posts/' + p.slug + '/';
// Run a same-page state change inside a view transition when the browser supports it.
S.vt = fn => {
  if (!document.startViewTransition || S.reduced()) { fn(); return Promise.resolve(); }
  const t = document.startViewTransition(fn);
  t.ready.catch(() => {});
  return t.finished;
};

// GitHub-shaped contribution calendar ({total, weeks:[{days:[{date,count,level,weekday}]}]}),
// the same shape hugo/data/contributions.json has, so production can drop the real file in.
// ponytail: seeded sample data for the mockups; the nightly job already bakes the real thing.
S.heatmap = (() => {
  let seed = 20260923;
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const end = new Date('2026-09-23T12:00:00');
  const d = new Date(end); d.setDate(d.getDate() - 364 - d.getDay());
  const weeks = [], counts = [];
  let total = 0, w;
  for (; d <= end; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd === 0) weeks.push((w = { days: [] }));
    const wk = weeks.length - 1;
    const tide = 0.55 + 0.45 * Math.sin(wk / 3.1) + (wk > 36 ? 0.45 : 0);
    const off = wk === 11 || wk === 27 || wk === 28;
    const p = (wd === 0 || wd === 6 ? 0.38 : 0.9) * Math.min(1, 0.5 + tide * 0.5);
    const count = off ? 0 : rnd() < p ? Math.max(1, Math.round((rnd() * 0.6 + rnd() * rnd()) * 11 * tide)) : 0;
    total += count; if (count) counts.push(count);
    w.days.push({ date: d.toISOString().slice(0, 10), count, weekday: wd });
  }
  counts.sort((a, b) => a - b);
  const q = f => counts[Math.floor(counts.length * f)];
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  for (const wk of weeks) for (const day of wk.days)
    day.level = !day.count ? 'NONE' : day.count <= q1 ? 'FIRST_QUARTILE' : day.count <= q2 ? 'SECOND_QUARTILE' : day.count <= q3 ? 'THIRD_QUARTILE' : 'FOURTH_QUARTILE';
  return { total, weeks, sample: true };
})();
S.level = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

// Heatmap as an SVG string. Each design styles .hm-l0 through .hm-l4 itself.
S.heatmapSVG = ({ cell = 11, gap = 3, radius = 2, cls = 'hm' } = {}) => {
  const step = cell + gap, W = S.heatmap.weeks.length * step - gap, H = 7 * step - gap;
  let r = '';
  S.heatmap.weeks.forEach((wk, i) => wk.days.forEach(day => {
    r += `<rect x="${i * step}" y="${day.weekday * step}" width="${cell}" height="${cell}" rx="${radius}" class="hm-l${S.level[day.level]}" style="--i:${i}"><title>${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}</title></rect>`;
  }));
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${S.heatmap.total} GitHub contributions in the last year (sample data)">${r}</svg>`;
};

// Search index over pages, projects, and posts. Each design maps {type, id} to its own route.
S.pages = [
  ['home', 'Overview', S.lead.join(' ')],
  ['experience', 'Work experience', S.roles.map(r => r.title + ' ' + r.org).join(' ')],
  ['credentials', 'Credentials', S.certs.map(c => c.name + ' ' + c.abbr).join(' ')],
  ['platforms', 'Platforms and stack', S.platforms.flatMap(g => g.items.map(i => i[0])).join(' ')],
  ['portfolio', 'Portfolio', S.projects.map(p => p.name).join(' ')],
  ['poc', 'Running a POC', S.poc.steps.map(s => s.title).join(' ')],
  ['talks', 'Speaking', S.talks.rooms.map(r => r.name).join(' ')],
  ['architecture', 'How this site runs', 'aws cloudfront s3 lambda terraform architecture gitops cost'],
  ['writing', 'Blog', 'writing posts articles'],
  ['contact', 'Contact', 'email hire message get in touch'],
  ['resume', 'Resume', 'cv pdf print download'],
];
S.index = [
  ...S.pages.map(([id, title, text]) => ({ type: 'page', id, title, text, kind: 'Page' })),
  ...S.projects.map(p => ({ type: 'project', id: p.slug, title: p.name, text: p.one + ' ' + p.stack.join(' ') + ' ' + p.kind, kind: p.kind })),
  ...S.posts.map(p => ({ type: 'post', id: p.slug, title: p.title, text: p.desc + ' ' + p.tags.join(' ') + ' ' + p.cat, kind: 'Post' })),
];
S.search = query => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  return S.index.map(it => {
    const t = it.title.toLowerCase(), hay = t + ' ' + it.text.toLowerCase();
    if (!words.every(w => hay.includes(w))) return null;
    return { ...it, score: (t.startsWith(q) ? 20 : 0) + (t.includes(q) ? 10 : 0) + words.filter(w => t.includes(w)).length * 3 - (it.type === 'post' ? 1 : 0) };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);
};

// Hash router with View Transitions. Routes are plain tokens ("work", "post.slug") so
// they also survive as artifact deep links. dirOf(from, to, back) names the motion;
// designs key their ::view-transition CSS off html[data-dir].
S.router = (render, dirOf = (f, t, back) => (back ? 'back' : 'forward')) => {
  let cur = null, n = 0;
  const saved = {};
  const run = () => {
    const to = location.hash.slice(1) || 'home';
    if (to === cur) return;
    let back = false;
    const st = history.state;
    if (st && typeof st.i === 'number') { back = st.i < n; n = st.i; }
    else { n++; try { history.replaceState({ i: n }, ''); } catch (e) { /* sandboxed frame */ } }
    const from = cur;
    if (from) saved[from] = scrollY;
    const dir = from ? dirOf(from, to, back) : 'none';
    const update = () => { render(to, from, dir); cur = to; scrollTo(0, back ? saved[to] || 0 : 0); };
    document.documentElement.dataset.dir = dir;
    if (!from || !document.startViewTransition || S.reduced()) update();
    else document.startViewTransition(update).ready.catch(() => {}); // skipped by a faster click
  };
  addEventListener('hashchange', run);
  run();
  return { go: to => { location.hash = to; }, get current() { return cur; } };
};

// Theme toggle: system by default, explicit choice stamped on <html data-theme>.
S.theme = btn => {
  const root = document.documentElement, key = 'theme:' + location.pathname;
  try { const t = localStorage.getItem(key); if (t) root.dataset.theme = t; } catch (e) {}
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const label = () => btn && btn.setAttribute('aria-label', dark() ? 'Switch to light theme' : 'Switch to dark theme');
  label();
  btn && btn.addEventListener('click', () => {
    const next = dark() ? 'light' : 'dark';
    const apply = () => { root.dataset.theme = next; label(); };
    root.dataset.dir = 'theme';
    S.vt(apply);
    try { localStorage.setItem(key, next); } catch (e) {}
  });
};

// Contact form. Same states as the production form (honeypot, pending, ok),
// but nothing leaves the page. `animate` may return a promise to play a send sequence.
S.contact = (form, status, animate) => {
  const say = (msg, kind) => { status.textContent = msg; status.dataset.kind = kind || ''; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.elements.company && form.elements.company.value) { form.reset(); return say('Thanks, your message is on its way.', 'ok'); }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    say('Sending...', 'pending');
    await (animate ? animate() : new Promise(r => setTimeout(r, 900)));
    btn.disabled = false;
    form.reset();
    say('Thanks, your message is on its way. I’ll be in touch. (Mockup: nothing was sent.)', 'ok');
  });
};

// Contact form fields shared by every design; each design wraps and styles them.
S.formFields = (p = 'cf') => `
  <div class="field"><label for="${p}-name">Name</label><input id="${p}-name" name="name" required autocomplete="name"></div>
  <div class="field"><label for="${p}-email">Email</label><input id="${p}-email" name="email" type="email" required autocomplete="email"></div>
  <div class="field"><label for="${p}-subject">Subject</label><input id="${p}-subject" name="subject" autocomplete="off"></div>
  <div class="field"><label for="${p}-message">Message</label><textarea id="${p}-message" name="message" rows="6" required></textarea></div>
  <div class="hp" aria-hidden="true"><label for="${p}-company">Company</label><input id="${p}-company" name="company" tabindex="-1" autocomplete="off"></div>`;
S.recaptcha = 'Protected by reCAPTCHA Enterprise on the live site.';

// Video with a fallback link, for hosts that block the remote file.
S.videoHTML = (cls = 'video') => `
  <figure class="${cls}">
    <video controls preload="none" playsinline poster="${S.talks.video.poster}" src="${S.talks.video.src}"></video>
    <figcaption><span>${S.esc(S.talks.video.title)}</span><a href="${S.talks.video.src}" target="_blank" rel="noopener">Open the recording ↗</a></figcaption>
  </figure>`;

// One-page resume, semantic markup that each design styles.
S.resumeHTML = () => `
  <article class="resume">
    <header>
      <h1>${S.profile.name}</h1>
      <p class="r-role">Sales Engineer / Solutions Architect</p>
      <p class="r-contact">Moscow, Idaho (open to relocation) · ${S.profile.email} · linkedin.com/in/grahamwbrooks · github.com/littleseneca · brooks-security.com</p>
    </header>
    <section><h2>Professional summary</h2><p>${S.summary}</p></section>
    <section><h2>Core skills</h2><dl>${S.skills.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></section>
    <section><h2>Professional experience</h2>${S.roles.map(r => `
      <div class="r-job"><h3>${r.title}</h3><p class="r-meta">${r.org}, ${r.where.split(' · ')[0]} · ${r.dates}</p>
      <ul>${r.bullets.map(b => `<li>${b[1]}</li>`).join('')}</ul></div>`).join('')}
    </section>
    <section><h2>Certifications</h2><ul class="r-certs">${S.certs.map(c => `<li>${c.name} (${c.abbr}), ${c.year}</li>`).join('')}</ul></section>
    <section><h2>Education</h2><p>Bachelor of Science, Civil Engineering. Washington State University, Pullman, Washington, 2018.</p></section>
  </article>`;
})();
