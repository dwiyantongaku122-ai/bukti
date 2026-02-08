import { useEffect, useRef } from "react";

interface SnowEffectProps {
  enabled: boolean;
  speed: number;
  amount: number;
  particleSize: number;
  images: string[];
}

interface Snowflake {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  wobble: number;
  wobbleSpeed: number;
  rotation: number;
  rotationSpeed: number;
  imageIndex: number;
}

export function SnowEffect({ enabled, speed, amount, particleSize, images = [] }: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const flakesRef = useRef<Snowflake[]>([]);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (!enabled) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const customImages = (images || []).filter(url => url && url.trim() !== "");
    loadedImagesRef.current = [];

    if (customImages.length > 0) {
      let loadedCount = 0;
      customImages.forEach((url) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          loadedImagesRef.current.push(img);
          loadedCount++;
          if (loadedCount === customImages.length) {
            startAnimation();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === customImages.length) {
            startAnimation();
          }
        };
        img.src = url;
      });
    } else {
      startAnimation();
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function startAnimation() {
      if (!canvas || !ctx) return;
      resize();
      window.addEventListener("resize", resize);

      const count = Math.max(10, Math.min(500, amount));
      const baseSpeed = Math.max(1, Math.min(20, speed));
      const baseSize = Math.max(5, Math.min(100, particleSize));
      const hasImages = loadedImagesRef.current.length > 0;

      flakesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: (Math.random() * 0.6 + 0.7) * baseSize,
        opacity: Math.random() * 0.6 + 0.3,
        speedY: (Math.random() * 1.5 + 0.5) * (baseSpeed / 5),
        speedX: (Math.random() - 0.5) * 0.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.005,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        imageIndex: hasImages ? Math.floor(Math.random() * loadedImagesRef.current.length) : -1,
      }));

      animate();
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hasImages = loadedImagesRef.current.length > 0;

      for (const flake of flakesRef.current) {
        flake.wobble += flake.wobbleSpeed;
        flake.y += flake.speedY;
        flake.x += flake.speedX + Math.sin(flake.wobble) * 0.3;
        flake.rotation += flake.rotationSpeed;

        if (flake.y > canvas.height + flake.size) {
          flake.y = -flake.size;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width + flake.size) flake.x = -flake.size;
        if (flake.x < -flake.size) flake.x = canvas.width + flake.size;

        if (hasImages && flake.imageIndex >= 0 && flake.imageIndex < loadedImagesRef.current.length) {
          const img = loadedImagesRef.current[flake.imageIndex];
          ctx.save();
          ctx.globalAlpha = flake.opacity;
          ctx.translate(flake.x, flake.y);
          ctx.rotate(flake.rotation);
          ctx.drawImage(img, -flake.size / 2, -flake.size / 2, flake.size, flake.size);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.size / 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [enabled, speed, amount, particleSize, images]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
      data-testid="canvas-snow"
    />
  );
}
