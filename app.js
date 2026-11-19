// NYOTA — Senior Creative WebGL & Scrollytelling Engine

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  initThreeJsScrollytelling();
  initPricingSelector();
  initFaqAccordion();
  initStickyBar();
  initSmoothScrollLinks();
});

function initThreeJsScrollytelling() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // 1. SCENE & CAMERA SETUP
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 5.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // 100% transparent pure white background
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 2. STUDIO LIGHTING (Pure White Luxury Setup)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfffaf4, 2.4);
  keyLight.position.set(-3.5, 4.5, 4.0);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf2f6ff, 1.35);
  fillLight.position.set(3.5, 2.0, 3.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xd45d79, 3.5); // Signature couture pink rim
  rimLight.position.set(3.0, 3.5, -3.5);
  scene.add(rimLight);

  const bounceLight = new THREE.PointLight(0xffffff, 0.65, 10);
  bounceLight.position.set(0, -2.5, 2.0);
  scene.add(bounceLight);

  // 2.5. BACKGROUND CONCEPT 3: MICRO-HYALURONIC SPHERES & ACTIVE ANTIOXIDANTS
  const spheresGroup = new THREE.Group();
  scene.add(spheresGroup);

  const sphereGeo = new THREE.SphereGeometry(1, 28, 28);

  // Material 1: Pure Liquid Hyaluronic Acid & Micellar Gel (Translucent glass / pearl gel)
  const matHyaluronic = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.90,
    opacity: 0.95,
    transparent: true,
    roughness: 0.10,
    ior: 1.333,
    thickness: 0.6,
    specularIntensity: 1.0,
    specularColor: 0xffffff,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    attenuationColor: new THREE.Color(0xfdecf0),
    attenuationDistance: 0.6
  });

  // Material 2: Active Polyphenols & Antioxidant Superfruit Essence (Ruby / Couture Rose Glow)
  const matPolyphenol = new THREE.MeshPhysicalMaterial({
    color: 0xc84b69,
    transmission: 0.40,
    opacity: 0.95,
    transparent: true,
    roughness: 0.14,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.10,
    emissive: 0x5a1224,
    emissiveIntensity: 0.45
  });

  const sphereData = [];
  const TOTAL_SPHERES = 46;

  // Curated distribution zones across the viewport
  for (let i = 0; i < TOTAL_SPHERES; i++) {
    const isPolyphenol = (i % 3 === 0); // 1 in 3 is polyphenol antioxidant, 2 in 3 are hyaluronic
    const mat = isPolyphenol ? matPolyphenol : matHyaluronic;
    const mesh = new THREE.Mesh(sphereGeo, mat);

    // Distribution across viewport:
    let baseX, baseY, baseZ;
    if (i < 20) {
      // Left side (Editorial copy side)
      baseX = -2.6 + Math.random() * 2.0;
      baseY = -1.6 + Math.random() * 3.2;
    } else if (i < 34) {
      // Right side (around and framing the 3D jar)
      baseX = 0.7 + Math.random() * 2.0;
      baseY = -1.6 + Math.random() * 3.2;
    } else {
      // Center / Ambient background
      baseX = -0.7 + Math.random() * 1.4;
      baseY = -1.5 + Math.random() * 3.0;
    }

    // Depth from z: -1.8 (distant background) to z: 0.35 (foreground)
    baseZ = -1.6 + Math.random() * 1.95;

    // Radius scaling
    const baseRadius = isPolyphenol
      ? (0.042 + Math.random() * 0.045) // Polyphenols: delicate concentrated beads (0.042 to 0.087)
      : (0.050 + Math.random() * 0.065); // Hyaluronic: hydrating beads (0.050 to 0.115)

    mesh.scale.set(baseRadius, baseRadius, baseRadius);
    mesh.position.set(baseX, baseY, baseZ);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    spheresGroup.add(mesh);

    sphereData.push({
      mesh,
      isPolyphenol,
      baseX,
      baseY,
      baseZ,
      x: baseX,
      y: baseY,
      z: baseZ,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: baseRadius,
      driftSpeed: 0.5 + Math.random() * 0.8,
      driftAmpX: 0.04 + Math.random() * 0.05,
      driftAmpY: 0.05 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      repulsionFactor: 0.8 + Math.random() * 0.5
    });
  }

  // 3. CONTACT SHADOW DISC (Procedural soft radial shadow grounded directly under jar base)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 512;
  shadowCanvas.height = 512;
  const sCtx = shadowCanvas.getContext('2d');
  const gradient = sCtx.createRadialGradient(256, 256, 12, 256, 256, 235);
  gradient.addColorStop(0, 'rgba(12, 10, 15, 0.65)');    // Dark crisp core occlusion
  gradient.addColorStop(0.28, 'rgba(22, 18, 24, 0.40)'); // Contact penumbra
  gradient.addColorStop(0.58, 'rgba(180, 60, 90, 0.10)'); // Signature warm rose glow
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');    // Clean falloff
  sCtx.fillStyle = gradient;
  sCtx.fillRect(0, 0, 512, 512);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  scene.add(shadowMesh);

  // 4. LOAD 3D MODEL
  const jarGroup = new THREE.Group();
  scene.add(jarGroup);
  const modelPivot = new THREE.Group();
  jarGroup.add(modelPivot);

  const loaderIndicator = document.getElementById('scrub-loader');
  const loader = new THREE.GLTFLoader();

  // Responsive metrics & dimensions calibrated to match the user's golden bounding zone
  let isMobile = window.innerWidth < 1024;
  let posX_Right = isMobile ? 0 : 1.45;
  let posX_Left  = isMobile ? 0 : -1.45;
  let targetBaseY = isMobile ? -0.35 : -0.18;
  let jarHalfHeight = 0.827; // will be updated dynamically from scaled geometry

  // Choreography configuration table for all 7 sections
  const sectionConfigs = [
    { id: 'section-hero',       side: 'right', rotY: 0.12 },
    { id: 'section-beneficios',  side: 'left',  rotY: 0.85 },
    { id: 'section-formula',     side: 'right', rotY: 1.95 },
    { id: 'section-respaldo',    side: 'left',  rotY: Math.PI },
    { id: 'section-filtro',      side: 'right', rotY: 4.35 },
    { id: 'section-ritual',      side: 'left',  rotY: 5.25 },
    { id: 'section-oferta',      side: 'right', rotY: Math.PI * 2 + 0.12 }
  ];

  let currentTargetX = posX_Right;
  let currentTargetY = targetBaseY;
  let currentTargetZ = 0.15;
  let currentTargetRotY = 0.12;

  let sectionCenters = [];

  function measureSectionCenters() {
    isMobile = window.innerWidth < 1024;
    posX_Right = isMobile ? 0 : 1.45;
    posX_Left  = isMobile ? 0 : -1.45;
    targetBaseY = isMobile ? -0.35 : -0.18;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    sectionCenters = sectionConfigs.map(cfg => {
      const el = document.getElementById(cfg.id);
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.top + scrollY + rect.height / 2;
    });
  }

  function updateScrollytellingTargets() {
    if (sectionCenters.length < 2) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const viewCenter = scrollY + window.innerHeight / 2;
    const n = sectionConfigs.length;

    // At or above the first section (Hero)
    if (viewCenter <= sectionCenters[0]) {
      currentTargetX = posX_Right;
      currentTargetRotY = sectionConfigs[0].rotY;
      currentTargetZ = 0.15;
      currentTargetY = targetBaseY;
      return;
    }

    // At or below the final section (Oferta)
    if (viewCenter >= sectionCenters[n - 1]) {
      currentTargetX = posX_Right;
      currentTargetRotY = sectionConfigs[n - 1].rotY;
      currentTargetZ = 0.15;
      currentTargetY = targetBaseY;
      return;
    }

    // Between section i and section i + 1
    for (let i = 0; i < n - 1; i++) {
      const c1 = sectionCenters[i];
      const c2 = sectionCenters[i + 1];

      if (viewCenter >= c1 && viewCenter < c2) {
        const span = c2 - c1;
        const rawT = (viewCenter - c1) / span; // 0.0 to 1.0

        // Plateau Architecture:
        // rawT 0.00 to 0.22: Jar is firmly HELD on Section i (stays in its column while reading)
        // rawT 0.22 to 0.78: Jar glides smoothly across to Section i+1 with 3D Z-arc
        // rawT 0.78 to 1.00: Jar is already settled on Section i+1 before user focuses on it
        let easedP = 0;
        let arcNorm = 0;

        if (rawT <= 0.22) {
          easedP = 0;
          arcNorm = 0;
        } else if (rawT >= 0.78) {
          easedP = 1;
          arcNorm = 0;
        } else {
          arcNorm = (rawT - 0.22) / 0.56;
          // Smooth cubic in-out transition
          easedP = arcNorm < 0.5
            ? 4 * arcNorm * arcNorm * arcNorm
            : 1 - Math.pow(-2 * arcNorm + 2, 3) / 2;
        }

        const fromCfg = sectionConfigs[i];
        const toCfg   = sectionConfigs[i + 1];

        const fromX = isMobile ? 0 : (fromCfg.side === 'right' ? posX_Right : posX_Left);
        const toX   = isMobile ? 0 : (toCfg.side === 'right' ? posX_Right : posX_Left);

        currentTargetX = fromX + (toX - fromX) * easedP;
        currentTargetRotY = fromCfg.rotY + (toCfg.rotY - fromCfg.rotY) * easedP;

        // 3D Z-depth arc: dips gracefully back mid-transition so it stays behind typography
        currentTargetZ = 0.15 - Math.sin(arcNorm * Math.PI) * 0.45;
        currentTargetY = targetBaseY;
        break;
      }
    }
  }

  loader.load(
    'nyota_frasco.glb',
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.envMapIntensity = 1.15;
          child.material.needsUpdate = true;
        }
      });

      // 1. Scale model first so bounding calculations are in world Three.js units
      const scale = isMobile ? 8.2 : 11.2;
      model.scale.set(scale, scale, scale);
      model.updateMatrixWorld(true);

      // 2. Compute exact bounding box of the SCALED model
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // 3. Center model inside modelPivot so (0,0,0) is the EXACT geometric center of the jar
      model.position.set(-center.x, -center.y, -center.z);
      modelPivot.add(model);

      // 4. Exact half height of the scaled geometry
      jarHalfHeight = size.y / 2;

      measureSectionCenters();
      updateScrollytellingTargets();

      // Position jar and shadow directly
      jarGroup.position.set(currentTargetX, currentTargetY, currentTargetZ);
      jarGroup.rotation.set(0.04, currentTargetRotY, 0.0);

      const initialGroundY = currentTargetY - jarHalfHeight - 0.002;
      shadowMesh.position.set(currentTargetX, initialGroundY, currentTargetZ);

      if (loaderIndicator) {
        loaderIndicator.style.opacity = '0';
        setTimeout(() => loaderIndicator.remove(), 400);
      }
    },
    undefined,
    (err) => console.error('Error loading 3D model:', err)
  );

  window.addEventListener('scroll', updateScrollytellingTargets, { passive: true });
  window.addEventListener('resize', () => {
    measureSectionCenters();
    updateScrollytellingTargets();
  });

  // 5. MOUSE PARALLAX & MICRO-HYALURONIC SPHERES INTERACTION
  let mouseX = 0, mouseY = 0;
  let targetTiltX = 0, targetTiltY = 0;

  // Smooth mouse coordinates with spring interpolation
  let smoothMouse = { x: 0, y: 0, vx: 0, vy: 0 };

  window.addEventListener('mousemove', (e) => {
    // Normalizing mouse from -0.5 to +0.5
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
    targetTiltX = mouseY * 0.08;
    targetTiltY = mouseX * 0.12;
  }, { passive: true });

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth interpolated mouse tracking
    const mouseAx = (mouseX - smoothMouse.x) * 0.12;
    const mouseAy = (mouseY - smoothMouse.y) * 0.12;
    smoothMouse.vx = (smoothMouse.vx + mouseAx) * 0.82;
    smoothMouse.vy = (smoothMouse.vy + mouseAy) * 0.82;
    smoothMouse.x += smoothMouse.vx;
    smoothMouse.y += smoothMouse.vy;

    // 5. UPDATE MICRO-HYALURONIC SPHERES & ANTIOXIDANT PARTICLES (CONCEPT 3)
    if (sphereData.length > 0) {
      const fovRad = THREE.MathUtils.degToRad(38 / 2);
      const distFromCam = 5.2; // camera at z = 5.2
      const visHalfH = distFromCam * Math.tan(fovRad);
      const visHalfW = visHalfH * (window.innerWidth / window.innerHeight);

      // Mouse in world coordinates at z = 0 plane
      const mouseWorldX = smoothMouse.x * visHalfW * 2.0;
      const mouseWorldY = -smoothMouse.y * visHalfH * 2.0;

      for (let i = 0; i < sphereData.length; i++) {
        const s = sphereData[i];

        // 1. Organic floating equilibrium point (Brownian & cellular breathing)
        const targetX = s.baseX + Math.sin(elapsedTime * s.driftSpeed + s.phase) * s.driftAmpX;
        const targetY = s.baseY + Math.cos(elapsedTime * s.driftSpeed * 0.85 + s.phase) * s.driftAmpY;
        const targetZ = s.baseZ + Math.sin(elapsedTime * 0.6 + s.phase) * 0.04;

        // 2. Elastic Mouse Repulsion Field
        const dx = s.x - mouseWorldX;
        const dy = s.y - mouseWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulsionRadius = 0.95; // ~260px interactive field

        if (dist < repulsionRadius && dist > 0.001) {
          // Smooth cosine ease-out repulsion curve
          const normDist = dist / repulsionRadius;
          const repStrength = (1.0 - normDist) * 0.032 * s.repulsionFactor;
          s.vx += (dx / dist) * repStrength;
          s.vy += (dy / dist) * repStrength;
        }

        // 3. Spring physics returning to equilibrium (Hooke's law + damping)
        const kSpring = 0.040;
        const kDamping = 0.86;

        s.vx = (s.vx + (targetX - s.x) * kSpring) * kDamping;
        s.vy = (s.vy + (targetY - s.y) * kSpring) * kDamping;
        s.vz = (s.vz + (targetZ - s.z) * kSpring) * kDamping;

        s.x += s.vx;
        s.y += s.vy;
        s.z += s.vz;

        // 4. Update 3D mesh position and subtle rotation
        s.mesh.position.set(s.x, s.y, s.z);
        s.mesh.rotation.x += 0.004;
        s.mesh.rotation.y += 0.006;
      }
    }

    if (jarGroup.children.length > 0) {
      // Smooth damped lerp towards target coordinates (60/120fps buttery motion)
      jarGroup.position.x += (currentTargetX - jarGroup.position.x) * 0.12;
      jarGroup.position.y += (currentTargetY - jarGroup.position.y) * 0.12;
      jarGroup.position.z += (currentTargetZ - jarGroup.position.z) * 0.12;

      // Smooth rotation lerp
      jarGroup.rotation.y += (currentTargetRotY - jarGroup.rotation.y) * 0.12;

      // Mouse interactive tilt
      jarGroup.rotation.x += (targetTiltX + 0.04 - jarGroup.rotation.x) * 0.05;
      jarGroup.rotation.z += (-targetTiltY - jarGroup.rotation.z) * 0.05;

      // Subtle breathing float on modelPivot (preserves model centering offset)
      modelPivot.position.y = Math.sin(elapsedTime * 1.8) * 0.012;

      // Contact shadow is ALWAYS 100% FLUSH with the base of the jar (ZERO floating gap!)
      const groundY = jarGroup.position.y + modelPivot.position.y - jarHalfHeight - 0.002;
      shadowMesh.position.x = jarGroup.position.x;
      shadowMesh.position.y = groundY;
      shadowMesh.position.z = jarGroup.position.z;

      // Dynamic shadow scale adjusting to Z-arc
      const shadowScale = 1.0 + (jarGroup.position.z - 0.15) * 0.35;
      shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  });
}

// 2. PRICING SELECTOR & WHATSAPP CONCIERGE
function initPricingSelector() {
  const cards = document.querySelectorAll('.pricing-option-card');
  const totalDisplay = document.getElementById('selected-price-display');
  const ctaBtn = document.getElementById('btn-checkout-whatsapp');
  let selectedTier = 'duo';

  const tiers = {
    single: {
      name: 'Tratamiento 33 Días (1 Frasco 500g)',
      price: 'S/. 179',
      message: 'Hola NYOTA, deseo ordenar 1 Frasco de NYOTA COLLAGEN ENERGY (Tratamiento 33 Días por S/. 179). ¿Cuáles son los métodos de pago y tiempo de entrega en Lima?'
    },
    duo: {
      name: 'Tratamiento Dúo 66 Días (2 Frascos + Envío Gratis)',
      price: 'S/. 319',
      message: 'Hola NYOTA, deseo ordenar el Pack Dúo (2 Frascos por S/. 319 con Envío Gratis). ¿Cuáles son los métodos de pago disponibles?'
    }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active-plan'));
      card.classList.add('active-plan');
      selectedTier = card.dataset.tier;

      if (totalDisplay) {
        totalDisplay.textContent = tiers[selectedTier].price;
      }
      updateCtaLink();
    });
  });

  function updateCtaLink() {
    if (!ctaBtn) return;
    const msg = encodeURIComponent(tiers[selectedTier].message);
    ctaBtn.href = `https://wa.me/51999999999?text=${msg}`;
  }

  updateCtaLink();
}

// 4. FAQ ACCORDION
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => {
        i.classList.remove('open');
        const content = i.querySelector('.faq-content');
        if (content) content.style.maxHeight = null;
        const icon = i.querySelector('.faq-icon');
        if (icon) icon.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        item.classList.add('open');
        const content = item.querySelector('.faq-content');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

// 5. STICKY BUY BAR
function initStickyBar() {
  const bar = document.getElementById('sticky-buy-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 550) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }, { passive: true });
}

// 6. SMOOTH SCROLL ANCHORS
function initSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
