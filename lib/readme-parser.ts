import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Paragraph, Blockquote, List, ListItem, Link, Text, Strong, Emphasis } from 'mdast';
import type { PageModel } from './types';

export async function parseReadme(markdown: string): Promise<PageModel> {
  const processor = remark().use(remarkGfm);
  const ast = processor.parse(markdown) as Root;

  const title = extractTitle(ast);
  const tagline = extractTagline(ast);
  const links = extractLinks(ast);
  const sections = extractSections(ast);
  const cta = extractCTA(links, sections);
  const secondaryLinks = extractSecondaryLinks(links, cta);
  const features = extractFeatures(ast);
  const badges = extractBadges(ast, links);

  return {
    title,
    tagline,
    cta,
    secondaryLinks,
    features,
    sections,
    badges,
  };
}

function extractTitle(ast: Root): string {
  let title = '';
  
  visit(ast, 'heading', (node: Heading) => {
    if (node.depth === 1 && !title) {
      title = extractTextFromNode(node);
    }
  });

  if (!title) {
    // Fallback to first non-empty line
    visit(ast, 'paragraph', (node: Paragraph) => {
      if (!title) {
        const text = extractTextFromNode(node);
        if (text.trim()) {
          title = text.trim();
        }
      }
    });
  }

  return title || 'Untitled Project';
}

function extractTagline(ast: Root): string {
  let tagline = '';
  let foundH1 = false;
  let nextParagraph = false;

  visit(ast, (node) => {
    if (node.type === 'heading' && (node as Heading).depth === 1) {
      foundH1 = true;
      nextParagraph = true;
      return;
    }

    if (foundH1 && nextParagraph && node.type === 'paragraph') {
      const text = extractTextFromNode(node as Paragraph);
      if (text.trim() && !tagline) {
        tagline = text.trim();
        nextParagraph = false;
      }
    }

    if (foundH1 && nextParagraph && node.type === 'blockquote') {
      const text = extractTextFromNode(node as Blockquote);
      if (text.trim() && !tagline) {
        tagline = text.trim();
        nextParagraph = false;
      }
    }
  });

  // If no tagline found, try first paragraph
  if (!tagline) {
    visit(ast, 'paragraph', (node: Paragraph) => {
      if (!tagline) {
        const text = extractTextFromNode(node);
        if (text.trim()) {
          tagline = text.trim();
        }
      }
    });
  }

  // Truncate to ~160 chars
  if (tagline.length > 160) {
    tagline = tagline.substring(0, 157) + '...';
  }

  return tagline || 'A great project that solves real problems.';
}

function extractLinks(ast: Root): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];

  visit(ast, 'link', (node: Link) => {
    const label = extractTextFromNode(node);
    if (node.url && label) {
      links.push({ label, href: node.url });
    }
  });

  return links;
}

function extractCTA(links: Array<{ label: string; href: string }>, sections: Array<{ id: string; title: string; content: string }>): { label: string; href: string } {
  // Look for demo/live/try/website links
  const demoKeywords = ['demo', 'live', 'try', 'website', 'playground', 'app'];
  for (const link of links) {
    const lowerLabel = link.label.toLowerCase();
    if (demoKeywords.some(keyword => lowerLabel.includes(keyword))) {
      return link;
    }
  }

  // Check if installation section exists
  const hasInstallation = sections.some(s => 
    s.title.toLowerCase().includes('install') || 
    s.id.includes('installation') || 
    s.id.includes('setup')
  );

  if (hasInstallation) {
    return { label: 'Get Started', href: '#install' };
  }

  // Default to GitHub if available
  const githubLink = links.find(l => l.href.includes('github.com'));
  if (githubLink) {
    return { label: 'View on GitHub', href: githubLink.href };
  }

  return { label: 'Get Started', href: '#' };
}

function extractSecondaryLinks(
  links: Array<{ label: string; href: string }>,
  cta: { label: string; href: string }
): Array<{ label: string; href: string }> {
  return links
    .filter(link => link.href !== cta.href)
    .slice(0, 3)
    .map(link => ({
      label: link.label || new URL(link.href).hostname,
      href: link.href,
    }));
}

function extractFeatures(ast: Root): Array<{ title: string; desc?: string }> {
  const features: Array<{ title: string; desc?: string }> = [];
  let inFeatureSection = false;
  let currentList: List | null = null;

  visit(ast, 'heading', (node: Heading) => {
    const text = extractTextFromNode(node).toLowerCase();
    if (text.includes('feature') || text.includes("what's") || text.includes('why') || text.includes('highlight')) {
      inFeatureSection = true;
    } else if (node.depth <= 2) {
      inFeatureSection = false;
    }
  });

  visit(ast, 'list', (node: List) => {
    if (inFeatureSection || !currentList) {
      currentList = node;
    }
  });

  // Extract from feature section list
  if (currentList) {
    visit(currentList, 'listItem', (node: ListItem) => {
      const text = extractTextFromNode(node);
      if (text.trim()) {
        // Try to split title and description
        const parts = text.split(/[.:]\s+/);
        features.push({
          title: parts[0] || text.substring(0, 50),
          desc: parts.slice(1).join('. ') || undefined,
        });
      }
    });
  }

  // If no features found, extract from overview paragraph
  if (features.length === 0) {
    visit(ast, 'paragraph', (node: Paragraph) => {
      if (features.length < 5) {
        const text = extractTextFromNode(node);
        // Look for bold phrases
        visit(node, 'strong', (strongNode: Strong) => {
          const strongText = extractTextFromNode(strongNode);
          if (strongText.trim() && features.length < 5) {
            features.push({ title: strongText.trim() });
          }
        });
      }
    });
  }

  // Limit to 6 features
  return features.slice(0, 6);
}

function extractSections(ast: Root): Array<{ id: string; title: string; content: string }> {
  const sections: Array<{ id: string; title: string; content: string }> = [];
  const sectionMap: Record<string, string> = {
    'usage': 'How it works',
    'quickstart': 'How it works',
    'getting started': 'How it works',
    'installation': 'Install',
    'setup': 'Install',
    'configuration': 'Configuration',
    'options': 'Configuration',
    'roadmap': 'Roadmap',
    'todo': 'Roadmap',
    'contributing': 'Contributing',
    'license': 'License',
    'faq': 'FAQ',
  };

  let currentSection: { id: string; title: string; content: string } | null = null;
  const contentNodes: any[] = [];

  // Iterate through root children to maintain order
  for (const node of ast.children) {
    if (node.type === 'heading' && (node as Heading).depth >= 2) {
      // Save previous section
      if (currentSection) {
        // Reconstruct markdown from collected nodes
        const markdown = contentNodes.map(n => nodeToString(n)).join('\n\n');
        if (markdown.trim()) {
          currentSection.content = markdown.trim();
          sections.push(currentSection);
        }
      }

      // Start new section
      const headingText = extractTextFromNode(node as Heading).toLowerCase();
      const mappedTitle = sectionMap[headingText] || extractTextFromNode(node as Heading);
      
      currentSection = {
        id: headingText.replace(/\s+/g, '-'),
        title: mappedTitle,
        content: '',
      };
      contentNodes.length = 0; // Clear previous content
    } else if (currentSection) {
      // Collect content nodes for current section
      contentNodes.push(node);
    }
  }

  // Add last section
  if (currentSection) {
    const markdown = contentNodes.map(n => nodeToString(n)).join('\n\n');
    if (markdown.trim()) {
      currentSection.content = markdown.trim();
      sections.push(currentSection);
    }
  }

  return sections;
}

function extractBadges(ast: Root, links: Array<{ label: string; href: string }>): Array<{ label: string; href?: string }> {
  const badges: Array<{ label: string; href?: string }> = [];

  // Look for common badge patterns (images with alt text)
  visit(ast, 'image', (node) => {
    if (node.alt) {
      const alt = node.alt.toLowerCase();
      if (alt.includes('license') || alt.includes('version') || alt.includes('build') || alt.includes('status')) {
        badges.push({
          label: node.alt,
          href: node.url || undefined,
        });
      }
    }
  });

  // Also check for links that look like badges
  for (const link of links.slice(0, 3)) {
    const label = link.label.toLowerCase();
    if (label.includes('license') || label.includes('version') || label.includes('npm') || label.includes('badge')) {
      badges.push(link);
    }
  }

  return badges.slice(0, 4);
}

// Helper functions
function extractTextFromNode(node: any): string {
  let text = '';
  
  if (node.type === 'text') {
    return (node as Text).value;
  }

  if (node.children) {
    for (const child of node.children) {
      text += extractTextFromNode(child);
    }
  }

  return text;
}

function nodeToString(node: any): string {
  if (node.type === 'text') {
    return (node as Text).value;
  }

  if (node.type === 'paragraph') {
    return extractTextFromNode(node);
  }

  if (node.type === 'code') {
    return `\`\`\`${node.lang || ''}\n${node.value}\n\`\`\``;
  }

  if (node.type === 'list') {
    let listText = '';
    for (const item of node.children || []) {
      listText += `- ${extractTextFromNode(item)}\n`;
    }
    return listText;
  }

  if (node.type === 'blockquote') {
    return `> ${extractTextFromNode(node)}`;
  }

  if (node.type === 'heading') {
    const level = '#'.repeat((node as Heading).depth);
    return `${level} ${extractTextFromNode(node)}`;
  }

  return extractTextFromNode(node);
}
