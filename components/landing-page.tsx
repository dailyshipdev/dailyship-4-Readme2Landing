'use client';

import type { PageModel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { useEffect, useState } from 'react';

interface LandingPageProps {
  model: PageModel;
  template?: 'minimal' | 'saas' | 'oss';
}

export function LandingPage({ model }: LandingPageProps) {
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

  // Categorize sections for smart layout
  const primarySections = model.sections.filter(s => 
    ['how-it-works', 'how it works', 'quick-start', 'quick start', 'installation', 'install', 'getting-started', 'usage'].some(
      key => s.id.toLowerCase().includes(key) || s.title.toLowerCase().includes(key)
    )
  );
  
  const secondarySections = model.sections.filter(s => 
    ['tech-stack', 'tech stack', 'project-structure', 'project structure', 'idea-categories', 'configuration'].some(
      key => s.id.toLowerCase().includes(key) || s.title.toLowerCase().includes(key)
    )
  );

  const tertiarySections = model.sections.filter(s => 
    !primarySections.includes(s) && !secondarySections.includes(s)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.01)_100%)]"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Text Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="inline-block mb-6 animate-fade-in-up">
                  <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                      {model.title}
                    </span>
                  </h1>
                </div>
                <p className="text-2xl md:text-3xl text-muted-foreground mb-10 leading-relaxed font-light animate-fade-in-up max-w-2xl mx-auto lg:mx-0" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  {model.tagline}
                </p>
                
                {/* Badges */}
                {model.badges && model.badges.length > 0 && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                    {model.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-5 py-2.5 text-sm font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-border/50 shadow-md hover:shadow-lg transition-all hover:scale-110 hover:border-primary/50"
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <Button 
                    size="lg" 
                    asChild
                    className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-lg px-10 py-7 shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-110 group font-semibold"
                  >
                    <a href={model.cta.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                      {model.cta.label}
                      <span className="group-hover:translate-x-2 transition-transform text-xl">→</span>
                    </a>
                  </Button>
                  {model.secondaryLinks.map((link, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      size="lg" 
                      asChild
                      className="text-lg px-10 py-7 border-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 hover:border-primary/50 transition-all duration-300 hover:scale-110 font-semibold"
                    >
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Right: Hero Image */}
              {model.heroImage && (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-gradient-to-br from-muted/30 to-muted/10 p-3 backdrop-blur-sm">
                      <img 
                        src={model.heroImage.url} 
                        alt={model.heroImage.alt}
                        className="w-full h-auto rounded-2xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {model.stats && model.stats.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background border-y border-border/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {model.stats.map((stat, idx) => (
                  <div 
                    key={idx} 
                    className="text-center group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                        <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3">
                          {stat.value}
                        </div>
                        <div className="text-sm md:text-base font-medium text-muted-foreground capitalize">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Show early if available */}
      {model.features.length > 0 && (
        <section className="relative py-24 md:py-32 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
                  <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                    Why {model.title.split(' ')[0]}?
                  </span>
                </h2>
                <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"></div>
                <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
                  {model.features.length} powerful features to help you succeed
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {model.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group relative animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <Card className="relative h-full group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-primary/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                      <CardHeader className="space-y-4 p-8">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                            {feature.icon ? (
                              <span className="text-3xl">{feature.icon}</span>
                            ) : (
                              <span className="text-primary font-extrabold text-2xl">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors mb-2">
                              {feature.title}
                            </CardTitle>
                            {feature.desc && (
                              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                                {feature.desc}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack Section - Only show if not already in sections */}
      {model.techStack && model.techStack.length > 0 && !secondarySections.some(s => s.title.toLowerCase().includes('tech')) && (
        <section className="py-20 bg-gradient-to-b from-background via-muted/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Built With
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">Modern technologies powering this project</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {model.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="group relative px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border-2 border-border/50 text-sm font-semibold hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-110 hover:shadow-lg cursor-default"
                  >
                    <span className="relative z-10">{tech}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {model.testimonials && model.testimonials.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-muted/20 via-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    What People Say
                  </span>
                </h2>
                <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {model.testimonials.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className="group relative animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Card className="relative h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 hover:border-primary/40 transition-all hover:shadow-2xl hover:scale-105">
                      <CardHeader className="p-8">
                        <div className="text-5xl text-primary/20 mb-6 font-serif">"</div>
                        <CardDescription className="text-lg leading-relaxed italic text-foreground/90 mb-6">
                          {testimonial.quote}
                        </CardDescription>
                        {testimonial.author && (
                          <div className="pt-6 border-t border-border/50">
                            <p className="text-base font-bold text-foreground">— {testimonial.author}</p>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Primary Sections - How it works, Installation, etc. */}
      {primarySections.length > 0 && (
        <>
          {primarySections.map((section, idx) => {
            const isHowItWorks = section.id.toLowerCase().includes('how-it-works') || section.title.toLowerCase().includes('how it works');
            const isInstallation = section.id.toLowerCase().includes('install') || section.title.toLowerCase().includes('quick start');
            
            return (
              <section 
                key={section.id} 
                id={section.id} 
                className={`relative py-24 md:py-32 ${idx % 2 === 0 ? 'bg-background' : 'bg-gradient-to-b from-muted/10 via-background to-background'}`}
              >
                {isInstallation && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                )}
                <div className="container mx-auto px-4">
                  <div className={`max-w-5xl mx-auto`}>
                    <div className="text-center mb-12">
                      <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
                        <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                          {section.title}
                        </span>
                      </h2>
                      <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"></div>
                      {isInstallation && (
                        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                          Get up and running in minutes
                        </p>
                      )}
                    </div>
                    <div className={`prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-code:bg-gradient-to-r prose-code:from-primary/10 prose-code:to-primary/5 prose-code:px-2.5 prose-code:py-1.5 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-primary/20 prose-code:shadow-sm prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-gray-800 prose-pre:p-6 prose-pre:rounded-2xl prose-pre:border prose-pre:border-border/50 prose-pre:shadow-2xl prose-ul:list-disc prose-ol:list-decimal prose-li:my-4 prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-bold prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:shadow-lg prose-img:rounded-xl prose-img:shadow-lg ${isHowItWorks ? 'prose-ul:list-none prose-ul:space-y-4' : ''}`}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderedSections[section.id] || section.content,
                        }}
                      />
                    </div>
                    {isInstallation && (
                      <div className="mt-12 text-center">
                        <Button 
                          size="lg" 
                          asChild
                          className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-lg px-10 py-7 shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-110 font-semibold"
                        >
                          <a href={model.cta.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 justify-center">
                            {model.cta.label}
                            <span className="text-xl">→</span>
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* Secondary Sections - Tech Stack, Project Structure, etc. */}
      {secondarySections.length > 0 && (
        <section className="relative py-20 bg-gradient-to-b from-background via-muted/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {secondarySections.map((section) => (
                  <div key={section.id} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl hover:shadow-2xl transition-all">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {section.title}
                    </h3>
                    <div className="prose prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-code:bg-gradient-to-r prose-code:from-primary/10 prose-code:to-primary/5 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-gray-800 prose-pre:p-4 prose-pre:rounded-xl prose-pre:border prose-pre:border-border/50 prose-pre:shadow-lg prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderedSections[section.id] || section.content,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tertiary Sections - Contributing, License, etc. */}
      {tertiarySections.length > 0 && (
        <section className="relative py-16 bg-gradient-to-b from-background to-muted/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                {tertiarySections.map((section) => (
                  <div key={section.id} id={section.id} className="border-b border-border/30 last:border-0 pb-12 last:pb-0">
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                      {section.title}
                    </h3>
                    <div className="prose prose-base dark:prose-invert max-w-none prose-p:text-muted-foreground prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderedSections[section.id] || section.content,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative border-t bg-gradient-to-br from-muted/30 via-muted/20 to-background mt-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              {/* Project Info */}
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {model.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                  {model.tagline}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                <div className="space-y-3">
                  {model.sections.slice(0, 5).map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-2 font-medium"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>

              {/* External Links */}
              <div>
                <h4 className="font-bold text-lg mb-6">Resources</h4>
                <div className="space-y-3">
                  <a
                    href={model.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-2 font-medium group"
                  >
                    {model.cta.label}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  {model.secondaryLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-2 font-medium group"
                    >
                      {link.label}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {model.title}. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Generated with{' '}
                <span className="text-primary font-semibold">README → Landing</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
