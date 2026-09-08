# Learning review: from beginner to independent engineering work

This revision focuses on helping you learn, practice, and retain engineering skills. The review found that the previous handbook had useful advanced material but assumed too much at the beginning.

## What the review found and changed

| Learning obstacle | Why it mattered | Improvement |
| --- | --- | --- |
| The first tasks assumed API, domain, and concurrency vocabulary | A new programmer could follow commands without understanding the code | Five [foundation lessons](foundations/README.md), a [plain-language glossary](glossary.md), and a [starting-point diagnostic](start-here.md) |
| Exercises asked learners to find a design gap before teaching how to investigate | Getting stuck could mean a missing prerequisite rather than a useful challenge | Worked examples, explicit expected results, guided attempts, staged hints, and independent variations |
| The jump from a small test to durable distributed behavior was large | Learners could copy a pattern without knowing when it helps | Four [bridge guides](bridges/README.md) for reading application C#, SQL, independent feature delivery, and system ownership |
| A review checkbox could be marked without recording any practice | Reading completion looked like demonstrated understanding | A result/explanation field for each challenge, required before a new review mark |
| The portal began with advanced feature work | A beginner had to choose among unfamiliar concepts | Five beginner challenges appear first for a fresh notebook; all twelve remain available through the stage selector |
| Reading had little immediate feedback | An incorrect mental model could persist unnoticed | Three interactive reasoning checks with hints, answer explanations, and a new example to attempt |
| Retention and feedback were optional afterthoughts | A completed exercise might not transfer to another task | A [practice and feedback loop](practice-and-feedback.md) with independent attempts, transfer tasks, delayed recall, and review |

## The progression to use

1. **Beginner:** predict a few lines, investigate a known failure, explain a request, write one assertion, and communicate a small change. Use hints freely at first, then repeat with different input.
2. **Junior:** complete a bounded vertical slice and explain the test protecting its caller. Practice debugging and review before increasing scope.
3. **Independent mid-level work:** clarify an ambiguous issue, select a storage/API boundary, test failure behavior, and prepare a compatible rollout. The SQL and delivery bridges introduce these decisions before the deeper labs.
4. **Broader technical ownership:** compare alternatives, explain partial failure, verify recovery, and help another person understand and maintain the decision. Use the existing operations and capstone labs with the new system-ownership bridge.

Use the [learning path](learning-path.md) to choose the next assignment and the [competency matrix](competency-matrix.md) to collect evidence. A calendar, quiz result, reading count, or checked box does not establish a job level. The useful question is whether you can repeat the task with a new input or requirement and explain why your approach works.

## How the learning interface supports this

The `/learn/` page now includes five beginner challenges alongside the existing seven engineering labs. A fresh notebook opens at **New to coding**. Existing reviewed notebooks open at **All stages**, retaining their previous review marks.

Each challenge's **Practice, then explain** area names a concrete demonstration and saves a result/explanation or artifact path. A new review mark asks for this evidence first. This is a prompt for honest self-assessment, not automatic grading of the text. Earlier review marks remain intact and invite evidence on revisit.

The reasoning checks cover variable tracing, independent test expectations, and an unknown provider outcome. Incorrect answers receive a specific explanation; correct answers include a transfer question. Solving these checks does not change challenge completion. The lesson remains the place to perform and explain real work.

Practice evidence is included in notebook export/import. Older v1 exports without evidence remain valid. All notes remain browser-local; export them to keep a backup.

## Validation for this revision

Three Astra subagents developed and reviewed the foundations, learning sequence, and progression into independent delivery. This revision adds 15 Markdown documents, bringing the embedded learning collection to 41 documents. The parent agent integrated the learning interface and checked the combined result.

- **API build:** Release build succeeded with zero warnings and zero errors using .NET SDK 10.0.302.
- **Live browser checks:** passed against the rebuilt API. Verified all 41 catalog documents open, five beginner cards appear initially, all twelve challenges remain selectable, reasoning checks explain answers without awarding completion, and new review marks require practice evidence.
- **Notebook compatibility:** verified notes and evidence survive reload and export/import, older v1 backups preserve notes and review marks, and malformed imports leave existing data intact.
- **Browser presentation:** document navigation, literal handling of unsafe Markdown, Escape, mobile overflow, and JavaScript-error checks passed. Desktop and mobile screenshots were also inspected: [desktop](screenshots/upskilling/meterforge-learning-desktop.png) and [mobile](screenshots/upskilling/meterforge-learning-mobile.png).
- **Executed C# examples:** foundation output examples matched their lessons. Four extracted beginner xUnit test methods passed when invoked directly; the deliberately incorrect expectation failed as intended. All three application-C# bridge snippets compiled and produced their exact documented outputs in separate temporary console projects. These snippet checks are separate from test discovery and the repository test suite.
- **Static checks:** local Markdown link validation, JavaScript syntax checks for the portal and browser script, and `git diff --check` passed.

The SQL practice fixture and expected rows were reviewed but not executed because PostgreSQL tooling was unavailable. This revision changes learning content and browser behavior; the full billing test suite was not rerun. The original implementation's test results remain in the [earlier change report](CHANGE-REPORT.md). Passing these checks establishes that the learning materials and flows are usable; independent practice and review are still needed to establish understanding.

## Your next session

Open [find your starting point](start-here.md). If predicting a tiny method is difficult, choose the first foundation lesson. Keep a short note: what you predicted, what you observed, why they differed, and the different example you will try next time. Advance when you can explain the result without the worked answer beside you.
