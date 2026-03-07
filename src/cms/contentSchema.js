/* ══════════════════════════════════════════════════════════════
   CONTENT SCHEMA — Default content extracted from App.jsx
   Every editable piece of text, image, and config lives here.
   Firestore stores only overrides; these defaults are the fallback.
   ══════════════════════════════════════════════════════════════ */

export const defaultContent = {
  // ─── GLOBAL ───
  "global.siteName": "by samantha brown",
  "global.tagline": "built with intention, not perfection",
  "global.copyright": "© 2025 by samantha brown | built with intention, not perfection",
  "global.email": "sam@bysamanthabrown.com",

  // ─── NAV ───
  "nav.cta": "work with me",

  // ─── HOME: HERO ───
  "home.hero.heading": "your business should work for your life — not the other way around",
  "home.hero.subheading": "feel-good systems, revenue expansion & brand experiences for established creators, service providers & leaders who are done choosing between growth and their sanity",
  "home.hero.ctaPrimary": "work with me",
  "home.hero.ctaSecondary": "brand partnerships",
  "home.hero.typewriterPhrases": ["systems that scale", "revenue that grows", "a life you actually enjoy", "boundaries that stick", "growth without burnout"],
  "home.hero.bubbleTags": [
    { emoji: "🏖️", text: "feel-good systems" },
    { emoji: "☕", text: "life-first business" },
    { emoji: "✨", text: "built with intention" },
  ],

  // ─── HOME: MARQUEES ───
  "global.marquee1": "feel-good systems · built with intention · sustainable growth",
  "global.marquee2": "life-first business · grow without burnout · real systems for real people",
  "global.marquee3": "systems that actually work · no hustle culture · revenue expansion",

  // ─── HOME: WELCOME ───
  "home.welcome.scriptLabel": "welcome to by samantha brown",
  "home.welcome.heading": "the permission slip you didn't know you needed",
  "home.welcome.body1": "if you're tired of forcing yourself into someone else's 5am routine, having all your income tied to one stream, downloading notion templates that immediately collect dust, and feeling like you need to be \"on\" 24/7 to be successful...",
  "home.welcome.highlight": "you're in the right place.",
  "home.welcome.body2": "no hustle culture. no cookie-cutter frameworks. just systems that work with how you actually operate and support from someone who's been through the burnout and rebuilt differently.",

  // ─── HOME: PATH CARDS ───
  "home.pathCards.scriptLabel": "how we'll work together",
  "home.pathCards.heading": "choose your path",
  "home.pathCards": [
    { title: "for founders & service providers", body: "backend systems, revenue expansion & client experience — built for how you actually work.", cta: "explore services →", page: "services" },
    { title: "for corporate teams & leaders", body: "team engagement, leadership development & systems that actually get adopted — not just rolled out.", cta: "get in touch →", page: "contact" },
    { title: "for brand partnerships", body: "authentic collaborations, speaking engagements & content that actually converts.", cta: "let's collaborate →", page: "contact" },
  ],
  "home.pathCards.anchorButtons": [
    { emoji: "🏖️", text: "i'm a founder" },
    { emoji: "🤝", text: "i'm corporate" },
    { emoji: "✨", text: "i'm a brand" },
  ],

  // ─── HOME: STATS ───
  "home.stats.scriptLabel": "the proof",
  "home.stats.heading": "proof this actually works",
  "home.stats": [
    { stat: "6+", label: "years building & leading high-performing teams across 8 global regions" },
    { stat: "8.9+", label: "/10 team engagement scores (consistently, not just once)" },
    { stat: "15+", label: "hires onboarded & trained, 5 now in leadership roles" },
    { stat: "94%", label: "adoption rate for Asana across distributed teams" },
    { stat: "96%", label: "adoption rate for major platform transitions" },
  ],
  "home.stats.badges": ["certified asana ambassador", "notion certified", "4-day corporate week"],
  "home.stats.footnote": "but here's the real story: i got here by burning out first, then rebuilding everything—my systems, my boundaries, my entire approach. now i help you skip the burnout part.",

  // ─── HOME: SOCIAL PROOF ───
  "home.socialProof.label": "certified & trusted by",
  "home.socialProof.badges": ["Asana Ambassador", "Notion Certified", "4-Day Work Week"],

  // ─── HOME: TESTIMONIALS ───
  "image.home.testimonials.bg": null,
  "home.testimonials.scriptLabel": "as told by my fave people (clients)",
  "home.testimonials.heading": "what people are saying",
  "home.testimonials": [
    { text: "Sam consistently demonstrated excellent communication skills, ensuring both my team and I were fully informed. Her pragmatic approach to decision-making allowed her to make well-considered decisions that balanced immediate needs with long-term strategic goals.", author: "Cross-functional Project Lead, MarTech Transformation" },
    { text: "Working with Sam transformed how our team approaches projects. The systems she built actually get used, which is more than I can say for previous consultants.", author: "Operations Director, SaaS Company" },
    { text: "Finally, someone who gets that 'hustle culture' isn't the answer. Sam helped us build sustainable systems that work with how we actually operate.", author: "Founder, Creative Agency" },
  ],

  // ─── HOME: NEWSLETTER ───
  "home.newsletter.heading": "join the cabana club 🏖️",
  "home.newsletter.scriptLabel": "every wednesday in your inbox",
  "home.newsletter.body": "bi-weekly insights on building a business that doesn't require you to be a different person. no productivity guilt, no \"monetize your mornings\" bs. just real talk about systems, revenue expansion, and growing sustainably.",

  // ─── HOME: CORE VALUES ───
  "home.coreValues.scriptLabel": "what we stand for",
  "home.coreValues.heading": "the non-negotiables",
  "home.coreValues.cards": [
    { emoji: "⚡", title: "energy over hustle", desc: "protect your capacity first. you can't pour from an empty cup — or build from an empty tank." },
    { emoji: "🧩", title: "systems over stress", desc: "the right systems mean you stop firefighting and start actually running your business." },
    { emoji: "🌊", title: "life over grind", desc: "success shouldn't cost you your sanity. build something sustainable, not something that owns you." },
    { emoji: "🌱", title: "progress over perfection", desc: "done is better than perfect. we build, iterate, and improve — not wait for the \"right\" time." },
  ],

  // ─── HOME: PROBLEM (the loop you're in) ───
  "home.problem.scriptLabel": "the loop you're in",
  "home.problem.heading": "sound familiar?",
  "home.problem.points": [
    "you're copying & pasting from 17 different google docs",
    "all your income is tied to one revenue stream — and it terrifies you",
    "you keep downloading notion templates that collect dust",
    "you're \"on\" 24/7 just to keep things from falling apart",
    "you've tried every productivity hack and still feel behind",
    "your client experience is inconsistent (and you know it)",
  ],
  "home.problem.punchline": "you're not the problem. the systems are.",

  // ─── HOME: SYSTEMS COMPARISON ───
  "home.systemsComparison.scriptLabel": "the difference",
  "home.systemsComparison.heading": "what good systems look like",
  "home.systemsComparison.without": [
    "copying & pasting from 17 google docs",
    "all income tied to one revenue stream",
    "forgetting to send invoices & follow-ups",
    "spending hours on tasks that should take minutes",
    "feeling like your business owns you",
  ],
  "home.systemsComparison.with": [
    "clients onboarded automatically & professionally",
    "multiple revenue streams working in parallel",
    "workflows that run while you sleep (or do pilates)",
    "time back to focus on what you actually love",
    "a business that fits your life, not the other way around",
  ],

  // ─── HOME: CLOSING ───
  "home.closing.heading": "ready to build something that actually works?",
  "home.closing.body": "whether you're a founder scaling your first business, a corporate leader transforming your team, or a brand looking for authentic partnerships — there's a path for you here.",
  "home.closing.script": "grab an iced latte, pull up a chair, and let's figure this out together. ☕",
  "home.closing.cta": "explore services →",
  "home.closing.cta.label": "explore services →",
  "home.closing.cta.link": "services",
  "home.closing.ctaSecondary.label": "book a discovery call →",
  "home.closing.ctaSecondary.link": "contact",
  "home.hero.ctaPrimary.label": "work with me",
  "home.hero.ctaPrimary.link": "services",
  "home.hero.ctaSecondary.label": "brand partnerships",
  "home.hero.ctaSecondary.link": "contact",
  "about.closing.cta.label": "work with me →",
  "about.closing.cta.link": "services",
  "about.closing.ctaSecondary.label": "join the cabana club →",
  "about.closing.ctaSecondary.link": "resources",

  // ─── SERVICES PAGE ───
  "services.hero.scriptLabel": "find your fit",
  "services.hero.heading": "choose your path",
  "services.hero.subheading": "not sure where to start? no worries—let's break it down.",
  "services.marquee": "systems that actually work",

  "services.creators.scriptLabel": "for the creators & service providers",
  "services.creators.heading": "systems that don't require you to be a different person",
  "services.creators.body": "you didn't start your business to spend hours wrestling with dubsado, notion, or whatever \"game-changing\" tool someone sold you on. you started it because you're really good at what you do. but now your backend is held together with duct tape and desperate energy. that's where i come in.",
  "services.creators.cards": [
    { num: "01", title: "the brand experience audit", price: "$350", body: "an unbiased look at your current client journey, backend systems, revenue streams, and where things are breaking down. detailed action plan + priority recommendations.", page: "audit", bg: "#F5E6DC" },
    { num: "02", title: "the brand experience (full implementation)", price: "starting at $1.5k", body: "the \"do it for me\" option. we start with the audit, then i build your entire backend—client onboarding, workflows, automation, templates, email marketing, the whole thing.", page: "implementation", bg: "#D6E8EC" },
    { num: "03", title: "fractional consulting", price: "limited spots", body: "ongoing support without the agency retainer. think: a business bestie who actually knows what they're talking about. monthly strategy sessions + async access.", page: "fractional", bg: "#EDE8F4" },
  ],
  "services.creators.fit.perfect": ["have an established community (even if it's small but mighty)", "are ready to expand beyond your current revenue streams", "want to build an email list that actually converts", "need backend systems that can handle growth", "value strategic support over just \"here's another template\""],
  "services.creators.fit.notFit": ["are just getting started (like, first 10 followers started)", "want someone to tell you exactly what to do without collaboration", "aren't ready to invest in your business infrastructure"],

  "services.corporate.scriptLabel": "for the corporate folks",
  "services.corporate.heading": "leadership development that doesn't feel like corporate theater",
  "services.corporate.body": "i'm here to help you build teams that don't need constant hand-holding and systems that actually get adopted—not just rolled out and ignored.",
  "services.corporate.cards": [
    { num: "01", title: "for leaders & executives", price: "custom pricing", body: "strategic leadership development, executive coaching, and organizational systems designed for senior leaders who want to drive real change — without the corporate theater.", page: "corporate", bg: "#E8DDD4" },
    { num: "02", title: "for corporate professionals", price: "custom pricing", body: "team engagement workshops, productivity systems, and career development frameworks for professionals ready to level up without burning out.", page: "corporate", bg: "#D6E8EC" },
  ],

  "services.brands.scriptLabel": "for brands & organizations",
  "services.brands.heading": "partnerships for people who value authenticity",
  "services.brands.body": "i'm not here to post a perfectly curated flat lay. i'm here to create content that actually converts, partnerships that feel aligned, and collaborations your audience will genuinely care about.",
  "services.brands.cards": [
    { num: "01", title: "speaking engagements", price: "inquire", body: "keynotes, panels, and workshops on systems, leadership, sustainable growth, and building businesses that actually work for your life.", page: "contact", bg: "#F5E6DC" },
    { num: "02", title: "brand collaborations", price: "inquire", body: "authentic partnerships with brands that align with my audience and values. content that converts because it's genuine, not performative.", page: "contact", bg: "#D6E8EC" },
    { num: "03", title: "ugc & content creation", price: "inquire", body: "user-generated content and social media content creation for brands looking for authentic, relatable content that actually resonates.", page: "contact", bg: "#EDE8F4" },
  ],
  // ─── SERVICE DETAIL: AUDIT ───
  "services.audit.price": "$350",
  "services.audit.title": "the brand experience audit",
  "services.audit.subtitle": "the deep dive",
  "services.audit.problem": "you know something's not working, but you can't quite put your finger on it. maybe it's clients asking the same questions over and over, all your income coming from one source and that starting to feel really risky, everyone telling you to \"build your email list\" but you haven't because overwhelm, or spending hours on admin tasks that should take 10 minutes. you can't fix what you can't see clearly. and you definitely can't scale what's barely holding together right now.",
  "services.audit.whatIntro": "a no-bs audit of your entire client journey & backend systems, delivered in a detailed loom walkthrough + written action plan.",
  "services.audit.includes": [
    "deep dive into your current client experience (from inquiry to offboarding)",
    "analysis of your backend systems (or lack thereof)",
    "revenue stream evaluation & expansion opportunities",
    "identification of what's working, what's broken, and what's missing",
    "prioritized recommendations (because \"do everything\" isn't a strategy)",
    "30-minute debrief call to walk through findings & answer questions",
  ],
  "services.audit.timeline": ["timeline: 1 week", "investment: $350"],
  "services.audit.process": [
    "you fill out the intake form — tell me what's going on, what you've tried, where you're stuck",
    "i audit everything — client touchpoints, automation, workflows, templates, revenue streams, the whole backend",
    "you get a loom walkthrough — i walk you through exactly what i found & why it matters",
    "we debrief — 30-minute call to answer questions & prioritize next steps",
  ],
  "services.audit.fit.perfect": [
    "know your backend is a mess but don't know where to start",
    "want an outside perspective before investing in a full buildout",
    "are DIY-ing your systems but keep getting stuck",
    "need validation that you're not crazy for thinking things could be better",
    "are considering expanding income streams but need strategic direction",
  ],
  "services.audit.fit.notFit": [
    "want someone to just build it for you (that's the full implementation)",
    "aren't ready to actually implement changes",
    "are looking for a \"quick fix\" without putting in any work",
  ],
  "services.audit.cta": "let's do this →",
  "services.audit.cta.label": "let's do this →",
  "services.audit.cta.link": "contact",
  "services.audit.faqs": [
    { q: "How long does the audit take?", a: "From intake form to final delivery, about one week. You'll receive a detailed Loom walkthrough plus a written action plan, followed by a 30-minute debrief call." },
    { q: "Do I need to prepare anything?", a: "Just fill out the intake form honestly — tell me what's going on, what you've tried, and where you're stuck. The more context you give me, the better the audit." },
    { q: "What if I want to implement the changes myself?", a: "That's totally fine! The audit gives you a clear, prioritized roadmap you can DIY. If you get stuck, you can always upgrade to the full implementation later." },
    { q: "Is this just for Dubsado or Notion users?", a: "Nope. I audit your entire backend — whatever tools you're using. The recommendations are platform-agnostic, though I can make specific tool suggestions based on your needs." },
    { q: "What's the difference between the audit and the full implementation?", a: "The audit tells you what's broken and how to fix it. The full implementation is where I actually build it all for you. Think of the audit as the blueprint and the implementation as the construction." },
  ],

  // ─── SERVICE DETAIL: IMPLEMENTATION ───
  "services.implementation.price": "starting at $1.5k",
  "services.implementation.title": "the brand experience",
  "services.implementation.subtitle": "full implementation — everyone starts with the audit",
  "services.implementation.problem": "you're really good at what you do. but every time you bring on a new client, you're copying & pasting from 17 different google docs, forgetting to send that one email, manually doing tasks that should be automated, and feeling like your business owns you instead of the other way around. they don't have more time. they just have better systems.",
  "services.implementation.whatIntro": "the \"do it for me\" option. i build your entire brand experience & backend systems from scratch—or burn down what's not working and rebuild it properly.",
  "services.implementation.includes": [
    "the audit (we always start here—no skipping)",
    "full client journey mapping (inquiry → onboarding → delivery → offboarding)",
    "custom workflows & automation",
    "templates for every client touchpoint (emails, contracts, welcome guides, questionnaires)",
    "revenue expansion strategy & income stream planning",
    "email marketing setup & strategy",
    "event/community coordination systems",
    "notion workspace setup (or whatever platform fits your brain)",
    "loom walkthrough of how everything works",
    "2 weeks of post-launch support",
  ],
  "services.implementation.timeline": ["timeline: 3-4 weeks", "starting at $1.5k"],
  "services.implementation.process": [
    "we start with the audit — gotta know what we're working with",
    "strategy session — we map out your ideal client journey, revenue expansion & backend setup",
    "i build everything — you get async updates, i ask clarifying questions, you live your life",
    "walkthrough & training — i show you how everything works (via loom + live call)",
    "post-launch support — 2 weeks of 'hey quick question' access while you settle in",
  ],
  "services.implementation.fit.perfect": [
    "don't have the time (or desire) to DIY your systems",
    "want a client experience that feels professional without feeling sterile",
    "are ready to invest in your business infrastructure",
    "value your time more than saving a few hundred bucks",
    "are ready to expand beyond your current revenue model",
  ],
  "services.implementation.fit.notFit": [
    "just want templates you can plug & play",
    "aren't ready to invest at this level",
    "want to control every single detail of the buildout",
  ],
  "services.implementation.different": "i'm not handing you a template and calling it custom. i'm building something that works with your brain (not against it), doesn't require you to change who you are, your clients will feel (in the best way), you can maintain without hiring a VA, and supports multiple income streams without multiplying your workload. the goal isn't to make your business look good. it's to make it feel sustainable.",
  "services.implementation.cta": "let's start with the audit →",
  "services.implementation.cta.label": "let's start with the audit →",
  "services.implementation.cta.link": "contact",
  "services.implementation.faqs": [
    { q: "Do I really need the audit first?", a: "Yes — always. I need to understand what's working, what's broken, and what's missing before I build anything. It's like a contractor doing a site assessment before construction. The audit is included in the implementation price." },
    { q: "How long does the full buildout take?", a: "Typically 3-4 weeks from kickoff. You'll get async updates throughout, and I'll ask clarifying questions as needed — but mostly you get to live your life while I build." },
    { q: "What platforms do you build on?", a: "I work with Dubsado, Notion, Asana, Flodesk, and most major business tools. I'll recommend what fits your brain and workflow — not just what's trendy." },
    { q: "What if I need changes after delivery?", a: "You get 2 weeks of post-launch support for questions and tweaks. After that, you can add on fractional consulting for ongoing support, or handle things yourself with the training I provide." },
    { q: "Can you help with revenue expansion too?", a: "Absolutely. Revenue stream planning is baked into the implementation. We'll map out opportunities for diversifying your income and build systems that support multiple streams without multiplying your workload." },
  ],

  // ─── SERVICE DETAIL: FRACTIONAL ───
  "services.fractional.price": "$2,200/month · 3 clients/quarter max",
  "services.fractional.title": "fractional consulting",
  "services.fractional.subtitle": "your business bestie who actually knows what they're talking about",
  "services.fractional.problem": "you don't need a full-time consultant or an agency retainer. but you do need someone who gets it, a second brain for the strategic stuff, accountability that doesn't feel like shame, troubleshooting help when things break, permission to do things differently, and support while you figure out new income streams or plan that first event. basically, you need a business bestie who actually knows what they're talking about.",
  "services.fractional.whatIntro": "ongoing support without the agency retainer or the \"you're on your own\" vibe of a one-off project.",
  "services.fractional.includes": [
    "monthly 90-minute strategy sessions (via zoom or loom, your choice)",
    "async access via slack or email for quick questions",
    "support for whatever you're working on: expanding income streams, launching that email list, planning events, building systems",
    "system audits & optimization as needed",
    "accountability check-ins (the kind that feel supportive, not judgey)",
    "access to my templates, frameworks, and resources",
  ],
  "services.fractional.timeline": ["minimum 3-month commitment", "$2,200/month"],
  "services.fractional.process": [
    "application — tell me what's going on, what you need, what you've tried",
    "intro call — let's make sure we're a good fit (chemistry matters)",
    "kickoff — we set goals, establish communication rhythms, and map out priorities",
    "monthly sessions — we strategize, troubleshoot, optimize, repeat",
    "async support — you send questions, i respond within 48 hours (business days)",
  ],
  "services.fractional.fit.perfect": [
    "are past the \"just getting started\" phase but not at the \"hire a full team\" phase",
    "want strategic support, not just task execution",
    "value having someone in your corner who sees the full picture",
    "are implementing systems but need guidance & accountability",
    "are exploring new revenue streams and want strategic input",
  ],
  "services.fractional.fit.notFit": [
    "need someone to execute tasks for you (this is consulting, not a VA service)",
    "want instant responses 24/7",
    "aren't ready to commit to at least 3 months",
  ],
  "services.fractional.different": "i'm not here to tell you what you \"should\" be doing. i'm here to help you build a business that actually works for your life. no shame if you didn't do the thing you said you'd do. no cookie-cutter advice. systems designed for your brain. support that feels like texting a friend who gets it. sustainable growth > hustle culture every single time.",
  "services.fractional.quote.text": "Taking on a client is easy. Taking on the right client is an investment.",
  "services.fractional.quote.author": "seth godin",
  "services.fractional.cta": "apply now →",
  "services.fractional.cta.label": "apply now →",
  "services.fractional.cta.link": "contact",
  "services.fractional.faqs": [
    { q: "What does 'async access' actually mean?", a: "You can send me questions via Slack or email anytime. I respond within 48 business hours. Think of it like having a strategic advisor on speed dial — without the agency retainer." },
    { q: "Why is there a 3-month minimum?", a: "Real change doesn't happen in one session. The first month is about understanding your business, the second is building momentum, and the third is where things really click. Most clients stay much longer." },
    { q: "How is this different from hiring a coach?", a: "Coaches ask you questions. I give you answers, strategy, and systems. This is hands-on consulting — I'll help you build frameworks, troubleshoot problems, and make decisions. Not just hold space." },
    { q: "Can I pause my retainer?", a: "Life happens. If you need to pause, we can discuss it — but the 3-month minimum is a commitment to the process. After that, month-to-month is flexible." },
    { q: "What kind of things do clients bring to sessions?", a: "Everything from 'how do I price this new offer' to 'my team is falling apart' to 'I want to launch an event but don't know where to start.' If it touches your business, it's fair game." },
  ],

  // ─── SERVICE DETAIL: CORPORATE ───
  "services.corporate.detail.price": "custom pricing",
  "services.corporate.detail.title": "workshops & training for corporate teams",
  "services.corporate.detail.subtitle": "leadership development that doesn't feel like corporate theater",
  "services.corporate.detail.problem": "your team engagement scores are... not great. your managers are drowning in admin work, firefighting constantly, and heading toward burnout. onboarding is basically \"here's your login, figure it out.\" you rolled out a new platform 6 months ago and adoption is sitting at 30%. sound familiar? i've been there. led teams through it. burned out from it. then figured out how to fix it.",
  "services.corporate.detail.whatIntro": "workshops & training programs that actually create change—not just check a box on someone's quarterly goals.",
  "services.corporate.detail.includes": [
    "building high-performing teams without micromanaging (8.9+/10 engagement scores)",
    "platform adoption that actually sticks (94-96% adoption rates)",
    "energy management for leaders (you can't time-manage your way out of burnout)",
    "custom programs designed for your team's specific challenges",
    "certified asana ambassador & notion expert credentials",
  ],
  "services.corporate.detail.timeline": ["custom program design", "ongoing consulting available"],
  "services.corporate.detail.process": [
    "discovery call — what's going on, what've you tried, what does success look like",
    "proposal — custom program design based on your needs",
    "delivery — workshop, training series, or ongoing consulting",
    "follow-up — because real change doesn't happen in a 2-hour session",
  ],
  "services.corporate.detail.fit.perfect": [
    "are tired of workshops that feel like corporate theater",
    "want actionable strategies, not just motivational speeches",
    "value retention & engagement over \"just hire more people\"",
    "need someone who's actually done this (not just read about it)",
  ],
  "services.corporate.detail.fit.notFit": [
    "want a one-hour motivational talk with no substance",
    "aren't ready to actually implement changes",
    "are looking for the cheapest option",
  ],
  "services.corporate.detail.different": "i'm currently leading teams across 8 global regions while building a fractional consulting business on a 4-day work week. but i didn't start here. i started checking teams at 10pm, working weekends, and thinking that's just what good leaders do. i burned out. then i rebuilt everything. this isn't theory. this is what actually works.",
  "services.corporate.detail.cta": "let's talk →",
  "services.corporate.detail.cta.label": "let's talk →",
  "services.corporate.detail.cta.link": "contact",
  "services.corporate.detail.faqs": [
    { q: "What size teams do you work with?", a: "I've led and trained teams from 5 to 50+ across 8 global regions. Whether you're a startup leadership team or a distributed enterprise group, the principles scale." },
    { q: "Do you offer one-off workshops or ongoing programs?", a: "Both. Some clients need a single workshop to kickstart change. Others benefit from an ongoing consulting relationship. We'll figure out what makes sense during the discovery call." },
    { q: "How do you measure success?", a: "We set clear metrics upfront — engagement scores, adoption rates, retention numbers, whatever matters to your team. I've consistently hit 8.9+/10 engagement and 94-96% platform adoption." },
    { q: "Is this only for in-person teams?", a: "Not at all. Most of my experience is with distributed and remote teams. Workshops can be delivered virtually, in-person, or hybrid — whatever works for your setup." },
    { q: "What makes your approach different from typical corporate training?", a: "I'm not a consultant who's only read about leadership. I'm currently doing it — leading global teams on a 4-day work week. Everything I teach comes from actual experience, not a textbook." },
  ],

  // ─── ABOUT PAGE ───
  "about.hero.scriptLabel": "a little about me",
  "about.hero.title": "hi, i'm sam 👋",
  "about.hero.subtitle": "global team leader, fractional consultant, certified notion nerd, and part-time mermaid",
  "about.hero.body": "currently managing teams across 8 regions from my home office in san diego (usually with an iced oat latte in an anthropologie cloud cup and my dog bentley judging my meetings from his bed).",
  "about.marquee": "systems that don't suck · sustainable growth · feel-good ops",

  "about.backstory.scriptLabel": "the backstory",
  "about.backstory.heading": "credibility without the stuffiness",
  "about.backstory.body1": "i've spent 6+ years building high-performing teams in performance marketing—the kind that don't need micromanaging, consistently hit 8.9+/10 engagement scores, and actually want to show up on mondays.",
  "about.backstory.body2": "but here's what those achievements don't show: the burnout i went through to get there. checking teams at 10pm. working through weekends \"just to catch up.\" saying yes to everything because i thought that's what good leaders did.",
  "about.backstory.body3": "i hit a wall. and when i did, i realized: this isn't sustainable. so i rebuilt everything—my systems, my boundaries, my entire approach. now i help you skip the burnout part and go straight to what actually works.",

  "about.beliefs.scriptLabel": "what i believe",
  "about.beliefs": [
    { b: "energy management > time management", d: "you can't calendar your way out of exhaustion. sustainable business is about protecting your capacity, not squeezing more into your day.", tag: "protect your energy" },
    { b: "the best system is the one you'll actually use", d: "i don't care how beautiful someone's notion template is—if it doesn't match your brain, you won't use it.", tag: "built for your brain" },
    { b: "sustainable growth beats hustle culture every time", d: "quick wins are fun. building something that lasts without burning out? that's the real flex.", tag: "the long game wins" },
    { b: "you don't need to be \"always on\" to be successful", d: "i'm literally building a consulting business while working corporate 4 days a week. proof of concept, baby.", tag: "proof of concept" },
  ],

  "about.lifestyle.scriptLabel": "when i'm not consulting",
  "about.lifestyle": [
    { emoji: "☕", text: "getting iced oat lattes in ridiculous cloud cups" },
    { emoji: "🏖️", text: "walking the beach in san diego" },
    { emoji: "🧘‍♀️", text: "at pilates (moving my body >> grinding)" },
    { emoji: "💅", text: "getting polka dot nails (it's a vibe)" },
    { emoji: "🐕", text: "hanging with bentley (my coworker)" },
    { emoji: "✈️", text: "planning trips (30th birthday in italy & spain!)" },
  ],

  "about.beliefs.heading": "the non-negotiables",
  "about.hero.typewriterTraits": ["global team leader", "fractional consultant", "certified notion nerd", "part-time mermaid", "pilates enthusiast", "iced latte connoisseur"],
  "about.cta.heading": "let's build something that actually works for your life",
  "about.cta.script": "no hustle required. just intention.",

  // ─── RESOURCES PAGE ───
  "resources.hero.heading": "welcome to the cabana club 🏖️",
  "resources.hero.subheading": "your corner of the internet for feel-good systems and doing things differently",
  "resources.marquee": "real talk · no productivity guilt · systems that work",

  "resources.newsletter.scriptLabel": "the newsletter",
  "resources.newsletter.heading": "every wednesday in your inbox",
  "resources.newsletter.body": "real talk about building businesses that don't own you, systems & strategy for sustainable growth, revenue expansion ideas, behind-the-scenes of building while working corporate, and permission slips you didn't know you needed. no \"monetize your mornings\" bs.",

  "resources.tools.scriptLabel": "the toolkit",
  "resources.tools.heading": "tools & favorites",
  "resources.tools.subheading": "the tools i use and recommend to every client",
  "resources.tools.items": [
    { emoji: "📋", title: "Asana", desc: "the project management tool that actually gets adopted. how i hit 94% adoption across distributed teams." },
    { emoji: "📝", title: "Notion", desc: "my second brain. templates, databases, and systems that work the way your brain does." },
    { emoji: "💼", title: "Dubsado", desc: "client management that handles contracts, invoicing, workflows, and onboarding — so you don't have to." },
    { emoji: "💌", title: "Flodesk", desc: "beautiful email marketing without the learning curve. design emails people actually want to open." },
  ],
  "resources.newsletter.preferences": ["systems & ops", "revenue expansion", "leadership", "all of the above"],

  // ─── CONTACT PAGE ───
  "contact.hero.heading": "let's chat 💬",
  "contact.hero.subheading": "not sure where to start? tell me what's going on and we'll figure it out together",
  "contact.dubsado.embedUrl": "https://hello.dubsado.com/public/form/view/69a496d4ed3322ac99c1a730",
  "contact.dubsado.placeholder": "once you add your dubsado form URL via the admin editor, your discovery call booking form will appear here.",
  "contact.emailAlt.heading": "prefer email?",
  "contact.emailAlt.body": "for brand partnerships, speaking inquiries, or collabs:",

  // ─── FOOTER ───
  "footer.tagline": "built with intention, not perfection",

  // ─── IMAGES ───
  "image.home.welcome": null,
  "image.home.pathCard0": null,
  "image.home.pathCard1": null,
  "image.home.pathCard2": null,
  "image.about.hero": null,

  // ─── CONTENT BLOCKS (dynamic headings, paragraphs, spacers) ───
  "blocks.home.welcome": [],
  "blocks.home.coreValues": [],
  "blocks.home.pathCards": [],
  "blocks.home.stats": [],
  "blocks.home.closing": [],
  "blocks.services.creators": [],
  "blocks.services.corporate": [],
  "blocks.services.brands": [],
  "blocks.about.backstory": [],
  "blocks.about.beliefs": [],
  "blocks.resources.newsletter": [],

  // ─── SECTION ORDER ───
  "home.sectionOrder": ["hero", "marquee", "welcome", "coreValues", "systems", "pathCards", "stats", "socialProof", "testimonials", "newsletter", "closing", "closingMarquee"],

  // ─── SECTION VISIBILITY ───
  "visibility.home.socialProof": true,
  "visibility.home.stats": true,
  "visibility.home.testimonials": true,
  "visibility.home.newsletter": true,
  "visibility.home.closing": true,
  "visibility.services.creators": true,
  "visibility.services.corporate": true,
  "visibility.services.brands": true,
  "visibility.about.backstory": true,
  "visibility.about.beliefs": true,
  "visibility.about.lifestyle": true,
  "visibility.resources.newsletter": true,
  "visibility.resources.free": true,
};
