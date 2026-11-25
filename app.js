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

  // 2.5. BACKGROUND CONCEPT 3: MICRO-HYALURONIC SPHERES & ACTIVE ANTIOXIDANTS
  const spheresGroup = new THREE.Group();
  scene.add(spheresGroup);

  const sphereGeo = new THREE.SphereGeometry(1, 28, 28);

  // Material 1: Pearlescent Liquid Hyaluronic Beads (matching silk droplets)
  const matHyaluronic = new THREE.MeshPhysicalMaterial({
    color: 0xffedf3,
    transmission: 0.72,
    opacity: 0.94,
    transparent: true,
    roughness: 0.12,
    ior: 1.333,
    thickness: 0.6,
    specularIntensity: 1.0,
    specularColor: 0xffffff,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    emissive: 0x5c1f35,
    emissiveIntensity: 0.28,
    attenuationColor: new THREE.Color(0xf7b9cc),
    attenuationDistance: 0.6
  });

  // Material 2: Active Polyphenols & Antioxidant Superfruit Essence (Luminous Ruby-Rose Glow)
  const matPolyphenol = new THREE.MeshPhysicalMaterial({
    color: 0xe67c9d,
    transmission: 0.38,
    opacity: 0.95,
    transparent: true,
    roughness: 0.12,
    metalness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    emissive: 0x7c1f40,
    emissiveIntensity: 0.55
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

  // Responsive metrics & dimensions calibrated to match the user's golden bounding zone
  let isMobile = window.innerWidth < 1024;
  let posX_Right = isMobile ? 0.68 : 1.45;
  let posX_Left  = isMobile ? -0.68 : -1.45;
  let targetBaseY = isMobile ? 0.05 : -0.18;
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
    posX_Right = isMobile ? 0.68 : 1.45;
    posX_Left  = isMobile ? -0.68 : -1.45;
    targetBaseY = isMobile ? 0.05 : -0.18;

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
      const scale = isMobile ? 8.5 : 11.2;
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
    ctaBtn.href = `https://wa.me/51999999999?text=${msg}`;
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

    return { name, phone, dni, email, destination, district, address };
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

      const waUrl = `https://wa.me/51999999999?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    });
  }

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
    if (presentationSection) presentationSection.classList.remove('hidden');
    if (qtySection) qtySection.classList.remove('hidden');
    if (customerFormSection) customerFormSection.classList.remove('hidden');
    if (drawerFooter) drawerFooter.classList.remove('hidden');
    if (drawerBody) drawerBody.scrollTop = 0;
    if (btnPayIzipay) {
      btnPayIzipay.classList.remove('hidden');
      btnPayIzipay.disabled = false;
    }
    if (btnPayText) btnPayText.textContent = 'Pagar con Tarjeta / Yape / Plin';
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

          const rOrderId = document.getElementById('receipt-order-id');
          const rStatus = document.getElementById('receipt-status');
          const rAmount = document.getElementById('receipt-amount');
          const rTxId = document.getElementById('receipt-tx-id');
          const rWaLink = document.getElementById('receipt-whatsapp-link');

          const finalOrder = verified.orderId || activeOrderContext?.orderId || 'NYOTA';
          const finalAmount = verified.amount ? `${verified.currency || 'PEN'} ${verified.amount.toFixed(2)}` : `S/. ${(activeOrderContext?.total || 0).toFixed(2)}`;
          const finalTx = verified.transactionUuid || 'Verificado';

          if (rOrderId) rOrderId.textContent = finalOrder;
          if (rStatus) rStatus.textContent = status;
          if (rAmount) rAmount.textContent = finalAmount;
          if (rTxId) rTxId.textContent = finalTx;

          if (rWaLink) {
            const c = activeOrderContext?.customer || {};
            const waText =
              `*PEDIDO PAGADO POR IZIPAY - NYOTA*\n` +
              `Orden: ${finalOrder}\n` +
              `Estado: ${status}\n` +
              `Monto: ${finalAmount}\n` +
              `ID Transacción: ${finalTx}\n` +
              `Cliente: ${c.name || ''}\n` +
              `Teléfono: ${c.phone || ''}\n` +
              `Distrito: ${c.district || ''}\n` +
              `Dirección: ${c.address || ''}\n` +
              `¡Hola! Acabo de completar mi pago en línea, deseo coordinar mi entrega.`;
            rWaLink.href = `https://wa.me/51999999999?text=${encodeURIComponent(waText)}`;
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

  // Handle izipay Online Payment
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
      const orderId = `NYOTA-${Date.now()}`;

      activeOrderContext = { orderId, total, customer: cust, tier: state.tier, quantity: state.quantity, firstPurchase: state.firstPurchase };

      // Loading state
      btnPayIzipay.disabled = true;
      btnPayText.textContent = 'Generando transacción segura...';
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
