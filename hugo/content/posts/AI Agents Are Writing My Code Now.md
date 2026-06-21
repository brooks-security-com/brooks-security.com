+++
title = "AI Agents Are Writing My Code Now"
description = "After a decade learning Bash, Python, Ansible, and Terraform, I have not written a line of production code in months. AI agents do the implementation now. The job changed. Here is what that actually feels like."
tags = [
    "ai",
    "ai agents",
    "software engineering",
    "career",
    "philosophy",
]
date = "2026-06-21"
categories = [
    "Engineering",
]
menu = "main"
+++

I used to write code every day. Bash scripts for automation. Python for tooling. [Ansible playbooks](/posts/why-ansible-outshines-chef-and-puppet-for-configuration-management/) that ran across fleets. Terraform modules that built cloud infrastructure from nothing. For the better part of a decade, that was the job. Know your tools. Write clean code. Ship it.

I have not written a line of production code in months.

Not because I stopped working. I am shipping more than I ever have. The things I ship are higher quality than anything I built by hand. But I am not the one writing the code anymore. AI agents are.

And I can feel those skills going.

## The Weirdness

There is a particular discomfort in spending a career learning something, getting good at it, building an identity around it, and then watching it become optional. Not obsolete. Optional. I still know how to do it. I still read every pull request that goes into production. I still make edits. But the ratio has flipped. I used to write 90 percent of the code and review 10 percent. Now I write maybe 5 percent and review 95.

The review part still uses the skills. Reading a diff, understanding what it does to the system, spotting the edge case before it ships. That is the same brain. But the act of typing the code, the thing I spent ten years practicing, is going.

It feels like losing a language. If you have ever been fluent in something and then moved somewhere you do not speak it anymore, you know the feeling. The grammar is still in there somewhere. The vocabulary has not vanished. But you reach for a word and it is not there. You hesitate where you used to be fast. The fluency fades, and you feel it fading, and there is nothing to do about it except watch.

I am not alone in this. Peng et al. (2023) found that developers using GitHub Copilot finished a task 55.8 percent faster than those writing the code by hand. A year later, GitHub's own research found that code written with Copilot was 53.2 percent more likely to pass every unit test in a controlled trial of experienced developers (GitHub, 2024). The tools work. That is not the question. The question is what happens to the person holding them.

## But Look at What Is Shipping

Here is the counterweight.

In the last two months I have built and shipped more working infrastructure and automation than I did in the six months before that. Some of it is sophisticated. Multi-cloud deployment pipelines. Agent orchestration systems. Compliance evidence collection that runs on a schedule and produces auditor-ready output. Things that would have taken weeks of careful implementation now take days. Sometimes hours.

And the quality is not worse. It is better in a lot of ways. The agents do not forget edge cases because they are tired. They do not skip writing tests because it is late. They write documentation that is actually readable. When you give them the right context, the right skills, the right guardrails, they produce work that would pass review on any senior team I have been on.

So I have a problem. On one hand, I am losing something I valued. On the other, I am more productive than I have ever been. Both things are true at the same time.

## The Slop Argument

Everyone keeps saying AI writes slop.

I am going to say something that will annoy people on both sides of this. AI does not write slop. People write slop, using AI.

Here is the mechanism. You open a chat window. You type a one-sentence prompt. The model generates something. It looks plausible. You copy it. You paste it. You ship it. That is not the AI being bad at writing code. That is you being bad at using the tool. Garbage in, garbage out, except now the garbage has perfect grammar.

The people I see doing this well are not treating AI like a code generator. They are treating it like a junior engineer with perfect recall and no judgment. You do not give a junior a one-line ticket and merge whatever comes back. [You write a spec](/posts/spec-driven-development/). You define the patterns. You give them context about how the codebase works. You review the output carefully. You reject the parts that are wrong. You iterate until it is right. If I cannot write the acceptance criteria, I am not ready to hand the work to anyone, human or model.

That is what skills and pipelines do for an agent. They front-load the context. Instead of the agent guessing what conventions you follow, what error handling you prefer, what your infrastructure looks like, you give it that up front. You pay the token cost once and every interaction after that is sharper for it.

The difference between prompting and engineering with AI is the difference between asking a stranger to fix your car and handing a mechanic the service manual for your specific vehicle.

But there is a deeper point the slop debate misses. The quality of the code is no longer the interesting variable. The quality of the decision to ship it is.

## The Automation Paradox

Here is a thing I learned the hard way. The more you automate, the deeper your understanding has to be. Not shallower. Deeper.

This is not intuitive. It runs against the sales pitch. The sales pitch says tools make things easier. They do. But easier to execute is not easier to understand. When you wrote every line yourself, you understood the system by default, because you built it. Now the system is built for you, and understanding it is an active choice. A discipline.

There is a well-documented version of this in aviation. They call it the automation paradox. As cockpit automation improved, pilots spent less time hand-flying and more time monitoring systems. The skill of hand-flying atrophied. But when the automation failed, as it does, the pilot had to take over a complex aircraft with diminished manual skills and a degraded picture of what the automation had been doing. The FAA has spent decades trying to solve this (Federal Aviation Administration, 2013).

Software is entering its own version. The autopilot is getting very good. But systems still fail. Outages still happen at 3 AM. Auditors still ask the question the agent never thought to prepare for. And when that moment comes, the person who only knows how to prompt is not the person you want holding the controls.

So you do not merge it blind. You read the diff. You run the tests. You check the edge cases. You ask the questions the agent does not know to ask. What happens when this fails at 3 AM and nobody is awake. What happens when the upstream API changes. What happens when the thing this depends on is down.

The agent cannot answer those questions. It has never been paged at 3 AM. It has never had to explain to a customer why the thing is broken. It has never felt the particular dread of watching a deploy go sideways and knowing you are the one who has to fix it.

That is the human in the loop. Not rubber-stamping the output. Reading it, with the scars.

## The Portfolio Problem

This shift creates a strange second-order problem. It is much harder to signal competence now.

When I built things by hand, a project was proof of work. A Terraform module that provisioned a full AWS environment meant I knew Terraform, knew AWS, understood networking and IAM and cost. The artifact itself was the signal.

Now anyone can generate a Terraform module that provisions a full AWS environment. The artifact is not the signal anymore. I can produce something that looks like senior-level work in an afternoon, and so can a college student who has never logged into the AWS console.

This is a real problem for portfolios. Not because the work is fake. Because the work is now the baseline. Everyone has the same models. Everyone can generate the same artifacts. The thing that separates people is not the code. It is the operations.

What did you make better. What was broken before you touched it, and what stayed fixed after you left. Nobody is impressed that you can generate a CI/CD pipeline. Everyone can generate a CI/CD pipeline. They are impressed that your pipeline caught a regression before it hit production, that your monitoring surfaced a memory leak before users noticed, that your architecture survived a real traffic spike without waking anyone up. Anyone can build on AWS now. Building it cheap, reliable, and boring to maintain is still the actual skill.

The trophy is not the code. The trophy is the outcome.

## The Foundations Don't Move

I want to say something about tooling, but at the level above the tools, because the specifics change too fast.

The ground moves every single day. Not every week. Every day. A new model drops. A new capability ships. Someone releases a framework that changes how you think about agent orchestration. Keeping up is its own skill set now, and it is one that did not exist three years ago.

So how do you set yourself up so you are not rebuilding your entire workflow every time the ground moves. The answer is not picking the right tool. The answer is having foundations that do not care what the right tool is this week.

First principles. You do not need to know which model writes the best Terraform if you know what good Terraform looks like. You can evaluate output from any system, from any provider, because you know the standard. You know which patterns are safe and which ones create blast radius. That knowledge is portable. The tools churn. The foundations do not.

Understanding risk. Most people skip this entirely. They generate code and ship it without asking what breaks if it is wrong. What is the blast radius. What depends on this. What happens if it fails at 3 AM. If you cannot answer those questions, no tool saves you. If you can, the tool barely matters.

Knowing how to triage. The model hands you 200 lines. You do not have time to read every line with equal care. You need to know where the dangerous parts are. The state changes. The IAM policies. The network edits. The database migrations. A senior engineer's triage instinct, the thing that makes them glance at a diff and zoom straight to the three lines that matter, is not automatable. It comes from having broken things and fixed them.

A documented environment. The models are only as good as the context you give them. If your infrastructure is not documented, if your architecture decisions live in Slack threads, if nobody wrote down why you made the tradeoffs you made, the agent is flying blind. So write it down. Not for the agent. For the next person. The agent just happens to benefit.

The DORA research has studied what makes engineering teams effective for over a decade. Their 2024 report found something that should be obvious and keeps getting ignored. AI adoption is accelerating, but team culture and established practices are still more predictive of delivery outcomes than any specific tool choice (Google Cloud, 2024). The practices that produced good outcomes before AI still produce good outcomes with AI. The practices that produced bad outcomes before AI still produce bad outcomes, just faster.

These things are boring. They are not exciting the way a new model release is exciting. But they are the difference between someone who gets whiplash every time the ground shifts and someone who watches it shift, evaluates it calmly, and adjusts.

## The New Skill

So if the foundations keep you stable while the tools churn, what is the thing you are actually practicing every day now. What replaces writing clean code as the craft.

It is orchestration. Not the buzzword. The specific act.

The model writes the function. You decide whether the function belongs in the codebase at all. The model generates the Terraform module. You decide whether the architecture it implies is safe for your environment. The model produces a deployment pipeline. You decide whether the blast radius is acceptable, whether the monitoring is adequate, whether the rollback path exists.

These are not code review decisions. They are system design decisions. They are risk decisions. They are the decisions that used to be spread across a week of implementation and are now compressed into the thirty seconds after the model finishes generating.

That compression is the skill. Making good decisions fast, against output you did not write, for a system you understand better than the thing that generated the code ever will.

The models know everything and understand nothing. They know every AWS API. They know every Terraform resource type. They know the syntax of every language. They do not know that your team is three people and nobody is on call on the weekend. They do not know that the audit is in six weeks and this is the one system the auditor is going to scrutinize. They do not know that the VP of Engineering got burned by a Kafka migration two years ago and will veto anything that touches the message bus.

That knowledge is not in the training data. It is in your head. And if it is not in your head, it is not in the system at all.

The craft changed. It used to be producing correct code. Now it is producing correct decisions about code you did not write. Same standard. Different muscle.

## Final Thoughts

I do not have a clean conclusion for this one. I am still inside it. The skills are fading and the output is rising and I do not know how to feel about either one except to notice that they are both true.

Maybe the right frame is this. For most of my career I was a builder. I swung the hammer. Now I am the architect who still reads the blueprints carefully and walks the site every morning, but I am not the one pouring the concrete. The house is better. It goes up faster. But I miss the hammer sometimes.

The people who thrive in this shift are not the ones who refuse to let go of the hammer. They are not the ones who trust the blueprints without reading them. They are the ones who know the craft well enough to know what good looks like, and who let the tools change while the standard does not.

Same standards. Different tools. More ships.

## References

Federal Aviation Administration. (2013). *Operational use of flight path management systems* (Final report of the Performance-based Operations Aviation Rulemaking Committee and Commercial Aviation Safety Team Flight Deck Automation Working Group). https://www.faa.gov/regulations_policies/rulemaking/committees/documents/media/TAecT1-051013-PARC%20CAST%20Flight%20Deck%20Automation%20Final%20Report%20Sept%202013.pdf

GitHub. (2024, October 29). *Research: Quantifying GitHub Copilot's impact on code quality*. The GitHub Blog. https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-code-quality/

Google Cloud. (2024). *2024 Accelerate State of DevOps Report*. https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-accelerate-state-of-devops-report

Peng, S., Kalliamvakou, E., Cihon, P., & Demirer, M. (2023). *The impact of AI on developer productivity: Evidence from GitHub Copilot* (arXiv:2302.06590). arXiv. https://arxiv.org/abs/2302.06590
