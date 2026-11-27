// NYOTA — Senior Creative WebGL & Scrollytelling Engine

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  initThreeJsScrollytelling();
  initPricingSelector();
  initCartDrawer();
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
    (document.documentElement.clientWidth || window.innerWidth) / window.innerHeight,
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
  renderer.setSize(document.documentElement.clientWidth || window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 2. STUDIO LIGHTING (Velvet Burgundy Silk Studio Setup)
  const ambientLight = new THREE.AmbientLight(0xffeef4, 1.25);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff4ee, 2.55);
  keyLight.position.set(-3.5, 4.5, 4.0);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf6dae6, 1.3);
  fillLight.position.set(3.5, 2.0, 3.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff9cc0, 4.2); // Signature champagne-rose backlit rim
  rimLight.position.set(3.0, 3.5, -3.5);
  scene.add(rimLight);

  const bounceLight = new THREE.PointLight(0xe57a9c, 1.05, 10); // Silk floor bounce illumination
  bounceLight.position.set(0, -2.5, 2.0);
  scene.add(bounceLight);

  // 2.5. BACKGROUND CONCEPT 3: SUBTLE ASCENDING HYALURONIC & POLYPHENOL PEARLS
  const spheresGroup = new THREE.Group();
  scene.add(spheresGroup);

  const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

  // Material 1: Subtle Translucent Liquid Hyaluronic Beads
  const matHyaluronic = new THREE.MeshPhysicalMaterial({
    color: 0xffedf3,
    transmission: 0.78,
    opacity: 0.44,
    transparent: true,
    roughness: 0.16,
    ior: 1.333,
    thickness: 0.45,
    specularIntensity: 0.7,
    specularColor: 0xffffff,
    clearcoat: 0.75,
    clearcoatRoughness: 0.12,
    emissive: 0x5c1f35,
    emissiveIntensity: 0.10,
    attenuationColor: new THREE.Color(0xf7b9cc),
    attenuationDistance: 0.6
  });

  // Material 2: Subtle Polyphenol Superfruit Essence Pearls
  const matPolyphenol = new THREE.MeshPhysicalMaterial({
    color: 0xe67c9d,
    transmission: 0.55,
    opacity: 0.40,
    transparent: true,
    roughness: 0.16,
    metalness: 0.04,
    clearcoat: 0.70,
    clearcoatRoughness: 0.14,
    emissive: 0x7c1f40,
    emissiveIntensity: 0.22
  });

  const sphereData = [];
  const TOTAL_SPHERES = 16;

  // Curated normalized horizontal & depth distribution (works cleanly on both desktop and mobile)
  for (let i = 0; i < TOTAL_SPHERES; i++) {
    const isPolyphenol = (i % 3 === 0);
    const mat = isPolyphenol ? matPolyphenol : matHyaluronic;
    const mesh = new THREE.Mesh(sphereGeo, mat);

    // Normalized horizontal placement across -0.92..+0.92 of visible viewport width
    const normX = ((i + 0.5) / TOTAL_SPHERES) * 1.84 - 0.92 + (Math.random() - 0.5) * 0.18;
    const normY = Math.random(); // Initial phase across vertical travel span
    const baseZ = -1.4 + Math.random() * 1.65;
    const depthNorm = (baseZ + 1.4) / 1.65; // 0 (far) to 1 (near)

    const baseRadius = isPolyphenol
      ? (0.028 + Math.random() * 0.030)
      : (0.032 + Math.random() * 0.040);

    mesh.scale.set(baseRadius, baseRadius, baseRadius);
    mesh.position.set(normX * 1.4, (normY - 0.5) * 3.0, baseZ);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    spheresGroup.add(mesh);

    sphereData.push({
      mesh,
      isPolyphenol,
      normX,
      normY,
      baseZ,
      x: normX * 1.4,
      y: (normY - 0.5) * 3.0,
      z: baseZ,
      prevTargetY: (normY - 0.5) * 3.0,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: baseRadius,
      riseSpeed: 0.045 + Math.random() * 0.055,
      scrollFactor: 0.75 + depthNorm * 0.85,
      driftSpeed: 0.45 + Math.random() * 0.65,
      driftAmpX: 0.035 + Math.random() * 0.045,
      phase: Math.random() * Math.PI * 2,
      repulsionFactor: 0.7 + Math.random() * 0.45
    });
  }

  // 3. CONTACT SHADOW DISC (Grounded directly under jar base on satin surface)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 512;
  shadowCanvas.height = 512;
  const sCtx = shadowCanvas.getContext('2d');
  const gradient = sCtx.createRadialGradient(256, 256, 12, 256, 256, 235);
  gradient.addColorStop(0, 'rgba(14, 3, 8, 0.78)');      // Deep plum-obsidian contact occlusion
  gradient.addColorStop(0.28, 'rgba(28, 8, 17, 0.48)');   // Soft satin penumbra
  gradient.addColorStop(0.60, 'rgba(138, 42, 76, 0.16)'); // Rose silk floor reflection
  gradient.addColorStop(1, 'rgba(34, 9, 19, 0)');         // Seamless falloff
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

  // Responsive metrics & dimensions calibrated dynamically for mobile, tablet, and desktop
  function getResponsiveJarMetrics() {
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = window.innerHeight || 800;
    const isNarrow = w < 1024;
    const aspect = w / h;
    // Frustum half-width at jar Z ~ 0.15 (distance 5.05 from camera at z=5.2, fov=38deg)
    const visHalfW = 5.05 * Math.tan(THREE.MathUtils.degToRad(19)) * aspect;

    let posX;
    let baseY;
    let jarScale;

    if (!isNarrow) {
      posX = 1.45;
      baseY = -0.18;
      jarScale = 11.2;
    } else if (w >= 640) {
      // Tablet (640px - 1023px): anchor jar cleanly at viewport edge without colliding with 64% text column
      posX = Math.max(0.95, visHalfW * 0.94);
      baseY = -0.05;
      jarScale = 8.4;
    } else {
      // Mobile (< 640px): clean 50% edge-peek with zero overlap against text/stat cards
      posX = Math.max(0.70, visHalfW * 0.98);
      baseY = 0.05;
      jarScale = 7.4;
    }
    return { isNarrow, posX, baseY, jarScale };
  }

  let metrics = getResponsiveJarMetrics();
  let isMobile = metrics.isNarrow;
  let posX_Right = metrics.posX;
  let posX_Left  = -metrics.posX;
  let targetBaseY = metrics.baseY;
  let jarHalfHeight = 0.827; // will be updated dynamically from scaled geometry
  let loadedModelRef = null;
  let baseCenterOffset = null;
  let baseHalfHeight = 0;

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
    metrics = getResponsiveJarMetrics();
    isMobile = metrics.isNarrow;
    posX_Right = metrics.posX;
    posX_Left  = -metrics.posX;
    targetBaseY = metrics.baseY;

    if (loadedModelRef && baseCenterOffset) {
      loadedModelRef.scale.set(metrics.jarScale, metrics.jarScale, metrics.jarScale);
      loadedModelRef.position.copy(baseCenterOffset).multiplyScalar(-metrics.jarScale);
      jarHalfHeight = baseHalfHeight * metrics.jarScale;
    }

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

        const fromX = fromCfg.side === 'right' ? posX_Right : posX_Left;
        const toX   = toCfg.side === 'right' ? posX_Right : posX_Left;

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
      loadedModelRef = model;
      const scale = metrics.jarScale;
      model.scale.set(scale, scale, scale);
      model.updateMatrixWorld(true);

      // 2. Compute exact bounding box of the SCALED model
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // 3. Center model inside modelPivot so (0,0,0) is the EXACT geometric center of the jar
      baseCenterOffset = center.clone().divideScalar(scale);
      baseHalfHeight = (size.y / 2) / scale;
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
  let smoothScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const rawScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    smoothScrollY += (rawScrollY - smoothScrollY) * 0.10;

    // Smooth interpolated mouse tracking
    const mouseAx = (mouseX - smoothMouse.x) * 0.12;
    const mouseAy = (mouseY - smoothMouse.y) * 0.12;
    smoothMouse.vx = (smoothMouse.vx + mouseAx) * 0.82;
    smoothMouse.vy = (smoothMouse.vy + mouseAy) * 0.82;
    smoothMouse.x += smoothMouse.vx;
    smoothMouse.y += smoothMouse.vy;

    // 5. UPDATE ASCENDING MICRO-HYALURONIC & POLYPHENOL PEARLS (Scroll-driven bottom -> top)
    if (sphereData.length > 0) {
      const fovRad = THREE.MathUtils.degToRad(38 / 2);
      const distFromCam = 5.2; // camera at z = 5.2
      const cw = document.documentElement.clientWidth || window.innerWidth;
      const visHalfH = distFromCam * Math.tan(fovRad);
      const visHalfW = visHalfH * (cw / window.innerHeight);

      // Mouse in world coordinates at z = 0 plane
      const mouseWorldX = smoothMouse.x * visHalfW * 2.0;
      const mouseWorldY = -smoothMouse.y * visHalfH * 2.0;

      const bottomEdge = -visHalfH - 0.35;
      const topEdge = visHalfH + 0.35;
      const wrapSpan = topEdge - bottomEdge;

      for (let i = 0; i < sphereData.length; i++) {
        const s = sphereData[i];

        // 1. Responsive horizontal sway + upward travel driven by scroll & gentle drift
        const targetX = (s.normX * visHalfW) + Math.sin(elapsedTime * s.driftSpeed + s.phase) * s.driftAmpX;
        const rawTravel = (s.normY * wrapSpan) + (elapsedTime * s.riseSpeed) + (smoothScrollY * 0.0028 * s.scrollFactor);
        const wrappedOffset = ((rawTravel % wrapSpan) + wrapSpan) % wrapSpan;
        const targetY = bottomEdge + wrappedOffset;
        const targetZ = s.baseZ + Math.sin(elapsedTime * 0.6 + s.phase) * 0.03;

        // If bubble wrapped from top back to bottom, snap cleanly without streaking across screen
        if (Math.abs(targetY - s.prevTargetY) > wrapSpan * 0.45) {
          s.y = targetY;
          s.vy = 0;
        }
        s.prevTargetY = targetY;

        // 2. Elastic Mouse Repulsion Field
        const dx = s.x - mouseWorldX;
        const dy = s.y - mouseWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulsionRadius = 0.85;

        if (dist < repulsionRadius && dist > 0.001) {
          const normDist = dist / repulsionRadius;
          const repStrength = (1.0 - normDist) * 0.026 * s.repulsionFactor;
          s.vx += (dx / dist) * repStrength;
          s.vy += (dy / dist) * repStrength;
        }

        // 3. Spring physics returning to moving ascending equilibrium
        const kSpring = 0.075;
        const kDamping = 0.82;

        s.vx = (s.vx + (targetX - s.x) * kSpring) * kDamping;
        s.vy = (s.vy + (targetY - s.y) * kSpring) * kDamping;
        s.vz = (s.vz + (targetZ - s.z) * kSpring) * kDamping;

        s.x += s.vx;
        s.y += s.vy;
        s.z += s.vz;

        // Soft emergence from bottom edge & gentle fade-out at top edge
        const normPos = Math.max(0, Math.min(1, (s.y - bottomEdge) / wrapSpan));
        let edgeFade = 1.0;
        if (normPos < 0.16) {
          edgeFade = normPos / 0.16;
        } else if (normPos > 0.84) {
          edgeFade = (1.0 - normPos) / 0.16;
        }
        const scaledR = Math.max(0.0001, s.radius * edgeFade);

        // 4. Update 3D mesh position, scale & subtle rotation
        s.mesh.position.set(s.x, s.y, s.z);
        s.mesh.scale.set(scaledR, scaledR, scaledR);
        s.mesh.rotation.x += 0.003;
        s.mesh.rotation.y += 0.005;
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
    const cw = document.documentElement.clientWidth || window.innerWidth;
    camera.aspect = cw / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(cw, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  });
}

// 2. PRICING SELECTOR & WHATSAPP CONCIERGE
function initPricingSelector() {
  const cards = document.querySelectorAll('.pricing-option-card');
  const totalDisplay = document.getElementById('selected-price-display');
  const regularDisplay = document.getElementById('selected-regular-price-display');
  const ctaBtn = document.getElementById('btn-checkout-whatsapp');
  let selectedTier = 'duo';

  const tiers = {
    single: {
      name: 'Tratamiento 30 Días (1 Frasco 450g)',
      price: 'S/. 161.10',
      regularPrice: 'S/. 179.00',
      message: 'Hola NYOTA, deseo ordenar 1 Frasco de NYOTA COLLAGEN ENERGY (Tratamiento 30 Días 450g) aprovechando el 10% OFF Primera Compra (S/. 161.10). ¿Envío Gratis a Lima o S/. 10 a provincia?'
    },
    duo: {
      name: 'Tratamiento Dúo 60 Días (2 Frascos · 900g)',
      price: 'S/. 287.10',
      regularPrice: 'S/. 319.00',
      message: 'Hola NYOTA, deseo ordenar el Pack Dúo (2 Frascos 450g) aprovechando el 10% OFF Primera Compra (S/. 287.10). Deseo coordinar mi envío.'
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
      if (regularDisplay) {
        regularDisplay.textContent = tiers[selectedTier].regularPrice;
      }
      updateCtaLink();
    });
  });

  function updateCtaLink() {
    if (!ctaBtn) return;
    const msg = encodeURIComponent(tiers[selectedTier].message);
    ctaBtn.href = `https://wa.me/51922020069?text=${msg}`;
  }

  updateCtaLink();
}

// 3. CART & CHECKOUT DRAWER ENGINE
function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('close-cart-btn');
  const openCartBtn = document.getElementById('open-cart-btn');
  const headerCheckoutBtn = document.getElementById('header-checkout-btn');
  const heroBuyBtn = document.getElementById('hero-buy-btn');
  const stickyCartBtn = document.getElementById('sticky-cart-btn');
  const openIzipayBtn = document.getElementById('btn-open-izipay-checkout');
  const tierRadios = document.querySelectorAll('input[name="cart_tier"]');
  const tierOptionCards = document.querySelectorAll('.cart-tier-option');
  const tierCardButtons = document.querySelectorAll('.btn-select-tier');
  
  const qtyMinus = document.getElementById('cart-qty-minus');
  const qtyPlus = document.getElementById('cart-qty-plus');
  const qtyDisplay = document.getElementById('cart-qty-display');
  const headerBadge = document.getElementById('header-cart-badge');
  
  const subtotalDisplay = document.getElementById('cart-summary-subtotal');
  const discountToggle = document.getElementById('cart-first-purchase-toggle');
  const discountRow = document.getElementById('cart-summary-discount-row');
  const discountDisplay = document.getElementById('cart-summary-discount');
  const shippingDisplay = document.getElementById('cart-summary-shipping');
  const totalDisplay = document.getElementById('cart-summary-total');
  
  const btnPayIzipay = document.getElementById('btn-pay-izipay');
  const btnPayText = document.getElementById('btn-pay-text');
  const btnPayIconYape = document.getElementById('btn-pay-icon-yape');
  const btnPayIconCard = document.getElementById('btn-pay-icon-card');
  const btnPayWhatsapp = document.getElementById('btn-pay-whatsapp');
  const btnEditData = document.getElementById('btn-edit-checkout-data');
  const btnNewOrder = document.getElementById('btn-new-order');
  const drawerBody = document.getElementById('cart-drawer-body');
  const drawerFooter = document.getElementById('cart-drawer-footer');
  const presentationSection = document.getElementById('checkout-presentation-section');
  const qtySection = document.getElementById('checkout-qty-section');
  const customerFormSection = document.getElementById('checkout-customer-form-section');
  const paymentContainer = document.getElementById('izipay-payment-container');
  const compactSummary = document.getElementById('izipay-compact-summary');
  const smartFormWrapper = document.getElementById('izipay-smartform-wrapper');
  const modeBadge = document.getElementById('izipay-mode-badge');
  const receiptContainer = document.getElementById('izipay-payment-receipt');
  const notifBox = document.getElementById('cart-notification-box');

  // Yape / Plin Screen Elements
  const yapeScreen = document.getElementById('yape-confirmation-screen');
  const yapeOrderCode = document.getElementById('yape-order-code');
  const yapeClientName = document.getElementById('yape-client-name');
  const yapeDisplayLocation = document.getElementById('yape-display-location');
  const yapeDisplayAddress = document.getElementById('yape-display-address');
  const yapeStepAmount = document.getElementById('yape-step-amount');
  const yapeDisplayEmail = document.getElementById('yape-display-email');
  const yapeDisplayPhone = document.getElementById('yape-display-phone');
  const yapeDisplayFullName = document.getElementById('yape-display-fullname');
  const yapeDisplayFullAddress = document.getElementById('yape-display-fulladdress');
  const yapeDisplayCity = document.getElementById('yape-display-city');
  const yapeDisplayProduct = document.getElementById('yape-display-product');
  const yapeDisplayTotal = document.getElementById('yape-display-total');
  const btnSendYapeWhatsapp = document.getElementById('btn-send-yape-whatsapp');
  const btnYapeNewOrder = document.getElementById('btn-yape-new-order');

  // Payment Method Selection State
  let selectedPaymentMethod = 'yape'; // 'yape' | 'card'
  const paymentMethodRadios = document.querySelectorAll('input[name="payment_method"]');
  const paymentMethodCards = document.querySelectorAll('.payment-method-card');

  const destinationSelect = document.getElementById('cust-destination');

  // Dynamic Krypton V4.0 SPA script loader state
  let kryptonLoadedKey = null;
  let kryptonLoadPromise = null;
  let kryptonCallbacksBound = false;

  function loadKryptonLibrary(publicKey) {
    if (!publicKey) {
      return Promise.reject(new Error('Falta clave pública de izipay'));
    }

    if (window.KR && kryptonLoadedKey === publicKey) {
      return Promise.resolve(window.KR);
    }

    if (kryptonLoadPromise && kryptonLoadedKey === publicKey) {
      return kryptonLoadPromise;
    }

    kryptonLoadedKey = publicKey;
    kryptonLoadPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('izipay-krypton-js');
      if (existing) {
        if (window.KR) {
          resolve(window.KR);
          return;
        }
        existing.remove();
      }

      const script = document.createElement('script');
      script.id = 'izipay-krypton-js';
      script.type = 'text/javascript';
      script.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
      script.setAttribute('kr-public-key', publicKey);
      script.setAttribute('kr-spa-mode', 'true');
      script.setAttribute('kr-language', 'es-ES');

      script.onload = () => {
        if (window.KR) {
          resolve(window.KR);
        } else {
          reject(new Error('El cliente Krypton no se inicializó correctamente.'));
        }
      };
      script.onerror = () => {
        kryptonLoadPromise = null;
        kryptonLoadedKey = null;
        reject(new Error('No se pudo descargar el SDK de izipay.'));
      };
      document.head.appendChild(script);
    });

    return kryptonLoadPromise;
  }

  // Silently preload gateway config & Krypton library on page boot if configured
  fetch('/api/config')
    .then(r => (r.ok ? r.json() : null))
    .then(cfg => {
      if (cfg?.configured && cfg.publicKey) {
        loadKryptonLibrary(cfg.publicKey).catch(() => {});
      }
    })
    .catch(() => {});

  // Cart State (Regular unit prices; 10% First Purchase applies dynamically)
  let state = {
    tier: 'duo', // 'single' | 'duo'
    quantity: 1,
    firstPurchase: true,
    prices: {
      single: 179,
      duo: 319
    },
    names: {
      single: '1 Frasco (450 g) — Tratamiento 30 Días',
      duo: 'Pack Dúo (2 Frascos · 900 g) — Tratamiento 60 Días'
    }
  };

  function computeOrderPricing(destinationOverride) {
    const unitPrice = state.prices[state.tier];
    const subtotal = Number((unitPrice * state.quantity).toFixed(2));
    const discountRate = state.firstPurchase ? 0.10 : 0;
    const discountAmount = Number((subtotal * discountRate).toFixed(2));
    const destination = destinationOverride || (destinationSelect ? destinationSelect.value : 'lima');

    // Uniform Shipping Policy: Free in Lima Metropolitana, S/. 10 flat rate to Provincias
    const shippingCost = destination === 'lima' ? 0 : 10;
    const shippingText = destination === 'lima' ? 'Gratis (Lima Metropolitana)' : 'S/. 10.00 (Provincia)';
    const total = Number((subtotal - discountAmount + shippingCost).toFixed(2));

    return { unitPrice, subtotal, discountAmount, shippingCost, shippingText, destination, total };
  }

  function openDrawer(preferredTier) {
    if (!drawer || !overlay) return;
    if (preferredTier) {
      setTier(preferredTier);
    }
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function setTier(tier) {
    if (!state.prices[tier]) return;
    state.tier = tier;
    
    // Update radio inputs
    tierRadios.forEach(radio => {
      radio.checked = radio.value === tier;
    });

    // Update style on tier option cards
    tierOptionCards.forEach(card => {
      if (card.dataset.tier === tier) {
        card.classList.add('active-tier', 'border-2', 'border-[#C84B69]', 'bg-[#FDF5F7]/40');
        card.classList.remove('border', 'border-[#F5DCE3]', 'bg-white');
      } else {
        card.classList.remove('active-tier', 'border-2', 'border-[#C84B69]', 'bg-[#FDF5F7]/40');
        card.classList.add('border', 'border-[#F5DCE3]', 'bg-white');
      }
    });

    // Update on-page active pricing card if present
    document.querySelectorAll('.pricing-option-card').forEach(card => {
      if (card.dataset.tier === tier) {
        card.classList.add('active-plan');
      } else {
        card.classList.remove('active-plan');
      }
    });

    updateTotals();
  }

  function updateTotals() {
    const pricing = computeOrderPricing();
    const promoUnitPrice = state.firstPurchase
      ? Number((pricing.unitPrice * 0.90).toFixed(2))
      : pricing.unitPrice;

    if (qtyDisplay) qtyDisplay.textContent = state.quantity;
    if (headerBadge) headerBadge.textContent = state.quantity;
    if (subtotalDisplay) subtotalDisplay.textContent = `S/. ${pricing.subtotal.toFixed(2)}`;

    if (discountRow) {
      discountRow.classList.toggle('hidden', !state.firstPurchase);
    }
    if (discountDisplay) {
      discountDisplay.textContent = `- S/. ${pricing.discountAmount.toFixed(2)}`;
    }

    if (shippingDisplay) {
      shippingDisplay.textContent = pricing.shippingText;
      shippingDisplay.className = pricing.shippingCost === 0
        ? 'font-semibold text-emerald-600'
        : 'font-semibold text-[#111113]';
    }
    if (totalDisplay) totalDisplay.textContent = `S/. ${pricing.total.toFixed(2)}`;

    // Sync on-page offer price display
    const onPagePrice = document.getElementById('selected-price-display');
    if (onPagePrice) {
      onPagePrice.textContent = `S/. ${promoUnitPrice.toFixed(2)}`;
    }
    const onPageRegular = document.getElementById('selected-regular-price-display');
    if (onPageRegular) {
      onPageRegular.textContent = `S/. ${pricing.unitPrice.toFixed(2)}`;
      onPageRegular.classList.toggle('hidden', !state.firstPurchase);
    }
  }

  // Event Listeners for Open / Close
  if (openCartBtn) openCartBtn.addEventListener('click', () => openDrawer());
  if (headerCheckoutBtn) headerCheckoutBtn.addEventListener('click', () => openDrawer());
  if (heroBuyBtn) heroBuyBtn.addEventListener('click', () => openDrawer('single'));
  if (stickyCartBtn) stickyCartBtn.addEventListener('click', () => openDrawer());
  if (openIzipayBtn) openIzipayBtn.addEventListener('click', () => openDrawer());
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Tier Card buttons in offer section
  tierCardButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tier = btn.dataset.tier;
      openDrawer(tier);
    });
  });

  // Radios inside drawer
  tierRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      setTier(radio.value);
    });
  });

  tierOptionCards.forEach(card => {
    card.addEventListener('click', () => {
      const tier = card.dataset.tier;
      setTier(tier);
    });
  });

  // Quantity controls
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (state.quantity > 1) {
        state.quantity--;
        updateTotals();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      if (state.quantity < 10) {
        state.quantity++;
        updateTotals();
      }
    });
  }

  if (destinationSelect) {
    destinationSelect.addEventListener('change', updateTotals);
  }

  if (discountToggle) {
    discountToggle.addEventListener('change', () => {
      state.firstPurchase = Boolean(discountToggle.checked);
      updateTotals();
    });
  }

  // Helper to validate and gather customer fields
  function getCustomerData() {
    const name = document.getElementById('cust-name')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const dni = document.getElementById('cust-dni')?.value.trim();
    const email = document.getElementById('cust-email')?.value.trim();
    const destination = document.getElementById('cust-destination')?.value;
    const district = document.getElementById('cust-district')?.value.trim();
    const address = document.getElementById('cust-address')?.value.trim();
    const reference = document.getElementById('cust-reference')?.value.trim() || '';
    const deliveryNotes = document.getElementById('cust-delivery-notes')?.value.trim() || '';
    const rawMapsUrl = document.getElementById('cust-maps-url')?.value.trim() || '';

    // Smart fallback: If customer didn't provide GPS or link, construct Google Maps Search link
    const mapsUrl = rawMapsUrl || (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([address, district, destination === 'provincias' ? 'Perú' : 'Lima, Perú'].filter(Boolean).join(', '))}` : '');

    return { name, phone, dni, email, destination, district, address, reference, deliveryNotes, mapsUrl };
  }

  function validateCustomer(cust) {
    if (!cust.name) return 'Por favor, ingresa tu Nombre y Apellido.';
    if (!cust.phone || cust.phone.length < 8) return 'Por favor, ingresa un número de teléfono o WhatsApp válido.';
    if (!cust.dni || cust.dni.length < 8) return 'Por favor, ingresa tu DNI o RUC para el comprobante.';
    if (!cust.email || !cust.email.includes('@')) return 'Por favor, ingresa un correo electrónico válido.';
    if (!cust.district) return 'Por favor, ingresa tu distrito o ciudad de destino.';
    if (!cust.address) return 'Por favor, ingresa la dirección de entrega.';
    return null;
  }

  // Interactive Google Maps & GPS Geolocation Controls
  const btnDetectGps = document.getElementById('btn-detect-gps');
  const btnOpenGmaps = document.getElementById('btn-open-gmaps');
  const custMapsUrlInput = document.getElementById('cust-maps-url');
  const btnTestMapsUrl = document.getElementById('btn-test-maps-url');
  const mapsStatusText = document.getElementById('maps-status-text');
  const iconGpsNormal = document.getElementById('icon-gps-normal');
  const iconGpsLoading = document.getElementById('icon-gps-loading');
  const textGpsBtn = document.getElementById('text-gps-btn');
  const cardNoticePill = document.getElementById('card-notice-pill');

  if (btnDetectGps) {
    btnDetectGps.addEventListener('click', () => {
      if (!navigator.geolocation) {
        if (mapsStatusText) mapsStatusText.textContent = 'Tu navegador no admite geolocalización automática. Puedes usar "Abrir Google Maps".';
        return;
      }

      if (iconGpsNormal) iconGpsNormal.classList.add('hidden');
      if (iconGpsLoading) iconGpsLoading.classList.remove('hidden');
      if (textGpsBtn) textGpsBtn.textContent = 'Detectando...';
      btnDetectGps.disabled = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const gmapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

          if (custMapsUrlInput) {
            custMapsUrlInput.value = gmapsLink;
            custMapsUrlInput.dispatchEvent(new Event('input'));
          }

          if (mapsStatusText) {
            mapsStatusText.innerHTML = `<span class="text-emerald-700 font-bold">✓ Ubicación GPS detectada con éxito (${lat}, ${lng})</span>`;
          }

          if (iconGpsNormal) iconGpsNormal.classList.remove('hidden');
          if (iconGpsLoading) iconGpsLoading.classList.add('hidden');
          if (textGpsBtn) textGpsBtn.textContent = 'GPS Activo';
          btnDetectGps.disabled = false;

          // Helpful UX: try reverse geocoding if address / district are empty
          const inputAddr = document.getElementById('cust-address');
          const inputDist = document.getElementById('cust-district');
          if ((!inputAddr || !inputAddr.value.trim()) || (!inputDist || !inputDist.value.trim())) {
            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: { 'Accept': 'application/json' }
              });
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                const road = geoData.address?.road || geoData.address?.pedestrian || geoData.address?.suburb || '';
                const district = geoData.address?.city_district || geoData.address?.suburb || geoData.address?.city || '';
                if (inputAddr && !inputAddr.value.trim() && road) {
                  inputAddr.value = road;
                }
                if (inputDist && !inputDist.value.trim() && district) {
                  inputDist.value = district;
                }
              }
            } catch (_) {}
          }
        },
        (err) => {
          console.warn('[GPS geolocation error]', err);
          if (iconGpsNormal) iconGpsNormal.classList.remove('hidden');
          if (iconGpsLoading) iconGpsLoading.classList.add('hidden');
          if (textGpsBtn) textGpsBtn.textContent = 'Usar mi GPS';
          btnDetectGps.disabled = false;

          const msg = err.code === 1
            ? 'Acceso a ubicación denegado en tu navegador. Puedes pulsar "Abrir Google Maps" o ingresar tu dirección.'
            : 'No se pudo obtener la posición GPS. Puedes ingresar tu dirección normalmente.';
          if (mapsStatusText) mapsStatusText.textContent = msg;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }

  if (btnOpenGmaps) {
    btnOpenGmaps.addEventListener('click', () => {
      const addr = document.getElementById('cust-address')?.value.trim();
      const dist = document.getElementById('cust-district')?.value.trim();
      const q = [addr, dist, 'Lima, Peru'].filter(Boolean).join(', ');
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
      window.open(searchUrl, '_blank');
      if (mapsStatusText) {
        mapsStatusText.textContent = 'En Google Maps, toca "Compartir" -> "Copiar vínculo" y pégalo en el campo inferior.';
      }
    });
  }

  if (custMapsUrlInput) {
    custMapsUrlInput.addEventListener('input', () => {
      const val = custMapsUrlInput.value.trim();
      if (val && (val.includes('maps.google') || val.includes('google.com/maps') || val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps') || val.startsWith('http'))) {
        if (btnTestMapsUrl) {
          btnTestMapsUrl.href = val;
          btnTestMapsUrl.classList.remove('hidden');
        }
        if (mapsStatusText) {
          mapsStatusText.innerHTML = '<span class="text-emerald-700 font-semibold">✓ Enlace de Google Maps verificado</span>';
        }
      } else {
        if (btnTestMapsUrl) btnTestMapsUrl.classList.add('hidden');
        if (!val && mapsStatusText) {
          mapsStatusText.textContent = 'Si no tienes el enlace, usaremos tu dirección escrita para generar la ruta automáticamente.';
        }
      }
    });
  }

  function showNotification(msg, isError = true) {
    if (!notifBox) return;
    notifBox.className = isError 
      ? 'p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-800 space-y-1 block'
      : 'p-3.5 rounded-xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1 block';
    notifBox.innerHTML = msg;
    notifBox.classList.remove('hidden');
  }

  // Handle WhatsApp Order Button inside drawer
  if (btnPayWhatsapp) {
    btnPayWhatsapp.addEventListener('click', () => {
      const cust = getCustomerData();
      const pricing = computeOrderPricing(cust.destination);

      let msg = `*NUEVO PEDIDO NYOTA COLLAGEN ENERGY*\n` +
        `----------------------------------------\n` +
        `*Tratamiento:* ${state.names[state.tier]}\n` +
        `*Cantidad:* ${state.quantity} unidad(es)\n` +
        `*Subtotal:* S/. ${pricing.subtotal.toFixed(2)}\n` +
        (state.firstPurchase ? `*Descuento 1ª Compra (-10%):* - S/. ${pricing.discountAmount.toFixed(2)}\n` : '') +
        `*Envío:* ${pricing.shippingCost === 0 ? 'Gratis (Lima Metropolitana)' : `S/. ${pricing.shippingCost.toFixed(2)} (Provincia)`}\n` +
        `*Total a Pagar:* S/. ${pricing.total.toFixed(2)}\n` +
        `----------------------------------------\n` +
        `*DATOS DE ENTREGA*\n` +
        `*Nombre:* ${cust.name || 'Por coordinar'}\n` +
        `*WhatsApp:* ${cust.phone || 'Por coordinar'}\n` +
        `*DNI/RUC:* ${cust.dni || 'Por coordinar'}\n` +
        `*Destino:* ${cust.destination === 'lima' ? 'Lima Metropolitana' : 'Provincias'}\n` +
        `*Distrito/Ciudad:* ${cust.district || 'Por coordinar'}\n` +
        `*Dirección:* ${cust.address || 'Por coordinar'}\n\n` +
        `Hola, deseo coordinar mi pago y entrega prioritaria por este canal oficial.`;

      const waUrl = `https://wa.me/51922020069?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    });
  }

  // Handle Payment Method Cards Selection UI
  function setPaymentMethod(method) {
    selectedPaymentMethod = method;
    paymentMethodRadios.forEach(r => {
      r.checked = (r.value === method);
    });

    const yapeLabel = document.getElementById('payment-method-label-yape');
    const cardLabel = document.getElementById('payment-method-label-card');

    if (method === 'yape') {
      if (yapeLabel) {
        yapeLabel.className = 'payment-method-card flex flex-col justify-between p-3 rounded-2xl border-2 border-[#C84B69] bg-[#FDF5F7] cursor-pointer transition-all';
      }
      if (cardLabel) {
        cardLabel.className = 'payment-method-card flex flex-col justify-between p-3 rounded-2xl border border-[#F5DCE3] bg-white cursor-pointer hover:border-[#C84B69] transition-all';
      }
      if (btnPayText) btnPayText.textContent = 'Continuar con Yape / Plin';
      if (btnPayIconYape) btnPayIconYape.classList.remove('hidden');
      if (btnPayIconCard) btnPayIconCard.classList.add('hidden');
      if (cardNoticePill) cardNoticePill.classList.add('hidden');
    } else {
      if (yapeLabel) {
        yapeLabel.className = 'payment-method-card flex flex-col justify-between p-3 rounded-2xl border border-[#F5DCE3] bg-white cursor-pointer hover:border-[#C84B69] transition-all';
      }
      if (cardLabel) {
        cardLabel.className = 'payment-method-card flex flex-col justify-between p-3 rounded-2xl border-2 border-[#C84B69] bg-[#FDF5F7] cursor-pointer transition-all';
      }
      if (btnPayText) btnPayText.textContent = 'Pagar con Tarjeta Online';
      if (btnPayIconYape) btnPayIconYape.classList.add('hidden');
      if (btnPayIconCard) btnPayIconCard.classList.remove('hidden');
      if (cardNoticePill) cardNoticePill.classList.remove('hidden');
    }
  }

  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      setPaymentMethod(radio.value);
    });
  });

  paymentMethodCards.forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[name="payment_method"]');
      if (radio) {
        setPaymentMethod(radio.value);
      }
    });
  });

  let activeOrderContext = null;

  function resetToCheckoutForm() {
    if (window.KR && typeof window.KR.removeForms === 'function') {
      try { window.KR.removeForms(); } catch (_) {}
    }
    if (smartFormWrapper) {
      smartFormWrapper.innerHTML = '<div class="kr-smart-form"></div>';
    }
    if (paymentContainer) paymentContainer.classList.add('hidden');
    if (receiptContainer) receiptContainer.classList.add('hidden');
    if (yapeScreen) yapeScreen.classList.add('hidden');
    if (presentationSection) presentationSection.classList.remove('hidden');
    if (qtySection) qtySection.classList.remove('hidden');
    if (customerFormSection) customerFormSection.classList.remove('hidden');
    if (drawerFooter) drawerFooter.classList.remove('hidden');
    if (drawerBody) drawerBody.scrollTop = 0;
    if (btnPayIzipay) {
      btnPayIzipay.classList.remove('hidden');
      btnPayIzipay.disabled = false;
    }
    setPaymentMethod(selectedPaymentMethod);
    if (notifBox) notifBox.classList.add('hidden');
  }

  if (btnEditData) {
    btnEditData.addEventListener('click', resetToCheckoutForm);
  }

  if (btnNewOrder) {
    btnNewOrder.addEventListener('click', () => {
      activeOrderContext = null;
      resetToCheckoutForm();
    });
  }

  if (btnYapeNewOrder) {
    btnYapeNewOrder.addEventListener('click', () => {
      activeOrderContext = null;
      resetToCheckoutForm();
    });
  }

  function bindKryptonHandlers(KR) {
    if (kryptonCallbacksBound) return;
    kryptonCallbacksBound = true;

    KR.onError((error) => {
      console.error('[IZIPAY KR.onError]', error);
      const errMsg = error?.detailedErrorMessage || error?.errorMessage || 'Verifica los datos ingresados e intenta nuevamente.';
      showNotification(
        `<strong>No se pudo procesar el pago:</strong> ${errMsg} <span class="text-[10px] opacity-70">(${error?.errorCode || 'IZIPAY'})</span>`,
        true
      );
    });

    KR.onSubmit(async (paymentData) => {
      try {
        showNotification('Verificando firma criptográfica de pago...', false);

        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'kr-answer': paymentData.rawClientAnswer,
            'kr-hash': paymentData.hash,
            'kr-hash-key': paymentData.hashKey || 'sha256_hmac'
          })
        });

        const verified = await verifyRes.json();

        if (!verified.valid) {
          showNotification(
            `<strong>No pudimos validar la firma del comprobante.</strong> Por seguridad, verifica con soporte o WhatsApp Concierge.`,
            true
          );
          return false;
        }

        const status = verified.orderStatus || paymentData.clientAnswer?.orderStatus || 'UNKNOWN';
        if (status === 'PAID' || status === 'RUNNING') {
          if (paymentContainer) paymentContainer.classList.add('hidden');
          if (notifBox) notifBox.classList.add('hidden');

          const finalOrder = verified.orderId || activeOrderContext?.orderId || 'NYOTA';
          const finalAmount = verified.amount ? `${verified.currency || 'PEN'} ${verified.amount.toFixed(2)}` : `S/. ${(activeOrderContext?.total || 0).toFixed(2)}`;
          const finalTx = verified.transactionUuid || 'Verificado';
          const c = activeOrderContext?.customer || {};
          const currentPricing = computeOrderPricing(c.destination);

          // Asynchronously dispatch notification email to nyotapedidos@gmail.com
          fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: finalOrder,
              customer: c,
              pricing: {
                tier: activeOrderContext?.tier || state.tier,
                tierName: state.names[activeOrderContext?.tier || state.tier],
                quantity: activeOrderContext?.quantity || state.quantity,
                subtotal: currentPricing.subtotal,
                discountAmount: currentPricing.discountAmount,
                shippingCost: currentPricing.shippingCost,
                total: activeOrderContext?.total || currentPricing.total
              },
              transaction: {
                transactionUuid: finalTx,
                orderStatus: status,
                paymentMethod: verified.paymentMethod || 'CARD',
                currency: verified.currency || 'PEN'
              }
            })
          }).then(r => r.json()).then(res => {
            console.log('[ORDER EMAIL NOTIFICATION RESULT]', res);
          }).catch(err => {
            console.warn('[ORDER EMAIL SILENT ERR]', err);
          });

          const rOrderId = document.getElementById('receipt-order-id');
          const rStatus = document.getElementById('receipt-status');
          const rAmount = document.getElementById('receipt-amount');
          const rTxId = document.getElementById('receipt-tx-id');
          const rWaLink = document.getElementById('receipt-whatsapp-link');
          const rDest = document.getElementById('receipt-destination');
          const rAddr = document.getElementById('receipt-address');
          const rMapsLink = document.getElementById('receipt-maps-link');

          if (rOrderId) rOrderId.textContent = finalOrder;
          if (rStatus) rStatus.textContent = `${status} (Aprobado)`;
          if (rAmount) rAmount.textContent = finalAmount;
          if (rTxId) rTxId.textContent = finalTx;
          if (rDest) rDest.textContent = `${c.district || 'Lima'}, ${c.destination === 'provincias' ? 'Provincia' : 'Lima Metro'}`;
          if (rAddr) rAddr.textContent = [c.address, c.reference].filter(Boolean).join(' - ') || 'Dirección registrada';
          if (rMapsLink) {
            if (c.mapsUrl) {
              rMapsLink.href = c.mapsUrl;
              rMapsLink.classList.remove('hidden');
            } else {
              rMapsLink.classList.add('hidden');
            }
          }

          if (rWaLink) {
            const waText =
              `*PEDIDO PAGADO POR TARJETA ONLINE (IZIPAY) - NYOTA*\n` +
              `----------------------------------------\n` +
              `*N° Pedido:* ${finalOrder}\n` +
              `*Estado:* ${status}\n` +
              `*Monto:* ${finalAmount}\n` +
              `*ID Transacción:* ${finalTx}\n` +
              `----------------------------------------\n` +
              `*DATOS DE DESPACHO*\n` +
              `*Cliente:* ${c.name || ''}\n` +
              `*WhatsApp:* ${c.phone || ''}\n` +
              `*DNI/RUC:* ${c.dni || ''}\n` +
              `*Destino:* ${c.district || ''} (${c.destination === 'provincias' ? 'Provincia' : 'Lima Metro'})\n` +
              `*Dirección:* ${c.address || ''} ${c.reference ? `(${c.reference})` : ''}\n` +
              (c.mapsUrl ? `*Ubicación Google Maps:* ${c.mapsUrl}\n` : '') +
              (c.deliveryNotes ? `*Notas de entrega:* ${c.deliveryNotes}\n` : '') +
              `----------------------------------------\n` +
              `¡Hola NYOTA! Acabo de pagar en línea con mi tarjeta. Confirmo mis datos de despacho prioritario.`;
            rWaLink.href = `https://wa.me/51922020069?text=${encodeURIComponent(waText)}`;
          }

          if (receiptContainer) receiptContainer.classList.remove('hidden');
        } else {
          showNotification(
            `<strong>Estado del pago: ${status}.</strong> No se realizó el cobro. Puedes reintentar con otra tarjeta, Yape o usar WhatsApp Concierge.`,
            true
          );
        }
      } catch (err) {
        console.error('[IZIPAY onSubmit error]', err);
        showNotification(
          `Hubo un error al confirmar la respuesta de pago. Revisa tu conexión o contáctanos por WhatsApp.`,
          true
        );
      }

      // Return false to keep full SPA experience inside the drawer
      return false;
    });
  }

  // Handle Main Payment Button (Yape/Plin Step-by-Step or izipay Online Card)
  if (btnPayIzipay) {
    btnPayIzipay.addEventListener('click', async () => {
      const cust = getCustomerData();
      const validationError = validateCustomer(cust);
      if (validationError) {
        showNotification(`<strong>Faltan datos requeridos:</strong> ${validationError}`, true);
        return;
      }

      const pricing = computeOrderPricing(cust.destination);
      const total = pricing.total;
      const orderCodeNum = String(Date.now()).slice(-4);
      const orderId = `VIXN${orderCodeNum}NY`;

      activeOrderContext = { orderId, total, customer: cust, tier: state.tier, quantity: state.quantity, firstPurchase: state.firstPurchase };

      // Case 1: YAPE / PLIN STEP-BY-STEP WORKFLOW
      if (selectedPaymentMethod === 'yape') {
        if (notifBox) notifBox.classList.add('hidden');

        // Hide checkout form and drawer footer
        if (presentationSection) presentationSection.classList.add('hidden');
        if (qtySection) qtySection.classList.add('hidden');
        if (customerFormSection) customerFormSection.classList.add('hidden');
        if (drawerFooter) drawerFooter.classList.add('hidden');
        if (paymentContainer) paymentContainer.classList.add('hidden');
        if (receiptContainer) receiptContainer.classList.add('hidden');

        // Populate Yape Confirmation Screen
        if (yapeOrderCode) yapeOrderCode.textContent = orderId;
        const firstName = (cust.name || 'Cliente').split(' ')[0];
        if (yapeClientName) yapeClientName.textContent = firstName;

        const regionCode = cust.destination === 'lima' ? 'PE-LIM' : 'PE-PROV';
        if (yapeDisplayLocation) yapeDisplayLocation.textContent = `${cust.district || 'Lima'}, ${regionCode}`;
        if (yapeDisplayAddress) yapeDisplayAddress.textContent = cust.address || '';
        if (yapeStepAmount) yapeStepAmount.textContent = `S/. ${total.toFixed(2)}`;

        if (yapeDisplayEmail) yapeDisplayEmail.textContent = cust.email || '';
        if (yapeDisplayPhone) yapeDisplayPhone.textContent = cust.phone || '';
        if (yapeDisplayFullName) yapeDisplayFullName.textContent = cust.name || '';
        if (yapeDisplayFullAddress) yapeDisplayFullAddress.textContent = cust.address || '';
        if (yapeDisplayCity) yapeDisplayCity.textContent = `${cust.district || ''} (Destino: ${cust.destination === 'lima' ? 'Lima Metropolitana' : 'Provincias'})`;
        if (yapeDisplayProduct) yapeDisplayProduct.textContent = `${state.names[state.tier]} (${state.quantity} unidad${state.quantity > 1 ? 'es' : ''})`;
        if (yapeDisplayTotal) yapeDisplayTotal.textContent = `S/. ${total.toFixed(2)}`;

        // Build WhatsApp pre-filled verification message
        const waYapeMsg =
          `*CONFIRMACIÓN DE PEDIDO NYOTA (YAPE / PLIN)*\n` +
          `----------------------------------------\n` +
          `*N° Pedido:* ${orderId}\n` +
          `*Cliente:* ${cust.name}\n` +
          `*WhatsApp:* ${cust.phone}\n` +
          `*DNI/RUC:* ${cust.dni}\n` +
          `*Destino:* ${cust.district} (${cust.destination === 'lima' ? 'Lima Metropolitana' : 'Provincias'})\n` +
          `*Dirección:* ${cust.address}\n` +
          `----------------------------------------\n` +
          `*Tratamiento:* ${state.names[state.tier]} (Cant: ${state.quantity})\n` +
          (state.firstPurchase ? `*Descuento 1ª Compra (-10%):* Aplicado\n` : '') +
          `*Envío:* ${pricing.shippingCost === 0 ? 'Gratis (Lima Metropolitana)' : `S/. ${pricing.shippingCost.toFixed(2)} (Provincia)`}\n` +
          `*TOTAL PAGADO / A CONFIRMAR:* S/. ${total.toFixed(2)}\n` +
          `----------------------------------------\n` +
          `¡Hola NYOTA! Acabo de realizar mi pago por Yape/Plin a nombre de Jorgelys Davila. Adjunto el comprobante de pago para que procedan con el despacho de mi pedido.`;

        if (btnSendYapeWhatsapp) {
          btnSendYapeWhatsapp.href = `https://wa.me/51922020069?text=${encodeURIComponent(waYapeMsg)}`;
        }

        if (yapeScreen) {
          yapeScreen.classList.remove('hidden');
        }

        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
        return;
      }

      // Case 2: ONLINE CARD PAYMENT (izipay)
      btnPayIzipay.disabled = true;
      btnPayText.textContent = 'Generando pasarela segura...';
      if (notifBox) notifBox.classList.add('hidden');

      try {
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            currency: 'PEN',
            orderId: orderId,
            customer: cust,
            metadata: {
              tier: state.tier,
              quantity: String(state.quantity),
              destination: cust.destination || 'lima',
              firstPurchaseDiscount: state.firstPurchase ? '10%' : '0%',
              shippingCost: pricing.shippingCost.toFixed(2)
            }
          })
        });

        const data = await response.json();

        if (!data.success || !data.formToken || !data.publicKey) {
          console.warn('[IZIPAY create-payment failed]', data);
          const refCode = data.errorCode || 'IZIPAY_ERR';
          const detailHint =
            refCode === 'MISSING_CONFIG'
              ? 'Faltan variables de entorno de IZIPAY en Vercel.'
              : refCode === 'INT_905'
                ? 'Credenciales IZIPAY pendientes o inválidas en Vercel.'
                : (data.error || 'Pasarela en validación.');

          showNotification(
            `<strong>No se pudo iniciar la pasarela en línea (${detailHint}).</strong><br>` +
            `Puedes finalizar tu compra inmediatamente vía <strong>WhatsApp Concierge</strong> sin contratiempos. ` +
            `<span class="block text-[10px] opacity-70 mt-1">[Ref: ${refCode} · Modo: ${data.mode || 'N/A'}]</span>`,
            true
          );
          btnPayText.textContent = 'Reintentar Pago con Tarjeta';
          btnPayIzipay.disabled = false;
          return;
        }

        // Load official Krypton V4.0 library matched to the active publicKey (TEST or PRODUCTION)
        const KR = await loadKryptonLibrary(data.publicKey);
        bindKryptonHandlers(KR);

        // Clean any prior rendered instance before rendering new formToken
        if (typeof KR.removeForms === 'function') {
          try { KR.removeForms(); } catch (_) {}
        }
        if (smartFormWrapper) {
          smartFormWrapper.innerHTML = '<div class="kr-smart-form"></div>';
        }

        if (modeBadge) {
          if (data.mode === 'TEST') {
            modeBadge.classList.remove('hidden');
            modeBadge.textContent = 'MODO PRUEBAS';
          } else {
            modeBadge.classList.add('hidden');
          }
        }

        if (presentationSection) presentationSection.classList.add('hidden');
        if (qtySection) qtySection.classList.add('hidden');
        if (customerFormSection) customerFormSection.classList.add('hidden');
        if (drawerFooter) drawerFooter.classList.add('hidden');
        if (compactSummary) {
          compactSummary.textContent = `${state.names[state.tier]} · Cant: ${state.quantity} · Entrega: ${cust.district}`;
        }
        if (paymentContainer) paymentContainer.classList.remove('hidden');
        if (btnPayIzipay) btnPayIzipay.classList.add('hidden');

        await KR.setFormConfig({
          formToken: data.formToken,
          publicKey: data.publicKey,
          'kr-language': 'es-ES'
        });

        await KR.renderElements('#izipay-smartform-wrapper .kr-smart-form');

        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      } catch (err) {
        console.error('Checkout error:', err);
        showNotification(
          `No se pudo inicializar el formulario de pagos en este momento. Puedes finalizar tu pedido vía <strong>WhatsApp Concierge</strong> inmediatamente.`,
          true
        );
        btnPayText.textContent = 'Pagar con Tarjeta / Yape / Plin';
        btnPayIzipay.disabled = false;
      }
    });
  }

  // Initial Calculation
  updateTotals();
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

// 5. STICKY BUY BAR (Reveals smoothly only when mouse passes near bottom edge)
function initStickyBar() {
  const bar = document.getElementById('sticky-buy-bar');
  const cartDrawer = document.getElementById('cart-drawer');
  if (!bar) return;

  const ENTER_ZONE_PX = 20;
  const EXIT_ZONE_PX = 78;
  let isHovered = false;

  const setVisible = (show) => {
    const drawerOpen = cartDrawer && cartDrawer.classList.contains('open');
    if (show && !drawerOpen) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  };

  bar.addEventListener('mouseenter', () => {
    isHovered = true;
    setVisible(true);
  });

  bar.addEventListener('mouseleave', (e) => {
    isHovered = false;
    if (e.clientY < window.innerHeight - EXIT_ZONE_PX) {
      setVisible(false);
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (window.matchMedia && !window.matchMedia('(any-pointer: fine)').matches) {
      setVisible(false);
      return;
    }
    const distFromBottom = window.innerHeight - e.clientY;
    const overFooterLink = e.target && typeof e.target.closest === 'function' && e.target.closest('footer a, footer button');
    if (!isHovered && overFooterLink) {
      setVisible(false);
      return;
    }
    if (distFromBottom <= ENTER_ZONE_PX || isHovered) {
      setVisible(true);
    } else if (distFromBottom > EXIT_ZONE_PX) {
      setVisible(false);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    isHovered = false;
    setVisible(false);
  });

  window.addEventListener('blur', () => {
    isHovered = false;
    setVisible(false);
  });

  const stickyCartBtn = document.getElementById('sticky-cart-btn');
  if (stickyCartBtn) {
    stickyCartBtn.addEventListener('click', () => {
      isHovered = false;
      bar.classList.remove('visible');
    });
  }

  window.addEventListener('touchstart', (e) => {
    if (!bar.contains(e.target)) {
      isHovered = false;
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
