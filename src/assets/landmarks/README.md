This folder is for local landmark images you want to keep inside the source tree.

Usage:
- Put images named by the landmark `id` (see `Survey.tsx` landmark ids) into this folder.
  Examples:
    - `disneyland.svg` or `disneyland.jpg`
    - `victoria-peak.svg`
    - `victoria-harbour.jpg`

Recommendations:
- Prefer consistent filenames that match the `landmark.id` used in the app.
- For ease of serving during dev, consider putting images in `public/landmarks` (already created) so they are available at `/landmarks/<name>`.

If you want the app to reference these under `/landmarks/<id>.<ext>`, put files in `public/landmarks`.
