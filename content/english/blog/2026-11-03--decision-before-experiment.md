---
title: "If the Result Won’t Change the Decision, Why Run the Experiment?"
date: "2026-11-06T08:00:00Z"
author: "Christian Guzman"
image: "images/blog/article/decision-before-experiment-20261106-v2.jpg"
description: "A practical way to decide what an experiment needs to teach before choosing its hypothesis, metric or design."
keywords:
  - "Product Experimentation"
  - "Decision Making"
  - "A/B Testing"
categories:
  - "Leadership"
tags:
  - "Product Management"
  - "Experimentation"
  - "Decision Making"
slug: "decision-before-experiment"
---

During a reporting discussion, we considered changing what users saw by default. One reason figures differed across report versions was that one included current-day data and the other did not. We wanted to know whether users needed fresh data as their starting point, or were happy to choose it only when they needed it.

An A/B test could show whether users noticed or objected to the new experience. Their response might help us judge how much they valued current-day data and what freshness thresholds to pursue. Running the test would also give the team practice with A/B testing.

But the main work was clear either way: improve data freshness, which is work that had been decided already. We were also dealing with more urgent work and bottlenecks. 

I argued that the test's setup and analysis would not change that priority enough to justify the time. So, after a brief discussion, we did not run it. But why exactly? I will explain that today.

Before designing an experiment, ask: **what decision could each result change, and is that change worth the cost?**

## Start with the decision

A test begins with a proposed change. The team still needs to name the decision as an action: change the experience, roll it out, roll it back, or set a different freshness target.

In this case, there were two related decisions. The team wanted to know whether users needed fresh data by default. It also needed to decide what freshness thresholds to pursue. User responses could inform both, but they could not settle the second one on their own. The team still had to weigh user needs against the options and costs of delivering fresher data.

The change would not remove access to current-day data. It would change what users saw first. That makes the question narrower: do they need fresh data before asking for it, or is it enough to keep it available as an option? A test of the default might help with that choice. It could not, by itself, tell the team what freshness was feasible or worth the cost.

Then write down what each result would change. If every plausible result leads to the same action, the experiment may not help with that decision. It could still reduce a risk or build a skill the team needs later. Name that benefit, and compare it with the time and work the test requires.

Sometimes a user conversation, a technical check or a direct decision will answer the question faster. Choose an experiment when its evidence can change an action, reduce a risk or teach the team something worth the effort.

## Map the possible outcomes

Before designing the experiment, sketch a decision tree. For each plausible result, write down what the team would conclude and what it would do next. This makes hidden assumptions visible while there is still time to change the proposal.

Each branch should connect three things: the signal the team expects to see, what that signal would mean, and what action would follow. Without those links, the team may collect data without agreeing how to use it.

The proposed change was to give users a different default experience of report freshness. The test was meant to show whether they needed current data by default or were comfortable with a less current starting point. The diagram keeps the question high level. We did not run the test:

<figure>
<svg role="img" aria-labelledby="freshness-tree-title freshness-tree-description" viewBox="0 0 760 560" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; font-family: Arial, sans-serif;">
 <title id="freshness-tree-title">Decision tree for the proposed report experience experiment</title>
 <desc id="freshness-tree-description">The proposal changes the freshness of data users see by default. The test asks whether users need current data at the start or are comfortable with a less current view. Few signs that users need current data would support keeping the new experience. Clear signs of need would prompt a review. Either way, the team would continue improving data freshness towards its target thresholds.</desc>
  <defs>
    <marker id="freshness-tree-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,5 L0,10 z" fill="#596579" />
    </marker>
  </defs>
  <g fill="none" stroke="#596579" stroke-width="2" marker-end="url(#freshness-tree-arrow)">
    <path d="M380 90 V125" />
    <path d="M380 205 V230 H130 V255" />
    <path d="M380 230 H630 V255" />
    <path d="M130 400 V430 H380 V455" />
    <path d="M630 400 V430 H380 V455" />
  </g>
  <g fill="#fff" stroke="#35435a" stroke-width="2">
    <rect x="205" y="20" width="350" height="70" rx="12" />
    <rect x="205" y="125" width="350" height="80" rx="12" />
    <rect x="20" y="255" width="220" height="145" rx="12" />
    <rect x="520" y="255" width="220" height="145" rx="12" />
    <rect x="205" y="455" width="350" height="85" rx="12" />
  </g>
  <g fill="#243047" font-size="17" text-anchor="middle">
    <text x="380" y="49"><tspan x="380">Proposed UX change:</tspan><tspan x="380" dy="23">freshness by default</tspan></text>
    <text x="380" y="153"><tspan x="380">A/B test: do users need</tspan><tspan x="380" dy="23">fresh data by default?</tspan></text>
    <text x="130" y="286"><tspan x="130">Little sign they need</tspan><tspan x="130" dy="22">current data</tspan><tspan x="130" dy="30" font-weight="700">Keep the experience</tspan></text>
    <text x="630" y="286"><tspan x="630">Users need current</tspan><tspan x="630" dy="22">data by default</tspan><tspan x="630" dy="30" font-weight="700">Review the experience</tspan></text>
    <text x="380" y="485"><tspan x="380">Either way: improve freshness</tspan><tspan x="380" dy="23">towards target thresholds</tspan></text>
  </g>
</svg>
<figcaption><em>Simplified from the proposed test; it was not run.</em></figcaption>
</figure>

Here, the result could change whether the team kept the new experience. It would not decide whether to improve the underlying data freshness. A useful decision tree makes both choices visible, so a signal about the user experience does not get mistaken for an answer to the larger data question.

The test proposal included indicators for deciding whether to continue the rollout or reverse it. Those indicators needed a clear meaning before the test began. What level of feedback would make the team change course? If the test measured whether users noticed, that would not automatically show whether they needed fresher data. If it measured complaints, silence could mean users did not notice, did not mind, or did not send feedback. The team needed to know which signal it was using.

Not noticing and not caring are different outcomes. A test that measures only complaints cannot claim that users do not need fresh data if nobody complains. The team needs a signal that can distinguish the question it cares about: whether users need fresher data by default, or whether the new starting point works for them.

Once the branches and signals are clear, choose the evidence that can distinguish between them. Decide what would count as a meaningful change, which guardrails matter, and what an inconclusive result would mean. Would more time or a different user group help? Would the team act the same way anyway? If more evidence cannot change an action or reduce a risk, extending the test may only delay the decision.

## Decide whether the experiment is worth it

The team also needs to compare the experiment with other work competing for its time. The cost includes more than building a variant. It can include analysis, coordination, delayed delivery and risk to users. If a decision is easy to reverse, the team may be comfortable acting with less evidence. If a mistake would be hard to undo or could harm users, stronger evidence may be worth the wait.

Urgency changes that trade-off. A test can take little engineering time and still draw on the same people needed for higher-priority work. The team has to compare the information it expects with what that time would otherwise deliver. The decision tree clarifies the value of evidence; it does not set the team's priorities.

The test in our discussion offered two benefits beyond the immediate experience decision. User responses might help us judge how much people valued fresh data by default. The team could also practise A/B testing before a bigger decision needed that skill. Both benefits mattered. But we were handling more urgent work, and I did not think they justified the test at that point. I preferred to save the practice for a decision where the learning was worth the effort.

Product, engineering, UX and data should make this trade-off together. Product can clarify the decision and user outcome; UX can help define what behaviour would signal a need; engineering and data can explain what freshness options are feasible and what they would cost. They bring different information, but the team needs to agree on what each result would change and whether that change is worth prioritising.

Before calling an experiment ready, write down four things:

- **Decision:** What choice will this evidence support?
- **Branches:** What will we do for each plausible result, including an inconclusive one?
- **Value:** What decision value, risk reduction or reusable learning could the experiment provide?
- **Cost:** What effort, delay or user risk does it introduce, and is that trade-off worth prioritising?

If those answers are clear, choose the hypothesis, metric and design. If they are not, keep working on the decision tree before spending time on the test.
