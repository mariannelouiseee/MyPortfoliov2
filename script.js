(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Scroll reveal (plays once per element) ---------- */
  const revealTargets = document.querySelectorAll(
    ".reveal, .timeline-item, .skill-group"
  );

  // Stagger skill cards inside each group
  document.querySelectorAll(".skill-group").forEach((group) => {
    group.querySelectorAll(".skill").forEach((skill, i) => {
      skill.style.setProperty("--i", i);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ---------- Typing effect ---------- */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const phrases = [
      "QA Engineer",
      "Graphic Artist",
      "detail-oriented tester",
      "lifelong learner",
    ];

    if (reduceMotion) {
      typedEl.textContent = phrases[0];
    } else {
      let p = 0;
      let c = 0;
      let deleting = false;

      const tick = () => {
        const word = phrases[p];
        typedEl.textContent = word.slice(0, c);

        let delay = deleting ? 45 : 90;

        if (!deleting && c === word.length) {
          delay = 1600;
          deleting = true;
        } else if (deleting && c === 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
          delay = 350;
        } else {
          c += deleting ? -1 : 1;
        }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 900);
    }
  }

  /* ---------- Navbar: scrolled state, scroll-spy, progress bar ---------- */
  const navbar = document.querySelector(".navbar");
  const progress = document.querySelector(".scroll-progress");
  const toTop = document.querySelector(".to-top");
  const navLinks = document.querySelectorAll("#nav-links a");
  const sections = [...navLinks]
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    navbar.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 500);
    progress.style.setProperty("--p", max > 0 ? Math.min(y / max, 1) : 0);

    // Scroll-spy: the last section whose top has passed the probe line
    const probe = y + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach((s) => {
      if (s.offsetTop <= probe) current = s;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${current.id}`)
    );

    // Education timeline progress line
    const tl = document.querySelector(".timeline-items");
    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / r.height;
      tl.style.setProperty("--tl", Math.max(0, Math.min(p, 1)));
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-links");

  const setMenu = (open) => {
    toggle.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () =>
    setMenu(!menu.classList.contains("open"))
  );
  navLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Cursor glow, 3D tilt, card spotlight (pointer devices) ---------- */
  if (canHover && !reduceMotion) {
    const glow = document.querySelector(".cursor-glow");
    let gx = 0;
    let gy = 0;
    let raf = null;

    window.addEventListener(
      "mousemove",
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        glow.classList.add("on");
        if (!raf) {
          raf = requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
            raf = null;
          });
        }
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));

    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${x * 14}deg`);
        el.style.setProperty("--rx", `${-y * 14}deg`);
      });
      el.addEventListener("mouseleave", () => {
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      });
    });

    document.querySelectorAll(".spotlight").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Project filter ---------- */
  const filters = document.querySelectorAll(".filter");
  const projectCards = document.querySelectorAll(".project-card");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.filter;
      filters.forEach((b) => b.classList.toggle("active", b === btn));

      let n = 0;
      projectCards.forEach((card) => {
        const show = type === "all" || card.dataset.category === type;
        card.classList.toggle("hide", !show);
        card.classList.remove("filter-in");
        if (show) {
          card.classList.add("in"); // make sure it's visible even if never scrolled to
          card.style.setProperty("--fi", `${n++ * 80}ms`);
          void card.offsetWidth; // restart the animation
          card.classList.add("filter-in");
        }
      });
    });
  });

  /* ---------- Contact form (Web3Forms, submitted without leaving the page) ---------- */
  const form = document.querySelector("#contact form");
  if (form) {
    const status = form.querySelector(".form-status");
    const button = form.querySelector("button[type=submit]");
    const label = button.querySelector(".btn-label");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";
      button.disabled = true;
      label.textContent = "Sending…";

      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          status.classList.add("success");
          status.textContent = "Thank you! Your message has been sent.";
          form.reset();
        } else {
          throw new Error(data.message || "Something went wrong.");
        }
      } catch (err) {
        status.classList.add("error");
        status.textContent =
          "Sorry, your message couldn't be sent. Please try again.";
      } finally {
        button.disabled = false;
        label.textContent = "Submit";
      }
    });
  }
})();
