"use strict";

const challenges = [
  { id: "read-code", stage: "beginner", label: "New to coding", title: "Read a few lines of C#", description: "Learn what values, variables, conditions, and methods do. Predict a tiny program before running it.", code: "src/MeterForge.Domain/Catalog/Product.cs", guide: "foundations/01-reading-csharp.md", tags: "beginner variables types methods csharp reading" },
  { id: "debug-change", stage: "beginner", label: "New to coding", title: "Find out why it failed", description: "Read an error, compare expected and actual behavior, and use Git to inspect a small change.", code: "src/MeterForge.Domain/Common/Money.cs", guide: "foundations/02-debugging-and-git.md", tags: "beginner debugging errors git diff" },
  { id: "request-basics", stage: "beginner", label: "New to coding", title: "Follow data into the app", description: "Understand a request, a response, and a lookup before tracing the complete product endpoint.", code: "src/MeterForge.Api/Catalog/ProductEndpoints.cs", guide: "foundations/03-requests-and-data.md", tags: "beginner http json dictionary data requests" },
  { id: "first-test", stage: "beginner", label: "New to coding", title: "Write your first useful test", description: "Arrange an input, run a method, and compare its result with an expectation you worked out yourself.", code: "tests/MeterForge.Domain.Tests/Catalog/ProductTests.cs", guide: "foundations/04-first-test.md", tags: "beginner unit test assertions expected actual" },
  { id: "small-change", stage: "beginner", label: "New to coding", title: "Explain one small change", description: "Make a bounded change, verify it, and explain your reasoning in a short review note.", code: "src/MeterForge.Domain/Catalog/Product.cs", guide: "foundations/05-small-change.md", tags: "beginner change review explanation independence" },
  { id: "vertical-slice", stage: "foundation", label: "Junior practice", title: "Follow one request", description: "Trace a product from HTTP contract to domain rule and back. Deliver a small vertical slice with a meaningful test.", code: "src/MeterForge.Api/Catalog/ProductEndpoints.cs", lab: "01-vertical-slice", note: "01-csharp-domain-modeling", tags: "api contracts csharp tests architecture" },
  { id: "rating-invariants", stage: "foundation", label: "Junior practice", title: "Make the money add up", description: "Explore rating boundaries, rounding, and invariants. Show that your implementation holds at the edges.", code: "src/MeterForge.Domain/Rating/TieredRating.cs", lab: "02-rating-invariants", note: "02-api-boundaries", tags: "money decimal rating testing validation" },
  { id: "idempotency", stage: "intermediate", label: "Independent delivery", title: "Handle the same request twice", description: "Examine duplicate usage and concurrent writes. Define what a retry should mean before implementing it.", code: "src/MeterForge.Infrastructure/Usage/InMemoryUsageEventStore.cs", lab: "03-idempotency-and-concurrency", note: "03-persistence-concurrency", tags: "idempotency concurrency retries usage persistence" },
  { id: "persistence", stage: "intermediate", label: "Independent delivery", title: "Keep the invoice after restart", description: "Work through durable storage, schema decisions, and integration boundaries. Make the failure behavior explicit.", code: "src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs", lab: "04-durable-invoice-persistence", note: "03-persistence-concurrency", tags: "postgres sql migrations persistence transactions" },
  { id: "outbox", stage: "advanced", label: "System ownership", title: "Design for uncertain outcomes", description: "Connect outbox delivery, payment ambiguity, and reconciliation. Explain how a system recovers when an answer is missing.", code: "src/MeterForge.Application/Payments/PaymentService.cs", lab: "05-outbox-and-provider-ambiguity", note: "04-distributed-reliability", tags: "outbox provider payments reliability distributed" },
  { id: "operations", stage: "advanced", label: "System ownership", title: "Investigate before optimizing", description: "Build a performance baseline and reason through an incident. Turn observations into a measurable improvement.", code: "src/MeterForge.Api/Program.cs", lab: "06-performance-and-incident", note: "05-testing-operations", tags: "performance incidents observability metrics testing operations" },
  { id: "capstone", stage: "advanced", label: "System ownership", title: "Own the whole decision", description: "Frame a system change, compare alternatives, plan the rollout, and support your design with evidence a reviewer can assess.", code: "src/MeterForge.Infrastructure/Persistence/Migrations/002_outbox.sql", lab: "07-senior-capstone", note: "06-technical-leadership", tags: "senior leadership architecture design review tradeoffs" }
];
const key = "meterforge.learning.v1";
const byId = id => document.getElementById(id);
const knownIds = new Set(challenges.map(challenge => challenge.id));
let state = { version: 1, reviewed: [], notes: "", evidence: {} };
let storageAvailable = true;
let catalog = [];
let documentRequest = 0;

function validateState(value) {
  if (!value || value.version !== 1 || typeof value.notes !== "string" || value.notes.length > 100000 || !Array.isArray(value.reviewed) || !value.reviewed.every(id => typeof id === "string" && knownIds.has(id))) throw new Error("Invalid notebook format.");
  // Evidence is optional so existing v1 notebooks keep their notes and progress.
  const evidence = value.evidence === undefined ? {} : value.evidence;
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence) || Object.entries(evidence).some(([id, note]) => !knownIds.has(id) || typeof note !== "string" || note.length > 4000)) throw new Error("Invalid practice evidence.");
  return { version: 1, reviewed: [...new Set(value.reviewed)], notes: value.notes, evidence: { ...evidence } };
}
try {
  const saved = localStorage.getItem(key);
  if (saved) state = validateState(JSON.parse(saved));
} catch {
  storageAvailable = false;
  byId("save-status").textContent = "Saved data could not be read. Changes stay in this session; export a backup.";
}
byId("notes").value = state.notes;
byId("level").value = state.reviewed.length ? "all" : "beginner";

const practiceGoals = {
  "read-code": "Predict each variable's value, run the example, then explain a different input without the answer key.",
  "debug-change": "Record expected versus actual behavior, the line that explains it, and a focused Git diff.",
  "request-basics": "Explain the request body, response, lookup key, and why a restart loses the example data.",
  "first-test": "Show a passing test and a deliberate wrong result that makes it fail for the expected reason.",
  "small-change": "Show your small diff, one negative case, and a review explanation written without copying the guide.",
  "vertical-slice": "Trace a requirement through the affected layers and show the test that protects the caller's result.",
  "rating-invariants": "Calculate an expected charge by hand and demonstrate a boundary case with an independent test.",
  "idempotency": "Explain a two-caller interleaving and demonstrate one canonical result, not just one stored row.",
  "persistence": "Show real-database rollback and replay results; name anything you have not verified after restart.",
  "outbox": "Draw a crash window and show how a repeated delivery or uncertain provider result is handled.",
  "operations": "Record a baseline, one hypothesis, a measurement, and the result that changed your decision.",
  "capstone": "Link your decision, failure evidence, rollout plan, and a review objection you addressed."
};

function save() {
  if (storageAvailable) {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { storageAvailable = false; }
  }
  byId("save-status").textContent = storageAvailable ? "Notes and progress saved in this browser." : "Browser storage is unavailable. Export to keep this session's notes and progress.";
  document.querySelector(".local-badge").textContent = storageAvailable ? "Saved in this browser" : "Session only · export to keep";
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function docButton(label, path) {
  const button = element("button", "text-button", label);
  button.type = "button";
  button.dataset.doc = path;
  return button;
}

function render() {
  const query = byId("search").value.trim().toLowerCase();
  const stage = byId("level").value;
  const filtered = challenges.filter(challenge =>
    (stage === "all" || challenge.stage === stage) &&
    (!byId("unfinished").checked || !state.reviewed.includes(challenge.id)) &&
    `${challenge.title} ${challenge.description} ${challenge.tags} ${challenge.code}`.toLowerCase().includes(query));
  const cards = filtered.map(challenge => {
    const reviewed = state.reviewed.includes(challenge.id);
    const card = element("article", `challenge-card${reviewed ? " reviewed" : ""}`);
    const top = element("div", "card-top");
    top.append(element("span", "stage-tag", challenge.label), element("span", "card-number", String(challenges.indexOf(challenge) + 1).padStart(2, "0")));
    const code = element("div", "code-pointer");
    code.append(element("span", "", "OPEN IN YOUR EDITOR"), element("code", "", challenge.code));
    const actions = element("div", "card-actions");
    actions.append(docButton("Open challenge ↗", challenge.guide || `labs/${challenge.lab}.md`), docButton(challenge.guide ? "Word help" : "Study notes", challenge.guide ? "glossary.md" : `notes/${challenge.note}.md`));
    const practice = element("details", "practice-evidence");
    practice.append(element("summary", "", "Practice, then explain"), element("p", "", practiceGoals[challenge.id]));
    const evidenceLabel = element("label", "", "Your result and explanation (or artifact path)");
    evidenceLabel.htmlFor = `evidence-${challenge.id}`;
    const evidence = element("textarea", "evidence-input");
    evidence.id = `evidence-${challenge.id}`;
    evidence.maxLength = 4000;
    evidence.rows = 4;
    evidence.placeholder = "I predicted…\nI ran/changed… and observed…\nThis happens because…\nNext time, without hints, I will…";
    evidence.value = state.evidence[challenge.id] || "";
    const feedback = element("p", "muted", reviewed && !evidence.value ? "Earlier review preserved. Add evidence when you revisit this challenge." : "Revisit with a new input tomorrow; use the guide only after trying from memory.");
    feedback.setAttribute("role", "status");
    evidence.addEventListener("input", () => { state.evidence[challenge.id] = evidence.value; save(); });
    practice.append(evidenceLabel, evidence, feedback);
    const label = element("label", "review-check");
    const checkbox = element("input");
    checkbox.type = "checkbox";
    checkbox.checked = reviewed;
    checkbox.setAttribute("aria-label", `Mark ${challenge.title} as reviewed with evidence`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked && !evidence.value.trim()) {
        checkbox.checked = false;
        practice.open = true;
        feedback.textContent = "First record what you tried, the result, and your explanation. A reading checkmark alone is not practice evidence.";
        evidence.focus();
        return;
      }
      state.reviewed = checkbox.checked ? [...state.reviewed, challenge.id] : state.reviewed.filter(id => id !== challenge.id);
      save();
      updateProgress();
      card.classList.toggle("reviewed", checkbox.checked);
      if (byId("unfinished").checked) {
        // Keep keyboard focus in a predictable place when the current card disappears.
        byId("unfinished").focus();
        render();
      }
    });
    label.append(checkbox, document.createTextNode("Reviewed with evidence"));
    card.append(top, element("h3", "", challenge.title), element("p", "", challenge.description), code, actions, practice, label);
    return card;
  });
  byId("challenges").replaceChildren(...cards);
  byId("empty-state").hidden = filtered.length > 0;
  byId("result-count").textContent = `${filtered.length} of ${challenges.length} challenges shown`;
  updateProgress();
}

function updateProgress() {
  byId("progress-count").textContent = `${state.reviewed.length} / ${challenges.length}`;
  byId("progress-bar").value = state.reviewed.length;
  byId("progress-bar").max = challenges.length;
  byId("progress-bar").textContent = `${state.reviewed.length} of ${challenges.length}`;
  const next = challenges.find(challenge => !state.reviewed.includes(challenge.id));
  byId("next-step").textContent = next ? `Next to explore: ${next.title}.` : "Every challenge reviewed. Revisit the competency matrix and ask a peer to review your evidence.";
  document.querySelector(".local-badge").textContent = storageAvailable ? "Saved in this browser" : "Session only · export to keep";
}

async function openDocument(path) {
  const request = ++documentRequest;
  const url = `/api/learning/documents/${path.split("/").map(encodeURIComponent).join("/")}`;
  byId("document-title").textContent = catalog.find(item => item.path === path)?.title || path;
  byId("document-body").textContent = "Loading document…";
  byId("related-guides").hidden = true;
  byId("raw-document").href = url;
  if (!byId("document-dialog").open) byId("document-dialog").showModal();
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Document unavailable");
    const content = await response.text();
    if (request === documentRequest) {
      byId("document-body").textContent = content;
      showRelatedGuides(content, path);
    }
  } catch {
    if (request === documentRequest) byId("document-body").textContent = "This document could not be loaded. Check that the API is running and rebuild after adding documentation. You can also read it in the repository's astra docs folder.";
  }
}

function showRelatedGuides(content, currentPath) {
  const related = new Set();
  // This is link discovery, not a Markdown renderer. Only entries already in
  // the embedded catalog become buttons; document content stays plain text.
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    try {
      const target = match[1].trim().replace(/^<(.+)>$/, "$1");
      if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(target)) continue;
      const resolved = new URL(target, `https://learning.invalid/${currentPath}`);
      const path = decodeURIComponent(resolved.pathname.slice(1));
      if (path !== currentPath && catalog.some(item => item.path === path)) related.add(path);
    } catch { /* A malformed Markdown link stays visible in the plain text. */ }
  }
  byId("related-links").replaceChildren(...[...related].map(path => docButton(catalog.find(item => item.path === path).title, path)));
  byId("related-summary").textContent = `${related.size} related guide${related.size === 1 ? "" : "s"}`;
  byId("related-guides").hidden = related.size === 0;
  byId("related-guides").open = false;
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-doc]");
  if (button) openDocument(button.dataset.doc);
});
byId("close-document").addEventListener("click", () => byId("document-dialog").close());
byId("search").addEventListener("input", render);
byId("level").addEventListener("change", render);
byId("unfinished").addEventListener("change", render);
byId("notes").addEventListener("input", () => { state.notes = byId("notes").value; save(); });
byId("export").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" }));
  const link = element("a");
  link.href = url;
  link.download = `meterforge-notebook-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  byId("save-status").textContent = "Notebook export requested. Keep the downloaded JSON file as your backup.";
});
byId("import").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 1000000) throw new Error("File too large");
    const imported = validateState(JSON.parse(await file.text()));
    if (!window.confirm("Replace this browser's notes and progress with this backup? Export your current notebook first if you want to keep it.")) return;
    state = imported;
    byId("notes").value = state.notes;
    save();
    render();
  } catch { byId("save-status").textContent = "Import failed. Choose a valid MeterForge v1 notebook JSON export under 1 MB. Existing notes were kept."; }
  finally { event.target.value = ""; }
});
byId("document-picker").addEventListener("change", event => {
  if (event.target.value) openDocument(event.target.value);
  event.target.value = "";
});

async function loadCatalog() {
  try {
    const response = await fetch("/api/learning/documents");
    if (!response.ok) throw new Error("Catalog unavailable");
    catalog = await response.json();
    const placeholder = element("option", "", "Choose a guide, note, lab, or template…");
    placeholder.value = "";
    const options = catalog.map(item => {
      const option = element("option", "", `${item.path} — ${item.title}`);
      option.value = item.path;
      return option;
    });
    byId("document-picker").replaceChildren(placeholder, ...options);
    byId("catalog-status").textContent = `${catalog.length} documents included in this build. Guides open as readable, unformatted Markdown.`;
  } catch {
    byId("document-picker").disabled = true;
    byId("document-picker").replaceChildren(element("option", "", "Document catalog unavailable"));
    byId("catalog-status").textContent = "Check that the API is running. Guides are also available in the repository's astra docs folder.";
  }
}
const understandingChecks = [
  {
    question: "What value does total have after these lines run?",
    code: "int quantity = 2;\nquantity = quantity + 3;\nint total = quantity * 4;",
    hint: "Write down quantity after each line. Assignment replaces its earlier value.",
    guide: "foundations/01-reading-csharp.md",
    answers: ["8", "20", "10"], correct: 1,
    explanations: ["8 uses the original quantity and skips the second line. After that assignment, quantity is 5; 5 × 4 is 20.", "Yes: quantity starts at 2, becomes 5, and total becomes 20. Now change the starting quantity to 4 and predict the result before running it.", "The last line multiplies the updated quantity by 4. It does not add another value: 5 × 4 is 20."]
  },
  {
    question: "A test gets both expected and actual by calling the same rating method. What would make it useful?",
    code: "Policy: first 100 units cost $1 each; later units cost $0.50 each.\nExample input: 150 units.",
    hint: "An incorrect method can repeat the same incorrect answer. Work out this small example without the method.",
    guide: "foundations/04-first-test.md",
    answers: ["Run the same method twice more", "Use a hand-calculated expected value of $125", "Assert only that the result is positive"], correct: 1,
    explanations: ["Repeating the same algorithm does not give independent evidence. For this example, 100 × $1 + 50 × $0.50 = $125.", "Yes: $100 + $25 = $125 gives an expectation independent of the implementation. Now derive the expected charge for 101 units and explain the boundary it tests.", "An incorrect charge could still be positive. The worked expectation is $125; test the specific rule, then try a boundary case."]
  },
  {
    question: "A simulated provider times out after it may have accepted a payment. What should your design do next?",
    code: "Local result: timeout\nRemote result: unknown\nOriginal logical operation ID: payment-42",
    hint: "A timeout describes what you heard back, not necessarily what happened remotely.",
    guide: "bridges/03-system-ownership.md",
    answers: ["Create a new operation ID and charge again", "Mark it successful without checking", "Record the unknown outcome and reconcile using the original identity"], correct: 2,
    explanations: ["A new identity could create a second collection. Preserve the original identity and use the provider's documented lookup or replay contract to resolve uncertainty.", "No response does not establish success. Record the uncertainty, investigate with the same identity, and make operator responsibility explicit.", "Yes. The exact recovery depends on the provider contract. Now draw what happens if the provider succeeded but the local acknowledgment was lost; explain which evidence would resolve it."]
  }
];

function renderUnderstandingCheck() {
  const check = understandingChecks[Number(byId("check-picker").value)];
  byId("check-question").textContent = check.question;
  byId("check-code").textContent = check.code;
  byId("check-answers").replaceChildren(...check.answers.map((answer, index) => {
    const label = element("label", "check-answer");
    const input = element("input");
    input.type = "radio";
    input.name = "understanding-answer";
    input.value = String(index);
    label.append(input, document.createTextNode(answer));
    return label;
  }));
  byId("check-feedback").replaceChildren();
  byId("check-hint").textContent = check.hint;
  byId("check-hint").hidden = true;
  byId("check-hint-button").setAttribute("aria-expanded", "false");
}

byId("check-picker").addEventListener("change", renderUnderstandingCheck);
byId("check-hint-button").addEventListener("click", () => {
  byId("check-hint").hidden = false;
  byId("check-hint-button").setAttribute("aria-expanded", "true");
});
byId("check-submit").addEventListener("click", () => {
  const selected = document.querySelector('input[name="understanding-answer"]:checked');
  if (!selected) { byId("check-feedback").textContent = "Choose an answer, then check your reasoning. Use the hint if you are stuck."; return; }
  const check = understandingChecks[Number(byId("check-picker").value)];
  const answer = Number(selected.value);
  byId("check-feedback").replaceChildren(
    element("strong", "", answer === check.correct ? "Correct reasoning. " : "Try tracing it again. "),
    document.createTextNode(check.explanations[answer]),
    docButton("Practice this with a worked example", check.guide));
});

render();
renderUnderstandingCheck();
loadCatalog();
