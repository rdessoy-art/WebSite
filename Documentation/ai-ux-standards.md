# DessoyRacing Web App — UX & Design Standards

## 1. Brand Colours

| Token       | Hex       | Usage                              |
|-------------|-----------|-------------------------------------|
| `--primary` | `#e63946` | CTAs, highlights, badges, borders   |
| `--secondary`| `#1d3557` | Header gradient end, section accents|
| `--dark`    | `#0a0a0a` | Header gradient start, text         |
| `--light`   | `#ffffff` | Background, card surfaces           |
| `--success` | `#2ecc71` | Connected / OK status               |
| `--warning` | `#f39c12` | Partial / degraded status           |
| `--error`   | `#e63946` | Error messages (same as primary)    |
| `--muted`   | `#666666` | Secondary text, placeholders        |

## 2. Typography

- **Font family:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **Base size:** 16 px
- **Heading scale:** h1 2.5 rem, h2 2 rem, h3 1.5 rem, h4 1.2 rem
- **Body:** 1 rem / 1.6 line-height
- **Small / meta:** 0.85–0.9 rem, colour `--muted`

## 3. Header (Sticky Navigation)

- `position: fixed; top: 0; width: 100%; z-index: 1000`
- Background: `linear-gradient(135deg, var(--dark) 0%, var(--secondary) 100%)`
- Height: ~82 px (50 px logo + 1 rem padding top & bottom)
- First content section below header must compensate with `margin-top: 82px` or equivalent
- Right side of header shows **Publisher [username]** when a session is active
- Mobile: hamburger menu, nav slides in from right

## 4. Layout

- Max content width: `1400 px`, centred with `margin: 0 auto`
- Page-level padding: `2 rem` left/right
- Card grid: CSS Grid, `repeat(auto-fit, minmax(340px, 1fr))`, gap `2 rem`
- Section padding: `4 rem 2 rem`
- Border-radius on cards: `12 px`
- Box shadows: `0 4px 15px rgba(0,0,0,0.08)`

## 5. Form Controls

- Label above every input, font-weight 600
- Input height: `48 px`; border: `1px solid #ddd`; border-radius: `8 px`; padding `0.75 rem 1 rem`
- Focus ring: `outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(230,57,70,0.15)`
- Password fields always have a show/hide toggle (eye icon)
- Disabled / read-only fields: background `#f8f9fa`, cursor `not-allowed`
- Required fields marked with a red asterisk `*`

## 6. Buttons

| Variant    | Background       | Text     | Use case                  |
|------------|------------------|----------|---------------------------|
| Primary    | `var(--primary)` | white    | Save, Sign In, main CTA   |
| Secondary  | transparent      | primary  | Cancel, secondary actions |
| Success    | `#2ecc71`        | white    | Connected state           |
| Ghost      | transparent      | dark     | Tertiary / icon actions   |

- All buttons: `border-radius: 50px`, `padding: 0.75rem 2rem`, `font-weight: 600`
- Hover: `translateY(-2px)` + darker shade
- Loading state: spinner replaces label text, button disabled

## 7. Status Badges

Used to show platform connection state:

```
● Connected   — green background, white text
● Not Connected — grey background, dark text
● Error       — red background, white text
● Testing…    — amber background, white text (animated pulse)
```

Badge size: `0.7 rem` font, `0.3 rem 0.8 rem` padding, `50px` border-radius.

## 8. Error Messages

- Displayed inline below the relevant section or input
- Container: `background: #fff5f5; border-left: 4px solid var(--primary); border-radius: 8px; padding: 1rem 1.25rem`
- Contains:
  - **Bold friendly message** — plain language, no jargon
  - **Error code** in monospace, muted — e.g. `ERR-FB-001`
  - Optional: "What to do" bullet list
- Support line suggestion: *"Quoting this code when calling our support line will help us fix this faster."*

### Error Code Registry

| Code        | Platform   | Meaning                                    |
|-------------|------------|--------------------------------------------|
| ERR-AUTH-001| Auth       | Invalid email or password                  |
| ERR-AUTH-002| Auth       | Session expired — please sign in again     |
| ERR-FB-001  | Facebook   | App ID is missing or invalid               |
| ERR-FB-002  | Facebook   | App Secret is incorrect                    |
| ERR-FB-003  | Facebook   | Page ID not found                          |
| ERR-FB-004  | Facebook   | Access token has expired                   |
| ERR-FB-005  | Facebook   | API rate limit reached — try again shortly |
| ERR-IG-001  | Instagram  | Account not found                          |
| ERR-IG-002  | Instagram  | Access token is invalid or expired         |
| ERR-IG-003  | Instagram  | Account must be a Business or Creator account |
| ERR-MC-001  | Mailchimp  | API key is invalid                         |
| ERR-MC-002  | Mailchimp  | Server prefix is incorrect (e.g. us14)     |
| ERR-MC-003  | Mailchimp  | Audience / List ID not found               |
| ERR-YT-001  | YouTube    | Channel ID not found                       |
| ERR-YT-002  | YouTube    | API key is invalid or restricted           |
| ERR-GA-001  | Analytics  | Measurement ID format incorrect            |
| ERR-NET-001 | Network    | Could not reach the server — check your internet connection |
| ERR-SRV-001 | Server     | Unexpected server error — please try again |

## 9. Loading & Feedback States

- Long operations (test connection, save): show spinner + disable button
- Success toast: slides in from top-right, green, auto-dismisses after 4 s
- All state changes must be smooth — use CSS transitions `0.3 s ease`

## 10. Responsiveness

- Breakpoints: `768 px` (tablet), `480 px` (mobile)
- Cards stack to single column below 768 px
- Header collapses to hamburger below 768 px
- Font sizes reduce ~10–15% below 480 px
- Input fields full-width on mobile

## 11. Accessibility

- All form inputs have associated `<label>` elements
- Colour contrast ratio ≥ 4.5:1 for body text
- Interactive elements have visible focus styles
- Error messages linked to inputs via `aria-describedby`
- Icons supplemented with visible text labels

## 12. Session & Auth UX

- Login page: email + password, "Use local config" checkbox
- After sign-in: `sessionStorage` holds `{ username, configSource }`
- Header right-slot shows: **Publisher [username]** when signed in
- "Sign Out" clears session and redirects to `login.html`
- Protected pages redirect to `login.html` if no session found
