(() => {
  const loader = document.getElementById("loader");
  const story = document.querySelector(".story-page");
  const sky = document.querySelector(".sky");
  const giftButton = document.getElementById("gift-button");
  const giftMessage = document.getElementById("gift-message");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fireworksPage = document.body.classList.contains("fireworks-page");
  const isStandaloneLoading = document.body.classList.contains("loading-only-page");

  // Loader Elements
  const stageLoading = document.getElementById("loaderStageLoading");
  const stageGate = document.getElementById("loaderStageGate");
  const progressBar = document.getElementById("progressBar");
  const progressPercentage = document.getElementById("progressPercentage");
  const loaderStatusText = document.getElementById("loaderStatusText");
  const skipLoadingBtn = document.getElementById("skipLoadingBtn");
  const standaloneAction = document.getElementById("standaloneAction");

  let frame = 0;
  let clickSparkles = [];

  // -------------------------------------------------------------------------
  // 1. LOVELY SURPRISE LOADING SIMULATION
  // -------------------------------------------------------------------------
  const statusPhrases = [
    { threshold: 0, text: "Gathering stardust and sweet memories... ✨" },
    { threshold: 25, text: "Unfolding moments of laughter and light... 💖" },
    { threshold: 55, text: "Sprinkling extra birthday magic on your day... 🌸" },
    { threshold: 82, text: "Almost ready for someone truly extraordinary... 🎁" },
    { threshold: 100, text: "Your lovely surprise is ready! ✨" }
  ];

  function runLoadingSimulation() {
    if (!progressBar || !progressPercentage) return;

    let currentProgress = 0;
    const duration = reducedMotion.matches ? 400 : 2200; // ~2.2 seconds
    const startTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(100, (elapsed / duration) * 100);
      
      // Gentle easeOutQuad progression
      const easeProgress = 1 - Math.pow(1 - (rawProgress / 100), 2);
      currentProgress = Math.round(easeProgress * 100);

      progressBar.style.width = `${currentProgress}%`;
      progressPercentage.textContent = `${currentProgress}%`;

      // Update status text smoothly
      for (let i = statusPhrases.length - 1; i >= 0; i--) {
        if (currentProgress >= statusPhrases[i].threshold) {
          if (loaderStatusText && loaderStatusText.textContent !== statusPhrases[i].text) {
            loaderStatusText.textContent = statusPhrases[i].text;
          }
          break;
        }
      }

      if (currentProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        finishLoading();
      }
    }

    requestAnimationFrame(updateProgress);
  }

  function finishLoading() {
    if (progressBar) progressBar.style.width = "100%";
    if (progressPercentage) progressPercentage.textContent = "100%";
    if (loaderStatusText) loaderStatusText.textContent = "Your lovely surprise is ready! ✨";

    if (isStandaloneLoading) {
      if (standaloneAction) standaloneAction.hidden = false;
      // Auto-transition to index.html after 1.4s
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
      return;
    }

    // On index.html: transition to Gatekeeper card
    setTimeout(() => {
      if (stageLoading) {
        stageLoading.style.opacity = "0";
        stageLoading.style.transform = "scale(0.96)";
        setTimeout(() => {
          stageLoading.hidden = true;
          if (stageGate) {
            stageGate.hidden = false;
            stageGate.style.opacity = "0";
            stageGate.style.transform = "scale(0.96)";
            requestAnimationFrame(() => {
              stageGate.style.transition = "opacity 0.6s ease, transform 0.6s ease";
              stageGate.style.opacity = "1";
              stageGate.style.transform = "scale(1)";
            });
          }
        }, 350);
      }
    }, 450);
  }

  if (skipLoadingBtn) {
    skipLoadingBtn.addEventListener("click", () => {
      finishLoading();
    });
  }

  // -------------------------------------------------------------------------
  // 2. GATEWAY ENTRY & STORY UNVEILING
  // -------------------------------------------------------------------------
  function enterBirthday(e) {
    if (e && e.clientX) {
      spawnClickSparkles(e.clientX, e.clientY, 32);
    }
    document.body.classList.add("entered");
    if (story) story.inert = false;
    if (loader) loader.classList.add("is-leaving");
    if (!reducedMotion.matches && !frame) frame = window.requestAnimationFrame(animate);
  }

  if (loader && !isStandaloneLoading) {
    document.querySelectorAll(".yes-button").forEach((button) => {
      button.addEventListener("click", enterBirthday);
    });
    // Start lovely surprise loading simulation
    runLoadingSimulation();
  } else if (isStandaloneLoading) {
    runLoadingSimulation();
  } else {
    enterBirthday();
  }

  // -------------------------------------------------------------------------
  // 3. GIFT UNWRAPPING ON PAGE 6
  // -------------------------------------------------------------------------
  if (giftButton && giftMessage) {
    giftButton.addEventListener("click", (e) => {
      giftMessage.hidden = false;
      giftButton.setAttribute("aria-expanded", "true");
      giftButton.disabled = true;
      giftButton.textContent = "A little note, just for you ✧";
      if (e && e.clientX) {
        spawnClickSparkles(e.clientX, e.clientY, 28);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. INTERACTIVE CLICK SPARKLES
  // -------------------------------------------------------------------------
  function spawnClickSparkles(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      clickSparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1.2,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        hue: [330, 42, 280, 200][Math.floor(Math.random() * 4)]
      });
    }
  }

  window.addEventListener("pointerdown", (e) => {
    // Only spawn occasional gentle sparkles on general clicks
    if (Math.random() > 0.4 || e.target.closest("button, a")) {
      spawnClickSparkles(e.clientX, e.clientY, 12);
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 5. SKY CANVAS (STARDUST, FLOATING BALLOONS, CELESTIAL FIREWORKS)
  // -------------------------------------------------------------------------
  if (!sky) return;
  const context = sky.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let balloons = [];
  let fireworks = [];

  const random = (min, max) => Math.random() * (max - min) + min;

  function resizeSky() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    sky.width = Math.round(width * pixelRatio);
    sky.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    particles = Array.from({ length: Math.min(95, Math.round((width * height) / 13000)) }, () => ({
      x: random(0, width),
      y: random(0, height),
      radius: random(0.6, 2.2),
      speed: random(0.12, 0.48),
      drift: random(-0.2, 0.2),
      phase: random(0, Math.PI * 2),
      hue: random(0, 1)
    }));

    balloons = Array.from({ length: Math.max(5, Math.min(11, Math.round(width / 120))) }, (_, index) => ({
      x: random(0, width),
      y: random(0, height),
      size: random(14, 26),
      speed: random(0.14, 0.36),
      drift: random(-0.22, 0.22),
      sway: random(0, Math.PI * 2),
      hue: [334, 286, 38, 316][index % 4]
    }));

    fireworks = fireworksPage && !reducedMotion.matches
      ? Array.from({ length: Math.max(4, Math.min(8, Math.round(width / 150))) }, () => createFirework(true))
      : [];
  }

  function createFirework(initial = false) {
    const hue = [334, 43, 278, 196, 320][Math.floor(random(0, 5))];
    return {
      x: random(width * 0.12, width * 0.88),
      y: random(height * 0.1, height * 0.78),
      hue,
      age: initial ? random(0, 110) : 0,
      lifetime: random(105, 175),
      particles: Array.from({ length: Math.round(random(24, 38)) }, () => ({
        angle: random(0, Math.PI * 2),
        speed: random(0.5, 2.4),
        size: random(1.2, 2.8)
      }))
    };
  }

  function drawBalloon(balloon, time) {
    const sway = Math.sin(time * 0.00055 + balloon.sway) * 14;
    const x = balloon.x + sway;
    const y = balloon.y;
    const radius = balloon.size;

    const gradient = context.createRadialGradient(x - radius * 0.35, y - radius * 0.45, 1, x, y, radius * 1.35);
    gradient.addColorStop(0, `hsla(${balloon.hue}, 90%, 92%, .75)`);
    gradient.addColorStop(0.28, `hsla(${balloon.hue}, 85%, 72%, .36)`);
    gradient.addColorStop(1, `hsla(${balloon.hue}, 80%, 58%, .08)`);

    context.beginPath();
    context.ellipse(x, y, radius * 0.78, radius, 0, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.shadowBlur = 24;
    context.shadowColor = `hsla(${balloon.hue}, 90%, 75%, .62)`;
    context.fill();
    context.shadowBlur = 0;

    // Balloon Knot
    context.beginPath();
    context.moveTo(x - radius * 0.14, y + radius * 0.96);
    context.lineTo(x, y + radius * 1.2);
    context.lineTo(x + radius * 0.14, y + radius * 0.96);
    context.strokeStyle = `hsla(${balloon.hue}, 82%, 84%, .45)`;
    context.lineWidth = 1;
    context.stroke();

    // Balloon String
    context.beginPath();
    context.moveTo(x, y + radius * 1.2);
    context.bezierCurveTo(
      x + 9, y + radius * 1.8,
      x - 8, y + radius * 2.25,
      x + Math.sin(time * 0.001 + balloon.sway) * 8, y + radius * 3.0
    );
    context.strokeStyle = `hsla(${balloon.hue}, 70%, 82%, .28)`;
    context.stroke();
  }

  function animate(time) {
    context.clearRect(0, 0, width, height);

    // Stardust Particles
    for (const particle of particles) {
      particle.y -= particle.speed;
      particle.x += particle.drift + Math.sin(time * 0.0007 + particle.phase) * 0.14;
      if (particle.y < -5) {
        particle.y = height + 5;
        particle.x = random(0, width);
      }
      if (particle.x < -5) particle.x = width + 5;
      if (particle.x > width + 5) particle.x = -5;

      const alpha = 0.3 + (Math.sin(time * 0.0015 + particle.phase) + 1) * 0.28;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.hue > 0.78
        ? `rgba(255, 225, 170, ${alpha})`
        : `rgba(255, ${165 + Math.round(particle.hue * 55)}, ${205 + Math.round(particle.hue * 40)}, ${alpha})`;
      context.shadowBlur = particle.radius * 7;
      context.shadowColor = "rgba(255, 185, 225, .8)";
      context.fill();
    }
    context.shadowBlur = 0;

    // Floating Balloons
    for (const balloon of balloons) {
      balloon.y -= balloon.speed;
      balloon.x += balloon.drift;
      if (balloon.y < -balloon.size * 4) {
        balloon.y = height + balloon.size * 3;
        balloon.x = random(0, width);
      }
      if (balloon.x < -40) balloon.x = width + 40;
      if (balloon.x > width + 40) balloon.x = -40;
      drawBalloon(balloon, time);
    }

    // Click Sparkles
    if (clickSparkles.length > 0) {
      clickSparkles = clickSparkles.filter((s) => s.life > 0);
      for (const s of clickSparkles) {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life > 0) {
          context.beginPath();
          context.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
          context.fillStyle = `hsla(${s.hue}, 95%, 80%, ${s.life * 0.85})`;
          context.shadowBlur = 8;
          context.shadowColor = `hsla(${s.hue}, 95%, 75%, 0.8)`;
          context.fill();
        }
      }
      context.shadowBlur = 0;
    }

    // Fireworks on Grand Finale Page
    if (fireworksPage && !reducedMotion.matches) {
      fireworks = fireworks.filter((f) => f.age < f.lifetime);
      if (fireworks.length < Math.max(4, Math.min(8, Math.round(width / 150))) && Math.random() < 0.048) {
        fireworks.push(createFirework());
      }
      for (const firework of fireworks) {
        const progress = firework.age / firework.lifetime;
        const fade = Math.sin(progress * Math.PI);
        for (const spark of firework.particles) {
          const distance = spark.speed * firework.age * 0.08;
          const x = firework.x + Math.cos(spark.angle) * distance;
          const y = firework.y + Math.sin(spark.angle) * distance + progress * progress * 16;
          context.beginPath();
          context.arc(x, y, spark.size * fade, 0, Math.PI * 2);
          context.fillStyle = `hsla(${firework.hue}, 100%, 78%, ${fade * 0.85})`;
          context.shadowBlur = 14;
          context.shadowColor = `hsla(${firework.hue}, 100%, 74%, .85)`;
          context.fill();
        }
        firework.age += 1;
      }
      context.shadowBlur = 0;
    }

    frame = window.requestAnimationFrame(animate);
  }

  resizeSky();
  window.addEventListener("resize", resizeSky, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else if (!document.hidden && !reducedMotion.matches && !frame) {
      frame = window.requestAnimationFrame(animate);
    }
  });
})();
