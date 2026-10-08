/*
 * SITE CONFIGURATION — the single place to edit project details.
 *
 * Any value left as null is shown on the page as a clearly marked placeholder
 * ("To be confirmed"). Fill a value in, commit, and GitHub Pages republishes.
 *
 * The static <title>, description and social-sharing tags live at the top of
 * index.html (crawlers do not run JavaScript), so update those by hand if the
 * project title changes.
 */
window.SITE_CONFIG = Object.freeze({
  projectTitle:
    "FPGA Deployment of AI for Science and Engineering: Neural Electromagnetic Models for Electrical Machines",

  // Project lead ------------------------------------------------------------
  leadName: null, // e.g. "Dr A. Researcher"
  leadRole: null, // e.g. "Research Fellow"
  email: null, // e.g. "name@nottingham.ac.uk"
  profileUrl: null, // optional personal or institutional page

  // Affiliation -------------------------------------------------------------
  // Set affiliationConfirmed to true ONLY once the University of Nottingham
  // PEMC affiliation is confirmed; the postal address below is then shown.
  affiliationConfirmed: false,
  affiliation: "Power Electronics, Machines and Control (PEMC) Research Institute, University of Nottingham",
  address: [
    "PEMC Building",
    "University of Nottingham",
    "15 Triumph Road, Jubilee Campus",
    "Nottingham, NG7 2GT",
    "United Kingdom",
  ],

  // Team members beyond the lead (empty = section shows a placeholder) -----
  // Each entry: { name: "…", role: "…" }
  team: [],

  // Publications by the team (empty = placeholder) --------------------------
  // Each entry: { citation: "Full reference text", url: "https://doi.org/…" }
  publications: [],

  // Repositories ------------------------------------------------------------
  // Both repositories are private at the time of writing. Add a URL only
  // after confirming it is publicly accessible.
  repositories: {
    hairpinFE: null,
    hairpinAI: null,
  },

  lastUpdated: "8 October 2026",
});
