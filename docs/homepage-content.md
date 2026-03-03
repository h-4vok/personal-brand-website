# Homepage Content

The homepage is largely driven by YAML files under `data/en`. Each file maps to a theme section. Most sections are optional and controlled by an `enable` flag.

## Section index

| File | Section it controls | Current status |
| --- | --- | --- |
| `data/en/banner.yml` | Hero / top banner | Enabled |
| `data/en/about.yml` | About cards | Enabled |
| `data/en/feature.yml` | Feature highlight block | Disabled |
| `data/en/funfacts.yml` | Counter section | Enabled |
| `data/en/cta.yml` | Call to action block | Disabled |
| `data/en/contact.yml` | Contact section and form | Disabled |
| `data/en/portfolio.yml` | Portfolio grid | Disabled |
| `data/en/pricing.yml` | Pricing table | Disabled |
| `data/en/service.yml` | Services grid | Disabled |
| `data/en/skill.yml` | Skills/progress bars | Disabled |
| `data/en/team.yml` | Team card section | Enabled |
| `data/en/testimonial.yml` | Testimonials | Disabled |

## File-by-file notes

### `banner.yml`

Controls the homepage hero.

Key fields:

- `enable`
- `bg_image`
- `bg_image_webp`
- `title`
- `content`
- `button.*`

Notes:

- `title` currently contains inline `<br/>`, so line breaks are intentional.
- Background image paths point into theme-resolved image assets.
- If you change the button from disabled to enabled, check that the target anchor exists.

### `about.yml`

Controls the short "About Me" cards.

Key fields:

- `about.title`
- `about.about_item[].icon`
- `about.about_item[].title`
- `about.about_item[].content`

Notes:

- Icons use Themify icon class names.
- Keep card titles short or the layout may become uneven.

### `feature.yml`

Controls a larger feature section with one image plus multiple supporting items.

Key fields:

- `feature.enable`
- `feature.image`
- `feature.image_webp`
- `feature.title`
- `feature.content`
- `feature.feature_item[]`

Notes:

- This section is currently disabled and still contains stock/demo copy.
- Review design and copy together before enabling it.

### `funfacts.yml`

Controls the counter/stat section.

Key fields:

- `funfacts.enable`
- `funfacts.bg_image`
- `funfacts.bg_image_webp`
- `funfacts.counter_item[].title`
- `funfacts.counter_item[].icon`
- `funfacts.counter_item[].count`

Notes:

- Counts are strings in the current data.
- Keep titles compact so the counter row stays balanced.

### `cta.yml`

Controls a full-width call-to-action section.

Key fields:

- `cta.enable`
- `cta.title`
- `cta.content`
- `cta.button.*`

Notes:

- This is disabled and still contains generic theme copy.
- Do not enable it without replacing placeholder content first.

### `contact.yml`

Controls the contact details block and optional contact form.

Key fields:

- `contact.enable`
- `contact.title`
- `contact.subtitle`
- `contact.content`
- `contact.contact_list[]`
- `contact.contact_form.*`

Notes:

- This is disabled and contains stock sample data.
- If you enable the form, `form_action` must point to a real form endpoint.

### `portfolio.yml`

Controls a filterable portfolio grid.

Key fields:

- `portfolio.enable`
- `portfolio.title`
- `portfolio.portfolio_item[].name`
- `portfolio.portfolio_item[].image`
- `portfolio.portfolio_item[].image_webp`
- `portfolio.portfolio_item[].categories`
- `portfolio.portfolio_item[].content`
- `portfolio.portfolio_item[].link`

Notes:

- This section is currently demo content.
- Categories affect filtering behavior in the UI.

### `pricing.yml`

Controls pricing tables.

Key fields:

- `pricing.enable`
- `pricing.title`
- `pricing.pricing_table[].name`
- `pricing.pricing_table[].price`
- `pricing.pricing_table[].unit`
- `pricing.pricing_table[].services`
- `pricing.pricing_table[].button.*`

Notes:

- Disabled and currently pure placeholder content.
- Only enable if pricing is a real part of the site strategy.

### `service.yml`

Controls a service grid.

Key fields:

- `service.enable`
- `service.title`
- `service.service_item[].name`
- `service.service_item[].icon`
- `service.service_item[].content`

Notes:

- Uses Themify icons.
- Disabled and still theme-default oriented.

### `skill.yml`

Controls a skill/progress bar section.

Key fields:

- `skill.enable`
- `skill.title`
- `skill.subtitle`
- `skill.content`
- `skill.image`
- `skill.skill_item[].name`
- `skill.skill_item[].percent`

Notes:

- Disabled and currently demo-oriented.
- Percentage values are strings such as `90%`.

### `team.yml`

Controls the current "Lets Talk" section.

Key fields:

- `team.enable`
- `team.title`
- `team.team_member[].name`
- `team.team_member[].image`
- `team.team_member[].image_webp`
- `team.team_member[].designation`
- `team.team_member[].content`
- `team.team_member[].social[]`

Notes:

- In this repo, this section is repurposed as a personal profile/contact block, not a true multi-person team grid.
- If you add more members, re-check whether the section still matches the site's personal-brand intent.

### `testimonial.yml`

Controls testimonials over a background image.

Key fields:

- `testimonial.enable`
- `testimonial.bg_image`
- `testimonial.bg_image_webp`
- `testimonial.testimonial_item[].name`
- `testimonial.testimonial_item[].image`
- `testimonial.testimonial_item[].date`
- `testimonial.testimonial_item[].content`

Notes:

- Disabled and still populated with theme sample data.

## Safe editing rules

- Change one section file at a time, then preview locally.
- Replace placeholder/demo copy before enabling a disabled block.
- Keep icon names consistent with the Themify icon set already used across the repo.
- If a section uses images, confirm the path exists before assuming the theme will fail gracefully.
