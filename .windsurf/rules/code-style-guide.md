---
trigger: always_on
---

When writing react code you MUST ALWAYS follow these rules:

- Always import the full react function, never use `React.`. Example: do `useMemo...` not `React.useMemo...`
- Always write fully optimised components
- Always format data ahead of render, never inline in render
- Always define functions outside of the render
- Never use `any`
- The app uses bun js, not NPM, not others. Always use bun to run commands!
- The app uses nextjs for the API layer. For the frontend it uses react-router. All pages are under `src/routes` and should be used and updated there only.
- All components are under src/components.
- Always use react-router links, never nextjs ones.
- App uses InstantDB with the store and functions, queries, mutations defined in src/stores/instantdb.ts
- Never setup barrel files!
