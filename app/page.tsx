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

const EXAMPLE_READMES: Record<string, string> = {
  'Select example...': '',
  'Shadcn UI': `# shadcn/ui

Re-usable components built with Radix UI and Tailwind CSS.

## Description

Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.

## Features

- **Copy and paste** components into your apps
- **Accessible** components built with Radix UI
- **Customizable** with Tailwind CSS
- **Open source** and free to use

## Installation

\`\`\`bash
npx shadcn@latest init
\`\`\`

## Usage

\`\`\`bash
npx shadcn@latest add button
\`\`\`

## License

MIT`,

  'Tauri': `# Tauri

Build smaller, faster, and more secure desktop applications with a web frontend.

## About

Tauri is a framework for building desktop applications with any frontend framework and a Rust core.

## Features

- **Smaller** bundle sizes
- **Faster** performance
- **More secure** by default
- **Cross-platform** support

## Getting Started

\`\`\`bash
npm create tauri-app@latest
\`\`\`

## Documentation

Visit [tauri.app](https://tauri.app) for full documentation.

## License

MIT or Apache-2.0`,

  'FastAPI': `# FastAPI

Modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.

## Description

FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.

## Key Features

- **Fast**: Very high performance, on par with NodeJS and Go
- **Fast to code**: Increase the speed to develop features by about 200% to 300%
- **Fewer bugs**: Reduce about 40% of human (developer) induced errors
- **Intuitive**: Great editor support. Completion everywhere. Less time debugging
- **Easy**: Designed to be easy to use and learn. Less time reading docs
- **Short**: Minimize code duplication. Multiple features from each parameter declaration

## Installation

\`\`\`bash
pip install fastapi
\`\`\`

## Quickstart

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
\`\`\`

## License

MIT`,

  'LangChain': `# LangChain

⚡ Building applications with LLMs through composability ⚡

## Overview

LangChain is a framework for developing applications powered by language models.

## Features

- **Composable** building blocks for LLM applications
- **Production-ready** chains and agents
- **Extensible** framework for custom use cases
- **Open source** and community-driven

## Installation

\`\`\`bash
pip install langchain
\`\`\`

## Quick Start

\`\`\`python
from langchain.llms import OpenAI

llm = OpenAI(temperature=0.9)
text = "What would be a good company name for a company that makes colorful socks?"
print(llm(text))
\`\`\`

## Documentation

Full documentation available at [python.langchain.com](https://python.langchain.com)

## License

MIT`,
};

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [pageModel, setPageModel] = useState<PageModel | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedExample, setSelectedExample] = useState('Select example...');

  useEffect(() => {
    if (markdown.trim()) {
      parseReadme(markdown).then(setPageModel).catch(console.error);
    } else {
      setPageModel(null);
    }
  }, [markdown]);

  const handleExampleChange = (example: string) => {
    setSelectedExample(example);
    if (example !== 'Select example...' && EXAMPLE_READMES[example]) {
      setMarkdown(EXAMPLE_READMES[example]);
    }
  };

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
            <div className="relative">
              <select
                value={selectedExample}
                onChange={(e) => handleExampleChange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border rounded-lg bg-background hover:bg-muted/50 transition-colors text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gradient-to-r from-background to-muted/30"
              >
                {Object.keys(EXAMPLE_READMES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
                placeholder="Paste your README markdown here...&#10;&#10;Or select an example from the dropdown above 👆"
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
                    Paste your README markdown in the left panel or select an example from the dropdown to see the magic happen ✨
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
      (f) => `
    <div class="feature-card">
      <h3>${escapeHtml(f.title)}</h3>
      ${f.desc ? `<p>${escapeHtml(f.desc)}</p>` : ''}
    </div>`
    )
    .join('');

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
      text-align: center;
      padding: 80px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto; }
    .badges { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
    .badge { padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 0.875rem; }
    .cta-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block; transition: all 0.2s; }
    .btn-primary { background: white; color: #667eea; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-secondary { background: transparent; border: 2px solid white; color: white; }
    .btn-secondary:hover { background: white; color: #667eea; }
    .features { padding: 80px 20px; background: #f8f9fa; }
    .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .feature-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .feature-card h3 { font-size: 1.25rem; margin-bottom: 8px; color: #667eea; }
    .content-section { padding: 60px 20px; }
    .content-section h2 { font-size: 2rem; margin-bottom: 1.5rem; }
    .section-content { max-width: 800px; margin: 0 auto; }
    .section-content p { margin-bottom: 1rem; }
    .section-content code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    .section-content pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 1rem 0; }
    .section-content ul, .section-content ol { margin-left: 24px; margin-bottom: 1rem; }
    footer { text-align: center; padding: 40px 20px; border-top: 1px solid #e0e0e0; color: #666; }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .features-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="container">
      <h1>${escapeHtml(model.title)}</h1>
      <p>${escapeHtml(model.tagline)}</p>
      ${badgesHTML ? `<div class="badges">${badgesHTML}</div>` : ''}
      <div class="cta-buttons">
        <a href="${escapeHtml(model.cta.href)}" class="btn btn-primary">${escapeHtml(model.cta.label)}</a>
        ${model.secondaryLinks.map(l => `<a href="${escapeHtml(l.href)}" class="btn btn-secondary">${escapeHtml(l.label)}</a>`).join('')}
      </div>
    </div>
  </section>
  ${model.features.length > 0 ? `
  <section class="features">
    <div class="container">
      <h2>Features</h2>
      <div class="features-grid">
        ${featuresHTML}
      </div>
    </div>
  </section>
  ` : ''}
  ${sectionsHTML}
  <footer>
    <div class="container">
      <p>${escapeHtml(model.title)} - ${escapeHtml(model.tagline)}</p>
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

