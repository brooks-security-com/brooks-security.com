+++
title = "Why I Moved to Hermes (and What It Cost)"
description = "After bouncing between ChatGPT, Cursor, and Claude, I landed on an open-source agent harness and spent $6.78 in two weeks while shipping 5x what I could on closed platforms. Here is the journey."
tags = [
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
    "productivity",
]
date = "2026-06-25"
categories = [
    "Engineering",
]
menu = "main"
+++

I have been using AI aggressively since the tools started being useful. That was late 2022 for me, like a lot of people. ChatGPT. The thing where you type something and it types back and you think, okay, this is different.

I have not stopped since. But the tools have changed, and so has the bill.

## The ChatGPT-to-Cursor pipeline

ChatGPT was the on-ramp. I used it for everything — writing scripts, debugging Ansible, explaining Terraform errors. But it was slow in the loop. Copy from terminal, paste into browser, copy back. You spend more time moving text around than thinking.

Cursor fixed that. Inline completions, chat in the editor, the thing where it actually knew your codebase. I moved fast and I paid for it. Their top-tier plan was not cheap. I do not remember whether it was a hundred a month or two hundred, but either way I handed them my card and did not think about it, because the velocity was real.

But Cursor was still a copilot. It suggested. It autocompleted. It did not *go do the thing*.

## Claude Code and the agent era

Claude Code changed that. Finally I could say "fix the failing Semaphore build" or "add this endpoint with tests" and it would read the codebase, figure out what to change, make the edits, and even run the tests. Claude Co-Work took it further — long-running sessions, project context, persistence across days.

I used both heavily. And I mean heavily. I paid Anthropic a substantial amount of money every month. Not a hobby subscription. Real money.

Two problems emerged. One is well-known: rate limiting. Even on the paid tiers, even with a healthy monthly bill, I would hit the wall. A session would get going, momentum would build, and then — "you have exceeded your rate limit, try again in X hours." Nothing kills a flow state faster than being told to come back later by the tool you are paying to use right now.

The second problem is less discussed but more frustrating: the guardrails. Claude has an extremely cautious posture around what it will do without explicit approval. If you are building a React todo app, this is fine. If you are a senior engineer trying to work fast, it is maddening. Every file write, every shell command, every API call — another pause, another approval dialog, another "are you sure?" The model treats you like you might hurt yourself.

I understand why they built it this way. Most users are not developers. Most users should not have an agent running arbitrary shell commands on their machine. The safety problem is real.

But there are better ways to solve it than making every user click through a consent form forty times a day into eternity. You scope the API keys. You give the agent access to specific directories, not the whole filesystem. You run it in a container or a sandboxed environment where the blast radius is contained. You put mechanical blocks in place — file system boundaries, network restrictions, command allowlists — rather than hoping the model respects your intentions.

These are not theoretical. I scope my Hermes API keys to exactly what they need. I give it specific project directories. The tool definitions themselves carry scope — the terminal tool runs in a defined working directory, the file tools operate on known paths. The safety is in the architecture, not in a popup.

Maybe Anthropic fixes both problems. Their models are excellent. But I could not wait.

## The open-source turn

Here is a thing I have learned across two decades in infrastructure: open source solves the problem eventually. Every time. It just takes a year or two longer than you want it to.

For AI inference, that moment is now. Between DeepSeek's models, Fireworks AI's caching layer, and Hermes as the agent harness, you can assemble the whole stack yourself. No single vendor owns the pipeline. No single rate limit blocks your day. And no single company decides how much you have to ask permission.

The pieces:

- **Hermes** — an open-source agent harness from Nous Research. It is the orchestrator. It manages tools, skills, memory, and sessions. You point it at any model from any provider and it just works. Skill system, cron jobs, delegation, the whole thing. It does not care whose model is on the other end, and it does not pester you with approval dialogs because the safety model assumes you are a competent adult who knows how to scope credentials.
- **DeepSeek V4** — the model. Pro for hard reasoning, Flash for fast turnaround. I run both.
- **Fireworks AI** — the inference provider. Their context caching is the secret weapon. When you are working in the same workloads for long stretches — same codebase, same tool definitions, same system prompt — you are not hitting new tokens on every turn. You are hitting cached tokens. And cached tokens basically cost nothing.

The open-source approach also means the tool gets better in the direction you actually need. With Claude, if it does not respect your skill definitions — and it often does not if the task looks risky to the safety layer — you just live with it. With Hermes, the skills are your own files. You write them, you patch them when they are wrong, and the agent follows them because the system prompt tells it to. There is no corporate safety layer overriding your instructions. You are responsible for what it does, so you have control over what it does.

## The numbers

I have been using Hermes for about two weeks. In that time I have shipped roughly five times what I would have in a comparable period with Claude Co-Work. Not five times more lines of code. Five times more *deliverables*. Infrastructure changes, PRs, documentation, the things that actually move projects forward.

Here is what that cost me:

| | Tokens Used | Cost |
|---|---|---|
| DeepSeek V4 Pro | 548 million | $6.78 |
| DeepSeek V4 Flash | 13 million | included above |
| **Total** | **561 million** | **$6.78** |

Five hundred sixty one million tokens. A latte and a half.

If I had run that same volume through Anthropic's API at their per-token rates — even a rough estimate puts it well into the hundreds of dollars. I would have burned through more than my monthly budget in a week, assuming I did not hit rate limits first. Assuming the approval dialogs did not slow me down enough to not get that far.

My total inference spend right now runs about fifty dollars a month across everything. Hermes harness, DeepSeek models, Fireworks caching. That is less than what I was paying for Claude alone, and I am producing more.

## Obsidian: the graph that ties it together

One of the quiet advantages of running your own agent harness is that it can integrate with whatever tools you want, not whatever tools the platform decided to support. For me, the most valuable of those is Obsidian.

Obsidian is a note-taking app built on plain markdown files. Every note lives on your disk, in folders you control. This local-first architecture matters because it means your agent can read, write, and search your notes directly — no API key, no cloud sync, no permissions model. It is just a filesystem.

And Hermes has skills for it. When I finish a session, the agent writes structured session notes into my Obsidian vault — what we worked on, what decisions were made, what broke, what worked. Every deliverable gets an artifact note. Every project gets a living project note that grows over time.

I did not invent this pattern. I got it from [Mete Polat's writeup](https://metedata.substack.com/p/013-my-hermes-and-obsidian-set-up) of his Hermes and Obsidian setup, and it is the single highest-leverage thing I have added to my workflow this year. Mete describes voice-noting ideas on dog walks and having his agent transcribe, tag, and enrich them into structured Obsidian notes by the time he sits down. Mine is more engineering-focused — session records, PR retrospectives, infrastructure decisions — but the principle is the same. The agent does the documentation as part of doing the work.

![Obsidian graph view showing my vault — green nodes are notes, grey lines are links between them. The large central hub is the most connected ideas.](/obsidian-graph.png)

*My Obsidian vault in graph view. Every green dot is a note. The grey lines are links between them. The large central hub is where the most connections converge — usually the project notes that tie everything together.*

This pays off in ways that are not obvious until you live with it for a while. When I hit a problem I know I have hit before, I do not search through chat logs or dig through old PRs. I search my vault. The session notes are there with the exact error message, the fix, and the context of what else was happening at the time. Mistakes become reference material. Successes become patterns that get reused.

It also cuts token usage. When the agent can load a skill that already knows how to do the thing, it does not need to figure it out again. When it can pull up a past session note instead of asking me what happened last time, it saves both of us the round trip. Over hundreds of sessions, the savings compound.

## Wispr Flow: voice at the speed of thought

There is one more piece to this workflow, and it is on the input side. I can talk a lot faster than I can type. Most people can. If you have ever dictated a long prompt, you know the problem: the built-in dictation on macOS and Linux is fine for a sentence, but it falls apart on anything longer. Words get mangled. Punctuation is a fight. After two paragraphs you are correcting more than you are saying.

I started using [Wispr Flow](https://wisprflow.ai) a while back and it changed how much context I can put into a prompt. Instead of a one-line instruction — "fix the CI pipeline" — I can dictate three paragraphs of exactly what broke, what I already tried, which environment it is in, and what the expected output should be. All in about thirty seconds. The agent gets a fully-loaded brief instead of a vague request, and the quality of the output goes up accordingly.

It is also surprisingly cost-efficient. Way better than the built-in dictation on either macOS or Linux, and it handles technical vocabulary without flinching — Ansible, Terraform, Semaphore, all of it comes through clean. When you are talking to an agent that can consume unlimited context, the bottleneck should not be your typing speed.

Combine Wispr Flow on the input side with the Obsidian vault on the output side, and you have a loop. Voice your ideas in detail. The agent does the work. The work gets documented. The documentation trains the skills that make the next session faster. Rinse, repeat, ship more.

## The thing that matters

The cost is nice. The speed is better. The control is essential. But the thing that actually matters is that I am not waiting.

No rate limit banner. No "try again later." No approval popup asking me to confirm the command I just told it to run. I type. It works. I keep working.

That is worth more than $6.78.
