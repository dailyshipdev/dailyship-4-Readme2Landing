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
    icon?: string;
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
  heroImage?: {
    url: string;
    alt: string;
  };
  stats?: Array<{
    label: string;
    value: string;
  }>;
  techStack?: string[];
  testimonials?: Array<{
    quote: string;
    author?: string;
  }>;
}
