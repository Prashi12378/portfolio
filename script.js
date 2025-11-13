document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const docStyle = document.documentElement.style;
  let raf;
  let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  const updatePointer = event => {
    pointer = { x: event.clientX, y: event.clientY };
    docStyle.setProperty("--pointer-x", `${pointer.x}px`);
    docStyle.setProperty("--pointer-y", `${pointer.y}px`);
  };

  window.addEventListener("mousemove", event => {
    if (raf) {
      cancelAnimationFrame(raf);
    }
    raf = requestAnimationFrame(() => updatePointer(event));
  });

  // Futuristic tech mesh background
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const dpr = window.devicePixelRatio || 1;
    let nodes = [];
    let animationFrame;

    const palette = ["#6c5ce7", "#32e0c4", "#4ea8de", "#f1f2f6"];

    const createNode = () => {
      const speed = 0.2 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.2 + Math.random() * 2.2,
        hue: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random(),
      };
    };

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const baseCount = window.innerWidth < 720 ? 32 : 56;
      nodes = Array.from({ length: baseCount }, createNode);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        pointer.x * dpr,
        pointer.y * dpr,
        0,
        pointer.x * dpr,
        pointer.y * dpr,
        canvas.width * 0.9
      );
      gradient.addColorStop(0, "rgba(108, 92, 231, 0.18)");
      gradient.addColorStop(0.4, "rgba(41, 128, 185, 0.12)");
      gradient.addColorStop(1, "rgba(11, 16, 38, 0.05)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        const dx = pointer.x * dpr - node.x;
        const dy = pointer.y * dpr - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160 * dpr) {
          const force = (160 * dpr - dist) / (160 * dpr);
          node.vx -= (dx / dist) * force * 0.08;
          node.vy -= (dy / dist) * force * 0.08;
        }

        ctx.beginPath();
        ctx.fillStyle = node.hue;
        const pulse = (Math.sin(Date.now() * 0.002 + node.pulse) + 1) * 0.5;
        ctx.globalAlpha = 0.55 + pulse * 0.35;
        ctx.arc(node.x, node.y, node.size * dpr * (0.7 + pulse * 0.9), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          const threshold = 180 * dpr;
          if (distance < threshold) {
            const opacity = 1 - distance / threshold;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108, 92, 231, ${opacity * 0.6})`;
            ctx.lineWidth = 0.8 * dpr;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(animationFrame);
      resize();
      draw();
    });
  }

  // Scroll triggered shimmer for cards
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("card--visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".card, .glide__card, .timeline__item").forEach(el => {
    el.classList.add("card--hidden");
    observer.observe(el);
  });
});

