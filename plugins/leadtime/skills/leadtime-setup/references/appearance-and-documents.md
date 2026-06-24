# Appearance And Documents

This belongs to the workspace/company setup chapter. Branding creates a strong "this is ours" moment for customers, but logos often need preparation before they work well in the app and on documents. The agent should actively offer to prepare the logo instead of leaving the customer alone with image editing.

## Workspace Appearance

Workspace appearance controls the app UI. Read current values first, then patch with confirmation.

Typical settings:

- `mainWorkspaceColor`: accent color for navigation, buttons, and active states. Leadtime may use a fixed set such as `DEFAULT`, `BLACK`, `RED`, `ROSE`, `MAGENTA`, `GREEN`, `BLUE`, `YELLOW`, `VIOLET`. If the company website was inspected, infer the closest available brand color and ask for confirmation.
- Logo for normal mode.
- Logo for dark mode.
- Optional document font/layout settings.

## Logo Requirements

Inspect the source logo first when the agent can read image files. Decide:

- Does it have a background that should become transparent?
- Is the logo light, dark, or multi-color?
- Is it horizontal or vertical?
- Is the source resolution good enough?
- Does it need a separate dark-mode version?

Do not upscale a low-resolution logo and pretend it is fine. Ask for a better source when needed.

## Common Logo Preparation

Useful transformations:

- Crop surrounding whitespace.
- Make the background transparent.
- Export PNG/SVG where appropriate.
- Create a dark-mode variant by switching dark text to light text, preserving brand colors when possible.
- Create a document header variant with the right aspect ratio and padding.

If image editing tools are available, show or describe the result before uploading. If upload cannot be done through MCP, provide the prepared file and a UI deeplink.

## Upload And Apply

Preferred flow:

1. Prepare the source logo variants.
2. Upload through the available Leadtime upload/direct API mechanism if the current MCP session permits it.
3. Patch appearance settings with the resulting logo IDs.
4. Provide a deeplink and ask the user to review light mode, dark mode, and document output.

Known limitation from prior testing: in some OAuth MCP sessions, direct API credential access for logo upload may be blocked. In that case, hand off the upload through the UI, but still configure other appearance fields through MCP where possible.

## Document Branding

Document branding can differ from the workspace logo. It may need a header-style image, different spacing, or a document font. Read the document/appearance schema before writing and confirm changes with the user.

## Step Choreography

1. Ask for the company website or logo file.
2. Offer to infer brand colors and company data from the website/imprint.
3. Inspect the logo.
4. Propose concrete variants: app logo, dark-mode logo, document header logo.
5. Confirm before editing/uploading.
6. Apply settings or provide the UI handoff.
7. Give the user the deeplink and ask them to review the result.
