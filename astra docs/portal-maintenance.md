# Maintaining the learning portal

The learning studio is a dependency-free browser interface served by the existing ASP.NET application. Its HTML, CSS, and JavaScript live in [wwwroot/learn](../src/MeterForge.Api/wwwroot/learn); [LearningEndpoints.cs](../src/MeterForge.Api/Learning/LearningEndpoints.cs) provides the document catalog.

## Routes and document updates

| Route | Behavior |
| --- | --- |
| `/` and `/learn` | Redirect to `/learn/` |
| `/learn/` | Learning pathway, field guide, and notebook |
| `/api/learning/documents` | JSON array containing each document's `path` and `title` |
| `/api/learning/documents/{path}` | One catalog document as UTF-8 plain text, or HTTP 404 |

The API project embeds `astra docs/**/*.md` into its assembly at build time. **Rebuild after adding or editing a learning document**, and republish to update a published application. No repository checkout is needed at runtime. The catalog is read from those embedded resources; request paths never become filesystem paths. Only this learning collection is exposed, not arbitrary source files or root documentation.

The reader displays Markdown literally using `textContent`. It does not interpret embedded HTML. A related-guides menu discovers relative Markdown links and enables only destinations already in the catalog. Source-code links and documents outside the collection remain repository paths to open in an editor. Keep the full catalog picker usable when adding documents whose Markdown links are more complex than the reader's simple discovery supports.

The twelve challenge cards and their document paths are defined near the beginning of [app.js](../src/MeterForge.Api/wwwroot/learn/app.js): five beginner lessons followed by the original seven labs. Fresh notebooks show the beginner stage; notebooks with existing review marks initially show all stages. Keep paths aligned with the lessons, labs, and notes. Preserve challenge IDs when editing wording so existing progress survives.

The three reasoning checks in the same file provide hints, explanatory feedback, and transfer prompts. They do not award review marks or assess career readiness. Challenge evidence fields ask learners to record a result and explanation before adding a new review mark; existing marks without evidence remain valid and show a revisit prompt.

## Local learner data

Notes, review checkmarks, and per-challenge evidence are stored under `meterforge.learning.v1` in the current browser's local storage for this site's origin. They are not sent to the API. Different browsers, profiles, hosts, or ports have separate notebooks. Clearing browser data removes the local copy; export JSON before moving or clearing it. There is no account, server sync, or assessment of competence.

The optional `evidence` field maps known challenge IDs to strings of at most 4,000 characters. Older v1 notebooks without that field import as an empty evidence map while preserving their notes and review IDs. Export includes the evidence map. Invalid evidence types, unknown IDs, or oversized values reject the whole import before replacing any local state.

The import flow validates the backup version, known challenge IDs, note length, and file size before asking to replace existing data. When browser storage is blocked or full, the page reports that changes are session-only and still permits export. Treat changes to the storage schema as a migration task; do not silently discard old learner notes.

## Verification

CI runs the documentation link check and the solution's format, build, and test checks. [LearningPortalTests.cs](../tests/MeterForge.Api.Tests/Learning/LearningPortalTests.cs) checks entry routes, local assets, all embedded documents, and rejection of unknown or traversal-like paths.

The optional [browser smoke script](../tools/check_learning_portal.cjs) exercises the beginner starting stage, reasoning feedback without review credit, practice evidence, filters, persisted progress and notes, old and new JSON backups, invalid backups, every catalog document, document navigation, Escape, mobile overflow, and JavaScript errors. It uses a fresh browser context, so it does not touch an existing learner notebook. Its one mocked response probes unsafe Markdown; the remaining flows use the running API. It is a manual check, not part of CI.

Start the API in one terminal, choosing a predictable local URL:

```powershell
dotnet run --project src/MeterForge.Api --no-launch-profile --urls http://localhost:5000
```

In another terminal, run the browser check with an existing Playwright package and Chromium installation:

```powershell
$env:METERFORGE_BASE_URL = 'http://localhost:5000'
# If Playwright is not available through Node's normal module resolution,
# point to the package directory in an existing tools installation:
# $env:METERFORGE_PLAYWRIGHT_MODULE = 'C:\your-tools\node_modules\playwright'
node tools/check_learning_portal.cjs
```

Playwright and its Chromium browser are optional development tools; they are not application dependencies and the script does not install them. Without them, use the API integration tests and manually exercise the portal. Set `METERFORGE_SCREENSHOT_DIR` to choose a screenshot directory; otherwise desktop and mobile screenshots are written to the operating system's temporary directory.

After publishing, rerun the script against the published server to check that static assets and embedded documents were included. A browser smoke pass does not replace keyboard and assistive-technology review, peer review of the curriculum, or the billing application's domain tests.
