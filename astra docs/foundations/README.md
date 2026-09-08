# Foundations: your first small programs and changes

[Handbook](../README.md) · [Learning path](../learning-path.md)

Start here if reading a method, running a test, or choosing a Git command still feels unfamiliar. You do not need billing knowledge, a computer science degree, or experience with web servers. These lessons teach the vocabulary before asking you to use it. Work in short sessions; needing several attempts is expected.

A **program** is a set of instructions a computer runs. **Source code** is the text people write to describe those instructions. A **repository** is the project folder plus its Git history. MeterForge is this repository's example program. A **terminal** is a window where you type commands; an **editor** is where you change files. C# is the programming language here. The .NET SDK supplies tools that turn C# into a runnable program and run its tests.

## Prepare once

Open this repository in your editor and open a PowerShell terminal in its root folder: the folder containing `MeterForge.slnx`, `global.json`, `src`, and `tests`. Code blocks labeled `powershell` go in that terminal. Blocks labeled `csharp` go in the file named immediately above them. Do not paste a whole Markdown document into either place.

Run one command at a time:

```powershell
Get-Location
dotnet --info
git status --short
dotnet restore MeterForge.slnx --locked-mode
```

`Get-Location` shows your current folder. `dotnet --info` shows the installed development tools. [global.json](../../global.json) selects SDK `10.0.302` and permits later patches in its selected feature band. Restore downloads the libraries the project needs; locked mode checks the recorded dependency versions. A successful restore ends without an error. If a command fails, keep its first error message and use the setup troubleshooting in [the first session](../first-session.md); do not change project settings to silence it.

`git status --short` lists existing changes. Save this list in your own notes so you can distinguish your work from changes already present. Empty output means Git sees no changes. You can complete the reading and temporary-console exercises with existing changes present. Lesson 2 explains how to decide whether to create a branch.

## Work through these in order

| Lesson | You will practice | Evidence to keep |
| --- | --- | --- |
| [1. Reading C#](01-reading-csharp.md) | Values, types, variables, decisions, repetition, and methods | Predicted output, actual output, and your explanation |
| [2. Debugging and Git](02-debugging-and-git.md) | Reproduce a known failure, follow its cause, inspect a change | A three-step diagnosis and a reviewed diff |
| [3. Requests and data](03-requests-and-data.md) | Send a request and follow a dictionary lookup | A successful lookup, a missing lookup, and a restart explanation |
| [4. Your first test](04-first-test.md) | Arrange, act, assert; distinguish a failed assertion from broken code | A test that you have seen both fail and pass |
| [5. Own a small change](05-small-change.md) | Turn a precise request into a tested, reviewable change | A small diff and a short handoff |

Each lesson has a worked example, guided practice, a similar task with fewer instructions, staged hints, and an answer key. Predict before running; try before opening a hint. If you use the answer, close it and reproduce the result with a new input. That second attempt is your evidence of learning.

Keep this small record in your own notes:

```text
I expected:
I observed:
The line or step that explains it:
What I can now do without the answer key:
One question to revisit:
```

You can stop after any lesson. Save your notes and changed files. Temporary console examples are separate from the application; their folder path is printed in lesson 1. When returning in a new terminal, follow that lesson's resume instructions before running them again.

## Ready for the next stage?

Without copying an answer, demonstrate all five: explain a short method, diagnose a specific failure, trace a create/read request, write a useful assertion, and review a small diff. If one is difficult, repeat that lesson's independent variant with a new input. Reading every page is not the completion check.

Then use the [learning path](../learning-path.md) to move into guided work across application files. The [codebase tour](../codebase-tour.md) will make more sense once requests and methods are familiar. Concepts such as concurrency and architecture come later; there is no need to master them before starting lesson 1.
