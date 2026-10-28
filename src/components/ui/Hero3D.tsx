import React, { useEffect, useRef } from "react";

export const Hero3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth) - 0.5;
      mouseRef.current.targetY = (e.clientY / innerHeight) - 0.5;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        mouseRef.current.targetX = (touch.clientX / innerWidth) - 0.5;
        mouseRef.current.targetY = (touch.clientY / innerHeight) - 0.5;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId = 0;

    interface Point3D {
      x: number;
      y: number;
      z: number;
      r: number;
    }

    interface LineIndex {
      a: number;
      b: number;
      opacity: number;
    }

    const torusVertices: Point3D[] = [];
    const torusLines: LineIndex[] = [];
    const sphereVertices: Point3D[] = [];
    const sphereLines: LineIndex[] = [];

    // Golden Ratio Torus mesh
    const R = 1.3;
    const r = 0.4;
    const uSegments = 16;
    const vSegments = 8;

    for (let i = 0; i < uSegments; i++) {
      const u = (i / uSegments) * Math.PI * 2;
      for (let j = 0; j < vSegments; j++) {
        const v = (j / vSegments) * Math.PI * 2;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        torusVertices.push({ x, y, z, r: 1.5 });
      }
    }

    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const curr = i * vSegments + j;
        const nextU = ((i + 1) % uSegments) * vSegments + j;
        const nextV = i * vSegments + ((j + 1) % vSegments);

        torusLines.push({ a: curr, b: nextU, opacity: 0.15 });
        torusLines.push({ a: curr, b: nextV, opacity: 0.25 });
      }
    }

    // Floating nested sphere vertices
    const sphereRadius = 0.7;
    const latSegs = 8;
    const lonSegs = 12;

    for (let i = 1; i < latSegs; i++) {
      const lat = (i / latSegs) * Math.PI;
      const sinLat = Math.sin(lat);
      const cosLat = Math.cos(lat);

      for (let j = 0; j < lonSegs; j++) {
        const lon = (j / lonSegs) * Math.PI * 2;
        const sinLon = Math.sin(lon);
        const cosLon = Math.cos(lon);

        sphereVertices.push({
          x: sphereRadius * sinLat * cosLon,
          y: sphereRadius * sinLat * sinLon,
          z: sphereRadius * cosLat,
          r: 2,
        });
      }
    }

    const sphereOffset = torusVertices.length;
    const numSpherePoints = sphereVertices.length;

    for (let i = 0; i < latSegs - 1; i++) {
      for (let j = 0; j < lonSegs; j++) {
        const curr = i * lonSegs + j;
        const nextLon = i * lonSegs + ((j + 1) % lonSegs);
        const nextLat = (i + 1) * lonSegs + j;

        sphereLines.push({
          a: sphereOffset + curr,
          b: sphereOffset + nextLon,
          opacity: 0.18,
        });

        if (nextLat < numSpherePoints) {
          sphereLines.push({
            a: sphereOffset + curr,
            b: sphereOffset + nextLat,
            opacity: 0.12,
          });
        }
      }
    }

    const allVertices = [...torusVertices, ...sphereVertices];
    const allLines = [
      ...torusLines,
      ...sphereLines.map((line) => ({
        a: line.a,
        b: line.b,
        opacity: line.opacity,
      })),
    ];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        if (entryWidth === 0 || entryHeight === 0) continue;
        width = entryWidth;
        height = entryHeight;
        canvas.width = entryWidth * dpr;
        canvas.height = entryHeight * dpr;
        canvas.style.width = `${entryWidth}px`;
        canvas.style.height = `${entryHeight}px`;
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }
    });

    resizeObserver.observe(container);

    let angleX = 0.4;
    let angleY = 0.5;
    let angleZ = 0.2;

    const render = () => {
      if (!ctx || width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation using ref without triggering React state re-renders
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const baseRotationSpeed = 0.003;
      const scrollRotationMultiplier = scrollYRef.current * 0.0008;

      angleX += baseRotationSpeed + mouse.y * 0.004;
      angleY += baseRotationSpeed + 0.001 + mouse.x * 0.004;
      angleZ = scrollRotationMultiplier + 0.4;

      const scale = Math.min(width, height) * 0.26;
      const centerX = width * 0.5;
      const centerY = height * 0.52;
      const fovCamDistance = 3.5;

      const projected: { sx: number; sy: number; sz: number; depth: number }[] = [];

      const cx = Math.cos(angleX);
      const sx = Math.sin(angleX);
      const cy = Math.cos(angleY);
      const sy = Math.sin(angleY);
      const cz = Math.cos(angleZ);
      const sz = Math.sin(angleZ);

      for (let i = 0; i < allVertices.length; i++) {
        const v = allVertices[i];
        const x1 = v.x;
        const y1 = v.y * cx - v.z * sx;
        const z1 = v.y * sx + v.z * cx;

        const x2 = x1 * cy + z1 * sy;
        const y2 = y1;
        const z2 = -x1 * sy + z1 * cy;

        const x3 = x2 * cz - y2 * sz;
        const y3 = x2 * sz + y2 * cz;
        const z3 = z2;

        const factor = fovCamDistance / (fovCamDistance + z3);
        const screenX = x3 * factor * scale + centerX;
        const screenY = y3 * factor * scale + centerY;

        projected.push({
          sx: screenX,
          sy: screenY,
          sz: z3,
          depth: factor,
        });
      }

      ctx.save();
      const isDark = document.documentElement.classList.contains("dark");
      const baseLineColor = isDark ? "255, 158, 74" : "180, 110, 40";

      // Render wireframe lines
      for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];
        const p1 = projected[line.a];
        const p2 = projected[line.b];

        if (!p1 || !p2) continue;

        const avgDepth = (p1.depth + p2.depth) * 0.5;
        const lineAlpha = Math.max(0.04, Math.min(0.35, line.opacity * avgDepth * 0.9));

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${baseLineColor}, ${lineAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }

      // Render node vertices
      for (let idx = 0; idx < projected.length; idx++) {
        const p = projected[idx];
        const pRadius = Math.max(0.7, p.depth * 1.5);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, pRadius, 0, Math.PI * 2);

        if (idx % 12 === 0) {
          ctx.fillStyle = "#FF9E4A";
          ctx.shadowColor = "#FF9E4A";
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = isDark ? "rgba(220, 220, 220, 0.4)" : "rgba(40, 40, 40, 0.3)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="hero-canvas-container"
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};
