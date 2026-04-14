---
title: "LinkedIn was stealing my attention: How I used agentic AI to take it back"
date: "2026-04-20T08:00:00Z"
author: "Christian Guzman"
image: "images/blog/article/agentic-ai-escaping-attention-trap.jpg"
description: "How I built a custom AI-powered system to eliminate the doomscrolling trap, filter out social media noise, and protect my attention as a leader."
keywords:
  - "Agentic AI"
  - "Signal to Noise Ratio"
  - "Social Media Algorithm"
  - "Time Management for Leaders"
  - "Engineering Leadership"
  - "Vibe Coding"
categories:
  - "Leadership"
  - "Technology & AI"
tags:
  - "Agentic AI"
  - "Productivity"
  - "Attention Economy"
  - "Systems Architecture"
slug: "agentic-ai-escaping-attention-trap"
---

I’ve always felt a deep friction whenever I scroll through LinkedIn.

A while ago, I made a strategic choice to invest in my personal brand. I needed to build a strong presence, and LinkedIn is the obvious arena where the decision-makers live.

The plan was the standard playbook: post my ideas, share my articles, and engage with the right niches to find my audience. Simple. Or so I thought.

But I immediately hit a trap. I was feeling "uncomfortable". To find the high-signal conversations I actually wanted to talk about, I had to pay with my time and attention: sessions of soul-crushing doomscrolling. I was being harvested by an algorithm designed for retention, not for my growth.

## My Needs Above All

There is a fundamental misalignment in the architecture of social media. These platforms are optimized for retention, but as a leader, I needed targeting. What I was looking for was precision; what the feed offered me was a buckshot of noise.

I couldn't afford to burn hours every day doomscrolling just to maintain a "presence." Building a brand should be about high-leverage activities: writing deep-dives, coaching, and strategic thinking. Every irrelevant post in my feed was distraction, it was waste, it was a systemic inefficiency I was forced to pay for with my most non-renewable resource: my time.

## The Typical Problem: Signal vs. Noise

As you grow in leadership, your noise filter becomes invaluable. You learn to value high-fidelity signals and build robust defenses against noise and distraction. You almost become disgusted by it. 

This was the root of my friction. I couldn't fully articulate it until I started building my vibe-coded solution, realizing that my discomfort was a rejection of a low-signal environment, and not a simple urge to automate things.

But, what exactly defines "noise"? On LinkedIn it’s the corporate fluff, the repetitive PR announcements, and the engagement bait that inevitably leads to a sales pitch. Even legitimate content becomes noise if it doesn't align with your strategic growth.

While this noise is the lifeblood of LinkedIn’s business model, human life is finite. I refuse to trade my time—the hours that belong to my business and my family—for the sake of an algorithm's retention metrics.

To solve the problem, I had to define what a High Signal actually looked like. I defined it as leaders being honest about what isn’t working, deep dives into new workflows, and genuine AI breakthroughs. I want to hear about systemic failures, real-world struggles, and anti-patterns. I don’t want the polished surface; I want the architectural truth. Your own definition might (and should) differ.

## The build process

*(Skip this part if the technical "how" is noise for you)*

I operate with an automation-first mindset, but AI is rarely my default answer. For this challenge, I needed a system that could doomscroll for me, identify themes, discern relevance, and present a distilled list of "high-signal" posts.

### The Failed Experiment: AI is not a Silver Bullet

My first attempt was building an automation with *Comet*. Yes, that is AI, and that is precisely why it failed. It would work for a few minutes and then fail for erratic reasons. At one point, it felt as if the model simply "didn't want" to perform the task.

It was a valuable two-hour experiment. It validated my hunch: I didn't need a black box; I needed a robust architecture.

### The Architecture: A Chrome Plugin

I shifted to a proper Chrome Plugin architecture. This allowed the system to inject itself directly into LinkedIn, take control on command, simulate human behavior, and "take notes" on everything available in my feed.

Using *agentic coding*, I defined the requirements for high-signal detection:
* Scraping profiles and follower counts.
* Measuring network proximity.
* Filtering by specific roles and professional profiles.

### Agentic Skills: Being Interviewed by my own Code

This was the most relaxing part of the process. I created two specific "skills" (agents): a [Product Manager](https://github.com/h-4vok/linkedin-post-gatherer/blob/main/.agents/skills/product-manager/SKILL.md) to refine requirements and save them as GitHub issues, and a [Tech Lead](https://github.com/h-4vok/linkedin-post-gatherer/blob/main/.agents/skills/tech-lead/SKILL.md) to handle technical definitions.

After a full day of meetings and work, I took a passive role. I let these agents interview me. They asked the hard questions, and I just provided the vision. Progress was constant, and it felt like having a tireless staff at my disposal. (I’ll write more about these agentic skills soon).

### The Intelligence Layer: Gemini & Enrichment

Once the data was scraped, I introduced a targeted AI layer. I configured a Gemini API key to use a free model for the final discernment: Is this post a genuine insight, or just a marketing funnel?

To avoid redundancy, I added an *enrichment layer*. The crawler visits every profile to gather deeper context, caching that information locally for 30 days.

### The Interface: From JSON to UX

The final output of the plugin is a JSON file. But I wasn't going to spend my life reading raw data.

In under an hour, I built a web presenter hosted on Netlify and locally. You simply upload the JSON, and voila: you get a clean list of posts with pills indicating if they deserve your attention, plus a set of powerful filters to play with.

Check it out [here](https://github.com/h-4vok/linkedin-post-presenter). Keep in mind I built the UX of all apps here just for me, but this one app should be self explanatory.

### The Human Boundary: Why AI does not speak for me

I made a deliberate decision: *I do not use AI to write my comments or suggest ideas*. I refuse to let my voice be replaced by an LLM or have my creativity biased by "average ideas." Writing a comment is an investment of my own energy. It’s a high-signal activity. By automating the noise-filtering, I finally have the time to ensure that every word I post is actually mine.

However, I must confess I have talked to AI so much that I have copied many of its quirks. But, what's better (or worse) is that I became a human detector for AI written content. I do not think this is a superhuman skill though, as so many others can detect slop just by looking at it. Please, if you are writing a document to be read by your entire company, do not slop it. Use AI for review, feedback, adversarial challenge, etc. Do not outsource your creativity and mind.

Anyway, back to our topic.

## Escaping the Echo Chamber

The network proximity indicator—whether someone is a direct connection or a 2nd/3rd+ degree—is paramount. Another of my "human-made" rules is to ensure that *70% of my engagement happens outside my immediate circle*. This is my deliberate strategy to escape the echo chamber and avoid the trap of talking to the same people over and over.

Algorithms are naturally biased: they serve you more of what you already know, with only a tiny, controlled quota for "discovery." I decided to flip that logic. I needed to ensure that my discovery rate was always at least 70% new.

If you only listen to the people you already know, you are effectively living in a closed system. In engineering, closed systems without new energy or information eventually stagnate. You stop learning when you eliminate the friction of unfamiliar ideas.

By enforcing this ratio, I made exploration faster and exploitation easier. It introduced a learning component I didn't originally expect, transforming LinkedIn from a social media "chore" into a genuine systemic research tool.

## Quality over Quantity

It sounds obvious, but a doomscrolling feed eventually makes you tap out. You surrender to the noise. After being "tortured" by irrelevance long enough, you just want out. This is when you perform the "algorithm chore": you leave a few low-quality comments just to hit your quota, satisfy the machine, and hope for the best.

By filtering out the low signals and the static, I reclaimed my focus on quality. My struggle was no longer about finding where or what to talk about. Instead, the challenge became purely intellectual: engaging with people smarter than me who forced me to question my assumptions and think hard.

I promised myself a new discipline: never to post a mundane comment just to "finish the task".

## AI as an Attention companion

LinkedIn might not love me for this, but I’ve found a way to bypass the algorithm while still extracting its value. I’ve turned AI into a shield that buys me back my time—time for the deep work I love and for the evenings I owe my family.

AI served me in four distinct ways: 
* As a builder (to create the tool)
* As a sparring partner (interviewing me until it had 99% certainty of what I wanted)
* As a technical collaborator (which, towards the end, it was enough context to just decide for me)
* As a filter (to pre-process the noise).

AI didn't replace my attention; it protected it (remember what I said about taking on AI's quirks? this is how often AI writes phrases, framing it one way and then saying its another thing -makes me think we will never be able to use this framing strategy without sounding sus).

## Reclaim your authority

You can visit my GitHub repositories (this solution is at https://github.com/h-4vok/linkedin-post-gatherer btw!), install them locally, and give them a shot. But be warned: I didn’t care about the UX. This is a plugin built by me, for me—at least for now. So the button layout and stuff got very little attention.

However, the code isn’t what actually matters here. What matters is that you *design your own system* for filtering noise.

My approach might not be your solution, but today you have the tools to imagine whatever you want. Step away from the "known reality" of default feeds and build a new one. Maybe you don’t need this specific plugin; maybe you need OpenClaw, or a completely different architectural approach to your digital life.

The goal is simple: Automate the noise filter so you can manually enjoy the high signals.

You know what they say: if you are not paying for it, you are the product. It's time to stop being the product and start being the architect.

*PS*: Did I mention I spent $0 on this? It’s all vibe-coded, hosted in my own browser, and uses Gemini's free tier for the smart filtering. When the solution is for yourself, you’ll likely find a *zero-cost path*. Make that your objective.

*PS2*: No, I don’t use this solution every day. As I mentioned before, *I got my time* back—and I’d rather spend it with my family.