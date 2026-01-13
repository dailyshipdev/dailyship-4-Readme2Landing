export interface PageModel {
  title: string;
  tagline: string;
  cta: {
    label: string;
    href: string;
  };
  secondaryLinks: Array<{
    label: string;
    href: string;
  }>;
  features: Array<{
    title: string;
    desc?: string;
  }>;
  sections: Array<{
    id: string;
    title: string;
    content: string; // markdown content
  }>;
  badges?: Array<{
    label: string;
    href?: string;
  }>;
}
