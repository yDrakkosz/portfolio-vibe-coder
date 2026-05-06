const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Remove old Html import if we want, but we can leave it or remove it. Let's leave it to be safe, maybe it's used elsewhere.
// Actually, it's imported from '@react-three/drei'. Let's leave it.

// 2. Replace OrbitalPlanet
const orbitalPlanetRegex = /const OrbitalPlanet = \(\{.*?return \([\s\S]*?\}\);\s*\n\};\s*\n/m;
const newOrbitalPlanet = `const OrbitalPlanet = ({ project, index, isLast, planetPositions, isActive, isHidden, onSelect, triggerAction }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  const planetColor = isLast ? '#ffffff' : '#ff3b30';
  const planetSize = isLast ? 0.18 : 0.14;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(planetPositions.current[index]);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Planet sphere */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(index); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={planetColor}
          emissiveIntensity={hovered ? 1.2 : 0.6}
        />
      </mesh>

      {/* Planet glow */}
      <pointLight color={planetColor} intensity={0.4} distance={3} />

      {/* Label (always visible) */}
      <Html position={[0, -0.35, 0]} center style={{ pointerEvents: 'none' }}>
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/50 whitespace-nowrap select-none">
          {isLast ? 'Em Breve' : project.title}
        </span>
      </Html>
    </group>
  );
};
`;
content = content.replace(orbitalPlanetRegex, newOrbitalPlanet);

// 3. Replace SceneManager
const sceneManagerRegex = /const SceneManager = \(\{.*?return \([\s\S]*?\}\);\s*\n\};\s*\n/m;
const newSceneManager = `const SceneManager = ({ activeNode, projects, orbitConfigs, isPaused, anglesRef, planetPositions, triggerAction, setActiveNode }) => {
  const controlsRef = useRef();
  
  useFrame((state, delta) => {
    // 1. Update planet positions (always rotating)
    for(let i=0; i<anglesRef.current.length; i++) {
       anglesRef.current[i] += delta * orbitConfigs[i].speed;
    }
    for(let i=0; i<planetPositions.current.length; i++) {
       const a = anglesRef.current[i];
       const r = orbitConfigs[i].radius;
       planetPositions.current[i].set(
         Math.cos(a) * r,
         Math.sin(a * 0.5) * 0.3,
         Math.sin(a) * r
       );
    }
    
    // 2. Camera gently returns to base target if it was moved previously
    if (controlsRef.current) {
       controlsRef.current.target.lerp(new THREE.Vector3(0,0,0), 0.05);
       controlsRef.current.update();
    }
  });

  return (
    <>
      <OrbitControls 
        ref={controlsRef} 
        enableDamping 
        dampingFactor={0.05}
        enableZoom={false} 
        enablePan={false} 
        autoRotate={true} 
        autoRotateSpeed={0.15} 
        maxDistance={25} 
        minDistance={2} 
        maxPolarAngle={Math.PI / 1.5}
      />

      <GargantuaCenter isHidden={false} />

      {orbitConfigs.map((cfg, i) => (
        <OrbitRing key={i} radius={cfg.radius} isHidden={false} />
      ))}

      {projects.map((proj, i) => (
        <OrbitalPlanet
          key={i}
          project={proj}
          index={i}
          isLast={i === projects.length - 1}
          planetPositions={planetPositions}
          isActive={false}
          isHidden={false}
          onSelect={(idx) => setActiveNode(idx)}
          triggerAction={triggerAction}
        />
      ))}
    </>
  );
};
`;
content = content.replace(sceneManagerRegex, newSceneManager);

// 4. Add ProjectOverlay before SolarSystem3D
const projectOverlayCode = `
// ==========================================
// COMPONENT: ProjectOverlay
// ==========================================
const ProjectOverlay = ({ activeNode, projects, setActiveNode, triggerAction }) => {
  const overlayRef = useRef(null);
  const redDotRef = useRef(null);
  const contentRef = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  // We need to store the currently animating project in case activeNode changes quickly
  const [currentProject, setCurrentProject] = React.useState(null);

  useEffect(() => {
    if (activeNode !== null) {
      setCurrentProject(projects[activeNode]);
      setIsVisible(true);
      document.body.style.overflow = 'hidden';

      let ctx = gsap.context(() => {
        const tl = gsap.timeline();
        
        // Animação de entrada
        // 1. Ponto vermelho cresce até cobrir a tela
        tl.fromTo(redDotRef.current, 
          { scale: 0, opacity: 1 }, 
          { scale: 150, duration: 0.8, ease: "power3.inOut" }
        );
        
        // 2. Transforma o fundo em escuro (fade) e revela o conteúdo
        tl.to(redDotRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" });
        tl.fromTo(contentRef.current, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.3"
        );
      }, overlayRef);
      return () => ctx.revert();
    } else {
      if (isVisible) {
        let ctx = gsap.context(() => {
          const tl = gsap.timeline({
            onComplete: () => {
              setIsVisible(false);
              setCurrentProject(null);
              document.body.style.overflow = '';
            }
          });
          
          // Animação de saída inversa
          tl.to(contentRef.current, { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" });
          tl.to(redDotRef.current, { opacity: 1, duration: 0.3, ease: "power2.in" });
          tl.to(redDotRef.current, { scale: 0, duration: 0.6, ease: "power3.inOut" });
        }, overlayRef);
        return () => ctx.revert();
      }
    }
  }, [activeNode, projects, isVisible]);

  if (!isVisible && activeNode === null) return null;

  const proj = currentProject || projects[0]; // fallback
  const isLast = currentProject?.title === "Projeto Nebulosa";

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* Background que fica escuro após a transição vermelha */}
      <div className={\`absolute inset-0 bg-[#0a0a0a] transition-opacity duration-500 \${activeNode !== null ? 'opacity-100' : 'opacity-0'}\`}></div>
      
      {/* Ponto vermelho que se expande */}
      <div 
        ref={redDotRef}
        className="absolute left-1/2 top-1/2 w-[2vw] h-[2vw] min-w-[30px] min-h-[30px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3b30]"
      ></div>

      {/* Conteúdo principal */}
      <div ref={contentRef} className="relative z-10 w-full h-full p-6 md:p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 pointer-events-auto opacity-0">
        
        {/* Lado Esquerdo: Placeholder para Foto/Vídeo */}
        <div className="w-full lg:w-1/2 max-w-3xl aspect-video rounded-lg border border-white/10 bg-black/50 relative overflow-hidden group flex items-center justify-center shadow-2xl">
           {/* Cyberpunk grid overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
           
           <div className="flex flex-col items-center justify-center text-white/20 font-mono text-[10px] md:text-xs uppercase tracking-widest gap-4 text-center p-4">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:border-white/40 transition-all duration-500">
                <span className="opacity-50 group-hover:opacity-100">+</span>
              </div>
              [ ESPAÇO RESERVADO PARA MÍDIA ]
           </div>

           {/* Corner decorations */}
           <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20"></div>
           <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20"></div>
           <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20"></div>
           <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20"></div>
        </div>

        {/* Lado Direito: Descrição */}
        <div className="w-full lg:w-1/2 max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left">
          {isLast && <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff3b30] font-mono animate-pulse mb-4 block">{">> STATUS: CONFIDENCIAL"}</span>}
          
          <h2 className={\`font-serif tracking-tight leading-none text-4xl md:text-6xl mb-6 \${isLast ? 'text-white/40' : 'text-white'}\`}>
            {proj.title}
          </h2>

          <div className="flex gap-1 mb-8">
            <div className="h-px bg-[#ff3b30]/60 w-24"></div>
            <div className="h-px bg-[#ff3b30]/30 w-8"></div>
            <div className="h-px bg-[#ff3b30]/10 w-4"></div>
          </div>

          <p className="text-sm md:text-base font-mono text-white/70 mb-10 leading-relaxed tracking-wide">
            {proj.desc}
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-12">
            {proj.tech.map(t => (
              <span key={t} className={\`px-3 py-1.5 text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-[0.2em] \${isLast ? 'text-white/20 border border-white/10' : 'text-[#ff3b30]/80 border border-[#ff3b30]/20'}\`}>
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 mt-auto">
            {!isLast && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  triggerAction(e, \`await System.deploy({\\n  project: '\${proj.title}',\\n  target: 'production'\\n});\\n\\n// Acessando preview em tempo real...\`, 'link', \`Acessando \${proj.title}\`, () => { console.log('Projeto aberto:', proj.title) });
                }}
                className="py-4 px-8 bg-[#ff3b30] text-black font-mono font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-white transition-colors w-full sm:w-auto"
              >
                Acessar
              </button>
            )}
            <button 
              onClick={() => setActiveNode(null)} 
              className="py-4 px-6 text-white/50 hover:text-white font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>✕</span> FECHAR
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const SolarSystem3D =`;

content = content.replace("const SolarSystem3D =", projectOverlayCode);

// 5. Replace SolarSystem3D completely
const solarSystemRegex = /const SolarSystem3D = \(\{.*?return \([\s\S]*?\}\);\s*\n\};\s*\n/m;
const newSolarSystem = `const SolarSystem3D = ({ projects, triggerAction }) => {
  const [activeNode, setActiveNode] = React.useState(null);

  const orbitConfigs = useMemo(() => [
    { radius: 2.2, speed: 0.35, initialAngle: 0 },
    { radius: 3.2, speed: 0.22, initialAngle: 2.1 },
    { radius: 4.2, speed: 0.15, initialAngle: 4.2 },
    { radius: 5.5, speed: 0.09, initialAngle: 1.5 },
  ], []);

  const anglesRef = useRef(orbitConfigs.map(c => c.initialAngle));
  const planetPositions = useRef(orbitConfigs.map(() => new THREE.Vector3()));

  return (
    <div className="w-full h-screen relative bg-[#030303] cursor-grab active:cursor-grabbing overflow-hidden z-0">
      {/* Help tooltip to inform interaction */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase pointer-events-none z-10 flex flex-col items-center gap-2">
        <span>[ ARRASTE PARA EXPLORAR ]</span>
      </div>

      <ProjectOverlay 
         activeNode={activeNode} 
         projects={projects} 
         setActiveNode={setActiveNode} 
         triggerAction={triggerAction} 
      />

      <Canvas
        camera={{ position: [7, 3.5, 7], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#030303' }}
      >
        <ambientLight intensity={0.08} />
        <Stars radius={80} depth={60} count={3000} factor={3} saturation={0} fade speed={0.5} />
        
        <SceneManager 
           activeNode={activeNode} 
           projects={projects} 
           orbitConfigs={orbitConfigs} 
           anglesRef={anglesRef} 
           planetPositions={planetPositions} 
           triggerAction={triggerAction}
           setActiveNode={setActiveNode}
        />
      </Canvas>
    </div>
  );
};
`;
content = content.replace(solarSystemRegex, newSolarSystem);

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.jsx refactored successfully.');
