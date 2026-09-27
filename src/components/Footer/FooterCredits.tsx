import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { IconGithub, IconLinkedin, IconInstagram, IconGmail } from './Icons';
import styles from './FooterCredits.module.css';

const ExplodingHeart = ({ globalExploded, sequenceStarted }: { globalExploded: boolean, sequenceStarted: boolean }) => {
  const [bpm, setBpm] = useState(60);

  useEffect(() => {
    if (sequenceStarted && !globalExploded) {
      // It has exactly 3 seconds to go from 60 to 300
      // 3000ms / 100ms = 30 intervals. 240 / 30 = 8 bpm per 100ms.
      const interval = setInterval(() => {
         setBpm(prev => prev + 8);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [sequenceStarted, globalExploded]);

  return (
    <span className={styles.heartContainer}>
      {globalExploded ? (
        <span className={styles.explosion}>💥</span>
      ) : (
        <>
          <Heart 
            className={styles.heart} 
            style={{ 
              animation: sequenceStarted ? `heartbeat ${60 / bpm}s infinite` : 'none', 
              transform: `scale(${1 + (bpm - 60) / 200})`,
              color: sequenceStarted ? '#ef4444' : 'var(--color-text-secondary)',
              fill: sequenceStarted ? '#ef4444' : 'transparent'
            }}
          />
          <span className={styles.mobileHint}>click me</span>
        </>
      )}
    </span>
  );
};

const ColorfulExplosion = ({ triggerCount, particleCount = 150 }: { triggerCount: number, particleCount?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (triggerCount === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    canvas.width = rect.width;
    canvas.height = rect.height;

    const particles: any[] = [];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 30, // Wide spread
        vy: (Math.random() - 1) * 25 - 5, // High jump
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.01 + 0.005
      });
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5; // gravity
          p.life -= p.decay;
          
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (active) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [triggerCount, particleCount]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />;
};

const Plaque = ({ href, icon: Icon, label, delay, hoverColor }: { href: string, icon: any, label: string, delay: string, hoverColor: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    
    ref.current.style.setProperty('--rx', `${rotateX}deg`);
    ref.current.style.setProperty('--ry', `${rotateY}deg`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!ref.current) return;
    ref.current.style.setProperty('--rx', `0deg`);
    ref.current.style.setProperty('--ry', `0deg`);
  };

  return (
    <div className={styles.plaqueWrapper} style={{ animationDelay: delay }}>
      <a 
        ref={ref}
        href={href} 
        target={href.startsWith('http') ? "_blank" : undefined}
        rel={href.startsWith('http') ? "noreferrer" : undefined}
        className={styles.linkPlaque}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Icon size={16} color={isHovered ? hoverColor : 'currentColor'} style={{ transition: 'color 0.3s ease' }} /> 
        <span className={styles.linkText}>{label}</span>
      </a>
    </div>
  );
};

export const FooterCredits: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const [explosionCount, setExplosionCount] = useState(0);
  const [particleCount, setParticleCount] = useState(150);
  const [sequenceStarted, setSequenceStarted] = useState(false);
  const [isHeartExploded, setIsHeartExploded] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasTriggered) {
        setIsVisible(true);
        setHasTriggered(true);
        setParticleCount(150);
        setExplosionCount(c => c + 1);
      }
    }, { threshold: 0.1 });

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [hasTriggered]);

  const handleMarqueeHover = () => {
    if (!sequenceStarted && !isHeartExploded) {
      setSequenceStarted(true);
      setTimeout(() => {
        setIsHeartExploded(true);
        setParticleCount(400); // Massive explosion
        setExplosionCount(c => c + 1);
      }, 3000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    footerRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    footerRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const marqueeContent = Array(10).fill(0).map((_, i) => (
    <span key={i} className={styles.marqueeItem}>
      Made with <ExplodingHeart globalExploded={isHeartExploded} sequenceStarted={sequenceStarted} /> by Aryan Raj<span className={styles.marqueeSeparator}>•</span>
    </span>
  ));

  return (
    <footer ref={footerRef} className={`${styles.footer} ${isHeartExploded ? styles.exploded : ''}`} onMouseMove={handleMouseMove}>
      <ColorfulExplosion triggerCount={explosionCount} particleCount={particleCount} />
      
      {isHeartExploded && <div className={styles.rainbowBorder} />}
      {isHeartExploded && <div className={styles.rainbowAura} />}
      
      <div className={styles.flashlight} />
      <div className={styles.footerGrid} />
      
      <div className={`${styles.contentWrapper} ${isVisible ? styles.visible : ''}`}>
        <div 
          className={`${styles.marqueeContainer} ${sequenceStarted ? styles.preExplosion : ''}`}
          onMouseEnter={handleMarqueeHover}
          onTouchStart={handleMarqueeHover}
        >
          <div className={`${styles.marqueeTrack} ${!isVisible ? styles.paused : ''}`}>
            {marqueeContent}
          </div>
          <div className={`${styles.marqueeTrack} ${!isVisible ? styles.paused : ''}`} aria-hidden="true">
            {marqueeContent}
          </div>
        </div>

        <div className={styles.links}>
          <Plaque href="https://github.com/ThisWasAryan" icon={IconGithub} label="GitHub" delay="0s" hoverColor="#ffffff" />
          <Plaque href="https://linkedin.com/in/thiswasaryan1" icon={IconLinkedin} label="LinkedIn" delay="-1.5s" hoverColor="#3b82f6" />
          <Plaque href="https://instagram.com/drugd3alers" icon={IconInstagram} label="Instagram" delay="-3s" hoverColor="#ec4899" />
          <Plaque href="mailto:hi@thiswasaryan.in" icon={IconGmail} label="Email" delay="-4.5s" hoverColor="#ef4444" />
        </div>
      </div>
    </footer>
  );
};
