# Chapters A-D: Core Setup

Concrete implementation notes for the core setup steps. Always read `action-details` before writing because schemas and required fields can change. Clarify values with the user, confirm, then execute. Never guess IDs.

## A/B - Workspace And Company Settings

Read current workspace/company settings first, then propose changes.

Typical areas:

- Company master data and VAT/tax details through company settings.
- Address and document defaults.
- Workspace appearance and branding. See [appearance-and-documents.md](appearance-and-documents.md).
- Default project/task settings where available.

Before asking the user to type company master data manually, offer to extract it from the company website or imprint using available web/fetch capabilities. Present the extracted data for confirmation before writing.

Branding is part of the job. Offer to prepare the logo for Leadtime: crop it, remove the background, make a dark-mode variant, and prepare document layout assets.

## C - Employees

Create employees before organizations. An employee has a core person/user record plus time-versioned employment details such as salary, vacation, and working time.

Before collecting data, explain what the employee list should contain:

- First and last name.
- Email.
- Role/job title.
- Login needed or not.
- Role/permission group.
- Weekly hours and work schedule.
- Start date.
- Vacation entitlement.
- Optional salary data when the customer wants full HR/time setup.

For many employees, use CSV import for the core employee records, then patch salary, vacation, working time, and chargeable targets per employee when needed. See [data-import.md](data-import.md).

After employee creation/import, give the user the staff deeplink and ask them to review roles, weekly hours, vacation, part-time settings, and login access.

## C - Organizations And Members

Explain the model first:

- **Organizations** are external companies or groups: customers, prospects, partners, suppliers, service providers, competitors, authorities, and similar.
- **Members** are contact people at an organization. Members can optionally receive guest access.
- Guest users should only see tickets/projects for their own organization.

For a single organization, create it with required fields such as name and type. Optional fields include address, VAT, billing defaults, document defaults, and brand color.

For imports:

- A contact list with a company column can import organization members and match/create organizations by name.
- An organization-only list can import organizations directly.
- Deduplicate by organization name when supported.

Before importing, load existing organizations and call out likely duplicates. After importing, give the user the contacts/organizations deeplink and ask for review.

## D - Internal Project Structure

Internal projects represent departments or ongoing operational work, not customer projects. Their purpose is to give employees places to book time and organize recurring work.

Explain value groups in simple terms: they classify how work contributes to value creation and reporting. Then help the user build a practical structure instead of only asking for raw inputs.

Recommended flow:

1. Ensure project basics exist: categories, phases, statuses, task types, and activities. Use restore-default actions when available.
2. Create one internal project per department or ongoing area, such as Marketing, Sales, Development, Support, or Administration.
3. Ask for one to five recurring activities per internal project and create recurring/standing tasks for them.
4. Encourage complete time tracking, including non-billable work.

## D - External Ongoing Projects

External ongoing projects are tied to customer organizations. They give tasks, time tracking, and billing a home.

Before creating projects:

- Ensure the target organization exists.
- Load workspace-specific project categories, statuses, phases, task types, and activities.
- Ensure required defaults exist.

For each external project, clarify the organization, project name, billing/value group, project category, and default task setup. After creation, provide the project deeplink and ask the user to review.

## General Notes

- Tasks always belong to a project.
- Statuses, types, priorities, categories, and activities are workspace-specific.
- PATCH operations may merge scalar fields but replace arrays; when patching arrays, send the complete intended list.
- Show names, not UUIDs.
