---
title: "Method Agnostic: How I Vetted 40 Vendors to Find the Perfect Partner."
date: "2025-12-29T00:00:00+01:00"
author: "Christian Guzman"
image: "images/blog/article/vendor-selection-horror-story.png"
description: "A tale of two vendors: One nearly derailed a project, the other accelerated it. The difference wasn't price—it was the selection process."
categories:
  - "Leadership"
tags:
  - "Leadership"
  - "Procurement"
  - "Engineering Management"
slug: "vendor-selection-horror-story"
---

Wisdom often comes from scars. In late 2024 and throughout 2025, I lived through a tale of two vendors. I had the fortune of working with a fantastic partner who accelerated our delivery, and the misfortune of working with one who nearly derailed us.

When I analyzed why these outcomes were so drastically different, the answer wasn't in the code they wrote. The success or failure was determined months earlier, in the moment we *selected them*.

Most organizations rely on a rigid "Procurement Playbook"—RFPs, rate cards, and legal checkboxes. But experience has taught me to be **"Method Agnostic"**. I don't trust a generic process to solve a specific problem.

Most people execute Scrum, RFP processes, or design sprints with a nagging sense that "something is wrong". While they might pinpoint the pain, most people (even leaders) rarely act on it. This inaction is odd, but unfortunately common.

# The Vendor Horror Story

If you want the tactical guide on selecting vendors, feel free to skip to the next section. But if you want to understand *why* traditional selection fails, you need to hear this.

It started, as these things often do, with a new strategic initiative. We needed to spin up a quick shipping project (3-4 months) for a new customer segment. Because our company was relatively new to this specific domain, it *made sense* to hire a specialist vendor.

On paper, the logic was sound. In reality, it was a train wreck.

### The Red Flags We Ignored

The problems started immediately, but because we were following a "standard" selection process (or rather, a lack of one), we missed them.

**1. The "Solution" Push**: Instead of listening to our constraints, the vendor tried to force their preferred architecture. We needed a modern stack (Flutter/NodeJS); they insisted on a custom .NET backend hosted on *their* servers. They wanted to lock us into a "black box" ecosystem with a monthly support contract.

**2. The Contractual Drift**: When we finally aligned on the tech stack, their "promises" evaporated when the Master Services Agreement (MSA) arrived. The draft was generic, riddled with errors, and still contained clauses for the hosting solution we had explicitly rejected. We essentially had to rewrite the contract ourselves.

**3. The "Drip-Feed" Delivery**: We signed the revised contract. We paid the first deposit. And then... silence. The first developer appeared a month later. Because trust was already low, we insisted on interviewing them. The candidate failed spectacularly.

Over the next few weeks, candidates were **drip-fed** to us one by one. Each interview was a reminder that this vendor had no internal quality control. They were simply throwing CVs at the wall to see what stuck.

And when we finally picked one (we needed to get going) the new hire also failed in an impressive manner. Not only they lacked the expertise, but were often offline and sometimes for entire days MIA. Eventually he confessed to us to having resigned, but the vendor never notified us. As a matter of fact, when confronted, the vendor insisted that it was a lie and that the engineer was still available to us (no one could explain how).

### The Anatomy of Failure
Eventually, we cut ties. But the post-mortem revealed that the failure wasn't just "bad luck". It was systemic:
*   **No Competitive Tension:** The vendor was selected by senior leadership based on "business fit" before Engineering was consulted. No other vendors were seriously considered.
*   **The "Sunk Cost" Trap:** Money changed hands for "design and project management" before the technical scope was even defined. We had paid our first deposit, so we might as well continue. The classic "escalation of commitment".
*   **The "Standard Process" Fallacy:** We followed the corporate motions—Budget Approval -> High-Level Pitch -> Sign Contract. This process is designed to optimize for *speed of signing*, not *quality of delivery*.

### Other Operational Red Flags
Looking back, the operational incompetence was visible everywhere:
*   **Unclear Business Operations:** Financials were managed unprofessionally in a poorly structured spreadsheet.
*   **Chasing for Basics:** That spreadsheet was only shared with us months later, after repeated insistence.
*   **Unresponsiveness:** Every message to their management was met with days, sometimes weeks, of silence.
*   **Data Leaks:** Confidential financial agreement data was leaked to my personal email address instead of the corporate one. To this day, I have no clue how their internal systems allowed that.

### The Root Cause: Absence of Process

The real motive of this article isn't to share a horror story, but to explain *why* it happened.

When we looked back, there was an absolute absence of a selection process. The vendor was selected because they were the first option presented, and leadership fell for the "Business Fit" pitch before validating the "Technical Fit"—and more importantly—their principles, values, and operational resiliency.

Even if we *had* followed the "Typical Corporate Process", it would have looked like this:
1.  **RFP:** Send a generic doc, and some requirements and expectations.
2.  **Resume Shuffle:** Receive a stack of formatted CVs.
3.  **Technical Screening:** Maybe interview a few.
4.  **Contract:** Sign the MSA.

But remember what I said at the beginning: **The typical process would not have saved us.** It might have filtered out the most obvious incompetence, but it wouldn't have found us a *partner*.

To find a true partner, I had to ignore the standard operating procedure and build something bespoke.


# How to Select a Vendor (The Right Way)

The first step isn't looking for companies; it's defining the problem. Be unclear on this step, and you will get fuzzy results.

For my success story, we were in a unique position:
*   **Budget:** Extremely limited.
*   **Direction:** Clear (We needed a mobile app).
*   **Scope:** Unclear (MVP features were still in flux).
*   **Tech Stack:** Unclear (We needed guidance).

A standard RFP would have failed here because we couldn't write a rigid requirements doc. We needed a partner who could handle ambiguity, not just an order-taker.

But first, we had to clear the fog.
**Clarity on Scope:** I worked with UX and Product to define just the MVP "Must Haves", accepting that the rest would evolve.
**Clarity on Stack:** I took an agnostic approach to the market options. After analyzing our long-term needs (cross-platform, fast UI), we settled on **Flutter**. This decision was crucial—it gave us a specific keyword to search for.

Once I had that clarity, I decided to be **Method Agnostic**. Instead of a standard procurement process, I built a bespoke funnel designed to filter for *adaptability* and *autonomy*.

## Phase 1: The "AI" Wide Net

In the past, I would have asked my network or Googled "top flutter agencies". But in an AI world, you are leaving money on the table if you don't leverage it.

I used "Deep Research" AI tools to generate a shortlist of 40 potential vendors. My prompt wasn't generic; I asked the AI to specifically look for agencies that had shipped consumer-facing mobile apps in the last 12 months. I asked for websites, client examples, and tech stacks.

**The result:** A list of 40 vendors generated in minutes. No "asking around", just raw data.

## Phase 2: The "Remote Due Diligence" (The Hygiene Check)

Before I spoke to a single human, I ran every vendor through an 8-point checklist. This filtered the list from 40 down to 7.

1.  **Glassdoor Rating:** This is non-negotiable. A low rating often signals high turnover. If an agency churns their own staff, they will churn the knowledge on your project. Besides, a poorly perceived partner also impacts on your own brand as an organisation.
2.  **Location Strategy:** Do they operate from a single hub or are they distributed? This informs their rate structure and resilience (especially in conflict zones).
3.  **Project Management Maturity:** Could they provide a PM? (We didn't have one internally yet).
4.  **QA Capabilities:** Did they have a dedicated QA department? Many vendors fail here—they rely on developers to test their own code. This can be done but its not a method we accepted for our new mobile app.
5.  **UX/UI Credibility:** Even if we had our own designs, I needed a vendor who spoke the language and could continue the designs, not just code. If they don't do this already, you become their experiment. You won't be able to trust their selection process otherwise.
6.  **Timezone Compatibility:** "We can work any hours" tends to be a lie. I looked for vendors with established overlap in our timezone.
7.  **App Store Management:** We were new to mobile. We needed a vendor who could handle the Google Play/Apple Store bureaucracy. Interestingly, this filtered out 70% of the candidates.
8.  **App Store Optimization (ASO):** Most failed this, but asking the question revealed who understood the *business* of apps vs. just the *code*.

## Phase 3: The "Semblance" Test (The First Call)

I shortlisted 7 vendors and booked 30-minute calls. But this wasn't a sales call; it was a "Semblance Test". I wasn't just listening to their pitch; I was watching for authenticity.

I asked three specific pressure-test questions:

**1. "Show me a demo of a Flutter app you built."**
*   *Setup*: I did inform everyone I would be asking this during our call.
*   *The Fakes:* "Check our website" (Lazy). Asking the customer to start doing the heavy lifting from the very first minutes together.
*   *The Partners:* "Let me share my screen and walk you through this product" (Prepared). The difference in attitude was night and day.

**2. "Confirm you can work in our timezone."**
Some had to "get back to me". That was an immediate red flag. If it's not standard for them, I don't want to be the client they "try" it with.

**3. "How fast can you build a team?"**
I wasn't looking for "Tomorrow". I was looking for honesty. The vendors who said "Give us 48 hours" were usually lying (or bench-sitting). The ones who said "2-3 weeks to do it right after XYZ is understood" won my trust.

**The Values Check**
Finally, I checked their history in a more detailed manner. If a vendor had scandals in the media or "sweatshop" reviews, I cut them. When you hire a vendor, their supply chain becomes *your* supply chain. You cannot outsource ethics.

## Phase 4: The "Shadow" Test (Onboarding)

Here is the secret weapon: **The Onboarding Process itself is a test**.

I put 3 finalists through our internal onboarding (Security questionnaires, Procurement tools) *before* signing the contract.

Why? because how they handle bureaucracy tells you how they handle operations.
*   One vendor took weeks to reply to a security questionnaire.
*   One vendor's Account Manager had to constantly "ask the tech team" which was not coming back to him.
*   **The Winner:** Replied instantly, had their answers and certs ready, and their Talent Acquisition team wanted to speak to me directly, running parallel workstreams to speed us up.

Unsurprisingly, the vendor who crushed the onboarding process became our partner. In just a few weeks, we went from "Who are you?" to a fully staffed team shipping code.

# Conclusion: The Courage to be Agnostic

When I say "Method Agnostic", I don't mean ignoring process. I mean refusing to follow a process blindly.

Regulations and compliance are the floor, not the ceiling. Your job as a leader is to build on top of them.

*   In the first story, we followed the "Standard Process" and got a disaster.
*   In the second, we built a "Bespoke Process" and got a partner.

Leading this way takes courage. You will have to defend your choices to Procurement, Legal, and maybe even your Leadership. It is easier to just "follow the rules" because if things go wrong, you can blame the system. If you get things wrong when taking courage, it could be yourself on the line.

But few things in leadership are as satisfying as the agency of owning your decisions. When you take full responsibility for the *how*, you get to own the success of the *what*.

Don't be a passenger in your own procurement process. Drive it.
