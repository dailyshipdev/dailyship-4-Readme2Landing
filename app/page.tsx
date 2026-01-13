'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LandingPage } from '@/components/landing-page';
import { parseReadme } from '@/lib/readme-parser';
import type { PageModel } from '@/lib/types';
import { Download, Copy, Check } from 'lucide-react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [pageModel, setPageModel] = useState<PageModel | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    if (markdown.trim()) {
      parseReadme(markdown)
        .then((model) => {
          if (!cancelled) {
            setPageModel(model);
          }
        })
        .catch(console.error);
    } else {
      // Use setTimeout to avoid synchronous setState
      const timer = setTimeout(() => {
        if (!cancelled) {
          setPageModel(null);
        }
      }, 0);
      
      return () => {
        clearTimeout(timer);
        cancelled = true;
      };
    }
    
    return () => {
      cancelled = true;
    };
  }, [markdown]);


  const downloadHTML = async () => {
    if (!pageModel) return;

    const html = await generateHTML(pageModel);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageModel.title.toLowerCase().replace(/\s+/g, '-')}-landing.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyHTML = async () => {
    if (!pageModel) return;

    const html = await generateHTML(pageModel);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow group">
              <span className="text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                README → Landing
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Transform in seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pageModel && (
              <>
                <Button 
                  onClick={downloadHTML} 
                  variant="outline" 
                  size="sm"
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </Button>
                <Button 
                  onClick={copyHTML} 
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-md hover:shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy HTML
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Input */}
          <Card className="flex flex-col shadow-lg border-2 hover:border-primary/20 transition-all duration-300">
            <div className="p-5 border-b bg-gradient-to-r from-muted/50 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h2 className="font-semibold text-lg">README Markdown</h2>
              </div>
            </div>
            <div className="flex-1 p-5 overflow-auto bg-muted/20">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Paste your README markdown here...&#10;&#10;The landing page will be generated automatically ✨"
                className="min-h-full resize-none font-mono text-sm bg-background border-2 focus:border-primary/50 transition-colors"
              />
            </div>
          </Card>

          {/* Preview */}
          <Card className="flex flex-col overflow-hidden shadow-lg border-2 hover:border-primary/20 transition-all duration-300">
            <div className="p-5 border-b bg-gradient-to-r from-muted/50 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="font-semibold text-lg">Live Preview</h2>
                {pageModel && (
                  <span className="ml-auto text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    Live
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/10">
              {pageModel ? (
                <LandingPage model={pageModel} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 shadow-lg">
                      <Copy className="w-10 h-10 text-primary/60" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-background"></div>
                  </div>
                  <p className="text-xl font-semibold mb-2 text-foreground">Ready to transform your README</p>
                  <p className="text-sm text-center max-w-sm leading-relaxed">
                    Paste your README markdown in the left panel to see your landing page come to life ✨
                  </p>
                  <div className="mt-6 flex gap-2 text-xs">
                    <span className="px-3 py-1 bg-muted rounded-full">⚡ Instant Preview</span>
                    <span className="px-3 py-1 bg-muted rounded-full">📥 Export HTML</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function generateHTML(model: PageModel): Promise<string> {
  const processor = remark().use(remarkGfm).use(remarkHtml);
  
  const featuresHTML = model.features
    .map(
      (f, idx) => `
    <div class="feature-card">
      ${f.icon ? `<div class="feature-icon">${f.icon}</div>` : `<div class="feature-number">${idx + 1}</div>`}
      <h3>${escapeHtml(f.title)}</h3>
      ${f.desc ? `<p>${escapeHtml(f.desc)}</p>` : ''}
    </div>`
    )
    .join('');

  const statsHTML = model.stats
    ? model.stats
        .map(
          (stat) => `
    <div class="stat-item">
      <div class="stat-value">${escapeHtml(stat.value)}</div>
      <div class="stat-label">${escapeHtml(stat.label)}</div>
    </div>`
        )
        .join('')
    : '';

  const techStackHTML = model.techStack
    ? model.techStack
        .map((tech) => `<span class="tech-badge">${escapeHtml(tech)}</span>`)
        .join('')
    : '';

  const testimonialsHTML = model.testimonials
    ? model.testimonials
        .map(
          (t) => `
    <div class="testimonial-card">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">${escapeHtml(t.quote)}</p>
      ${t.author ? `<p class="testimonial-author">— ${escapeHtml(t.author)}</p>` : ''}
    </div>`
        )
        .join('')
    : '';

  const heroImageHTML = model.heroImage
    ? `<div class="hero-image-wrapper">
        <img src="${escapeHtml(model.heroImage.url)}" alt="${escapeHtml(model.heroImage.alt)}" class="hero-image" />
      </div>`
    : '';

  const sectionsHTMLPromises = model.sections.map(async (s) => {
    const html = await processor.process(s.content);
    return `
    <section class="content-section">
      <h2>${escapeHtml(s.title)}</h2>
      <div class="section-content">${String(html)}</div>
    </section>`;
  });
  
  const sectionsHTML = (await Promise.all(sectionsHTMLPromises)).join('');

  const badgesHTML = model.badges
    ?.map((b) => `<span class="badge">${escapeHtml(b.label)}</span>`)
    .join('') || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(model.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .hero {
      padding: 80px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
    .hero-text { text-align: left; }
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    .hero-image-wrapper { text-align: center; }
    .hero-image { max-width: 100%; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 2rem; }
    .badge { padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 0.875rem; }
    .cta-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn { padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block; transition: all 0.2s; }
    .btn-primary { background: white; color: #667eea; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-secondary { background: transparent; border: 2px solid white; color: white; }
    .btn-secondary:hover { background: white; color: #667eea; }
    .stats { padding: 60px 20px; background: #f8f9fa; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #667eea; margin-bottom: 8px; }
    .stat-label { font-size: 0.875rem; color: #666; text-transform: capitalize; }
    .features { padding: 80px 20px; background: #f8f9fa; }
    .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .feature-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .feature-icon, .feature-number { font-size: 2rem; margin-bottom: 12px; }
    .feature-card h3 { font-size: 1.25rem; margin-bottom: 8px; color: #667eea; }
    .tech-stack { padding: 60px 20px; text-align: center; }
    .tech-stack h2 { font-size: 2rem; margin-bottom: 2rem; }
    .tech-badges { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .tech-badge { padding: 8px 16px; background: #f0f0f0; border-radius: 6px; font-size: 0.875rem; }
    .testimonials { padding: 80px 20px; background: #f8f9fa; }
    .testimonials h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .testimonial-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .testimonial-quote { font-size: 3rem; color: #667eea; opacity: 0.3; margin-bottom: 12px; }
    .testimonial-text { font-style: italic; margin-bottom: 16px; }
    .testimonial-author { font-weight: 600; color: #667eea; }
    .content-section { padding: 60px 20px; }
    .content-section h2 { font-size: 2rem; margin-bottom: 1.5rem; }
    .section-content { max-width: 800px; margin: 0 auto; }
    .section-content p { margin-bottom: 1rem; }
    .section-content code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    .section-content pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 1rem 0; }
    .section-content ul, .section-content ol { margin-left: 24px; margin-bottom: 1rem; }
    footer { text-align: center; padding: 40px 20px; border-top: 1px solid #e0e0e0; color: #666; background: #f8f9fa; }
    @media (max-width: 768px) {
      .hero-content { grid-template-columns: 1fr; text-align: center; }
      .hero-text { text-align: center; }
      .hero h1 { font-size: 2.5rem; }
      .features-grid, .testimonials-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1>${escapeHtml(model.title)}</h1>
          <p>${escapeHtml(model.tagline)}</p>
          ${badgesHTML ? `<div class="badges">${badgesHTML}</div>` : ''}
          <div class="cta-buttons">
            <a href="${escapeHtml(model.cta.href)}" class="btn btn-primary">${escapeHtml(model.cta.label)}</a>
            ${model.secondaryLinks.map(l => `<a href="${escapeHtml(l.href)}" class="btn btn-secondary">${escapeHtml(l.label)}</a>`).join('')}
          </div>
        </div>
        ${heroImageHTML}
      </div>
    </div>
  </section>
  ${statsHTML ? `<section class="stats"><div class="container"><div class="stats-grid">${statsHTML}</div></div></section>` : ''}
  ${model.features.length > 0 ? `<section class="features"><div class="container"><h2>Features</h2><div class="features-grid">${featuresHTML}</div></div></section>` : ''}
  ${techStackHTML ? `<section class="tech-stack"><div class="container"><h2>Built With</h2><div class="tech-badges">${techStackHTML}</div></div></section>` : ''}
  ${testimonialsHTML ? `<section class="testimonials"><div class="container"><h2>What People Say</h2><div class="testimonials-grid">${testimonialsHTML}</div></div></section>` : ''}
  ${sectionsHTML}
  <footer>
    <div class="container">
      <p>${escapeHtml(model.title)} - ${escapeHtml(model.tagline)}</p>
      <p style="margin-top: 8px; font-size: 0.75rem;">Generated with README → Landing</p>
    </div>
  </footer>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

