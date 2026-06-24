# Data Import

Use the native imports-management pipeline when the customer provides CSV, Excel, JSON, or exported data.

## Import Flow

1. **Prepare the file.** Normalize dates, trim empty columns, check required fields, and remove example rows.
2. **Upload.** Use `execute-action` for `POST /imports-management/upload` with `files:[{ data:<base64>, filename, mimetype:"text/csv", fieldName:"file" }]`. The response contains `importId`, detected `columns`, suggested mappings, and `sampleRows`.
3. **Review mappings.** Read the target entity schema, map columns explicitly, and explain any uncertain mappings to the user.
4. **Dry run.** Run validation/import preview first when available.
5. **Confirm.** Never execute the final import without explicit confirmation.
6. **Execute.** Run the import through MCP.
7. **Verify.** Check counts and inspect one or two imported records.
8. **Review checkpoint.** Give the user an in-app deeplink through `leadtime-get-urls` and ask them to inspect the imported records before continuing.

## Employee Imports

The import creates the core employee records, but some employment details may need follow-up writes per employee:

- Salary history.
- Vacation entitlement.
- Working time / weekly hours.
- Chargeable daily target.
- Roles and permissions.

After an employee import, ask the user to review roles, working hours, vacation entitlement, part-time settings, and salary data where relevant.

## Organization And Contact Imports

For a combined contact list with a company column, import organization members and let Leadtime match or create organizations by name. For organization-only lists, import organizations directly and deduplicate by organization name where supported.

Before importing organizations, load existing organizations and call out likely duplicates.

## Guardrails

- Never run the final import without a dry run/preview and explicit confirmation.
- Keep the original file untouched when possible.
- Explain skipped rows and validation errors clearly.
- After imports, actively offer to repair issues with patch actions or a correction import.
