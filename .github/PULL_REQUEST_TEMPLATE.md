## Summary

Describe the change and why it is needed.

## Verification

- [ ] `bun run test:www`
- [ ] Relevant web, WordPress, Figma, or integration builds
- [ ] `bun run php-test:wp`, if PHP changed
- [ ] Manual builder/editor verification, if relevant

## Checklist

- [ ] Tests cover behavior changes.
- [ ] Documentation was updated when behavior, configuration, or public surfaces changed.
- [ ] Shared behavior lives in `packages/core` where appropriate.
- [ ] Project-schema or generated-CSS compatibility was considered.
- [ ] No credentials, private URLs, local environment files, or unintended generated artifacts are included.
- [ ] Third-party copyright and license notices are preserved.
