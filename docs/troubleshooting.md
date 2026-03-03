# Troubleshooting

This file covers repo-specific problems that are likely to recur while maintaining this site.

## `go`, `hugo`, or `sass` is not found

Symptoms:

- commands fail in the terminal
- `npm run dev` or `npm run build` exits early

What to check:

- the tool is actually installed
- the install path is on `PATH`
- the terminal or IDE was restarted after installation

This repo's original setup notes already assume Windows + Chocolatey, so environment refresh issues are a common cause.

## Root commands vs theme commands

Symptoms:

- a command exists in `themes/meghna-hugo/package.json` but not in the root `package.json`
- CSS lint/format commands fail when run from the wrong directory

Rule:

- run `npm run dev`, `npm run build`, and `npm run test` from the repo root
- run CSS quality commands from `themes/meghna-hugo` if you are using the theme's tooling

The root project and the theme have different responsibilities and different scripts.

## Text renders with broken characters

Symptoms:

- apostrophes or quotes look corrupted in content or config text

Likely cause:

- file encoding mismatch

What to do:

- save edited text files as UTF-8
- re-open the file and confirm the characters were preserved
- preview locally after saving

This repo already contains visible encoding artifacts in some files, so be careful when copying text from older sources.

## Visual change did not appear

Check these in order:

1. Confirm you edited the correct layer:
   - root content/data/config
   - or `themes/meghna-hugo` for layout/CSS
2. Confirm the relevant section is enabled in its YAML file.
3. Confirm the image or asset path exists.
4. Refresh the browser without cache.
5. Re-run the build or dev server.

## Unsure whether to use `static/` or `assets/`

Use `static/` when:

- you want files copied directly to the final site with stable public paths

Use `assets/` when:

- the theme or Hugo asset pipeline is expected to process the file
- the file is part of theme-managed images or styles

In this repo:

- avatars/icons in `static/images` are direct public assets
- article and section imagery often lives under `assets/images`

## Conflicting config behavior

Symptoms:

- you change a setting and the site still behaves as before
- a language or output setting seems to ignore your edit

Likely cause:

- the same concern exists in both `hugo.toml` and `config/_default/*`

What to do:

- inspect both locations before assuming Hugo is ignoring the value
- follow the rules in `docs/configuration-source-of-truth.md`

## Scripts mentioned in `package.json` do not work

The root `package.json` currently contains:

- `project-setup`
- `theme-setup`

Those scripts reference a `scripts/` directory that is not present in the repo root. Treat them as non-operational until they are restored or removed.

They are not part of the recommended workflow documented in this repository.
