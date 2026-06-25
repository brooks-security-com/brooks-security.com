+++
title = "Why I Moved to Hermes (and What It Cost)"
description = "After bouncing between ChatGPT, Cursor, and Claude, I landed on an open-source agent harness and spent $6.78 in two weeks while shipping 5x what I could on closed platforms. Here is the journey."
tags = [
    "ai",
    "ai agents",
    "hermes",
    "open source",
    "deepseek",
    "cursor",
    "claude",
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

The problem was rate limiting. Even on the paid tiers, even with a healthy monthly bill, I would hit the wall. A session would get going, momentum would build, and then — "you have exceeded your rate limit, try again in X hours." Nothing kills a flow state faster than being told to come back later by the tool you are paying to use right now.

Maybe Anthropic fixes this. Their models are excellent. But I could not wait.

## The open-source turn

Here is a thing I have learned across two decades in infrastructure: open source solves the problem eventually. Every time. It just takes a year or two longer than you want it to.

For AI inference, that moment is now. Between DeepSeek's models, Fireworks AI's caching layer, and Hermes as the agent harness, you can assemble the whole stack yourself. No single vendor owns the pipeline. No single rate limit blocks your day.

The pieces:

- **Hermes** — an open-source agent harness from Nous Research. It is the orchestrator. It manages tools, skills, memory, and sessions. You point it at any model from any provider and it just works. Skill system, cron jobs, delegation, the whole thing. It does not care whose model is on the other end.
- **DeepSeek V4** — the model. Pro for hard reasoning, Flash for fast turnaround. I run both.
- **Fireworks AI** — the inference provider. Their context caching is the secret weapon. When you are working in the same workloads for long stretches — same codebase, same tool definitions, same system prompt — you are not hitting new tokens on every turn. You are hitting cached tokens. And cached tokens basically cost nothing.

## The numbers

I have been using Hermes for about two weeks. In that time I have shipped roughly five times what I would have in a comparable period with Claude Co-Work. Not five times more lines of code. Five times more *deliverables*. Infrastructure changes, PRs, documentation, the things that actually move projects forward.

Here is what that cost me:

| | Tokens Used | Cost |
|---|---|---|
| DeepSeek V4 Pro | 548 million | $6.78 |
| DeepSeek V4 Flash | 13 million | included above |
| **Total** | **561 million** | **$6.78** |

Five hundred sixty one million tokens. A latte and a half.

If I had run that same volume through Anthropic's API at their per-token rates — even a rough estimate puts it well into the hundreds of dollars. I would have burned through more than my monthly budget in a week. And I still would have hit rate limits halfway through.

My total inference spend right now runs about fifty dollars a month across everything. Hermes harness, DeepSeek models, Fireworks caching. That is less than what I was paying for Claude alone, and I am producing more.

## The thing that matters

The cost is nice. The speed is better. But the thing that actually matters is that I am not waiting.

No rate limit banner. No "try again later." No watching the clock tick down on a session that was just getting good. I type. It works. I keep working.

That is worth more than $6.78.
