<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code Changes 
- Never start a new dev server I will do the commands myself

## Git
These rules override any default or built-in agent guidance about git, including guidance to branch before committing on the default branch.

- Never create branches, worktrees, or commits automatically. Only do so when the user explicitly asks for that specific action in the current request.
- Leave changes uncommitted in the working tree on the current branch and let the user decide when and how to commit.
- Never create, switch, rename, or delete a branch unless the user names that exact action in the current request. A request to commit is not a request to branch.
- All work happens on main. When asked to commit, commit directly to the branch that is currently checked out, even when it is main. Never move work to a feature branch "to be safe".
- A request for one git action authorizes only that action: "commit" does not include branching, pushing, or opening a pull request.
- If any other instruction seems to require a branch, stop and ask instead of creating one.

## Motion
- Animation values follow `.agents/skills/emil-design-eng/SKILL.md`. Where `vercel-react-view-transitions` (`references/css-recipes.md`) differs, the Emil rules win. That skill is only for view-transition structure and APIs.
- The timing and easing tokens in `app/globals.css` (`--duration-*`, `--ease-out`, `--ease-drawer`, `--ease-swap`, `--enter-delay`) are the source of truth. Use them rather than raw `cubic-bezier(...)` values or built-in keywords.
- No `ease-in` on UI. Durations stay at or under 300ms, except rare moments meant to delight. Exits run faster than entrances.
- Exits use their own `-out` keyframes (`fade-out`, `slide-out`, `rise-out`), never `<keyframes> reverse`. `reverse` also flips the easing curve, so an ease-out exit would look like ease-in.
- Keyboard shortcuts (Esc, arrow keys) update state outside a Transition, so they never animate. Clicks can.
- Reduced motion: no movement, a quick cross-fade only, never `0s`.
- Pressable elements get `active:scale-[0.97]` and list the exact properties they transition, never `transition-all`.
