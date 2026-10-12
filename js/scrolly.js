(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Typed tagline ──────────────────────────────────
    (function () {
        const el = document.getElementById('typed');
        const phrases = ['AI Engineer', 'Software Developer', 'Multimodal LLM Researcher'];
        if (reduce) { el.textContent = phrases[0]; return; }
        let p = 0, i = 0, deleting = false;
        (function tick() {
            const word = phrases[p];
            el.textContent = word.slice(0, i);
            if (!deleting && i < word.length) { i++; setTimeout(tick, 70); }
            else if (!deleting) { deleting = true; setTimeout(tick, 1600); }
            else if (i > 0) { i--; setTimeout(tick, 35); }
            else { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 350); }
        })();
    })();

    // ── Step activation: a step is "active" when it crosses the viewport middle ──
    function watchSteps(steps, onEnter) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                steps.forEach(s => s.classList.toggle('is-active', s === e.target));
                onEnter(e.target, steps.indexOf(e.target));
            });
        }, { rootMargin: '-50% 0px -50% 0px' });
        steps.forEach(s => io.observe(s));
    }

    // ── Chapter 1: the path, entries slide in from their side ──
    (function () {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -25% 0px' });
        document.querySelectorAll('.entry').forEach(el => io.observe(el));
    })();
    const timeline = document.querySelector('.timeline');
    const timelineFill = document.getElementById('timeline-fill');
    const years = [...document.querySelectorAll('.timeline .year')];

    // ── Chapter 2: work scenes ─────────────────────────
    (function () {
        const steps = [...document.querySelectorAll('#work .step')];
        const scenes = [...document.querySelectorAll('.scene')];
        const nodes = [...document.querySelectorAll('.node')];
        const edges = [...document.querySelectorAll('.edge')];
        const stat = document.getElementById('raguard-stat');
        const points = [...document.querySelectorAll('.points li')];
        let shownNode = 0;

        // light the pipeline node and the matching bullet together
        const STEP_MS = 1800;
        let autoTimer;
        document.querySelector('.points').style.setProperty('--step-ms', STEP_MS + 'ms');

        function setRaguardNode(n) {
            if (n === shownNode) return;
            shownNode = n;
            nodes.forEach(el => {
                const k = +el.dataset.node;
                el.classList.toggle('on', k <= n);
                el.classList.toggle('current', k === n);
            });
            points.forEach(li => {
                const k = +li.dataset.node;
                li.classList.toggle('on', k < n);
                li.classList.toggle('current', k === n);
            });
            edges.forEach((e, i) => e.classList.toggle('on', i + 1 < n));
            stat.classList.toggle('on', n === 4);
        }

        // walk 1 → 4 on a timer, starting from n, then loop back to 1
        function playRaguard(n) {
            clearTimeout(autoTimer);
            if (reduce) { setRaguardNode(4); return; }
            setRaguardNode(n);
            autoTimer = setTimeout(() => playRaguard(n % 4 + 1), STEP_MS);
        }

        // stop the loop whenever RaGuard is off screen
        const raguardStep = document.querySelector('#work .step[data-scene="raguard"]');
        new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) clearTimeout(autoTimer);
        }).observe(raguardStep);

        // clicking a bullet or a pipeline box jumps there and carries on from it
        [...points, ...nodes].forEach(el => {
            const jump = () => playRaguard(+el.dataset.node);
            el.addEventListener('click', jump);
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); }
            });
        });

        // JdAtlas dot grid
        const dotsEl = document.getElementById('atlas-dots');
        for (let i = 0; i < 160; i++) dotsEl.appendChild(document.createElement('i'));
        const dots = [...dotsEl.children];
        const counter = document.querySelector('[data-count]');
        let atlasTimer;

        function playAtlas() {
            clearInterval(atlasTimer);
            dots.forEach(d => d.className = '');
            const order = dots.map((_, i) => i).sort(() => Math.random() - 0.5);
            const target = +counter.dataset.count;
            let n = 0;
            atlasTimer = setInterval(() => {
                for (let k = 0; k < 6 && n < order.length; k++, n++) {
                    const d = dots[order[n]];
                    d.className = Math.random() < 0.15 ? 'on hot' : 'on';
                }
                counter.textContent = Math.round(target * n / order.length).toLocaleString();
                if (n >= order.length) clearInterval(atlasTimer);
            }, reduce ? 0 : 30);
        }

        let current = null;
        watchSteps(steps, (step) => {
            const name = step.dataset.scene;
            scenes.forEach(s => s.classList.toggle('is-active', s.dataset.scene === name));
            if (name === 'raguard') { shownNode = 0; playRaguard(1); }
            else clearTimeout(autoTimer);
            if (name === 'jdatlas' && current !== 'jdatlas') playAtlas();
            current = name;
        });
    })();

    // ── Chapter 4: toolkit tags cascade in ─────────────
    (function () {
        document.querySelectorAll('.tool-group').forEach((g, gi) => {
            g.querySelectorAll('.tags span').forEach((t, i) => {
                t.style.transitionDelay = `${gi * 120 + i * 40}ms`;
            });
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.tool-group, .paper').forEach(g => io.observe(g));
    })();

    // ── Scroll-driven: progress bar, timeline line, active chapter ──
    const bar = document.getElementById('progress-bar');
    const chapters = [...document.querySelectorAll('section[data-chapter]')];
    const navLinks = [...document.querySelectorAll('.topbar-nav a')];
    let ticking = false;

    function onScroll() {
        const doc = document.documentElement;
        const y = window.scrollY, vh = window.innerHeight;
        bar.style.transform = `scaleX(${y / (doc.scrollHeight - vh)})`;

        // timeline line draws down to the viewport middle; years light as it passes them
        const t = timeline.getBoundingClientRect();
        const fill = Math.min(1, Math.max(0, (vh * 0.6 - t.top) / t.height));
        timelineFill.style.transform = `scaleY(${fill})`;
        years.forEach(yEl => yEl.classList.toggle('is-lit', yEl.getBoundingClientRect().top < vh * 0.6));

        let active = null;
        chapters.forEach(c => {
            const b = c.getBoundingClientRect();
            if (b.top <= vh * 0.5 && b.bottom > vh * 0.5) active = c.dataset.chapter;
        });
        navLinks.forEach(a => a.classList.toggle('active', a.dataset.chapter === active));
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
})();
