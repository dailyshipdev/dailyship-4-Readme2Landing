import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Paragraph, Blockquote, List, ListItem, Link, Text, Strong, Code, Node, Image } from 'mdast';
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
  const heroImage = extractHeroImage(ast);
  const stats = extractStats(ast);
  const techStack = extractTechStack(ast);
  const testimonials = extractTestimonials(ast);

  // Smart section ordering - prioritize important sections
  const orderedSections = orderSectionsIntelligently(sections);

  return {
    title,
    tagline,
    cta,
    secondaryLinks,
    features,
    sections: orderedSections,
    badges,
    heroImage,
    stats,
    techStack,
    testimonials,
  };
}

// Smart section ordering based on importance and user journey
function orderSectionsIntelligently(sections: Array<{ id: string; title: string; content: string }>): Array<{ id: string; title: string; content: string }> {
  const priorityOrder = [
    'how-it-works',
    'how it works',
    'quick-start',
    'quick start',
    'installation',
    'install',
    'getting-started',
    'getting started',
    'usage',
    'examples',
    'demo',
    'configuration',
    'api',
    'documentation',
    'tech-stack',
    'tech stack',
    'project-structure',
    'project structure',
    'idea-categories',
    'idea categories',
    'contributing',
    'roadmap',
    'faq',
    'troubleshooting',
    'changelog',
    'acknowledgments',
    'license',
    'connect',
  ];

  const sectionMap = new Map(sections.map(s => [s.id.toLowerCase(), s]));
  const ordered: Array<{ id: string; title: string; content: string }> = [];
  const added = new Set<string>();

  // Add sections in priority order
  for (const priorityId of priorityOrder) {
    for (const [id, section] of sectionMap.entries()) {
      if (!added.has(id) && (id === priorityId || id.includes(priorityId) || priorityId.includes(id))) {
        ordered.push(section);
        added.add(id);
        break;
      }
    }
  }

  // Add remaining sections that weren't in priority list
  for (const section of sections) {
    if (!added.has(section.id.toLowerCase())) {
      ordered.push(section);
    }
  }

  return ordered;
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
  let paragraphCount = 0;

  // Look for first paragraph after H1 - prefer shorter, punchier ones
  for (const node of ast.children) {
    if (node.type === 'heading' && (node as Heading).depth === 1) {
      foundH1 = true;
      continue;
    }

    if (foundH1) {
      if (node.type === 'paragraph') {
        const text = extractTextFromNode(node as Paragraph).trim();
        if (text) {
          paragraphCount++;
          // Prefer first paragraph if it's short and punchy (likely tagline)
          if (paragraphCount === 1 && text.length < 200) {
            tagline = text;
            break;
          } else if (!tagline && text.length < 200) {
            // Use first short paragraph as tagline
            tagline = text;
          }
        }
      } else if (node.type === 'heading' && (node as Heading).depth >= 2) {
        // Stop at first H2 if we haven't found a tagline
        if (!tagline) {
          // Use previous paragraph if available
          break;
        }
      }
    }
  }

  // If no tagline found, try first paragraph in entire document
  if (!tagline) {
    visit(ast, 'paragraph', (node: Paragraph) => {
      if (!tagline) {
        const text = extractTextFromNode(node).trim();
        if (text && text.length < 200) {
          tagline = text;
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
  // Look for demo/live/try/website links (check both label and URL)
  const demoKeywords = ['demo', 'live', 'try', 'website', 'playground', 'app', 'deploy'];
  for (const link of links) {
    const lowerLabel = link.label.toLowerCase();
    const lowerHref = link.href.toLowerCase();
    if (demoKeywords.some(keyword => lowerLabel.includes(keyword) || lowerHref.includes(keyword))) {
      // Prefer actual URLs over placeholders
      if (!link.href.startsWith('#') && link.href !== '#') {
        return link;
      }
    }
  }

  // Check if installation section exists
  const hasInstallation = sections.some(s => 
    s.title.toLowerCase().includes('install') || 
    s.title.toLowerCase().includes('quick start') ||
    s.id.includes('installation') || 
    s.id.includes('setup') ||
    s.id.includes('quick-start')
  );

  if (hasInstallation) {
    const installSection = sections.find(s => 
      s.title.toLowerCase().includes('install') || 
      s.title.toLowerCase().includes('quick start') ||
      s.id.includes('installation') || 
      s.id.includes('setup') ||
      s.id.includes('quick-start')
    );
    if (installSection) {
      return { label: 'Get Started', href: `#${installSection.id}` };
    }
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
  // Filter out the CTA link and prioritize meaningful links
  const filtered = links.filter(link => {
    if (link.href === cta.href || link.href === '#') return false;
    // Prefer actual URLs
    if (link.href.startsWith('http')) return true;
    // Include anchor links to sections
    if (link.href.startsWith('#')) return true;
    return false;
  });

  // Prioritize: GitHub, then other social links, then others
  const github = filtered.find(l => l.href.includes('github.com'));
  const social = filtered.filter(l => 
    l.href.includes('twitter.com') || 
    l.href.includes('x.com') || 
    l.href.includes('linkedin.com') ||
    l.href.includes('bluesky')
  );
  const others = filtered.filter(l => 
    l !== github && !social.includes(l)
  );

  const result: Array<{ label: string; href: string }> = [];
  if (github && github.href !== cta.href) result.push(github);
  result.push(...social.slice(0, 2));
  result.push(...others.slice(0, 3 - result.length));

  return result.slice(0, 4).map(link => ({
    label: link.label || (link.href.startsWith('http') ? new URL(link.href).hostname.replace('www.', '') : link.href),
    href: link.href,
  }));
}

function extractFeatures(ast: Root): Array<{ title: string; desc?: string; icon?: string }> {
  const features: Array<{ title: string; desc?: string; icon?: string }> = [];
  const featureKeywords = ['feature', "what's", 'why', 'highlight', 'benefit', 'advantage', 'capability', 'key'];
  let foundFeatureHeading = false;
  let featureList: List | null = null;

  // Find the Features section and its list
  for (let i = 0; i < ast.children.length; i++) {
    const node = ast.children[i];
    
    if (node.type === 'heading') {
      const heading = node as Heading;
      const text = extractTextFromNode(heading).toLowerCase();
      // Check if this is a features heading
      if (featureKeywords.some(keyword => text.includes(keyword)) || text.includes('✨')) {
        foundFeatureHeading = true;
        // Look for list in next few nodes
        for (let j = i + 1; j < Math.min(i + 5, ast.children.length); j++) {
          const nextNode = ast.children[j];
          if (nextNode.type === 'list') {
            featureList = nextNode as List;
            break;
          }
          // Stop if we hit another heading
          if (nextNode.type === 'heading' && (nextNode as Heading).depth <= 2) {
            break;
          }
        }
        break;
      }
    }
  }

  // Extract from feature section list
  if (featureList) {
    visit(featureList, 'listItem', (node: ListItem) => {
      const text = extractTextFromNode(node);
      if (text.trim()) {
        // Extract emoji if present (including sparkles, lightning, etc.)
        const emojiMatch = text.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);
        const icon = emojiMatch ? emojiMatch[0] : undefined;
        let cleanText = emojiMatch ? text.replace(emojiMatch[0], '').trim() : text;
        
        // Remove leading dashes or other list markers
        cleanText = cleanText.replace(/^[-*+]\s+/, '').trim();
        
        // Try to split title and description (look for dash or colon)
        const dashMatch = cleanText.match(/^(.+?)\s*[-–—]\s*(.+)$/);
        if (dashMatch) {
          features.push({
            title: dashMatch[1].replace(/^\*\*|\*\*$/g, '').trim(),
            desc: dashMatch[2].replace(/^\*\*|\*\*$/g, '').trim(),
            icon,
          });
        } else {
          // Try colon separator
          const parts = cleanText.split(/:\s+/);
          const title = parts[0] || cleanText.substring(0, 60);
          const desc = parts.slice(1).join(': ').trim() || undefined;
          
          features.push({
            title: title.replace(/^\*\*|\*\*$/g, '').trim(),
            desc: desc ? desc.replace(/^\*\*|\*\*$/g, '').trim() : undefined,
            icon,
          });
        }
      }
    });
  }

  // If no features found, extract from overview paragraph
  if (features.length === 0) {
    visit(ast, 'paragraph', (node: Paragraph) => {
      if (features.length < 5) {
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
    'how it works': 'How it works',
    'installation': 'Install',
    'setup': 'Install',
    'quick start': 'Quick Start',
    'project structure': 'Project Structure',
    'idea categories': 'Idea Categories',
    'tech stack': 'Tech Stack',
    'configuration': 'Configuration',
    'options': 'Configuration',
    'roadmap': 'Roadmap',
    'todo': 'Roadmap',
    'contributing': 'Contributing',
    'license': 'License',
    'faq': 'FAQ',
    'connect': 'Connect',
    'live demo': 'Live Demo',
    'acknowledgments': 'Acknowledgments',
  };

  let currentSection: { id: string; title: string; content: string } | null = null;
  const contentNodes: Node[] = [];
  let skipUntilFirstH2 = true;

  // Iterate through root children to maintain order
  for (const node of ast.children) {
    // Skip content before first H2 (title, tagline, description)
    if (skipUntilFirstH2) {
      if (node.type === 'heading' && (node as Heading).depth >= 2) {
        skipUntilFirstH2 = false;
      } else {
        continue;
      }
    }

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
      const headingText = extractTextFromNode(node as Heading);
      const headingTextLower = headingText.toLowerCase().replace(/[✨🎯🚀📁💡🛠️📝🌐📄🔗🙏]/g, '').trim();
      const mappedTitle = sectionMap[headingTextLower] || headingText.replace(/[✨🎯🚀📁💡🛠️📝🌐📄🔗🙏]/g, '').trim();
      
      currentSection = {
        id: headingTextLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
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
  const seen = new Set<string>();

  // Look for common badge patterns (images with alt text) - these are most reliable
  visit(ast, 'image', (node) => {
    if (node.alt) {
      const alt = node.alt.toLowerCase();
      if (alt.includes('license') || alt.includes('version') || alt.includes('build') || alt.includes('status') || alt.includes('badge')) {
        const label = node.alt;
        if (!seen.has(label.toLowerCase())) {
          badges.push({
            label,
            href: node.url || undefined,
          });
          seen.add(label.toLowerCase());
        }
      }
    }
  });

  // Check for links that look like badges (shields.io, etc.)
  for (const link of links) {
    const label = link.label.toLowerCase();
    const href = link.href.toLowerCase();
    if ((label.includes('license') || label.includes('version') || label.includes('npm') || label.includes('badge') || 
         href.includes('shields.io') || href.includes('badge')) && !seen.has(label)) {
      badges.push(link);
      seen.add(label);
    }
  }

  // Only extract tech stack as badges if we have very few badges and it's clearly a tech stack line
  if (badges.length < 2) {
    visit(ast, 'paragraph', (node: Paragraph) => {
      const text = extractTextFromNode(node);
      // Only if it's a short line with tech names (not a full sentence)
      if (text.length < 100 && text.split(/\s+/).length <= 8) {
        const techWords = text.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/g);
        if (techWords && techWords.length >= 3 && techWords.length <= 6) {
          // This looks like a tech stack line
          const words = text.split(/\s+/).filter(w => w.length > 2 && /^[A-Z][a-z]/.test(w) && !w.includes('.'));
          // Only add if they look like tech names (common patterns)
          const techKeywords = ['next', 'react', 'vue', 'angular', 'typescript', 'javascript', 'python', 'node', 'tailwind', 'css', 'html', 'license', 'mit', 'apache'];
          const validTechs = words.filter(w => techKeywords.some(k => w.toLowerCase().includes(k)) || w.length > 3);
          
          if (validTechs.length >= 2 && validTechs.length <= 5) {
            for (const word of validTechs.slice(0, 4)) {
              if (!seen.has(word.toLowerCase())) {
                badges.push({ label: word });
                seen.add(word.toLowerCase());
              }
            }
          }
        }
      }
    });
  }

  return badges.slice(0, 5);
}

function extractHeroImage(ast: Root): { url: string; alt: string } | undefined {
  let heroImage: Image | null = null;
  let foundH1 = false;

  // Look for first image after H1
  visit(ast, (node) => {
    if (node.type === 'heading' && (node as Heading).depth === 1) {
      foundH1 = true;
      return;
    }

    if (foundH1 && !heroImage && node.type === 'image') {
      const img = node as Image;
      const alt = (img.alt || '').toLowerCase();
      // Prefer images that look like screenshots or logos
      if (alt.includes('screenshot') || alt.includes('demo') || alt.includes('preview') || 
          alt.includes('logo') || alt.includes('hero') || alt.includes('banner')) {
        heroImage = img;
      } else if (!heroImage) {
        // Fallback to first image
        heroImage = img;
      }
    }
  });

  if (heroImage) {
    const img = heroImage as Image;
    if (img.url) {
      return {
        url: img.url,
        alt: img.alt || 'Hero image',
      };
    }
  }

  return undefined;
}

function extractStats(ast: Root): Array<{ label: string; value: string }> | undefined {
  const stats: Array<{ label: string; value: string }> = [];
  
  // Look for patterns like "100+ stars", "50k downloads", etc.
  visit(ast, 'paragraph', (node: Paragraph) => {
    const text = extractTextFromNode(node);
    // Match patterns like: "100+", "50k", "1.2M", etc.
    const statPattern = /(\d+[kKmMbB]?\+?)\s+(\w+)/gi;
    const matches = text.matchAll(statPattern);
    
    for (const match of matches) {
      if (stats.length < 4) {
        stats.push({
          value: match[1],
          label: match[2],
        });
      }
    }
  });

  // Also look for list items with stats
  visit(ast, 'listItem', (node: ListItem) => {
    const text = extractTextFromNode(node);
    const statPattern = /(\d+[kKmMbB]?\+?)\s+(\w+)/gi;
    const matches = text.matchAll(statPattern);
    
    for (const match of matches) {
      if (stats.length < 4) {
        stats.push({
          value: match[1],
          label: match[2],
        });
      }
    }
  });

  return stats.length > 0 ? stats.slice(0, 4) : undefined;
}

function extractTechStack(ast: Root): string[] | undefined {
  const techStack: string[] = [];
  const techKeywords = ['react', 'vue', 'angular', 'next', 'typescript', 'javascript', 'python', 'node', 'rust', 'go', 'java', 'php', 'ruby', 'swift', 'kotlin', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'postgresql', 'mysql', 'mongodb', 'redis', 'tailwind', 'bootstrap', 'sass', 'webpack', 'vite'];

  visit(ast, 'paragraph', (node: Paragraph) => {
    const text = extractTextFromNode(node).toLowerCase();
    for (const keyword of techKeywords) {
      if (text.includes(keyword) && !techStack.includes(keyword)) {
        techStack.push(keyword);
      }
    }
  });

  // Also check code blocks
  visit(ast, 'code', (node: Code) => {
    if (node.lang && !techStack.includes(node.lang)) {
      techStack.push(node.lang);
    }
  });

  return techStack.length > 0 ? techStack.slice(0, 8) : undefined;
}

function extractTestimonials(ast: Root): Array<{ quote: string; author?: string }> | undefined {
  const testimonials: Array<{ quote: string; author?: string }> = [];

  // Look for blockquotes which are often testimonials
  visit(ast, 'blockquote', (node: Blockquote) => {
    const text = extractTextFromNode(node);
    if (text.length > 20 && text.length < 300) {
      // Try to extract author (often after a dash or newline)
      const parts = text.split(/[-–—]\s*|\n/);
      const quote = parts[0]?.trim() || text.trim();
      const author = parts[1]?.trim();
      
      if (quote) {
        testimonials.push({
          quote,
          author: author || undefined,
        });
      }
    }
  });

  return testimonials.length > 0 ? testimonials.slice(0, 3) : undefined;
}

// Helper functions
function extractTextFromNode(node: Node): string {
  let text = '';
  
  if (node.type === 'text') {
    return (node as Text).value;
  }

  if ('children' in node && node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      text += extractTextFromNode(child);
    }
  }

  return text;
}

function nodeToString(node: Node): string {
  if (node.type === 'text') {
    return (node as Text).value;
  }

  if (node.type === 'paragraph') {
    return extractTextFromNode(node);
  }

  if (node.type === 'code') {
    const codeNode = node as Code;
    return `\`\`\`${codeNode.lang || ''}\n${codeNode.value}\n\`\`\``;
  }

  if (node.type === 'list') {
    let listText = '';
    const listNode = node as List;
    for (const item of listNode.children || []) {
      listText += `- ${extractTextFromNode(item)}\n`;
    }
    return listText;
  }

  if (node.type === 'blockquote') {
    return `> ${extractTextFromNode(node)}`;
  }

  if (node.type === 'heading') {
    const headingNode = node as Heading;
    const level = '#'.repeat(headingNode.depth);
    return `${level} ${extractTextFromNode(node)}`;
  }

  return extractTextFromNode(node);
}
