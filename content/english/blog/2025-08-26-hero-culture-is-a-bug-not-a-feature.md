---
title: "'Hero Culture' Is a Bug, Not a Feature"
date: "2025-08-27T00:00:00+01:00"
author: Christian Guzman
image: images/blog/article/hero-culture-is-a-bug.png
description: "Learn why celebrating last-minute 'heroes' is a dangerous bug in your company's culture. Lets explore how to shift from rewarding firefighting to building resilient systems."
categories:
  - "Leadership"
tags:
  - "Culture"
  - "Resilience"
  - "Systems Thinking"
  - "Risk Management"
slug: "hero-culture-is-a-bug"
---

It was a long time ago, yet I still remember this vividly. I had a fantastic experience as a DevOps manager, and some outstanding coaching back then. Back in those days, my team was responsible for keeping our company's most critical system for EU Tax online. That was not the only thing, but one of our main pain points. It was a complex beast—a mix of modern services and legacy code—but it was the engine of this part of the business. If it failed, the company lost money in many digits per minute. So as with any critical system, we were ready to answer any calls about outages at any time.

So, one night at 1 AM, the inevitable call came. The system was down. This was not a surprise nor a major event, basically business-as-usual at this point. And that is what is actually odd here.

The pressure in these situations can be immense, especially for those that have not had much experience. We were guided by a few clear directives: get the system running at all costs, every minute is lost money, and everyone is at your disposal. That night, we pulled in DBAs, Product owners, and engineers. For two hours, we triaged, debugged network connectivity at the database servers, and executed a series of high-stakes changes. Finally, the system came back online. We got a brief "thank you" and went back to sleep.

The next business day, the praise arrived. An email from leadership went out, celebrating our team's ability to recover the system under pressure. But this wasn't a one-time event; with an outage every couple of months, this celebration became a familiar ritual. My team, responsible for operations, was repeatedly lauded as heroes for fixing the problem on short notice on a regular basis.

But here's the crucial detail: we were not responsible for developing the system. That was a different team.

After every outage, while we were receiving praise, the development team faced a tense post-mortem to assess the damage and explain why their code had failed. Inadvertently, we had created a culture with a perverse conflict of interest: my team was being rewarded for the development team's failures. If they had dramatically improved the system's stability, their proactive work would have gone unnoticed, and my team would have lost its chance to be the hero.

_Are you starting to see the bug?_

This celebration, while well-intentioned, is one of the most dangerous things that can happen to an engineering culture. The need for a "hero" is not a sign of individual brilliance; it's a symptom of a systemic failure. We celebrated the cure while ignoring the disease.

Our work as leaders is not to create more heroes, but to build systems where heroes are no longer necessary.

We can also argue that having one team fix the system of another might not be a best practice. This all depends on the context, and how the incentives are managed between the dynamics of the teams. It's a very complex topic that is often ignored when leaders develop organisational systems.

## The Hidden Costs of a Hero Culture

A culture that relies on heroes pays a heavy tax, often in ways that aren't immediately obvious. These costs are a direct drag on your organization's performance and long-term health.

- **It Creates Single Points of Failure**: When you celebrate an individual for saving the day, you are rewarding the creation of a human bottleneck. You've disincentivized knowledge sharing and created a dependency that becomes a critical risk the moment that person goes on holiday, gets sick, or resigns. This can also be applied to teams, and while getting an entire team sick or on holiday at the same time, you could still have bottlenecks if that hero team is constantly at-capacity, tired or even discontent with having to deal with everything at once.

- **It Punishes Proactive Work**: Heroism is visible, dramatic, and easy to reward. The quiet, disciplined, and often invisible work of documenting, adding tests, or refactoring old code to prevent the next outage goes unnoticed. You are accidentally incentivizing firefighting over fire prevention. Worse yet, if this culture is ingrained within your senior leadership teams and they have a firm grasp over capacity and scope, then you are unlikely to reach consensus on when to do these things. The resistance towards proactive work becomes the status quo for your team, and everyone is driven away from having creative ideas or even sharing their own thoughts. The implications of punishing proactive work ripple through every part of an organization.

  A leader will never say "I have decided to punish proactive work" or "to punish creativity" or "to punish out of the box thinking". A leader will never say that. But more often than not, our decisions and our words have implications far beyond what our intention and purpose was. The more complex the organisation, the harder it is to develop the soft skills and the awareness to realise this.

  In my anecdote, celebrating my team as heroes was a bit of a bug, but what consolidated this as a bug was the fact that the dev team was then bashed in the post mortem and had to explain themselves. Many companies today understand that post-mortems need to be blameless, and they actually carry them out that way; but let's be real, the thoughts about that team's performance still linger around the minds of leaders and managers. So whether you voice or not your **judgment**, you should realise that your mind is what shapes your reality. But, besides that, a good amount of people will eventually pick that up. What you say and what you actually think, when you are in a position of leadership, is always under scrutiny.

- **It Burns People Out**: The "hero" is put on a pedestal and implicitly expected to save the day again. This creates immense pressure and leads directly to burnout, eventually costing you your most valuable people. Same happens with teams, managers, or specialists. Sure, if you have an overtime policy some people will actually welcome the opportunity. Others will actually enjoy the spotlight. So "burn out" is not a problem that occurs every single time.

- **It Kills Psychological Safety**: If only a few people can solve the problem, others are less likely to propose solutions or admit they don't understand the system for fear of looking incompetent. Your hero culture has now created an unsafe environment that stifles learning and collaborative problem-solving.

## From Heroes to Resilience: A New Operating System

With all that said, it would also be unfair **not to** celebrate your heroes. The gist is that if you identify an over-reliance on hero behaviour, then you might have a bug in your organisational system. Shifting from a hero culture to a resilient one requires a deliberate change in what you choose to measure, celebrate, and reward. It requires a new operating system for leadership.

**Principle 1: Measure What's Quiet**

The first step is to make the invisible, visible. While my team was being praised for fixing outages, we discovered our customers were suffering from over 60,000 non-critical exceptions per month. They weren't reporting it, but it was a major deterrent on their experience. We shifted our focus from the noisy outage to this quiet friction. We organised ourselves together with our dev team to proactively start finding problems and getting them resolved. We did not wait for outages to build up, but instead we started to look at our system, our tech debt and our customers' experience for clues on what to do next.

A leader's job is to find and reward the invisible work of prevention. Start by measuring the "paper cuts"—the small, recurring issues that drain energy and erode quality. When you fix these, you're not just improving the product; you're building the cultural muscle of proactive problem-solving.

In our case, once we started to work together (once we understood there was a bug in organisation and collaboration), in the span of 6 months we had reduced outages from occurring every month or two months, to having none. And we made sure to celebrate all the improvements and the hard work done by everyone.

**Principle 2: Arm Your Teams with Data**

You cannot have a culture of resilience without a culture of transparent, real-time information. We built better telemetry for our servers, databases, and critical systems, with alerts that could immediately identify what went down the moment it happened. This allowed us to fix outages in minutes, not hours.

With this newfound time, we analyzed why failures were occurring. We were no longer just firefighters; we were investigators, empowered by data to fix the root cause. When you give your teams the tools to see and understand the system, you give them the power to own it.

And we created a habit of getting together, all of us, including product, and discussing these failures, exceptions, timeouts and issues. We went from having our TOP 10 exceptions with occurrences of over 20k each to having our top 1 being only counted 2000 times. Still something to work towards, but we had reduced exceptions in about 90%.

**Principle 3: Make Resilience a Shared Currency**

System stability is not one team's job; it's a cross-functional goal that requires a shared language of risk and reward. While my team could bring the system back online, the real underlying problems could not be solved by us alone. Any org is an actual system of people, dynamics, incentives and processes. You are never alone.

As a leader, your role is to create this shared context, to shape these dynamics. When discussing new features, you must also ask, "How will we make this resilient?" You need to get others involved, especially if your initiatives will affect other teams. When you make resilience a shared priority, it becomes a powerful, unifying force that makes the entire organization stronger.

Look at the last time your company handed out a bonus or public praise for technical work. Did you celebrate the person who prevented the fire, or the one who put it out? The answer doesn't just define your culture; it predicts your future.

Remember: **Great leaders don't create heroes. They create systems that make heroes irrelevant.**
