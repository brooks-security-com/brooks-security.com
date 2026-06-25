+++
title = "Why I Moved to Hermes (and What It Cost)"
description = "ChatGPT. Cursor. Claude. I ran through them all, and I kept hitting the same walls. An open-source agent harness, a model nobody was talking about, and a $6.78 bill later, I am shipping five times what I used to. Here is the whole stack."
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

I have been using AI aggressively since the day ChatGPT launched. GPT-3.5. I signed up the first week and I have not stopped since. I have burned through platforms. I have handed my credit card to multiple companies and told myself the bill was worth it because the velocity was real. And I have hit the same walls over and over until I stopped trying to fix the platforms and started assembling my own.

This is the story of that stack. What it cost. What it replaced. And why I am putting the whole thing out in the open so anyone can copy it.

## 1. The tools I burned through

### ChatGPT

ChatGPT was the on-ramp. I used it for everything. Scripts, Ansible, Terraform errors. But the loop was awful. Copy from terminal. Paste into browser. Copy back. You spend more time moving text around than thinking.

### Cursor

Cursor fixed the loop. Inline completions. Chat in the editor. The part where it actually knew your codebase. I moved fast and I paid for it. Top tier plan. I do not remember whether it was a hundred a month or two hundred. Either way I handed them my card and did not think about it, because the velocity was unreal (once I learned to build in useful directions).

But Cursor was still a copilot. It suggested. It autocompleted. It did not go execute.

### Claude Code

Claude Code changed that. I could say "fix the failing Ansible lint" or "add this endpoint with tests" and it would read the codebase, figure out what to change, make the edits, run the tests. Claude Co-Work went further. Long sessions. Project context. Persistence across days.

I used both heavily. Real money every month. Not hobby money.

Two problems emerged. One is well known. Rate limiting. Even on the paid tiers I would hit the wall mid-session. Momentum would build, the session was working, and then, you have exceeded your rate limit, try again in however many hours. Nothing kills flow faster than being told to come back later by the tool you are paying to use right now.

The second problem is less discussed but worse. The guardrails.

Claude has an extremely cautious posture around what it will do without approval. If you are building a React todo app this is fine. If you are a senior engineer trying to work fast it is suffocating. Every file write. Every shell command. Every API call. Another pause. Another dialog. Another are you sure. The model treats you like you might hurt yourself.

I understand why. Most users are not developers. Most users should not have an agent running arbitrary shell commands. The safety problem is real.

But there are better ways to solve it than making every user click through a consent form forty times a day until the end of time. You scope the API keys. You give the agent access to specific directories, not the whole filesystem. You run it in a container where the blast radius is contained. You put mechanical blocks in place. File system boundaries. Network restrictions. Command allowlists. Safety in the architecture, not in a popup.

These are not theoretical. I scope my Hermes API keys to exactly what they need. I give it specific project directories. The tool definitions carry their own scope. The terminal tool runs in a defined working directory. The file tools operate on known paths. And Hermes itself runs in a container, so even if it wanted to break my environment it physically cannot.

Anthropic's models are excellent. Maybe they fix the rate limiting and rethink the guardrails eventually. But I got tired of waiting for a company to decide when I was allowed to work at full speed.

## 2. The open-source turn

I have been using open source platforms my whole life, as have we all, but I have been using them intentionally for the better part of two decades, starting with Linux and then expanding into infrastructure operations and security. Here is the one thing I know for certain. Open source solves the problem. And right now, with the AI revolution, it is getting there first. Often in ways the big companies cannot keep up with.

You hear a lot about AI slop. All the garbage flooding into production. Some of that is true. But it is also true that some of the best tooling we are finding for managing AI, for running large language models, for orchestrating agents, is coming from the open source community. Coming fast. The tools do not always have the most polish. Nobody is putting a marketing site behind them. But they are excellent in a way we have not really seen before.

For AI inference, that moment is now. You can assemble the whole stack yourself. No single vendor owns the pipeline. No single rate limit blocks your day. And no single company decides how much you have to ask permission.

### The stack

**Hermes.** Open-source agent harness from Nous Research. The orchestrator. It manages tools, skills, memory, and sessions. You point it at any model from any provider and it works. Skill system. Cron jobs. Delegation. It does not care whose model is on the other end, and it does not pester you with approval dialogs because the safety model assumes you are a competent adult who knows how to scope credentials.

**DeepSeek V4.** The model. Pro for hard reasoning. Flash for fast turnaround. I run both.

**Fireworks AI.** The inference provider. Their context caching is the secret weapon. When you work in the same workloads for long stretches, same codebase, same tool definitions, same system prompt, you are not hitting new tokens on every turn. You are hitting cached tokens. Cached tokens basically cost nothing. There is a tradeoff here. Fireworks costs a bit more than hitting the DeepSeek API directly. But I am still not entirely comfortable sharing my personal details with a Chinese API endpoint, and the price difference is worth that peace of mind.

### The tradeoff

Here is the part that matters beyond the tech. With Claude, if it does not respect your skill definitions, and it often does not if the task looks risky to the safety layer, you just live with it. With Hermes, the skills are your own files. You write them. You patch them when they are wrong. The agent follows them because the system prompt tells it to. No corporate safety layer overriding your instructions. You are responsible for what it does, so you have control over what it does.

That tradeoff is the entire argument. I would rather be responsible than babysat.

## 3. The numbers

I have been using Hermes for about two weeks. In that time I have shipped roughly five times what I would have in a comparable period with Claude Co-Work. Not five times more lines of code. Five times more deliverables. Infrastructure changes. PRs. Documentation. The things that actually move projects forward.

Here is what it cost.

| | Tokens Used | Cost |
|---|---|---|
| DeepSeek V4 Pro | 548 million | $6.78 |
| DeepSeek V4 Flash | 13 million | included above |
| **Total** | **561 million** | **$6.78** |
| *Anthropic Claude Opus (est.)* | *561 million* | *~$2,300* |

Five hundred sixty one million tokens. A latte and a half. The same volume through Anthropic would have been roughly three hundred forty times that.

Let me be fair about model quality. DeepSeek V4 Pro is not as good as Claude Opus. On broad intelligence benchmarks, like Artificial Analysis's Intelligence Index, Opus's successor Claude Fable 5 scores about 60 while DeepSeek V4 Pro scores about 44. That is a real gap. But for day to day engineering work, the scripts, the Ansible, the Terraform, the practical difference is much narrower. Maybe five percent. Sometimes I have to ask it again because it did not get it right.

But here is the tradeoff. Opus gets the call right maybe ninety percent of the time, but it takes two to five times longer to run through its loop. DeepSeek gets the call wrong maybe twice as often, but it is five times faster. The math still favors the faster model. I would rather ask twice and move on than wait once and wonder when the rate limit will hit.

If I had run that volume through Anthropic's API, the math gets stupid fast. Claude Opus costs $5 per million input tokens. Even with their caching, which at $12.50 per 5 million cache reads works out to $2.50 per million, it barely helps. Anthropic's caching is not really there yet, and Fireworks caches far more aggressively. Give Anthropic the benefit of the doubt and say a third of those 561 million tokens were cached reads. A third at $2.50 per million, two thirds at $5 per million. That is roughly $467 plus $1,870. Call it $2,300. For the same tokens that cost me $6.78.

And that assumes I did not hit rate limits first. Which I would have.

My total inference spend runs about fifty dollars a month across everything. Hermes harness. DeepSeek models. Fireworks caching. Less than what I was paying for Claude alone. And I am producing more.

## 4. Obsidian, the graph that remembers

### How it works

One of the quiet advantages of running your own agent harness is that it integrates with whatever tools you want, not whatever tools the platform decided to support. For me the most valuable of those is Obsidian.

Obsidian is a note taking app built on plain markdown files. Every note lives on your disk, in folders you control. This matters because your agent can read, write, and search your notes directly. No API key. No cloud sync. No permissions model. It is just a filesystem.

And Hermes has skills for it. When I finish a session the agent writes structured notes into my vault. What we worked on. What decisions were made. What broke. What worked. Every deliverable gets an artifact note. Every project gets a living note that grows over time.

I did not invent this. I got it from Mete Polat's writeup of his Hermes and Obsidian setup, and it is the single highest leverage addition I have made to my workflow this year. Mete describes voice noting ideas on dog walks and having his agent transcribe, tag, and enrich them into structured Obsidian notes by the time he sits down. Mine is more engineering focused. Session records. PR retrospectives. Infrastructure decisions. But the principle is the same. The agent does the documentation as part of doing the work.

![Obsidian graph view showing my vault. Green nodes are notes. Grey lines are links between them. The large central hub is where the most connections converge, usually the project notes that tie everything together.](/obsidian-graph.png)

### The payoff

This pays off in ways that are not obvious until you live with it. When I hit a problem I know I have hit before, I do not search through chat logs or dig through old PRs. I search my vault. The session notes are there with the exact error message, the fix, and the context of what else was happening. Mistakes become reference material. Successes become patterns that get reused.

It also cuts token usage. When the agent can load a skill that already knows how to do the task, it does not need to figure it out again. When it can pull up a past session note instead of asking me what happened last time, it saves both of us the round trip. Over hundreds of sessions the savings compound.

## 5. The voice loop

### How it works

There is one more piece, and it is on the input side. I can talk a lot faster than I can type. Most people can. The built-in dictation on macOS and Linux is fine for a sentence but falls apart on anything longer. Words get mangled. Punctuation is a fight. After two paragraphs you are correcting more than you are saying.

Wispr Flow fixed this. Instead of a one line instruction, fix the CI pipeline, I can dictate three paragraphs of exactly what broke, what I already tried, which environment it is in, and what the expected output should be. All in about thirty seconds. The agent gets a fully loaded brief instead of a vague request, and the quality of the output follows.

It is cost efficient. Way better than the built in dictation on either macOS or Linux. It handles technical vocabulary without flinching. Ansible. Terraform. Semaphore. All of it comes through clean. When you are talking to an agent that can consume unlimited context, the bottleneck should not be your typing speed.

Combine Wispr Flow on the input side with the Obsidian vault on the output side and you have a loop. Voice your ideas in detail. The agent does the work. The work gets documented. The documentation trains the skills that make the next session faster. Rinse. Repeat. Ship more.

## In Summary

I believe knowledge should be free. Not the kind of free where nobody gets paid. The kind where the information is out in the open and what you pay for is the expertise. Someone who has already done the work. Someone who knows which pieces fit together and which ones do not. Anyone should be able to acquire the knowledge. People should be paid well for the hard work required to acquire it. Those two things are not in conflict. This stack has given me substantial cheat codes, and that is the whole point of writing it down.

Pull on the threads and the story comes apart.

I ran through the commercial tools. They got me far. But they all had the same ceiling. A company deciding how fast I could work. A company deciding how many times I had to click approve. A company deciding what my agent was allowed to do with my own filesystem.

I built something different. Open source agent harness. Open weight models. Inference provider with real caching. A voice layer on the input side. A knowledge graph on the output side. The whole stack runs for fifty dollars a month and I stop when I am done, not when someone else's rate limiter says I am done.

The cost is nice. The speed is better. The control is essential. But the thing that actually matters is that I am not waiting.

No rate limit banner. No try again later. No approval popup asking me to confirm the command I just told it to run. I type. Or I talk. It works. I keep working.

That is worth more than six dollars and seventy eight cents.

## References

Mete Polat. (2026, May 20). My Hermes and Obsidian setup and use cases. *Metedata*. https://metedata.substack.com/p/013-my-hermes-and-obsidian-set-up

Wispr Flow. https://wisprflow.ai
