export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Nesahub",
  description:
    "Modern social media platform for sharing, connecting, and discovering content in real time.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};

export const reportCategories = [
  {
    value: "SPAM",
    title: "Spam",
    description:
      "Mass posting of repetitive content, misleading links, or unsolicited promotions. This includes scams, bots, fake giveaways, or anything designed to manipulate engagement dishonestly.",
  },
  {
    value: "HARASSMENT",
    title: "Harassment or Bullying",
    description:
      "Targeted abuse such as personal attacks, name-calling, threats, intimidation, or repeated unwanted contact. Includes behavior meant to shame, insult, or make someone feel unsafe.",
  },
  {
    value: "FALSE_INFORMATION",
    title: "False or Misleading Information",
    description:
      "Spreading false claims, conspiracy theories, manipulated media, or any content intended to deceive people or distort facts. Includes health misinformation, fake news, and impersonation.",
  },
  {
    value: "HATE_SPEECH",
    title: "Hate Speech",
    description:
      "Includes slurs, racist or sexist stereotypes, dehumanizing language, incitement of fear or discrimination, hateful references to identity groups, and the use of hate symbols or logos.",
  },
  {
    value: "NUDITY",
    title: "Nudity or Sexual Content",
    description:
      "Sexually explicit imagery, pornography, or graphic depictions of nudity. Also includes sexual exploitation, suggestive content involving minors, or non-consensual sharing of intimate media.",
  },
  {
    value: "VIOLENCE",
    title: "Violence or Dangerous Acts",
    description:
      "Depictions or threats of physical harm, abuse, self-harm, or suicide. Includes violent imagery, glorification of violence, or encouragement of dangerous or illegal acts.",
  },
  {
    value: "OTHER",
    title: "Other",
    description:
      "Something else that doesn't fit the above categories but you believe violates our rules. Please provide details in your report so we can review it accurately.",
  },
];
