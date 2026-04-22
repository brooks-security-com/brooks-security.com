+++
title = "Spec Driven Development"
description = ""
tags = [
    "spec-driven development",
    "ai",
    "cursor",
    "claude code",
    "engineering",
]
date = "2026-04-22"
categories = [
    "Engineering",
]
menu = "main"
+++

Most software failures are not caused by a lack of coding ability. They are caused by unclear expectations.

If your requirements are vague, your output will be vague. That was true before AI, and it is even more true now.

Spec Driven Development is the process I use to avoid that trap:

1. Handwrite a specification that fully defines the work.
2. Hand that spec to Claude Code or Cursor to execute.
3. Grade the result against the spec.

That loop sounds simple, but it changes everything.

## Why specs matter now

With AI-assisted coding, you can generate implementation quickly. The bottleneck is no longer typing speed. The bottleneck is **clarity**.

I think people miss this: everything an LLM does is a form of hallucination. It is always trying to predict the next most likely token based on training data and context. So when people say "the model made a mistake," I usually read that as "we gave it weak guidance." The model did what models do.

A good spec removes ambiguity:

- What problem are we solving?
- What does success look like?
- What is explicitly out of scope?
- How should the result be written (style, tone, constraints)?

When those are explicit, the implementation gets better. When they are not, you get polished nonsense.

Clear specs improve outcomes because they constrain the hallucination space. If you give precise expectations, the model is more likely to "hallucinate" the solution you actually wanted. LLMs do not think like humans; they move outputs closer to or farther from your desired outcome one token at a time.

## How I write specs

I handwrite specs in plain language first. Not because handwritten text is magical, but because it slows me down enough to think clearly.

The spec should be specific enough that another engineer can execute it without guessing. My baseline template:

- Objective
- Scope and non-scope
- Inputs and outputs
- Constraints (security, compliance, performance, style)
- Acceptance criteria
- Test and validation plan

If I cannot define acceptance criteria, I am not ready to build.

## Execution with Claude Code or Cursor

Once the spec is solid, I hand it to Claude Code or Cursor and have it execute.

At that point, the AI is not deciding the product direction. It is executing a contract.

That is an important difference. The spec owns the intent. The model handles implementation speed.

My practical loop usually looks like this:

1. Prompt with the full spec.
2. Review the output for alignment.
3. Modify prompt or code.
4. Run tests.
5. Modify again.
6. Commit when acceptance criteria are met.

I frankly do not write most code from scratch anymore. It is mostly prompting, modifying, testing, and committing. The spec keeps that process grounded.

## Team workflow: design specs together first

If multiple people are involved, collaborate on the spec before implementation starts.

This avoids the classic engineering problem where everyone "agrees" but each person imagines a different outcome.

Shared spec design gives you:

- Early alignment across engineering, security, and operations
- Faster implementation once coding starts
- Better review quality because reviewers compare against a known contract

You can still split implementation work across people and tools, but everyone is building to the same target.

## Grade output against the spec

After implementation, grade it against the spec. Do not grade by vibes.

I use a simple pass/fail checklist tied to acceptance criteria:

- Functional behavior matches the spec
- Security and compliance constraints are met
- Tests pass for required cases
- Documentation and handoff requirements are complete

If it misses criteria, it is not done. No matter how polished it looks.

This is the part many teams skip, and it is exactly where quality control lives.

## Example sanitized spec

Here is a sanatized example of a spec I generated for a client of mine:

- [IAM Graph Analysis Platform Deployment Spec](/specs/pmapper-platform-deployment-spec.md)


## Final thought

Spec Driven Development is not anti-AI. It is how you make AI useful without losing engineering discipline.

Write clear specs. Execute fast. Validate ruthlessly.

That is how you get speed without sacrificing quality.
