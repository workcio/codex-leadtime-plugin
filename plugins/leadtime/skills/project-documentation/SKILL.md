---
name: project-documentation
description: Find, read, create, and maintain durable Leadtime project documentation with compact discovery, bounded reads, and safe focused edits. Use for project knowledge, decisions, runbooks, handoffs, recurring answers, and documentation created during project work.
---

# Project Documentation

Use the bundled Leadtime MCP tools. Discover exact operations with
`list-actions`. Read each contract with `action-details` before execution.

## Discover Before Reading

1. Search actions with focused terms such as `project documentation tree`,
   `project documentation search`, or `project documentation partial`.
2. Read the compact tree when you know the project but not the page.
3. Search inside one project when you know the topic. Use the returned path,
   excerpt, tags, ETag, and generation to select the page.

Do not list or read every page body to find one topic.

Treat tree and detail tag values as UUIDs. Read the
`project-documentation` tag catalog when names or colors matter. Trust the
current project and node capabilities returned by the tree; do not infer an
allowed action from node kind or prior access.

## Read With a Context Budget

Start with a partial page read:

- Use `outline` to map headings.
- Use `matches` with a narrow query to inspect one section and nearby blocks.
- Use `blocks` to read the first complete top-level blocks.
- Continue only with the returned opaque cursor. Do not decode or change it.

Use full page detail only when complete canonical HTML is necessary. If a
cursor returns HTTP 409, restart from current state.

## Make Focused Edits

Prefer Programmatic Document Edits over full page replacement.

1. Read the exact canonical HTML fragment, content ETag, and generation.
2. Read `action-details` for the content-edits operation.
3. Send one ordered atomic batch. Each `search` fragment must match exactly
   once. Use complete blocks when that makes the match unique.
4. Give the command a stable client-generated ID.
5. Verify the receipt, then read the changed blocks. Use the receipt ETag and
   generation for the next coherent edit.

If one edit is missing, ambiguous, overlapping, stale, malformed, or
schema-lossy, the server applies none.

Use full replacement only for an intentional complete rewrite or import. Read
the full current page first. Send a command ID and expected generation.

The application renders the page title separately as the page H1. Do not repeat
that title as the first H1 inside the page body. Start the body with an
introduction or H2 sections unless the user explicitly requests a different
document heading.

## Organize and Label Knowledge

- Create `Page` nodes for knowledge and `Folder` nodes for structure. Omitting
  `kind` creates a page. Pages require `content`; folders omit `content` and
  `tags`.
- Search before creating. Choose `parentId` and optional `afterNodeId` from a
  current tree response.
- Rename pages or folders with metadata PATCH. Page `tags` replaces the complete
  UUID set. Update page content and tags in separate requests.
- Use `/tags/project-documentation` actions to list, create, rename, recolor, or
  delete workspace tag definitions. Assign only active tag UUIDs to pages.
- Move a node only after reading the current destination and neighbors. Re-read
  the tree afterward.

## Retry Safely

- After an unknown exact-content edit, replacement, or restore outcome, retry
  the exact request with the same command ID. For a metadata update, re-read the
  page first and retry only if the requested title or tags were not persisted.
- Creation has no command receipt. After an unknown create outcome, re-read the
  tree and search when useful. Compare parent, kind, and title, and create only
  if the intended node is absent. Never blindly retry a create.
- If the payload changes, use a new command ID.
- After a stale-state conflict, re-read current state and re-evaluate the edit.
- After a missing or ambiguous match, read a larger bounded section. Select a
  unique exact fragment before a new command.
- After validation failure, re-read `action-details` before correction.

Treat each verified receipt as an execution checkpoint. Continue from its ETag
and generation. Do not replay earlier successful edits.

## Protect Destructive and Historical Actions

- Before deletion, read the current subtree preview and present its page and
  folder counts. Delete only with explicit intent and the unchanged preview
  token.
- Discover checkpoint list, detail, and restore contracts before use. Preview
  the selected checkpoint, then guard restore with the current live generation
  and timestamp. Re-read the live page after restore.
- Discover the PDF export contract before exporting. Use a page UUID for one
  page, a folder UUID for its ordered subtree, or omit the root for the complete
  project documentation tree.

## Maintain Durable Knowledge

Create or update a page when project work produces knowledge useful to a later
person or agent. Examples include decisions, constraints, architecture,
runbooks, integration steps, troubleshooting results, handoffs, and repeated
answers.

Search before creation. Update the canonical page when one exists. Create a
clear page in the correct project when no suitable page exists. Keep transient
progress in task comments or session status. Keep credentials, tokens, and
unnecessary personal data out of documentation.

After every write, re-read the changed resource. Leadtime creates page history
checkpoints automatically. A successful status without expected live content
is not completion.
