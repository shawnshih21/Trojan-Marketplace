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
| Browse | Search, furniture categories, price/condition/distance/width filters, sorting, list/map switch, approximate map markers, saved items, see all |
| Item details | Photo gallery and detail crops, save listing, seller verification and reviews, dimensions, condition, pickup availability, approximate map, message seller, reserve or view reservation |
| Create / edit listing | Up to six image uploads with local resizing, remove photos, choose an uploaded cover, price/category/condition/color/dimensions/description/location, pickup date and start/end times, preview, publish, edit, mark sold/available, delete |
| Inbox | Six sample conversations, search, unread state and count, compose conversation |
| Chat | Local messages, image attachments, message persistence, simulated seller reply, listing summary, seller profile, pickup scheduling, conversation information and local concern reports |
| Pickup | Buyer and seller confirmation states, explicit simulation for the other participant, private meeting details, rescheduling with renewed confirmation, cancellation, reminder preference, real .ics export with 30-minute reminder, Google Calendar link, completion, transaction review |
| Activity | Buying/selling tabs, upcoming pickups, completed transactions, history including cancellations, listing management, saved items, notifications and mark read |
| Profile & reviews | Profile photo/name/year/bio editing, verified demo identity, stats, own listings, reviews, settings, reminder defaults, sign-out, reset |

## Scope

This is a **single-device prototype** using browser localStorage, with fictional USC identities and sample reviews. No live identity verification, shared database, email, messaging, moderation, payments, background reminders, or calendar invitations to another person are sent. Other-student confirmations and messages are explicitly simulated. Calendar export downloads a real file and Google Calendar opens an event creation page; the user chooses whether to save it. Exact locations are only shown after both demo participants confirm. Photos and fonts are bundled locally.

Seeded photo galleries include detail crops of sample photos; uploaded galleries use the actual uploaded photos. The approximate campus map is a diagram, not a live map or navigation service.

## Validate

```sh
npm run build
npx playwright install chromium
npm test
```

For the cloud machine's system Chromium, use `CI=1 npm test`. Tests cover verification, filtering, maps, saving, listing CRUD and preview, chat and attachments, pickup rescheduling and location privacy, calendar download, cancellation, completion and reviews, profile edits, reset, and mobile layout.

## Assets

The six primary furniture photographs and two fictional profile portraits were generated for this demo. Legacy sample photographs in `public/images` are from [Woodex by codewithsadee](https://github.com/codewithsadee/woodex), whose README permits free use. DM Sans is bundled through Fontsource under the SIL Open Font License.
