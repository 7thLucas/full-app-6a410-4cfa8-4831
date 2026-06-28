/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TRequestCategory = {
  id: string;
  label: string;
  routeTo: "chef" | "employee";
};

export type TAmenity = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  tagline?: string;
  welcomeHeadline?: string;
  welcomeSubcopy?: string;
  statusPollIntervalMs?: number;
  requestCategories?: TRequestCategory[];
  amenities?: TAmenity[];
  brandColor: TBrandColor;
  font: TFont;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Cinq",
  logoUrl: "",
  tagline: "Step into a five-star world.",
  welcomeHeadline: "Welcome to Cinq",
  welcomeSubcopy:
    "A living five-star hotel, lived through four roles. Choose yours — guests ask, staff deliver, in real time.",
  statusPollIntervalMs: 3000,
  requestCategories: [
    { id: "dining", label: "Dining", routeTo: "chef" },
    { id: "spa", label: "Spa & Wellness", routeTo: "employee" },
    { id: "amenities", label: "Amenities", routeTo: "employee" },
    { id: "service", label: "Service", routeTo: "employee" },
  ],
  amenities: [
    { id: "tasting-menu", name: "Chef's Tasting Menu", description: "Seven courses, paired.", categoryId: "dining" },
    { id: "in-room-dining", name: "In-Room Dining", description: "Served at your suite, anytime.", categoryId: "dining" },
    { id: "champagne", name: "Champagne & Caviar", description: "Vintage pour, on ice.", categoryId: "dining" },
    { id: "signature-massage", name: "Signature Massage", description: "Ninety minutes of calm.", categoryId: "spa" },
    { id: "private-sauna", name: "Private Sauna", description: "Reserve the cedar room.", categoryId: "spa" },
    { id: "turndown", name: "Turndown Service", description: "Suite readied for the evening.", categoryId: "amenities" },
    { id: "fresh-linens", name: "Fresh Linens", description: "Pressed and replaced.", categoryId: "amenities" },
    { id: "concierge", name: "Concierge Request", description: "Anything you need, arranged.", categoryId: "service" },
    { id: "valet", name: "Valet & Transport", description: "Car brought to the door.", categoryId: "service" },
  ],
  brandColor: {
    // Base — deep navy/teal
    background:        "#0B1F2A",
    foreground:        "#F5EFE3",
    // Card — elevated navy-teal surface
    card:              "#13323D",
    cardForeground:    "#F5EFE3",
    // Popover
    popover:           "#13323D",
    popoverForeground: "#F5EFE3",
    // Primary — warm gold
    primary:           "#C8A24B",
    primaryForeground: "#0B1F2A",
    // Secondary — teal surface
    secondary:           "#0E2C33",
    secondaryForeground: "#F5EFE3",
    // Muted
    muted:           "#0E2C33",
    mutedForeground: "#9FB2B8",
    // Accent — brighter gold
    accent:           "#E0BC6B",
    accentForeground: "#0B1F2A",
    // Destructive
    destructive:           "#C0564B",
    destructiveForeground: "#F5EFE3",
    // Border / Input / Ring
    border: "#1E4450",
    input:  "#1E4450",
    ring:   "#C8A24B",
    // Charts — status palette cues
    chart1: "#E0BC6B",
    chart2: "#5FB28A",
    chart3: "#C8A24B",
    chart4: "#9FB2B8",
    chart5: "#1E4450",
    // Navbar
    navbarBackground: "#0B1F2A",
    // Sidebar
    sidebarBackground:        "#0E2C33",
    sidebarForeground:        "#F5EFE3",
    sidebarPrimary:           "#C8A24B",
    sidebarPrimaryForeground: "#0B1F2A",
    sidebarAccent:            "#13323D",
    sidebarAccentForeground:  "#F5EFE3",
    sidebarBorder:            "#1E4450",
    sidebarRing:              "#C8A24B",
  },
  font: {
    headingFont: "Cormorant Garamond",
    textFont: "Lato",
  },
};
