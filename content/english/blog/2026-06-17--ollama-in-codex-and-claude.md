---
title: "Use local LLMs within Codex and Claude: A pragmatic guide"
date: "2026-06-17T08:00:00Z"
author: "Christian Guzman"
image: "images/blog/article/ollama-in-codex-and-claude.png"
description: "A pragmatic guide to integrating local LLMs via Ollama with agentic tools like Codex and Claude. Reduce cloud spend, bypass rate limits, and secure your AI sovereignty."
keywords:
  - "Agentic AI"
  - "Local LLM"
  - "Ollama"
  - "AI Sovereignty"
  - "Developer Experience"
  - "Claude Code"
  - "Codex"
  - "LiteLLM"
categories:
  - "Technology & AI"
  - "Engineering Leadership"
tags:
  - "Agentic Workflows"
  - "Local AI"
  - "AI Strategy"
  - "Productivity"
slug: "ollama-in-codex-and-claude"
--- 

Ollama is a local LLM/SLM orchestrator that, for the vast majority of people who tried it, was a great little experiment. But most engineers quickly defaulted back to using Codex, Claude, or other App/CLI agentic products.

One of the primary walls when running open-source models locally is hardware limitations. Lacking a capable GPU or a comfortable amount of RAM quickly limits your ability to use larger context models effectively. 

But the other issue, even if you got your local model running on a powerful computer setup, was that the experience was just not the same. It wasn't as hands-off. Whether you were using basic editor extensions or earlier iteration tools, the experience felt "not smart enough." You had to point directly to files, the codebase, or specific context manually. If you wanted certain things run—like accessing GitHub issues through the `gh` CLI—you had to create specific skills, direct the LLM to use them, or simply do it yourself and feed the output back to the model. And many times your "interface" with the model would not be intelligent enough. The function calls would be skipped, fail mysteriously, and you'd be completely lost.

With Codex and Claude, the experience is truly remarkable. Once you clearly define what needs to be done, you fire off the task and go work on something else. Five seconds to thirty minutes later, Codex or Claude comes back with questions, results, or a finished implementation. You do not have to be constantly present nor permanently running manual commands yourself.

Add to this the ability to connect your mobile to your PC to continue interacting with these apps remotely, and the workflow becomes incredibly powerful. Basic VSCode plugins that merely chat with your Ollama instance simply cannot compete with that experience.

## Why should you consider a local LLM?

I am not asking you to cancel your subscriptions or move your organisation away from whatever AI vendor you have chosen. You most likely want to keep access to frontier models. But if you have access to capable hardware—especially if you are running modern GPUs like an RTX 4080 or 5080, or even just an old 1080—you have massive untapped inference power sitting idle. Offloading certain tasks to your local LLM makes a lot of sense, especially if:

* You constantly hit the 5-hour, weekly, or monthly rate limits of your subscriptions.
* You are paying by tokens, so low-effort tasks are quietly chewing away your budget.

From now on, whenever I mention *budget*, we are talking about both scenarios.

I am not only talking about a solution for individual engineers working from home, but also for organizations. Companies today are highly optimized for cloud spending; investors actively scrutinize cloud infrastructure bills and question the existence of on-premise servers. 

However, if you are not strictly bound by these external pressures and wish to create *balance* in your approach to building an agentic SDLC, integrating local LLMs or SLMs for certain processes should be part of your everyday strategy.

For example, one of the best uses I have for AI is helping me refine requirements, challenge my thinking, explore edge cases, and define exactly what we want to build. This is all text and no code, but it involves:
* Function calling: to upload results, obtain metadata, or consult files and documentation.
* Token expenditure: these are text-heavy, multi-turn conversations that significantly impact your budget.

## Why Executive Leaders Must Care: The Sovereignty Perspective

For engineering leadership and executives, pushing for a hybrid local-cloud AI strategy is no longer just a cost-saving measure. We are now talking about risk mitigation. 

There is a persistent myth that frontier models will inevitably become drastically cheaper. We have already seen the reality is quite the opposite. Whether it is a matter of frontier companies trying to achieve AGI, or just because it does not serve their business model that things become cheaper (for you of course!), vendor lock-in is real. The pricing power rests entirely with a few major providers and the only thing stopping them from commanding even more premium prices is the fact you are struggling to breathe right now. And I do not mean just financially, but because the space has moved to quickly that barely anyone has been able to catch up, let alone implement those practices.

More importantly, the recent incident with Fable demonstrated the catastrophic risk of depending entirely on a frontier model hosted outside your jurisdiction. When regulatory shifts, compliance disputes, or sudden vendor policy changes occur, you are caught in the middle.

Running capable open-weight models locally—or on self-hosted infrastructure or even simply cloud EC2s—creates partial AI sovereignty that at the same time watches over your own AI budget. And, if you have the hardware for it and can go for higher tier open models, you ensure business continuity regardless of what happens in the shifting landscape of global AI regulation. Not to mention that it opens an entire new world of experimentation with the myriad of available models out there.

## Why the Engineering Team Should Care: Flow State and Privacy

For engineers, the appeal of local LLMs goes beyond corporate budgeting. It’s about protecting the "flow state."

Nothing breaks momentum faster than hitting a rate limit right when you are deep into debugging a complex architectural issue. Having a local model seamlessly integrated into your agentic tools means unmetered, unlimited experimentation. You can ask "stupid" questions, run massive context searches, and iterate endlessly without watching a token counter. Being able to ask silly things often leads to breakthroughs. You are removing cognitive friction.

Furthermore, there is the reality of data privacy. Engineers occasionally need to debug issues using sensitive context—production database dumps, internal network topologies, or files containing environmental variables. Sure, your cloud provider might be giving you guarantees or promises around security and isolation of data, but what happens when an engineer is almost out of tokens but they desperately need to debug that one production incident? They will paste those sensitive logs in ChatGPT, Gemini or Claude. Sure, you might have been clear about the AI guidelines, but consider what happens when pressure builds up and engineers no longer fathom doing things manually anymore? A solution to this is what we are talking about today. 

## The Technical Guide: Connecting Ollama to Codex and Claude

So, how do we translate this high-level strategy into everyday execution? It starts at the terminal.

The goal is to trick your premium agentic tools (like Codex, Cursor, or Claude Code) into talking to your local Ollama instance, leveraging their superior UI and agentic capabilities without spending cloud tokens. We will only focus on Ollama today, but there is an equivalent solution in LM Studio.

Here is the pragmatic way to set this up in *your local machine*.

### Step 1: Fire up your local model
First, ensure Ollama is running with a model capable of strong reasoning and function calling. For coding, Qwen is very strong. Ensure you are downloading a version capable of function calling, otherwise it will not work. For deep reasoning work most people point to DeepSeek, although I am completely happy with Gemma 4's performance.

To download the models do the following in CLI (replace with the model of your choice):
```bash
ollama pull gemma4:latest
```

### Step 2: Simply use the launch command
No longer do you need to manually setup Ollama against your coding agent. Whether you want to use Codex, Hermes, Claude, OpenCode or whatever, there is a command for you.

My personal choice is keeping Codex pointing to OpenAI models and my subscription, and then use the Claude CLI pointing to my Ollama.

```bash
ollama launch claude
ollama launch codex
ollama launch openclaw
ollama launch hermes
ollama launch opencode
```

In theory you can add the ```bash --model gemma4:latest``` parameter but it has never worked well for me. So I simply use launch and then I get a list of models. Your locally installed one will be placed at the very end of this list.

### Step 3: That's it really
Just start working. If you are using a model capable of function calling (listed as "tools" in Ollama's catalogue) you are likely set.

As I mentioned before, I use Codex to burn my OpenAI subscription but then run Claude against my local Ollama. You might chose a different combination. Nothing stops you from trying whatever works for you.

Why not simply use plugins like Continue in VSCode? Well, the "interface" holds a lot more intelligence than you think. By leveraging the CLIs of these vendors you are getting a whole range of "tools" that are provided as context back to your LLM. They also automatically handle the "context" providing visibility of your codebase back to your model. With Continue, you need to be very precise many times otherwise your model flies blind.

Configuring the agentic interfaces/CLI against your own server is not impossible either, but exceeds our exploration for the day.

## Conclusion

Working with these CLI tools (or even the Codex App or Claude Cowork for example) provides a fantastic user experience. It almost feels like you are working with a colleague. 

The first execution is extremely simple. As you want to scale to teams you must begin thinking on exposing ports and scaling the hardware, or thinking of a load balancing strategy.

Resilience is no longer optional. You do not need to abandon your product roadmap immediately, but start planning your discovery and experimentation on self hosted models. Whether it's political pressure or economics, Ollama has made it extremely simple now. This is an invitation for sovereignty and excellence. 
