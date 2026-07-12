<!-- BACK TO TOP ANCHOR -->
<a id="readme-top"></a>

<!-- LOGO -->
<div align="center">
  <a href="https://leonardo-vasconcellos.vercel.app/portfolio/juca">
    <img src="public/juca.svg" alt="Logo" height="80" />
  </a>

  <h1 align="center">Histórias do Juca</h1>

  <p align="center">Choice-based interactive fiction, engineered to <em>actually work</em> with screen readers — the same adventure, alive for readers who see and readers who don't.</p>

  <p align="center">// accessible interactive fiction · inclusion for blind readers</p>

  <br />

  <a href="https://leonardo-vasconcellos.vercel.app/portfolio/juca"
    ><strong>View it live »</strong></a>
</div>

<br />

<!-- SHIELDS -->
[![Creator Website][website-shield]][website-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Released][year-shield]][year-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#screenshots">Screenshots</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Screenshot][product-screenshot]](https://leonardo-vasconcellos.vercel.app/portfolio/juca)

<!-- PROJECT INTRO: 260 chars max -->

**Histórias do Juca** is a choice-based interactive fiction platform for a social project on blind inclusion — built so a screen-reader user can actually finish the adventure alone, yet fun for everyone.

<!-- END INTRO -->

The reader reads *or listens to* a scene and picks, with real buttons, what happens next; each story is a branching graph of nodes with different endings. The hero is **Juca**, a young, blind alligator from the Cachoeira River in Joinville, Brazil, who finds treasures using smell and hearing — the protagonist himself mirrors the audience the project wants to welcome.

The first story, *Juca e a Caça ao Tesouro do Rio*, branches into two paths and two endings. The second, *Juca e a Corrida do Churrasco*, introduces **lightweight state** (money and time) that changes as you choose and unlocks or hides options — a race against the clock (and hunger) to reach a barbecue across town.

The non-negotiable premise is **accessibility first**: the experience must *genuinely work* with screen readers (NVDA, JAWS, VoiceOver, Narrator) and keyboard navigation — not merely "be compatible." Choices are real buttons reachable by Tab and fired with Enter/Space; on every scene change, focus moves to the new text so the screen reader announces it; there is a skip link, high contrast, an always-visible focus ring, and no information conveyed by color alone. In-browser narration (Web Speech API, pt-BR) with speed control, a native share button, and per-scene illustrations round out the experience.

Architecturally, the **engine is fully separated from the content**: the React components are generic and story-agnostic, while each story is self-contained under `stories/<slug>/` (a JSON node graph, cover art, and the source script). A graph validator (`pnpm validate-stories`) guarantees no node is unreachable, choice-less, or missing image alt text — keeping accessibility verifiable with every new story that ships.

### Key Features

- **Built an accessibility-first engine, verified against real screen readers** (NVDA, JAWS, VoiceOver, Narrator) and keyboard-only navigation with automated Playwright walkthroughs — turning "screen-reader compatible" into a product a blind child can actually finish alone, which is the entire reach of this social project.
- **Decoupled a content-agnostic story engine from JSON-defined story graphs** (plus optional lightweight state like money and time), so authors can ship a new branching story — and even new game mechanics — without touching a line of engine code, driving the cost of each new story toward zero.
- **Made every scene work hands-free and shareable out of the box** — in-browser narration (Web Speech API) with speed control, per-scene AI illustrations, and native share with a copy-link fallback — so the stories reach kids with no app install and no paid TTS bill.

<!-- SCREENSHOTS -->
## Screenshots

<div align="center" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
  <a href="screenshots/06%20-%20Hist%C3%B3rias%20do%20Juca.png"><img src="screenshots/06%20-%20Hist%C3%B3rias%20do%20Juca.png" height="220" style="object-fit:cover;border-radius:6px;" /></a>
  <a href="screenshots/01%20-%20Hist%C3%B3rias%20do%20Juca.png"><img src="screenshots/01%20-%20Hist%C3%B3rias%20do%20Juca.png" height="220" style="object-fit:cover;border-radius:6px;" /></a>
  <a href="screenshots/02%20-%20Hist%C3%B3rias%20do%20Juca.png"><img src="screenshots/02%20-%20Hist%C3%B3rias%20do%20Juca.png" height="220" style="object-fit:cover;border-radius:6px;" /></a>
  <a href="screenshots/03%20-%20Hist%C3%B3rias%20do%20Juca.png"><img src="screenshots/03%20-%20Hist%C3%B3rias%20do%20Juca.png" height="220" style="object-fit:cover;border-radius:6px;" /></a>
  <a href="screenshots/04%20-%20Hist%C3%B3rias%20do%20Juca.png"><img src="screenshots/04%20-%20Hist%C3%B3rias%20do%20Juca.png" height="220" style="object-fit:cover;border-radius:6px;" /></a>
  <a href="screenshots/05%20-%20Hist%C3%B3rias%20do%20Juca.png"><img src="screenshots/05%20-%20Hist%C3%B3rias%20do%20Juca.png" height="220" style="object-fit:cover;border-radius:6px;" /></a>
</div>

<!-- BUILT WITH -->
## Built With

<!-- LANGUAGES -->

**Languages**

|                                                                                                                | Language   | Version |
| -------------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20" /> | TypeScript | 5.x     |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="20" />           | HTML       | 5       |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="20" />             | CSS        | 3       |

<!-- FRAMEWORKS & LIBRARIES -->

**Frameworks & Libraries**

|                                                                                                                  | Framework    | Version |
| ---------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="20" />           | Next.js      | 16.2.7  |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="20" />             | React        | 19.2.4  |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="20" /> | Tailwind CSS | 4.x     |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20" />           | Node.js      | scripts |

<!-- GETTING STARTED -->
## Getting Started

This project uses **pnpm** and Node.js **22**.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### Scripts

- `pnpm dev` — development server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — type checking (`tsc --noEmit`)
- `pnpm validate-stories` — validate the node graph of every story

### Manual accessibility check

`script-testing/verify-juca.mjs` is a Playwright script that walks a story down both branches, checks accessibility affordances (skip link, focus management, semantic buttons), and takes desktop and mobile screenshots. With the dev server running:

```bash
node script-testing/verify-juca.mjs
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

This project repository is for archive purposes only. No new features or issues are being tracked.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTORS -->
## Contributors

<a href="https://github.com/llvasconcellos2/juca/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=llvasconcellos2/juca" alt="Contributors" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

[Leonardo Vasconcellos - Website](https://leonardo-vasconcellos.vercel.app/) — [LinkedIn](https://www.linkedin.com/in/llvasconcellos)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[website-shield]: https://img.shields.io/badge/Creator_Website-%E2%86%97-2eba7a?style=for-the-badge
[website-url]: https://leonardo-vasconcellos.vercel.app/
[contributors-shield]: https://img.shields.io/github/contributors/llvasconcellos2/juca.svg?style=for-the-badge
[contributors-url]: https://github.com/llvasconcellos2/juca/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/llvasconcellos2/juca.svg?style=for-the-badge
[forks-url]: https://github.com/llvasconcellos2/juca/network/members
[issues-shield]: https://img.shields.io/github/issues/llvasconcellos2/juca.svg?style=for-the-badge
[issues-url]: https://github.com/llvasconcellos2/juca/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/llvasconcellos
[year-shield]: https://img.shields.io/badge/Released-2026-gray?style=for-the-badge
[year-url]: #
[product-screenshot]: screenshots/05%20-%20Hist%C3%B3rias%20do%20Juca.png
