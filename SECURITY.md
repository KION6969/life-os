# Security

Life OS is a static, local-first app. It has no server-side component and does not
collect analytics.

- Profile, meals, workouts and study history are stored in `localStorage` in your
  browser. They are not uploaded anywhere unless you explicitly enable cloud sync.
- Cloud sync tokens are stored in this browser and sent only to the provider you
  choose (GitHub Gist or JSONBin). Do not enable sync on a shared or public computer.
- The public demo seeds example data locally and makes no network requests beyond
  loading the static files and fonts.

To report a security issue, open a private vulnerability report through the
repository's **Security** tab. Please do not include tokens or personal data in a
public issue.
