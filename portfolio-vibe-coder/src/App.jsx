import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Code2, 
  Cpu, 
  Globe2, 
  CheckCircle2, 
  TerminalSquare,
  Lock,
  Zap,
  Mail
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// COMPONENT: Navbar
// ==========================================


// ==========================================
// COMPONENT: Floating Agent Overlay
// ==========================================

const highlightJS = (code) => {
  if (!code) return '';
  return code
    .replace(/(document|window|System)/g, '<span class="text-[#569CD6] font-semibold">$1</span>') // Objects
    .replace(/(getElementById|scrollIntoView|open|deploy|log)/g, '<span class="text-[#DCDCAA]">$1</span>') // Methods
    .replace(/('.*?'|".*?")/g, '<span class="text-[#CE9178]">$1</span>') // Strings
    .replace(/\b(await|async|const|let|var)\b/g, '<span class="text-[#C586C0] font-semibold">$1</span>') // Keywords
    .replace(/(\{|\}|\(|\)|\.|;|:|,)/g, '<span class="text-[#D4D4D4]">$1</span>') // Punctuation
    .replace(/(\/\/.*)/g, '<span class="text-[#6A9955] italic">$1</span>') // Comments
    .replace(/\n/g, '<br/>'); // Line breaks
};

const getIconSvgUrl = (actionType) => {
  let path = '';
  if (actionType === 'download') {
    path = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>';
  } else if (actionType === 'link') {
    path = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>';
  } else {
    path = '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>';
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const FloatingAgentOverlay = ({ isActive, code, actionType, onComplete, closeTerminal }) => {
  const [agentState, setAgentState] = React.useState('idle');
  const [displayedText, setDisplayedText] = React.useState('');
  
  const containerRef = React.useRef(null);
  const morphRef = React.useRef(null);
  const textRef = React.useRef(null);
  const dotsRef = React.useRef(null);
  
  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      return;
    }
    
    setAgentState('typing');
    
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    document.body.style.overflow = 'hidden';

    let ctx = gsap.context(() => {
      if (morphRef.current) {
        morphRef.current.style.animation = 'none';
      }

      const tl = gsap.timeline({
        onComplete: () => {
          let currentIndex = 0;
          const interval = setInterval(() => {
            setDisplayedText(code.slice(0, currentIndex + 1));
            currentIndex++;
            if (currentIndex >= code.length) {
              clearInterval(interval);
              setTimeout(() => {
                 if(onComplete) onComplete();
                 
                 const iconTl = gsap.timeline({
                   onComplete: () => {
                     setAgentState('icon'); // Trigger the SVG mask
                     setTimeout(() => {
                       setAgentState('returning');
                       
                       const returnTl = gsap.timeline({
                         onComplete: () => {
                           setAgentState('idle');
                           if (morphRef.current) morphRef.current.style.animation = '';
                           window.removeEventListener('wheel', preventScroll);
                           window.removeEventListener('touchmove', preventScroll);
                           document.body.style.overflow = '';
                           closeTerminal();
                         }
                       });
                       
                       // Animate back to idle state
                       returnTl.to(morphRef.current, {
                                 width: 56,
                                 height: 56,
                                 duration: 0.1
                               })
                               .to(dotsRef.current, { opacity: 1, duration: 0.3 });
                     }, 1500);
                   }
                 });
                 
                 iconTl.to(textRef.current, { opacity: 0, duration: 0.2 })
                       .to(morphRef.current, {
                         width: 64,
                         height: 64,
                         duration: 0.5,
                         ease: 'back.out(1.2)'
                       });
                 
              }, 400); 
            }
          }, 15);
        }
      });

      gsap.set(morphRef.current, {
        left: 24,
        top: 24,
        bottom: 'auto',
        right: 'auto',
        xPercent: 0,
        yPercent: 0
      });

      const targetWidth = Math.min(window.innerWidth * 0.9, 400);
      const targetHeight = 160;

      tl.to(dotsRef.current, { opacity: 0, duration: 0.2 })
        .to(morphRef.current, {
          width: targetWidth,
          height: targetHeight,
          borderRadius: '16px',
          duration: 0.6,
          ease: 'power3.inOut'
        })
        .to(textRef.current, { opacity: 1, duration: 0.3 }, "-=0.2");
      
    }, containerRef);
    
    return () => {
      ctx.revert();
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      document.body.style.overflow = '';
    };
  }, [isActive, code, actionType, onComplete]);

  const isMasked = agentState === 'icon' || agentState === 'returning';

  return (
    <div ref={containerRef} className="fixed inset-0 z-[99999] pointer-events-none">
      <div className={`absolute inset-0 bg-transparent transition-opacity duration-500 ${agentState !== 'idle' ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div 
        ref={morphRef} 
        className={`absolute overflow-hidden flex items-center justify-center transition-all ${
          agentState === 'idle' 
            ? 'w-14 h-14 top-6 left-6 animate-morph pointer-events-auto cursor-help' 
            : ''
        }`}
        style={{
          background: 'rgba(0,0,0,0.06)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          border: isMasked ? 'none' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: isMasked ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: isMasked ? '0px' : undefined,
          ...(isMasked ? {
            WebkitMaskImage: `url('${getIconSvgUrl(actionType)}')`,
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: '60%',
            maskImage: `url('${getIconSvgUrl(actionType)}')`,
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: '60%',
          } : {})
        }}
      >
        <div ref={dotsRef} className={`flex gap-1.5 absolute ${agentState === 'idle' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-1.5 h-1.5 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <div ref={textRef} className={`absolute inset-0 p-5 flex flex-col justify-center font-mono text-xs sm:text-sm text-[#D4D4D4] whitespace-pre-wrap break-words pointer-events-none ${isMasked ? 'hidden' : ''}`}>
          <div className="flex items-center gap-3 mb-3 opacity-40">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[9px] tracking-widest uppercase text-white/50">Vibe.AI Liquid Agent</span>
          </div>
          <div>
            <span className="text-accent font-bold">{'>'} </span>
            <span dangerouslySetInnerHTML={{ __html: highlightJS(displayedText) }}></span>
            <span className="animate-pulse w-1.5 h-3 bg-white inline-block ml-1 align-middle"></span>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// COMPONENT: Hero
// ==========================================
const Hero = ({ triggerAction }) => {
  return (
    <section className="relative min-h-[90vh] w-full pt-32 pb-20 overflow-hidden bg-background bg-dot-pattern flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-background pointer-events-none z-0"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Left Column: Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <div className="hero-anim gsap-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Engenharia Web de Alta Performance
          </div>
          
          <h1 className="hero-anim gsap-reveal font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-primary mb-6 leading-[1.05]">
            Construindo a <br /><span className="italic text-accent">nova era</span><br />
            das interfaces.
          </h1>
          
          <p className="hero-anim gsap-reveal text-primary/60 text-lg md:text-xl max-w-xl mb-12 font-sans font-light">
            Especialista em criar experiências digitais premium que unem design sofisticado, arquitetura escalável e animações ultra-fluidas.
          </p>
          
          <div className="hero-anim gsap-reveal flex flex-wrap items-center justify-start gap-4">
            <a href="#projects" onClick={(e) => triggerAction(e, "document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });", 'scroll', () => document.getElementById('projects').scrollIntoView({behavior: 'smooth'}))} className="btn-pill btn-pill-dark px-8 py-4 text-base shadow-xl shadow-primary/10">
              Explorar Projetos
            </a>
            <a href="#" onClick={(e) => triggerAction(e, "window.open('/cv.pdf', '_blank');\n// Baixando currículo...", 'download', () => console.log('Baixar CV click'))} className="btn-pill btn-pill-light px-8 py-4 text-base">
              Baixar CV
            </a>
          </div>
        </div>

        {/* Right Column: 3D Element Placeholder */}
        <div className="hidden md:flex w-full md:w-1/2 h-[500px] relative items-center justify-center">
          <div className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-3xl flex items-center justify-center opacity-70 bg-black/5">
            <span className="text-primary/30 font-mono text-sm tracking-widest uppercase text-center px-4">
              [ Área Reservada ]<br/>
              Elemento 3D / FFmpeg
            </span>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary/30 text-xs font-medium uppercase tracking-widest">
        Deslize para mais
        <ArrowRight size={14} className="rotate-90 animate-bounce" />
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT: About (Human Centered)
// ==========================================
const About = () => {
  return (
    <section id="about" className="reveal-section py-24 bg-background">
      <div className="container-custom">
        <div className="reveal-up gsap-reveal mb-16">
          <div className="flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Sobre Mim
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            Código Centrado no Humano,<br className="hidden md:block"/>
            Feito para Produção.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Dark Card - Location/Vibe */}
          <div className="reveal-up gsap-reveal bento-card-dark md:col-span-2 p-10 flex flex-col justify-between min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                Disponível Mundialmente
              </div>
            </div>
            
            <div className="relative z-10 mt-auto">
              <h3 className="text-3xl md:text-5xl font-sans font-medium leading-tight mb-6">
                Baseado no<br/>
                <span className="text-white/50">Brasil</span>
              </h3>
              <a href="#contact" className="inline-flex items-center gap-2 text-sm font-semibold border-b border-white/30 pb-1 hover:border-white transition-colors">
                Iniciar Projeto <ArrowRight size={16} />
              </a>
            </div>
            
            {/* Abstract visual in dark card */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl"></div>
          </div>

          {/* Stats/Highlight Cards */}
          <div className="flex flex-col gap-6">
            <div className="reveal-up gsap-reveal bento-card p-8 flex-1 flex flex-col justify-center">
              <p className="text-sm text-primary/60 font-medium leading-relaxed mb-4">
                Desenvolvedor Front-end especializado em criar experiências digitais rápidas e escaláveis, utilizando tecnologias modernas.
              </p>
              <div className="flex items-center gap-1 text-accent">
                {[1,2,3,4,5].map(i => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
            </div>
            
            <div className="reveal-up gsap-reveal bento-card p-8 flex-1 flex items-center gap-4 bg-accent text-white border-none shadow-[0_10px_30px_rgba(255,59,48,0.2)]">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shrink-0 overflow-hidden border-2 border-white">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop" loading="lazy" decoding="async" alt="Profile" className="w-full h-full object-cover rounded-xl grayscale" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight italic">
                  "Sólida experiência em projetos complexos e Design Systems."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT: Skills (Features Flowchart)
// ==========================================
const Skills = () => {
  return (
    <section id="skills" className="reveal-section py-24 bg-white border-y border-black/5">
      <div className="container-custom">
        <div className="reveal-up gsap-reveal text-center mb-20">
          <div className="inline-flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Stack Tecnológico
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            Ferramentas Poderosas
          </h2>
        </div>

        {/* Pseudo Flowchart Layout */}
        <div className="relative max-w-4xl mx-auto py-10">
          {/* Connector Lines (Desktop only for simplicity) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-black/10 -translate-y-1/2 z-0"></div>
          <div className="hidden md:block absolute top-[20%] bottom-[20%] left-1/2 w-px bg-black/10 -translate-x-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10 items-center justify-items-center">
            
            {/* Left Column */}
            <div className="flex flex-col gap-6 w-full max-w-[280px]">
              <div className="reveal-up gsap-reveal bento-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Code2 size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm">React & Next.js</h4>
                  <p className="text-xs text-primary/50 font-medium">Arquitetura base</p>
                </div>
              </div>
              <div className="reveal-up gsap-reveal bento-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><TerminalSquare size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm">TypeScript</h4>
                  <p className="text-xs text-primary/50 font-medium">Tipagem segura</p>
                </div>
              </div>
            </div>

            {/* Center Core */}
            <div className="reveal-up gsap-reveal w-32 h-32 rounded-3xl bg-accent text-white shadow-[0_0_40px_rgba(255,59,48,0.4)] flex flex-col items-center justify-center gap-2 relative z-20 hover:scale-105 transition-transform cursor-pointer">
              <Cpu size={32} />
              <span className="font-bold text-sm tracking-widest uppercase">Core</span>
              <div className="absolute -inset-4 border border-accent/30 rounded-[2.5rem] pointer-events-none animate-[spin_10s_linear_infinite]"></div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 w-full max-w-[280px]">
              <div className="reveal-up gsap-reveal bento-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Globe2 size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm">Tailwind CSS</h4>
                  <p className="text-xs text-primary/50 font-medium">Estilização ágil</p>
                </div>
              </div>
              <div className="reveal-up gsap-reveal bento-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><CheckCircle2 size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm">Design Systems</h4>
                  <p className="text-xs text-primary/50 font-medium">Componentização</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT: Projects (The Squad)
// ==========================================
const Projects = ({ triggerAction }) => {
  const projects = [
    { title: "Collage.fm", desc: "Plataforma de música e colagens interativas.", tech: ["Next.js", "React", "TypeScript", "Tailwind"] },
    { title: "The Movie Guide", desc: "Guia completo de filmes com integração de API externa.", tech: ["React", "TypeScript", "Styled Components"] },
    { title: "Daily Weather", desc: "App de previsão do tempo com UI limpa e minimalista.", tech: ["HTML", "SASS", "JavaScript"] },
    { title: "Dashboard Star Wars", desc: "Painel de dados consumindo a SWAPI.", tech: ["HTML", "SASS", "JavaScript"] }
  ];

  return (
    <section id="projects" className="reveal-section py-24 bg-[#0a0a0a] text-white">
      <div className="container-custom">
        <div className="reveal-up gsap-reveal flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
              O Trabalho
            </div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Projetos Entregues
            </h2>
          </div>
          <p className="text-white/50 max-w-sm text-sm font-medium leading-relaxed">
            Nós não apenas escrevemos código. Nós desenhamos, construímos e avaliamos com tecnologias modernas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, i) => (
            <div key={i} onClick={(e) => triggerAction(e, `await System.deploy({\n  project: '${proj.title}',\n  target: 'production'\n});\n\n// Acessando preview em tempo real...`, 'link', () => { console.log('Projeto aberto:', proj.title) })} className="reveal-up gsap-reveal bento-card-dark p-2 flex flex-col group cursor-pointer hover:border-white/20 transition-colors">
              <div className="w-full h-64 bg-[#1a1a1a] rounded-2xl mb-4 overflow-hidden relative">
                <img src={`https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop&sig=${i}`} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={proj.title} />
                <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={18} className="-rotate-45" />
                </div>
              </div>
              <div className="p-4 pt-2">
                <h3 className="text-2xl font-sans font-medium mb-2">{proj.title}</h3>
                <p className="text-white/50 text-sm mb-6 h-10">{proj.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.tech.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT: Contact (Stats & Footer)
// ==========================================
const Contact = ({ triggerAction }) => {
  return (
    <section id="contact" className="reveal-section bg-[#0a0a0a] pt-10 pb-12 border-t border-white/10 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row gap-10 items-center justify-between mb-24">
          
          <div className="reveal-up gsap-reveal flex-1">
             <div className="flex items-center gap-2 text-white/30 text-xs font-semibold uppercase tracking-widest mb-6">
               <span className="w-8 h-px bg-white/20"></span>
               Nossos Números
             </div>
             <div className="text-7xl md:text-9xl font-sans font-black tracking-tighter text-white mb-2">
               +100<span className="text-accent">.</span>
             </div>
             <p className="text-white/50 font-medium uppercase tracking-widest text-sm">Projetos & Repositórios</p>
          </div>

          <div className="reveal-up gsap-reveal flex-1 w-full bento-card-dark p-10 md:p-14 bg-gradient-to-br from-[#111] to-[#0a0a0a]">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8">
               <Mail size={24} className="text-accent" />
             </div>
             <h3 className="font-serif text-4xl mb-8">Pronto para inovar?</h3>
             <a href="mailto:rhuambello@gmail.com" className="inline-flex items-center justify-between w-full bg-white text-black px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors">
               <span>rhuambello@gmail.com</span>
               <ArrowRight size={20} />
             </a>
          </div>

        </div>

        <div className="reveal-up gsap-reveal flex flex-col md:flex-row justify-between items-center text-xs font-sans font-medium text-white/40 border-t border-white/10 pt-8">
          <p className="mb-4 md:mb-0">© 2026 VibeCoder. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="https://linkedin.com/in/rhuanbello" onClick={(e) => triggerAction(e, `window.open('https://linkedin.com/in/rhuanbello', '_blank');`, 'link', () => window.open('https://linkedin.com/in/rhuanbello', '_blank'))} className="hover:text-white transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn
            </a>
            <a href="https://github.com/rhuanbello" onClick={(e) => triggerAction(e, `window.open('https://github.com/rhuanbello', '_blank');`, 'link', () => window.open('https://github.com/rhuanbello', '_blank'))} className="hover:text-white transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  const comp = React.useRef(null);
  const cursorRef = React.useRef(null);
  
  const [terminalState, setTerminalState] = React.useState({
    isActive: false,
    code: '',
    actionType: 'scroll',
    onComplete: null
  });

  const triggerCodeAction = (e, codeStr, actionType, actionCb) => {
    if(e) e.preventDefault();
    
    setTerminalState({ 
      isActive: true, 
      code: codeStr, 
      actionType: actionType,
      onComplete: () => {
        if(actionCb) actionCb();
      }
    });
  };

  const closeTerminal = () => {
    setTerminalState(prev => ({ ...prev, isActive: false }));
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      
      // --- Cursor Logic ---
      if (window.matchMedia("(pointer: fine)").matches) {
        gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
        
        // Reduced duration for faster follow (less delay)
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.05, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.05, ease: "power3" });

        window.addEventListener("mousemove", (e) => {
          xTo(e.clientX);
          yTo(e.clientY);
        });

        let isHoveringInteractive = false;
        let isHoveringDark = false;

        const updateCursor = () => {
          if (isHoveringInteractive) {
            gsap.to(cursorRef.current, { 
              scale: 3, 
              duration: 0.3, 
              ease: 'power2.out', 
              backgroundColor: isHoveringDark ? 'rgba(255,59,48,0.5)' : 'rgba(0,0,0,0.1)' 
            });
          } else {
            gsap.to(cursorRef.current, { 
              scale: 1, 
              duration: 0.3, 
              ease: 'power2.out', 
              backgroundColor: isHoveringDark ? '#FF3B30' : '#000000' 
            });
          }
        };

        // Dark areas trigger orange cursor
        const darkElements = document.querySelectorAll('#projects, #contact, .bento-card-dark, .btn-pill-dark, .bg-primary');
        darkElements.forEach(el => {
          el.addEventListener('mouseenter', () => { isHoveringDark = true; updateCursor(); });
          el.addEventListener('mouseleave', () => { isHoveringDark = false; updateCursor(); });
        });

        // Interactive elements trigger expansion
        const interactiveElements = document.querySelectorAll('a, button, .bento-card, .bento-card-dark');
        interactiveElements.forEach(el => {
          el.addEventListener('mouseenter', () => { isHoveringInteractive = true; updateCursor(); });
          el.addEventListener('mouseleave', () => { isHoveringInteractive = false; updateCursor(); });
        });
      }
      
      // 1. Hero Animations
      gsap.fromTo('.hero-anim', 
        { y: 40, opacity: 0, autoAlpha: 0 },
        { y: 0, opacity: 1, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.2 }
      );

      // 2. Navbar Scroll Interaction
      ScrollTrigger.create({
        start: 'top -50',
        end: 99999,
        toggleClass: { className: 'bg-white/90 backdrop-blur-xl border-black/10 shadow-saas', targets: '.navbar' }
      });
      gsap.set('.navbar', { backgroundColor: 'transparent', border: '1px solid transparent', boxShadow: 'none' });

      // 3. Scroll Reveal for Sections (About, Skills, Projects, Contact)
      const sections = gsap.utils.toArray('.reveal-section');
      sections.forEach(sec => {
        const elements = sec.querySelectorAll('.reveal-up');
        gsap.fromTo(elements, 
          { y: 50, opacity: 0, autoAlpha: 0 },
          { 
            y: 0, opacity: 1, autoAlpha: 1, 
            duration: 1, 
            ease: 'power3.out', 
            stagger: 0.15,
            scrollTrigger: {
              trigger: sec,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={comp} className="font-sans antialiased bg-background text-primary selection:bg-accent selection:text-white">
      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor hidden md:block"></div>

      {/* Floating Agent Overlay */}
      <FloatingAgentOverlay {...terminalState} closeTerminal={closeTerminal} />

      {/* Navbar with class for GSAP */}
      <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full w-[90%] max-w-4xl transition-colors duration-300">
        <div className="font-sans font-bold text-lg tracking-tight text-primary flex items-center gap-2 cursor-pointer" onClick={(e) => triggerCodeAction(e, "window.scrollTo({ top: 0, behavior: 'smooth' });", 'scroll', () => window.scrollTo({top: 0, behavior: 'smooth'}))}>
          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          VibeCoder
        </div>
        <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium text-primary/70">
          <a href="#about" onClick={(e) => triggerCodeAction(e, "document.getElementById('about').scrollIntoView({ behavior: 'smooth' });", 'scroll', () => document.getElementById('about').scrollIntoView({behavior: 'smooth'}))} className="hover:text-primary transition-colors">Sobre</a>
          <a href="#skills" onClick={(e) => triggerCodeAction(e, "document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });", 'scroll', () => document.getElementById('skills').scrollIntoView({behavior: 'smooth'}))} className="hover:text-primary transition-colors">Habilidades</a>
          <a href="#projects" onClick={(e) => triggerCodeAction(e, "document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });", 'scroll', () => document.getElementById('projects').scrollIntoView({behavior: 'smooth'}))} className="hover:text-primary transition-colors">Projetos</a>
        </div>
        <a href="#contact" onClick={(e) => triggerCodeAction(e, "window.location.href = '#contact';", 'scroll', () => window.location.href = '#contact')} className="btn-pill btn-pill-dark px-5 py-2 text-sm">
          Iniciar Projeto
        </a>
      </nav>

      <main>
        <Hero triggerAction={triggerCodeAction} />
        <About />
        <Skills />
        <Projects triggerAction={triggerCodeAction} />
        <Contact triggerAction={triggerCodeAction} />
      </main>
    </div>
  );
}

export default App;


