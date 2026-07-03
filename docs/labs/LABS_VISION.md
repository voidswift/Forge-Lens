# ForgeLens Labs Vision

## Mission

Build foundational technologies that enable software to be understood semantically rather than syntactically.

ForgeLens Core helps engineers understand repositories.

ForgeLens Labs explores technologies that may fundamentally change how software evolution is analyzed, verified, searched, and explained.

---

## Research Principles

* **Isolation:** Research must remain isolated from production systems.
* **Measurability:** Every experiment must have measurable hypotheses.
* **Stability First:** Core product stability always takes priority.
* **Reusability:** Labs technologies should become reusable libraries.
* **Open Source:** Research should be publishable and open-source whenever possible.

---

## Research Track 1: Temporal Code Graph Engine (TCGE)

### Goal
**TCGE explores semantic version control by modeling code as an evolving graph of language constructs rather than line-based text. The long-term objective is to enable architectural queries that are difficult or impossible with traditional Git history alone.**

Instead of asking:
> "What changed?"

Answer:
> "What concept evolved?"

### Long-Term Query Examples
- When did authentication become tightly coupled to billing?
- Which refactor reduced complexity the most?
- Which module has accumulated architectural debt over five years?
- Show every public API whose contract changed.
- Trace the evolution of this function across every release.
- Identify architectural drift over time.

---

## Research Phases

### Phase 0: Syntax Extraction
`Repository -> Git History -> Tree-sitter -> AST JSON`

### Phase 1: Semantic Mapping
`AST -> Semantic Graph -> Relationships`

### Phase 2: Timeline Engine
`Graph Diff Engine -> Semantic Timeline -> Evolution Queries`

### Phase 3: Temporal Replay
`Compressed Storage -> Temporal Graph -> Historical Replay`

### Phase 4: Formal Verification
`Formal Analysis -> Dependency Verification -> Architectural Constraints`

### Phase 5: Distributed Execution
`Distributed Temporal Engine -> Custom Storage -> Potential research publication`

---

## Non-Goals

The Labs project is NOT:
* Another AI wrapper
* Another GitHub dashboard
* Another code search engine
* Another vector database
* Another LLM assistant

Its purpose is to build **new developer infrastructure**.

---

## Success Criteria

Success is not measured by MAU or revenue. It is measured by:
* Open-source adoption
* Academic citations
* IDE integrations
* Security tooling integrations
* Static analysis integrations
* Compiler ecosystem integrations
