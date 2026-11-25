/**
 * NYOTA — React 18 Liquid-Silk & Velvet Burgundy Animated Studio Backdrop
 * Combines a custom GLSL fragment shader (satin drapery waves + scroll velocity inertia + pointer aura)
 * mounted via React, with an automatic 2D Canvas smooth silk fallback if WebGL is unavailable.
 */

(function () {
  const e = React.createElement;
  const { useEffect, useRef } = React;

  const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  // Calibrated to the reference velvet plum-burgundy studio + flowing pearlescent blush silk ribbons
  const FRAGMENT_SHADER = `
    precision highp float;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uScroll;
    uniform float uScrollVel;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      mat2 rot = mat2(0.82, -0.57, 0.57, 0.82);
      for (int i = 0; i < 4; i++) {
        v += amp * noise(p);
        p = rot * p * 2.02 + vec2(1.7, 9.2);
        amp *= 0.5;
      }
      return v;
    }

    // Computes a glossy silk fold ridge + soft underside shadow
    vec3 drawSilkRibbon(vec2 p, float centerY, float thickness, float sharpness, float intensity, vec3 baseCol) {
      float d = (p.y - centerY);
      float ridge = exp(-abs(d) * sharpness);
      float core = pow(exp(-abs(d) * (sharpness * 2.8)), 1.5);
      float wideGlow = exp(-abs(d) * (thickness));
      float shadowSide = smoothstep(0.0, -0.18, d) * smoothstep(-0.42, -0.02, d);

      vec3 col = baseCol;
      // Rich shadow under the silk fold for tactile 3D drapery depth
      col *= (1.0 - 0.34 * shadowSide * intensity);

      // Rose-champagne satin body
      vec3 satinRose = vec3(0.76, 0.36, 0.50);
      vec3 blushSilk = vec3(0.96, 0.72, 0.81);
      vec3 pearlCrest = vec3(1.0, 0.92, 0.95);

      col = mix(col, satinRose, clamp(wideGlow * 0.34 * intensity, 0.0, 0.56));
      col += blushSilk * ridge * 0.30 * intensity;
      col += pearlCrest * core * 0.34 * intensity;
      return col;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

      float t = uTime * 0.58;

      // Gentle cursor aura and smooth continuous organic flow (steady constant slow waves)
      vec2 mouseWarp = (uMouse - 0.5) * vec2(0.08, 0.05);
      float flowField = fbm(vec2(p.x * 1.1 - t * 0.32, p.y * 1.3 + t * 0.14 + uScroll * 0.18));
      vec2 q = p + vec2(flowField - 0.5) * 0.045 + mouseWarp * 0.25;

      // 1. Deep Velvet Plum Studio Gradient (richer darker pocket behind left copy)
      vec3 deepWine = vec3(0.12, 0.03, 0.07);
      vec3 richPlum = vec3(0.28, 0.09, 0.17);
      vec3 warmRoseStudio = vec3(0.50, 0.20, 0.32);

      float vignette = smoothstep(1.25, 0.18, length((uv - vec2(0.58, 0.46)) * vec2(1.05, 1.25)));
      vec3 col = mix(deepWine, richPlum, vignette);

      // Warm studio backdrop pocket framing the jar area while keeping copy dark & legible
      float jarGlow = exp(-length((uv - vec2(0.73 + uMouse.x * 0.03, 0.48 - uMouse.y * 0.02)) * vec2(1.35, 1.15)) * 2.4);
      float leftGlow = exp(-length((uv - vec2(0.22, 0.52)) * vec2(1.2, 1.3)) * 2.5);
      col += warmRoseStudio * (jarGlow * 0.46 + leftGlow * 0.12);

      // 2. Smooth Satin Floor Surface Glow (lower studio reflection matching hero pedestal)
      float floorHorizon = smoothstep(0.32, 0.0, uv.y);
      float floorSheen = exp(-abs(uv.y - 0.17) * 14.0) * smoothstep(-0.2, 0.9, uv.x);
      col += vec3(0.62, 0.26, 0.40) * floorHorizon * 0.22;
      col += vec3(0.92, 0.68, 0.77) * floorSheen * 0.18;

      // 3. Sweeping Constant Slow Waves (continuous undulating satin ribbons, bright behind jar/floor)
      float rightBias = mix(0.42, 0.96, smoothstep(-0.15, 0.65, uv.x));

      // Ribbon A: Swooping upward right-side liquid-silk wave behind jar lid
      float waveA = sin(q.x * 2.0 - t * 0.85 + uScroll * 0.18) * 0.075 + cos(q.x * 1.15 - t * 0.52) * 0.028;
      float curveA = 0.06 + q.x * 0.38 + waveA;
      col = drawSilkRibbon(q, curveA, 4.6, 19.0, 0.88 * rightBias, col);

      // Ribbon B: Deep sculpted secondary continuous wave
      float waveB = cos(q.x * 1.75 + t * 0.68 - uScroll * 0.12) * 0.085 + sin(q.x * 0.95 + t * 0.42) * 0.03;
      float curveB = -0.08 + q.x * 0.14 + waveB;
      col = drawSilkRibbon(q, curveB, 3.8, 15.0, 0.44, col);

      // Ribbon C: Sweeping foreground horizon silk stream near bottom edge
      float waveC = sin(q.x * 2.25 - t * 1.05 + uScroll * 0.20) * 0.068 + sin(q.x * 1.2 + t * 0.58) * 0.024;
      float curveC = -0.32 + waveC - q.x * 0.06;
      col = drawSilkRibbon(q, curveC, 5.4, 23.0, 0.90, col);

      // Ribbon D: Delicate fine secondary filament wave gliding counter-phase
      float waveD = cos(q.x * 2.85 + t * 0.82 + uScroll * 0.15) * 0.052;
      float curveD = -0.36 + waveD - q.x * 0.04;
      col = drawSilkRibbon(q, curveD, 7.2, 32.0, 0.50, col);

      // Soft ambient mouse spotlight reflection
      vec2 mCoord = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);
      float mouseSpot = exp(-length(p - mCoord) * 3.0);
      col += vec3(0.94, 0.66, 0.77) * mouseSpot * 0.09;

      // Smooth edge vignette & anti-banding dither
      float outerVig = smoothstep(1.38, 0.35, length((uv - 0.5) * vec2(aspect * 0.72, 1.15)));
      col *= mix(0.62, 1.0, outerVig);

      float dither = (hash21(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
      col = clamp(col + dither, 0.0, 1.0);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[NYOTA Silk Shader]', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function run2DFallback(canvas, stateRef) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    let rafId = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function render(now) {
      const t = now * 0.0007;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = stateRef.current;

      s.smoothMouseX += (s.mouseX - s.smoothMouseX) * 0.06;
      s.smoothMouseY += (s.mouseY - s.smoothMouseY) * 0.06;
      s.smoothScroll += (s.scroll - s.smoothScroll) * 0.08;

      const grad = ctx.createRadialGradient(w * 0.72, h * 0.48, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.9);
      grad.addColorStop(0, '#803450');
      grad.addColorStop(0.5, '#47192b');
      grad.addColorStop(1, '#220913');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Flowing blush silk bezier waves
      const ribbons = [
        { y0: h * 0.18, y1: h * 0.36, amp: 55, speed: 1.0, alpha: 0.24, width: 90 },
        { y0: h * 0.78, y1: h * 0.86, amp: 38, speed: 1.3, alpha: 0.32, width: 65 },
        { y0: h * 0.84, y1: h * 0.89, amp: 24, speed: 0.9, alpha: 0.45, width: 6 }
      ];

      ribbons.forEach((r, idx) => {
        ctx.save();
        ctx.beginPath();
        const offset = s.smoothScroll * 60 + idx * 1.4;
        ctx.moveTo(-40, r.y0 + Math.sin(t * r.speed + offset) * r.amp);
        ctx.bezierCurveTo(
          w * 0.33,
          r.y0 + Math.cos(t * r.speed * 1.1 + offset) * r.amp,
          w * 0.66,
          r.y1 - Math.sin(t * r.speed * 0.9 + offset) * r.amp,
          w + 40,
          r.y1 + Math.cos(t * r.speed + offset) * r.amp * 0.6
        );
        ctx.strokeStyle = `rgba(248, 198, 216, ${r.alpha})`;
        ctx.lineWidth = r.width;
        ctx.filter = r.width > 12 ? 'blur(26px)' : 'blur(2px)';
        ctx.stroke();
        ctx.restore();
      });

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }

  function NyotaSilkBackground() {
    const canvasRef = useRef(null);
    const motionRef = useRef({
      mouseX: 0.5,
      mouseY: 0.5,
      smoothMouseX: 0.5,
      smoothMouseY: 0.5,
      scroll: 0,
      smoothScroll: 0,
      scrollVel: 0,
      lastScrollY: 0
    });

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;

      const state = motionRef.current;
      const onMouseMove = (ev) => {
        state.mouseX = ev.clientX / Math.max(window.innerWidth, 1);
        state.mouseY = 1.0 - ev.clientY / Math.max(window.innerHeight, 1);
      };

      const onScroll = () => {
        const y = window.scrollY || 0;
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        state.scroll = y / maxScroll;
        const delta = y - state.lastScrollY;
        state.scrollVel = Math.max(-1.5, Math.min(1.5, state.scrollVel + delta * 0.015));
        state.lastScrollY = y;
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });

      const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance'
      });

      let cleanupRenderer;

      if (!gl) {
        cleanupRenderer = run2DFallback(canvas, motionRef);
      } else {
        const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        if (!vs || !fs) {
          cleanupRenderer = run2DFallback(canvas, motionRef);
        } else {
          const program = gl.createProgram();
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);

          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            cleanupRenderer = run2DFallback(canvas, motionRef);
          } else {
            gl.useProgram(program);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
              gl.STATIC_DRAW
            );

            const aPos = gl.getAttribLocation(program, 'aPosition');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            const uTime = gl.getUniformLocation(program, 'uTime');
            const uResolution = gl.getUniformLocation(program, 'uResolution');
            const uMouse = gl.getUniformLocation(program, 'uMouse');
            const uScroll = gl.getUniformLocation(program, 'uScroll');
            const uScrollVel = gl.getUniformLocation(program, 'uScrollVel');

            function handleResize() {
              const dpr = Math.min(window.devicePixelRatio || 1, 2);
              canvas.width = Math.floor(window.innerWidth * dpr);
              canvas.height = Math.floor(window.innerHeight * dpr);
              gl.viewport(0, 0, canvas.width, canvas.height);
            }

            handleResize();
            window.addEventListener('resize', handleResize);

            let rafId = 0;
            const start = performance.now();

            function frame(now) {
              const elapsed = (now - start) * 0.001;
              state.smoothMouseX += (state.mouseX - state.smoothMouseX) * 0.06;
              state.smoothMouseY += (state.mouseY - state.smoothMouseY) * 0.06;
              state.smoothScroll += (state.scroll - state.smoothScroll) * 0.08;
              state.scrollVel *= 0.90;

              gl.uniform1f(uTime, elapsed);
              gl.uniform2f(uResolution, canvas.width, canvas.height);
              gl.uniform2f(uMouse, state.smoothMouseX, state.smoothMouseY);
              gl.uniform1f(uScroll, state.smoothScroll);
              gl.uniform1f(uScrollVel, state.scrollVel);

              gl.drawArrays(gl.TRIANGLES, 0, 6);
              rafId = requestAnimationFrame(frame);
            }

            rafId = requestAnimationFrame(frame);

            cleanupRenderer = () => {
              cancelAnimationFrame(rafId);
              window.removeEventListener('resize', handleResize);
            };
          }
        }
      }

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        if (cleanupRenderer) cleanupRenderer();
      };
    }, []);

    return e(
      'div',
      {
        id: 'nyota-react-silk-backdrop',
        'aria-hidden': 'true',
        style: {
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden'
        }
      },
      e('canvas', {
        ref: canvasRef,
        style: {
          width: '100%',
          height: '100%',
          display: 'block'
        }
      })
    );
  }

  function mountSilkBackdrop() {
    const rootEl = document.getElementById('react-silk-bg-root');
    if (!rootEl || !window.React || !window.ReactDOM) return;
    if (typeof window.ReactDOM.createRoot === 'function') {
      window.ReactDOM.createRoot(rootEl).render(e(NyotaSilkBackground));
    } else if (typeof window.ReactDOM.render === 'function') {
      window.ReactDOM.render(e(NyotaSilkBackground), rootEl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSilkBackdrop);
  } else {
    mountSilkBackdrop();
  }
})();
