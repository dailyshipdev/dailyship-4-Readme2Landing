'use client';

import type { PageModel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { useEffect, useState } from 'react';

interface LandingPageProps {
  model: PageModel;
  template?: 'minimal' | 'saas' | 'oss';
}

export function LandingPage({ model, template = 'minimal' }: LandingPageProps) {
  const [renderedSections, setRenderedSections] = useState<Record<string, string>>({});

  useEffect(() => {
    // Render markdown sections to HTML
    const processor = remark().use(remarkGfm).use(remarkHtml);
    const renderPromises = model.sections.map(async (section) => {
      const result = await processor.process(section.content);
      return { id: section.id, html: String(result) };
    });

    Promise.all(renderPromises).then((results) => {
      const htmlMap: Record<string, string> = {};
      results.forEach(({ id, html }) => {
        htmlMap[id] = html;
      });
      setRenderedSections(htmlMap);
    });
  }, [model.sections]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight">
                {model.title}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              {model.tagline}
            </p>
            
            {/* Badges */}
            {model.badges && model.badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {model.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-1.5 text-sm bg-gradient-to-r from-muted to-muted/80 rounded-full border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <Button 
                size="lg" 
                asChild
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <a href={model.cta.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  {model.cta.label}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </Button>
              {model.secondaryLinks.map((link, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="text-lg px-8 py-6 border-2 hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:scale-105"
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {model.features.length > 0 && (
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-muted/30 via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Features
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {model.features.map((feature, idx) => (
                  <Card 
                    key={idx}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
                  >
                    <CardHeader className="space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-primary font-bold text-lg">{idx + 1}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      {feature.desc && (
                        <CardDescription className="text-base leading-relaxed">
                          {feature.desc}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sections */}
      {model.sections.map((section, idx) => (
        <section 
          key={section.id} 
          id={section.id} 
          className={`container mx-auto px-4 py-16 md:py-20 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {section.title}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
            </div>
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-muted prose-pre:p-5 prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-ul:list-disc prose-ol:list-decimal prose-li:my-3 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold"
              dangerouslySetInnerHTML={{
                __html: renderedSections[section.id] || section.content,
              }}
            />
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">{model.title}</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                {model.tagline}
              </p>
            </div>
            <div className="pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Generated with README → Landing
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
