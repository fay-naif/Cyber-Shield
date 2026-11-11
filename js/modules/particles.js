/**
 * Background of faint floating dots drawn on a canvas.
 */
window.Particles = (function () {
  "use strict";

  const COUNT = 18;
  let canvas, ctx, dots = [], width = 0, height = 0, rgb = "0, 200, 230";

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createDot() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 5 + Math.random() * 4,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: 0.1 + Math.random() * 0.12,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    dots.forEach((dot) => {
      dot.x += dot.dx;
      dot.y += dot.dy;
      if (dot.x < -10) dot.x = width + 10;
      if (dot.x > width + 10) dot.x = -10;
      if (dot.y < -10) dot.y = height + 10;
      if (dot.y > height + 10) dot.y = -10;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + rgb + ", " + dot.alpha + ")";
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  function init() {
    canvas = document.getElementById("particles");
    if (!canvas || !canvas.getContext) return;
    ctx = canvas.getContext("2d");
    const fromCss = getComputedStyle(document.documentElement).getPropertyValue("--particle-rgb").trim();
    if (fromCss) rgb = fromCss;
    resize();
    dots = Array.from({ length: COUNT }, createDot);
    window.addEventListener("resize", resize);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dots.forEach((d) => { d.dx = 0; d.dy = 0; });
    }
    draw();
  }

  return { init };
})();
