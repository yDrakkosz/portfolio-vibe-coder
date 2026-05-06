import React, { useEffect, useRef, useMemo } from 'react';

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
  Mail,
  Layout,
  Server,
  Smartphone,
  Layers,
  FileCode2,
  Database
} from 'lucide-react';
import gsap from 'gsap';

// Prevent GSAP from pausing animations when tab is inactive
gsap.ticker.lagSmoothing(0);

import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// COMPONENT: CanvasDots (Black Hole Effect)
// ==========================================
const CanvasDots = () => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;

    const spacing = 35; 
    const radius = 1.2;
    const color = 'rgba(255, 59, 48, 0.5)'; // accent color
    
    let dots = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      dots = [];
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          dots.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
          });
        }
      }
    };

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);

    init();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];
        
        const dx = mouseX - dot.baseX;
        const dy = mouseY - dot.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxDistance = 250; 
        let targetX = dot.baseX;
        let targetY = dot.baseY;

        if (distance < maxDistance && distance > 0) {
          const pullStrength = Math.pow((maxDistance - distance) / maxDistance, 2); 
          const maxPull = 12; // Reduced from 20 for a much softer pull
          targetX = dot.baseX + (dx / distance) * pullStrength * maxPull;
          targetY = dot.baseY + (dy / distance) * pullStrength * maxPull;
        }

        // Reduced spring friction from 0.1 to 0.05 for smoother movement
        dot.x += (targetX - dot.x) * 0.05;
        dot.y += (targetY - dot.y) * 0.05;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        
        const maskDist = Math.max(0, 1 - distance / 400);
        ctx.globalAlpha = 0.1 + maskDist * 0.8;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen" />;
};

// ==========================================
// COMPONENT: LoadingScreen
// ==========================================
const LoadingScreen = ({ onComplete }) => {
  const containerRef = React.useRef(null);
  const text1Ref = React.useRef(null);
  const text2Ref = React.useRef(null);
  const leftDoorRef = React.useRef(null);
  const rightDoorRef = React.useRef(null);
  const sliceRef = React.useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          if (onComplete) onComplete();
        }
      });

      // 1. Orange Liquid Blob pops in and pulses
      tl.to(sliceRef.current, {
        scale: 1.5,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
      tl.to(sliceRef.current, {
        scale: 1,
        duration: 0.4,
        ease: "power2.inOut"
      });

      // 2. Black Doors split open & blob explodes and fades
      tl.to(leftDoorRef.current, {
        xPercent: -100,
        duration: 1.2,
        ease: "power4.inOut"
      }, "+=0.15");

      tl.to(rightDoorRef.current, {
        xPercent: 100,
        duration: 1.2,
        ease: "power4.inOut"
      }, "<");

      tl.to(sliceRef.current, {
        scale: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power4.inOut"
      }, "<");

      // 3. Text Blur/Scale Reveal (Liquid effect) on White Layer
      tl.fromTo(text1Ref.current, {
        filter: 'blur(20px)',
        opacity: 0,
        scale: 1.1,
        y: 20
      }, {
        filter: 'blur(0px)',
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=0.8");

      tl.fromTo(text2Ref.current, {
        filter: 'blur(15px)',
        opacity: 0,
        x: -20
      }, {
        filter: 'blur(0px)',
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=1.0");

      // 4. Pause for reading, then container slides up to reveal site
      tl.to([text1Ref.current, text2Ref.current], {
        y: -50,
        opacity: 0,
        duration: 0.6,
        ease: "power3.in"
      }, "+=1.2");

      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut"
      }, "-=0.3");
      
    }, containerRef);
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[999999] bg-[#ffffff]">
      {/* Layer 2: White background with Text */}
      <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center overflow-hidden gap-3 md:gap-6 px-6">
        <span 
          ref={text1Ref} 
          className="font-sans font-black text-[12vw] md:text-[7vw] leading-none uppercase tracking-[0.2em] text-[#0a0a0a]" 
          style={{ willChange: 'transform, filter' }}
        >
          PORTFOLIO
        </span>
        <span 
          ref={text2Ref} 
          className="font-sans font-medium text-[12vw] md:text-[7vw] leading-none tracking-tight text-accent"
          style={{ willChange: 'transform, filter' }}
        >
          Pronto.
        </span>
      </div>

      {/* Layer 1: Black Split Doors */}
      <div ref={leftDoorRef} className="absolute top-0 left-0 w-1/2 h-full bg-[#0a0a0a] origin-left border-r border-[#0a0a0a]"></div>
      <div ref={rightDoorRef} className="absolute top-0 right-0 w-1/2 h-full bg-[#0a0a0a] origin-right border-l border-[#0a0a0a]"></div>
      
      {/* Center Liquid Blob */}
      <div 
        ref={sliceRef} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-accent rounded-full scale-0 animate-morph"
        style={{ boxShadow: '0 0 40px rgba(255, 59, 48, 1)' }}
      ></div>
    </div>
  );
};

// ==========================================
// COMPONENT: Curved Icon Carousel
// ==========================================
const IconCarousel = () => {
  const carouselRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const itemRefs = React.useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Scroll the track horizontally linked to vertical scroll
      gsap.to(trackRef.current, {
        xPercent: -15, // slower speed
        ease: "none",
        scrollTrigger: {
          trigger: carouselRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
      
      // 2. Animate the Y position based on distance to center of screen to form an arc
      const updateYPositions = () => {
        const centerX = window.innerWidth / 2;
        itemRefs.current.forEach((el) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const elCenterX = rect.left + rect.width / 2;
          const distance = Math.abs(centerX - elCenterX);
          // Calculate rotation to make items follow the tangent of the curve
          const y = Math.pow(distance * 0.005, 2) * 15;
          const sign = elCenterX < centerX ? -1 : 1;
          const slope = 2 * (0.005 * 0.005 * 15) * distance * sign; 
          const angle = Math.atan(slope) * (180 / Math.PI);
          
          gsap.set(el, { y: y, rotation: angle });
        });
      };

      // Hook into GSAP ticker for smooth updates
      gsap.ticker.add(updateYPositions);
      
      return () => gsap.ticker.remove(updateYPositions);
    }, carouselRef);
    return () => ctx.revert();
  }, []);

  const iconsList = [
    <ArrowRight size={20} />,
    <Zap size={20} />,
    <Cpu size={20} />,
    <Layers size={20} />,
    <Layout size={20} />,
    <FileCode2 size={20} />,
    <span className="font-mono font-bold text-lg">{'<>'}</span>,
    <Server size={20} />,
    <Database size={20} />,
    <Code2 size={20} />,
    <Smartphone size={20} />,
    <Globe2 size={20} />,
    <span className="font-mono font-bold text-lg">{'{ }'}</span>,
    <CheckCircle2 size={20} />,
    <Lock size={20} />
  ];

  // Repeat icons to make a long track
  const allIcons = [...iconsList, ...iconsList, ...iconsList, ...iconsList, ...iconsList, ...iconsList, ...iconsList, ...iconsList];

  return (
    <section ref={carouselRef} className="py-24 bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-background to-white/0 z-10 pointer-events-none"></div>
      
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div 
        ref={trackRef} 
        className="flex items-center gap-6 md:gap-10 px-[50vw] w-max relative z-20"
      >
        {allIcons.map((icon, index) => (
          <div 
            key={index}
            ref={el => itemRefs.current[index] = el}
            className="w-16 h-16 rounded-full bg-white/80 border border-gray-200/60 backdrop-blur-sm flex items-center justify-center text-gray-400 shadow-[0_8px_32px_rgba(0,0,0,0.03)] shrink-0"
          >
            {icon}
          </div>
        ))}
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT: Skills
// ==========================================


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

const FloatingAgentOverlay = ({ isActive, code, actionType, actionTitle, onComplete, closeTerminal }) => {
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
    // We assume the title is passed via actionType if it's formatted as "type:Title" or we just pass it explicitly.
    // Wait, let's pass title as a prop.
    // I will change the component props to include title.
    
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    document.body.style.overflow = 'hidden';

    const fullText = `> ${code}`;

    let ctx = gsap.context(() => {
      if (morphRef.current) {
        morphRef.current.style.animation = 'none';
      }

      const tl = gsap.timeline({
        onComplete: () => {
          let currentIndex = 0;
          const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentIndex + 1));
            currentIndex++;
            if (currentIndex >= fullText.length) {
              clearInterval(interval);
              setTimeout(() => {
                 if(onComplete) onComplete();
                 
                 const returnSequence = gsap.timeline({
                   onComplete: () => {
                     setAgentState('idle');
                     if (morphRef.current) {
                       morphRef.current.style.animation = '';
                       gsap.set(morphRef.current, { clearProps: 'borderRadius' });
                     }
                     window.removeEventListener('wheel', preventScroll);
                     window.removeEventListener('touchmove', preventScroll);
                     document.body.style.overflow = '';
                     closeTerminal();
                   }
                 });

                 // 1. Fade out terminal text and box
                 returnSequence.to([textRef.current, morphRef.current], { 
                   autoAlpha: 0, 
                   scale: 0.8, 
                   duration: 0.2, 
                   ease: 'power2.in' 
                 })
                 
                 // 2. Instantly reset position to origin (top-left) while invisible
                 .set(morphRef.current, {
                   width: 56,
                   height: 56,
                   left: 24,
                   top: 24,
                   xPercent: 0,
                   yPercent: 0,
                   scale: 0
                 })
                 
                 // 3. Pop-in animation at the origin
                 .to(morphRef.current, {
                   autoAlpha: 1,
                   scale: 1,
                   duration: 0.5,
                   ease: 'back.out(1.5)'
                 })
                 .to(dotsRef.current, { autoAlpha: 1, duration: 0.3 }, "-=0.3");
                  
               }, 200); 
            }
          }, 5);
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

      tl.to(dotsRef.current, { autoAlpha: 0, duration: 0.1 })
        .to(morphRef.current, {
          left: '50%',
          top: '50%',
          xPercent: -50,
          yPercent: -50,
          width: 24,
          height: 24,
          duration: 0.2,
          ease: 'power2.inOut'
        })
        .to(morphRef.current, {
          width: targetWidth,
          height: targetHeight,
          borderRadius: '16px',
          duration: 0.3,
          ease: 'back.out(1.2)'
        })
        .to(textRef.current, { autoAlpha: 1, duration: 0.2 }, "-=0.1");
      
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
          background: isMasked ? 'white' : 'rgba(15,15,15,0.85)',
          mixBlendMode: isMasked ? 'difference' : 'normal',
          backdropFilter: isMasked ? 'none' : 'blur(16px) saturate(1.8)',
          WebkitBackdropFilter: isMasked ? 'none' : 'blur(16px) saturate(1.8)',
          border: isMasked ? 'none' : '1px solid rgba(255,255,255,0.15)',
          boxShadow: isMasked ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)',
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
          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <div ref={textRef} className={`absolute inset-0 p-5 flex flex-col justify-center font-mono text-xs sm:text-sm text-[#D4D4D4] whitespace-pre-wrap break-words pointer-events-none opacity-0 invisible ${isMasked ? 'hidden' : ''}`}>
          <div className="flex items-center gap-3 mb-3 opacity-40">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[9px] tracking-widest uppercase text-white/50">Vibe.AI Liquid Agent</span>
          </div>
          {actionTitle && (
            <div className="text-white mb-4 font-sans font-bold tracking-wide text-sm sm:text-base uppercase opacity-90">
              {actionTitle}
            </div>
          )}
          <div>
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
    <section id="hero" className="glow-section relative min-h-[90vh] w-full pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden bg-background bg-dot-pattern flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-background pointer-events-none z-0"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Left Column: Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <div className="hero-anim gsap-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Engenharia Web de Alta Performance
          </div>
          
          <h1 className="hero-anim gsap-reveal font-serif text-4xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-primary mb-6 leading-[1.05]">
            Construindo a <br /><span className="italic text-accent">nova era</span><br />
            das interfaces.
          </h1>
          
          <p className="hero-anim gsap-reveal text-primary/60 text-lg md:text-xl max-w-xl mb-12 font-sans font-light">
            Especialista em criar experiências digitais premium que unem design sofisticado, arquitetura escalável e animações ultra-fluidas.
          </p>
          
          <div className="hero-anim gsap-reveal flex flex-wrap items-center justify-start gap-4">
            <a href="#projects" onClick={(e) => triggerAction(e, "document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });", 'scroll', 'Navegando para Projetos', () => document.getElementById('projects').scrollIntoView({behavior: 'smooth'}))} className="btn-pill btn-pill-dark px-8 py-4 text-base shadow-xl shadow-primary/10">
              Explorar Projetos
            </a>
            <a href="/cv.png" download="Yan_Dutra_CV.png" onClick={(e) => {
              triggerAction(e, "const a = document.createElement('a');\na.href = '/cv.png';\na.download = 'Yan_Dutra_CV.png';\na.click();", 'download', 'Baixando Currículo', () => {
                const link = document.createElement('a');
                link.href = '/cv.png';
                link.download = 'Yan_Dutra_CV.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              });
            }} className="btn-pill btn-pill-light px-8 py-4 text-base">
              Baixar CV
            </a>
          </div>
        </div>

        {/* Right Column: 3D Element */}
        <div className="hidden md:flex w-full md:w-1/2 h-[600px] relative items-center justify-center spline-container">
          {/* Container de "Corte" (Crop) para esconder a marca d'água no canto inferior direito */}
          <div className="absolute w-[120%] h-[120%] overflow-hidden hero-anim gsap-reveal z-0">
            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            {/* O Iframe fica consideravelmente maior que o container pai para garantir que a logo suma totalmente */}
            <iframe 
              src="https://my.spline.design/stackableglasscopy-GJYXfEaZyggI8lWBXyBJAesP-R6x/" 
              frameBorder="0" 
              width="100%" 
              height="100%"
              title="Spline 3D Model"
              style={{ 
                backgroundColor: 'transparent',
                width: '115%', // Aumentamos mais
                height: '115%', // Aumentamos mais
                position: 'absolute',
                top: '-5%', // Subimos um pouco para centralizar o modelo compensando o aumento
                left: '-5%',
                pointerEvents: 'auto'
              }}
              className="relative z-10 opacity-95"
            ></iframe>

            {/* Overlay invisível no cantinho para bloquear qualquer clique residual */}
            <div className="absolute bottom-0 right-0 w-60 h-40 z-20 pointer-events-auto bg-transparent"></div>
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
    <section id="about" className="reveal-section py-16 md:py-24 bg-background">
      <div className="container-custom">
        <div className="reveal-up gsap-reveal mb-16">
          <div className="flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Sobre Mim
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-primary leading-tight">
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
                Baseado em<br/>
                <span className="text-white/50">Paranaguá</span>
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
                Desenvolvedor Front-end Vibe Coder — transformo ideias em interfaces de alto impacto usando IA como copiloto e código de alta performance como motor.
              </p>
              <div className="flex items-center gap-1 text-accent">
                {[1,2,3,4,5].map(i => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
            </div>
            
            <div className="reveal-up gsap-reveal bento-card p-8 flex-1 flex items-center gap-4 bg-accent text-white border-none shadow-[0_10px_30px_rgba(255,59,48,0.2)]">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shrink-0 overflow-hidden border-2 border-white">
                <img src="/yan-photo.jpg" loading="lazy" decoding="async" alt="Yan Dutra" className="w-full h-full object-cover object-[35%_15%] rounded-xl" style={{ objectPosition: '35% 15%' }} />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight italic">
                  "Vibe Coder — onde a IA amplifica a criatividade humana."
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
    <section id="skills" className="reveal-section py-16 md:py-24 bg-white border-y border-black/5">
      <div className="container-custom">
        <div className="reveal-up gsap-reveal text-center mb-20">
          <div className="inline-flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Stack Tecnológico
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-primary leading-tight">
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
// COMPONENT: Projects (Timeline)
// ==========================================
const Projects = ({ triggerAction }) => {
  const projects = [
    { year: "2025", title: "Seu Negócio", desc: "O próximo grande projeto pode ser o seu. Vamos transformar sua ideia em uma experiência digital de alto impacto.", url: "#contact", tech: ["React", "Next.js", "Tailwind", "GSAP"] },
    { year: "—", title: "Em Breve", desc: "Novo projeto em desenvolvimento. Fique atento.", url: "", tech: ["???"] },
    { year: "—", title: "Em Breve", desc: "Mais um projeto está a caminho. Detalhes em breve.", url: "", tech: ["???"] },
  ];

  const [activeProject, setActiveProject] = React.useState(null);
  const modalRef = useRef(null);
  const overlayBgRef = useRef(null);
  const modalContentRef = useRef(null);

  // GSAP Modal Animation
  useEffect(() => {
    if (activeProject !== null) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.to(overlayBgRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
          .fromTo(modalContentRef.current, 
            { y: 50, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
            "-=0.1"
          );
      }, modalRef);
      return () => ctx.revert();
    } else {
      document.body.style.overflow = '';
    }
  }, [activeProject]);

  const closeModal = () => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setActiveProject(null) });
      tl.to(modalContentRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in" })
        .to(overlayBgRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
    }, modalRef);
  };

  return (
    <section id="projects" className="reveal-section relative bg-[#030303] text-white py-24 border-y border-white/5 overflow-hidden">
      <div className="container-custom relative z-10">
        
        {/* Header */}
        <div className="reveal-up gsap-reveal mb-20 text-center">
          <div className="inline-flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Histórico
          </div>
          <h2 className="font-serif text-4xl md:text-6xl tracking-tight leading-none text-white">
            Projetos.
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-[20px] md:left-1/2 w-px bg-white/10 md:-translate-x-1/2"></div>

          <div className="flex flex-col gap-12">
            {projects.map((proj, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`reveal-up gsap-reveal relative flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full bg-[#030303] border-2 border-[#ff3b30] -translate-x-[7.5px] md:-translate-x-1/2 mt-1 md:mt-0 z-10 shadow-[0_0_15px_rgba(255,59,48,0.5)]"></div>

                  {/* Content Box */}
                  <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                    <div 
                      onClick={() => setActiveProject(i)}
                      className="group cursor-pointer p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest mb-2 block">{proj.year}</span>
                      <h3 className="text-2xl font-serif mb-2 group-hover:text-accent transition-colors">{proj.title}</h3>
                      <p className="text-sm text-white/50 font-mono mb-4 line-clamp-2">{proj.desc}</p>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white/30 group-hover:text-white/70 transition-colors flex items-center gap-1 ${isEven ? 'md:justify-end' : ''}">
                        Ler Mais <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal / Pop-up */}
      <div 
        ref={modalRef} 
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none ${activeProject !== null ? 'pointer-events-auto' : ''}`}
      >
        <div 
          ref={overlayBgRef} 
          onClick={closeModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0"
        ></div>

        {activeProject !== null && (
          <div 
            ref={modalContentRef}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl opacity-0 overflow-hidden flex flex-col"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>

            <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest mb-4 block">
              {projects[activeProject].year}
            </span>
            
            <h3 className="text-4xl font-serif mb-6">{projects[activeProject].title}</h3>
            
            <div className="h-px w-full bg-gradient-to-r from-accent/50 to-transparent mb-6"></div>
            
            <p className="text-base text-white/70 font-mono leading-relaxed mb-8">
              {projects[activeProject].desc}
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {projects[activeProject].tech.map(t => (
                <span key={t} className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-white/10 text-white/60 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-auto flex justify-end">
              {projects[activeProject].url && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerAction(e, `window.open('${projects[activeProject].url}', '_blank');`, 'link', `Acessando ${projects[activeProject].title}`, () => window.open(projects[activeProject].url, '_blank'));
                  }}
                  className="px-6 py-3 bg-accent text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Globe2 size={14} />
                  Acessar Projeto
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </section>
  );
};

// ==========================================
// COMPONENT: Animated Stats for Contact Section (Odometer)
// ==========================================
const AnimatedStats = ({ isHovered }) => {
  const unitsRef = useRef(null);
  const plusRef = useRef(null);
  const questionRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    // Kill any running tweens to prevent stacking on rapid hover
    if (tweenRef.current) {
      tweenRef.current.kill();
    }
    gsap.killTweensOf([unitsRef.current, plusRef.current, questionRef.current]);

    if (isHovered) {
      const tl = gsap.timeline();
      tl.to(unitsRef.current, {
        y: '-50%',
        duration: 0.6,
        ease: 'back.out(1.4)',
      })
      .to(plusRef.current, { opacity: 0, y: -15, duration: 0.25, ease: 'power2.in' }, 0)
      .fromTo(questionRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, delay: 0.2, ease: 'power2.out' }, 0
      );
      tweenRef.current = tl;
    } else {
      const tl = gsap.timeline();
      tl.to(unitsRef.current, {
        y: '0%',
        duration: 0.5,
        ease: 'power2.out',
      })
      .to(questionRef.current, { opacity: 0, y: 15, duration: 0.25, ease: 'power2.in' }, 0)
      .to(plusRef.current, { opacity: 1, y: 0, duration: 0.35, delay: 0.15, ease: 'power2.out' }, 0);
      tweenRef.current = tl;
    }
  }, [isHovered]);

  return (
    <div className="text-7xl md:text-9xl font-sans font-black tracking-tighter text-white mb-2 flex items-baseline select-none">
      <span>1</span>
      <span>0</span>
      <div className="relative overflow-hidden" style={{ height: '1em', width: '0.62em' }}>
        <div ref={unitsRef} className="flex flex-col" style={{ transform: 'translateY(0%)' }}>
          <span className="block leading-none" style={{ height: '1em' }}>0</span>
          <span className="block leading-none text-[#ff3b30]" style={{ height: '1em' }}>1</span>
        </div>
      </div>
      <div className="relative" style={{ width: '0.62em', height: '1em' }}>
        <span ref={plusRef} className="absolute inset-0 flex items-baseline justify-start text-[#ff3b30]">+</span>
        <span ref={questionRef} className="absolute inset-0 flex items-baseline justify-start text-[#ff3b30] opacity-0">?</span>
      </div>
    </div>
  );
};
// ==========================================
// COMPONENT: Contact (Stats & Footer)
// ==========================================
const Contact = ({ triggerAction }) => {
  const [isHovered, setIsHovered] = React.useState(false);

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
             <AnimatedStats isHovered={isHovered} />
             <p className="text-white/50 font-medium uppercase tracking-widest text-sm">Projetos & Repositórios</p>
          </div>

          <div 
            className="reveal-up gsap-reveal flex-1 w-full bento-card-dark p-10 md:p-14 bg-gradient-to-br from-[#111] to-[#0a0a0a] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8">
               <Mail size={24} className="text-accent" />
             </div>
             <h3 className="font-serif text-4xl mb-8">Pronto para inovar?</h3>
             <a href="mailto:yancdutra@gmail.com" className="inline-flex items-center justify-between w-full bg-white text-black px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors">
                <span>yancdutra@gmail.com</span>
                <ArrowRight size={20} />
             </a>
          </div>

        </div>

        <div className="reveal-up gsap-reveal flex flex-col md:flex-row justify-between items-center text-xs font-sans font-medium text-white/40 border-t border-white/10 pt-8">
          <p className="mb-4 md:mb-0">© 2026 VibeCoder. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/yan-dutra" onClick={(e) => triggerAction(e, `window.open('https://www.linkedin.com/in/yan-dutra', '_blank');`, 'link', 'Abrindo LinkedIn', () => window.open('https://www.linkedin.com/in/yan-dutra', '_blank'))} className="hover:text-white transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn
            </a>
            <a href="https://github.com/yDrakkosz" onClick={(e) => triggerAction(e, `window.open('https://github.com/yDrakkosz', '_blank');`, 'link', 'Abrindo GitHub', () => window.open('https://github.com/yDrakkosz', '_blank'))} className="hover:text-white transition-colors flex items-center gap-2">
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
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [terminalState, setTerminalState] = React.useState({
    isActive: false,
    code: '',
    actionType: 'scroll',
    actionTitle: '',
    onComplete: null
  });

  // Force scroll reset on reload
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Initial Intro Animation separated from main GSAP to wait for LoadingScreen
  useEffect(() => {
    if (isLoading) return;
    let ctx = gsap.context(() => {
      const introTl = gsap.timeline();
      introTl.fromTo('.navbar', 
        { y: -100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      )
      .fromTo('.hero-anim', 
        { y: 40, autoAlpha: 0, rotationX: 5, transformOrigin: "bottom center" },
        { y: 0, autoAlpha: 1, rotationX: 0, duration: 1, ease: 'power3.out', stagger: 0.1 },
        "-=0.4"
      );
    }, comp);
    return () => ctx.revert();
  }, [isLoading]);

  const triggerCodeAction = (e, codeStr, actionType, actionTitleStr, actionCb) => {
    if(e && e.currentTarget) {
      e.preventDefault();
      const el = e.currentTarget;
      const target = el.querySelector('svg') || el; // Target icon if exists
      
      if (actionType === 'scroll') {
        gsap.to(target, { y: 8, yoyo: true, repeat: 3, duration: 0.15 });
      } else if (actionType === 'download') {
        gsap.to(target, { y: 6, scale: 0.9, yoyo: true, repeat: 3, duration: 0.15 });
      } else if (actionType === 'open') {
        gsap.to(target, { scale: 0.8, yoyo: true, repeat: 1, duration: 0.15 });
      } else {
        gsap.to(target, { scale: 0.85, yoyo: true, repeat: 1, duration: 0.1 });
      }
    } else if (e) {
      e.preventDefault();
    }
    
    setTerminalState({ 
      isActive: true, 
      code: codeStr, 
      actionType: actionType,
      actionTitle: actionTitleStr,
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
          document.documentElement.style.setProperty('--mouse-x', e.pageX);
          document.documentElement.style.setProperty('--mouse-y', e.pageY);
          
          // Local mask variables for glowing dot patterns
          document.querySelectorAll('.glow-section').forEach(section => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            section.style.setProperty('--mouse-local-x', `${x}px`);
            section.style.setProperty('--mouse-local-y', `${y}px`);
          });

          xTo(e.clientX);
          yTo(e.clientY);
        });

        let isHoveringInteractive = false;

        const updateCursor = () => {
          if (isHoveringInteractive) {
            gsap.to(cursorRef.current, { 
              width: 56,
              height: 56,
              duration: 0.3, 
              ease: 'back.out(1.5)',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderColor: 'rgba(255, 59, 48, 0.8)',
              borderWidth: '1px'
            });
          } else {
            gsap.to(cursorRef.current, { 
              width: 16,
              height: 16,
              duration: 0.3, 
              ease: 'power2.out',
              backgroundColor: 'rgba(200, 200, 200, 0.15)',
              borderColor: 'rgba(150, 150, 150, 0.2)',
              borderWidth: '1px'
            });
          }
        };

        // Interactive elements trigger expansion
        const interactiveElements = document.querySelectorAll('a, button, .bento-card, .bento-card-dark, .btn-pill, .btn-pill-dark, .btn-pill-light');
        interactiveElements.forEach(el => {
          el.addEventListener('mouseenter', () => { isHoveringInteractive = true; updateCursor(); });
          el.addEventListener('mouseleave', () => { isHoveringInteractive = false; updateCursor(); });
        });

        // Hide custom cursor over Spline so it doesn't freeze or overlap
        const splineContainer = document.querySelector('.spline-container');
        if (splineContainer) {
          splineContainer.addEventListener('mouseenter', () => {
            gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
          });
          splineContainer.addEventListener('mouseleave', () => {
            gsap.to(cursorRef.current, { opacity: 1, duration: 0.2 });
          });
        }
      }
      
      // 1. Initial State Hiding (Revealed by introTl after LoadingScreen)
      gsap.set('.navbar', { opacity: 0, y: -100 });
      gsap.set('.hero-anim', { autoAlpha: 0, y: 40 });

      // 2. Removed ScrollTrigger for navbar to maintain constant glassmorphism visibility

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
    <>
      <CanvasDots />
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <div ref={comp} className="font-sans antialiased bg-background text-primary selection:bg-accent selection:text-white relative z-10">
        {/* Custom Cursor */}
        <div ref={cursorRef} className="custom-cursor hidden md:block"></div>

      {/* Floating Agent Overlay */}
      <FloatingAgentOverlay {...terminalState} closeTerminal={closeTerminal} />

      {/* Navbar with solid dark glassmorphism to guarantee visibility on any background */}
      <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full w-[90%] max-w-4xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="font-sans font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer text-white" onClick={(e) => triggerCodeAction(e, "window.scrollTo({ top: 0, behavior: 'smooth' });", 'scroll', 'Retornando ao Topo', () => window.scrollTo({top: 0, behavior: 'smooth'}))}>
          Yan
        </div>
        <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium transition-colors text-white/70 hover:text-white">
          <a href="#about" onClick={(e) => triggerCodeAction(e, "document.getElementById('about').scrollIntoView({ behavior: 'smooth' });", 'scroll', 'Acessando Sobre Mim', () => document.getElementById('about').scrollIntoView({behavior: 'smooth'}))} className="transition-colors hover:text-white">Sobre</a>
          <a href="#skills" onClick={(e) => triggerCodeAction(e, "document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });", 'scroll', 'Acessando Habilidades', () => document.getElementById('skills').scrollIntoView({behavior: 'smooth'}))} className="transition-colors hover:text-white">Habilidades</a>
          <a href="#projects" onClick={(e) => triggerCodeAction(e, "document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });", 'scroll', 'Acessando Projetos', () => document.getElementById('projects').scrollIntoView({behavior: 'smooth'}))} className="transition-colors hover:text-white">Projetos</a>
        </div>
        <a href="#contact" onClick={(e) => triggerCodeAction(e, "window.location.href = '#contact';", 'scroll', 'Iniciando Contato', () => window.location.href = '#contact')} className="px-5 py-2 text-sm shrink-0 font-bold bg-white text-black rounded-full hover:bg-white/90 transition-colors">
          Iniciar Projeto
        </a>
      </nav>

      <main>
        <Hero triggerAction={triggerCodeAction} />
        <About />
        <IconCarousel />
        <Skills />
        <Projects triggerAction={triggerCodeAction} />
        <Contact triggerAction={triggerCodeAction} />
      </main>
    </div>
    </>
  );
}

export default App;


