---
title: "LinkedIn was stealing my attention: How I used agentic AI to take it back"
date: "2026-04-14T21:00:00Z"
author: "Christian Guzman"
image: "images/blog/article/agentic-ai-escaping-attention-trap.jpg"
description: "lorem ipsum"
keywords:
  - "Engineering Leadership"
  - "Signal to Noise Ratio"
  - "Human Systems Architecture"
  - "Leadership Systems"
  - "AI Strategy"
categories:
  - "Leadership"
  - "Human Systems"
tags:
  - "Management"
  - "Team Dynamics"
  - "Autonomy"
  - "Mentorship"
slug: "agentic-ai-escaping-attention-trap"
---

I always felt uncomfortable scrolling down LinkedIn.

At one point, I had made the decision to work on my networking and branding skills. This included, among many other things, building a great social media presence, especially in LinkedIn.

The plan was simple, comment a bit here and there on things I cared about, post my ideas, post about my articles, try to gain an audience and followers, etc. The usual.

But I immediately started feeling... "uncomfortable" about the necessary doom scrolling to find the niches I wanted to talk about.

## Design vs Need

There was a default cost associated with how social media feeds are designed for retention. What I needed is targeting, what social media offers is a buckshot.

I could not spend this many hours, day by day, only doomscrolling trying ot build a brand. It should be about writing articles like these, ebooks, doing coaching sessions, thinking about topics, self learning, etc. Every irrelevant post was waste that I had to pay with my time.

## The typical problem: Signal vs Noise

The more experienced you become as a leader, the more you value true signals, and you tend to build defenses against noise. This is why I felt uncomfortable. I could not explain it until much later, as I was building my vibe coded solution and learning more about myself in the process.

What was so "low signal" about the feed? Corporate announcements, topics I did not care for, posts that seemed interesting only to end in some kind of sale process or trying to get me to click in a link to buy a ticket or a product or book a call with a sales rep, and of course, just content that I did not care about, even if it was legitimate.

This low signal noise is necessary for LinkedIn, but life is not endless, so I have to do the best I can with my time. Not only in business, but also with my family.

So in order to avoid low signals, I had to define what a high signal was. For me, it was leaders talking about what does not working, leaders discussing new workflows, ideas, AI breakthroughs. People talking about struggles and systemic failures and anti-patterns.

## The build process

*Skip this part if how I built the solution is noise for you*

I am always thinking in automation, and no, AI is not the default answer. For this case, I needed something to doomscroll social media for me, identify what people were talking about, discern what I would really care for, and then provide me with a list of distilled posts to actually read.

The first thing I tried is to build automation with Comet. Ok yes, that is AI, and that is exactly why it failed spectacularly. It would do its job for a bit but then fail for different reasons after just a bit. At one point, it almost seemed to indicate it just did not want to do that.

It was worth the shot, I needed to validate I was not crazy for thinking AI was not the solution. But you never know, and the cost of the experiment was minimal to be honest, less than two hours.

So I went with a proper architecture for a Chrome Plugin that would inject itself onto the LinkedIn website and then take control when given, to doomscrool for me, simulate human behaviour, and simply "take note" of what was available for me to read.

With agentic coding doing the hard work, I designed the requirements and defined how to establish high signals:
* Looking at people's profiles
* Checking followers
* Checking network proximity
* Checking and filtering roles and profiles

I created a skill "product-manager" to help me refine requirements and save them in github issues. Another skill "tech-lead" to build the technical definitions. They all interviewed me for a long time. I could take a passive role, and be interviewed, after a full day of work and meetings. It felt nice and relaxing, and progress was constant. I will soon write more about agentic skills.

Then AI became part of the picture. I added a way for this plugin to configure a Gemini API Key to use a free model for discerning which posts I would actually care about, and which ones not. Is this marketing or is it about something I cared for?

I then defined and created a layer of enrichment, where the crawler would visit everyone's profile and add enrichment data to the output based on information found on people's profile. To avoid doing this constantly, any information found would be cached locally for 30 days.

And then I would get a final JSON output with the information. But Christian, you mean you changed the feed UX for a JSON file? No sir.

In under an hour, I had a pretty website hosted online that allowed me to load these JSON files into it. I hosted it for free in netlify but you can quickly spin up your own version: https://github.com/h-4vok/linkedin-post-presenter

You just dropped or upload the file there and wallah, you get a list of all posts, with pills indicating whether you should pay attention to it or not, and a group of filters to play with. Some simple buttons to go see that post, and post your comment.

On purpose, I decided to not use AI to create these comments, and not even to suggest ideas. I never wanted my voice to be replaced by AI, nor my creativity be biased by "average ideas". That is another key decision. I would still spend time of my own writing here, writing a lot sometimes. But it is me, and its a proper investment. Its a high signal. Its what I should be doing.

## Echo Chamber

The network proximity indicator (whether someone is connected to you, or its a 2nd or 3rd+ connection) is massively imporant. My another "human made" rule is to ensure 70% of my engagement to escape my echo chamber, to ensure I am not talking to the same people over and over.

The algorithm will always do that, serve you more of what you want, with a quota of "discovery". I needed to ensure discovery was always 70% new.

Besides, if you only listen to the same people and the ones you know, you are living in a closed system and not learning on your own.

This made exploration faster, exploitation easier, and introduced a learning component that is not what I originally expected when I began using LinkedIn so much more.

## Quality over quantity

While obvious, with a doomscrolling feed you eventually tap out, you surrender to it. You have been tortured enough and just want out. So you do your "chore", you make a few low quality comments, cover your quota for the algorithm, and hope for the best.

By filering out low signals, all noise, I remained focused on quality. My struggle was no longer about finding where and what to talk about, but how some of the smarter people than me made me question things and made me think hard. 

I promised myself discipline, to never post mundane comments just to "finish the task".

## AI as an Attention companion

So, perhaps LinkedIn will hate me for it, but I found a way to break out of the algorithm while still gradually getting its benefits. I used AI to get more time for me, for what I love doing and for spending with my family on those evenings. AI helped me in two ways, to build and to pre-process all noise.

## Reclaim your authority

While you can definitely visit my github repos, install them locally, give them a try (hey, be warned, I did not care about UX, this is a plugin just for myself -- for now at least), what actually matters here is that you design your own system for filtering noise. Maybe this is not it, but you have the tools today to imagine whatever you want. Step away from the known reality and build a new one. Maybe you don't need this plugin, you need OpenClaw, or you need a different approach to your problem, etc. Automate the noise filter, and manually enjoy the high signals.

You know what they say, if you are not paying for it, you are the product.

PS: Did I mention I spent 0$ on this? All vibe coded, hosted in my own browser, and using Gemini's free tier for smart filtering. If the solution is for yourself, you'll likely find a zero cost solution.