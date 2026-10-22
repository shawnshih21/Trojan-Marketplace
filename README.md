# Trojan Marketplace

An interactive mobile demo that follows the supplied nine-screen prototype, beginning with USC email verification. Every screen uses the same iPhone 17 Pro Max reference frame (440 × 956 CSS pixels). Longer pages scroll inside the frame; status, navigation, and the home indicator stay in place. On smaller displays, the frame fits the available viewport without changing size between pages. Chat scrolls messages independently while keeping its header and composer visible. Dialogs stay inside the phone frame.

## Run on your Mac

Install Node.js LTS from https://nodejs.org. Download this repository using **Code → Download ZIP**, then extract the ZIP. In Terminal, type `cd` followed by a space, drag the extracted folder into Terminal, and press Return. The folder should contain `package.json`.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173. Keep Terminal running. If port 5173 is already in use, Vite prints the next available port.

## Verification

The app starts at **Welcome, Trojan** on a fresh browser. Enter an `@usc.edu` address, select **Send code**, enter demo code **248613**, then select **Continue to marketplace**. No email is sent. To show verification again, open **Profile → Settings → Sign out**. **Reset demo data** restores all original screens and data.

## Demo functions

| Screen | Interactive functions |
| --- | --- |
| Login & verification | USC email validation, six-digit code, paste support, resend, error states, sign-in persistence, sign-out |
| Browse | Search, furniture categories, price/condition/distance/width/pickup-area filters, sorting, list/map switch, USC street map with neighborhood price pins, zoom/pan/reset, saved items, see all |
| Item details | Photo gallery and detail crops, save listing, seller verification and reviews, dimensions, condition, defect disclosures, sell-by deadline, pickup availability, approximate map, message seller, reserve or view reservation |
| Create / edit listing | Up to six image uploads with local resizing, remove photos, choose an uploaded cover, price/category/condition/color/dimensions/description/defects/area/location, required sell-by deadline, pickup date and start/end times, preview, publish, edit, mark sold/available, delete |
| Inbox | Six sample conversations, search, unread state and count, compose conversation |
| Chat | Local messages, image attachments, message persistence, simulated seller reply, listing summary, seller profile, pickup scheduling, conversation information and local concern reports |
| Pickup | Buyer and seller confirmation states, explicit simulation for the other participant, private meeting details, rescheduling with renewed confirmation, cancellation, reminder preference, real .ics export with 30-minute reminder, Google Calendar link, separate buyer/seller handoff responses, issue reporting and two-party resolution, versioned transaction record, transaction review |
| Activity | Buying/selling tabs, upcoming pickups, completed transactions, history including cancellations, listing management, saved items, notifications and mark read |
| Profile & reviews | Profile photo/name/year/bio editing, verified demo identity, stats, own listings, reviews, settings, reminder defaults, opt-in task-testing log and CSV export, sign-out, reset |

## PRD demo walkthrough

- **Listings:** Choose a pickup neighborhood, explicitly disclose wear or select **No known defects**, and set a sell-by deadline. Pickup availability and proposals cannot fall after that deadline. These fields also appear in previews and item details.
- **Pickup:** Select **Request to reserve**, propose the date, start/end times, and a public meeting point, then send. The item becomes **Reserved** everywhere. The other participant’s confirmation is explicitly simulated. Changes create a new terms version and require renewed agreement.
- **Handoff:** After both agree to pickup terms, choose **Mark as picked up → Confirm my handoff**. The transaction remains pending until **Demo: confirm seller/buyer handoff** records the other response. Only then is it **Completed**, and its listing **Sold**. Canceling a reservation with no handoff or open issue releases the listing. Manual listing status changes cannot override active or completed in-app transactions; manual sales do not create a confirmed handoff record.
- **Issues:** In Pickup Details, use **Report a transaction issue**. Choose the participant, issue type, severity, and description. The issue is tied to that pickup and listing. Each participant separately acknowledges a resolution; the other acknowledgment is a labeled demo action. Resolved issues still require fresh handoff confirmations. Unresolved records never appear in completed purchases/sales.
- **Testing:** Open **Profile → Settings → Prototype task testing**. Opt in, choose a participant code, buyer/seller role, and task, then start. Close the panel and perform the task. Return to finish it with outcome, assistance count, confidence, missing information, and notes. Export CSV for your team. Results and the proposed 80% threshold are reported with attempt and participant counts; they are not live-marketplace metrics or proof of improvement.

Existing local data is preserved. Older one-click completions without both handoff responses are flagged **Needs outcome review**, rather than silently counted as successful transactions. Reset demo data also clears local task-testing records.

## Scope

This is a **single-device prototype** using browser localStorage, with fictional USC identities and sample reviews. No live identity verification, shared database, email, messaging, moderation, payments, background reminders, or calendar invitations to another person are sent. Other-student confirmations and messages are explicitly simulated. Calendar export downloads a real file and Google Calendar opens an event creation page; the user chooses whether to save it. Proposed public meeting points are reviewed only in the participant transaction flow; public listings and maps always show approximate areas. Both participants must approve the same terms. Photos and fonts are bundled locally.

Seeded photo galleries include detail crops of sample photos; uploaded galleries use the actual uploaded photos. The approximate campus map is an original SVG street illustration based on the supplied USC-area map. Pins use neighborhood centers, not individual addresses. It is not a live map, routing service, or GPS feed.

## Validate

```sh
npm run build
npm run test:rules
npx playwright install chromium
npm test
```

For the cloud machine's system Chromium, use `CI=1 npm test`. Tests cover verification, filtering, maps, saving, listing CRUD and preview, chat and attachments, pickup rescheduling and location privacy, calendar download, cancellation, completion and reviews, profile edits, reset, and mobile layout. PRD tests cover sell-by/defect validation, area filtering and map pins, two-party handoff/issue outcomes, and task-log CSV export. Independent rule tests exercise invalid transitions and legacy-record migration.

## Assets

The six primary furniture photographs and two fictional profile portraits were generated for this demo. Legacy sample photographs in `public/images` are from [Woodex by codewithsadee](https://github.com/codewithsadee/woodex), whose README permits free use. DM Sans is bundled through Fontsource under the SIL Open Font License.
