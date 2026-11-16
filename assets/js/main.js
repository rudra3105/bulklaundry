/* Bulk Laundry — site scripts (no dependencies) */
(function () {
  'use strict';

  var CONFIG = {
    bookingUrl: 'https://tophatcleaner.smrtapp.com/custx/login',
    phone: '214-348-0666',
    email: 'info@bulklaundry.com',
    // Optional: set to a form endpoint (e.g. Web3Forms https://api.web3forms.com/submit)
    // and add your key in contactAccessKey. If empty, the form opens the visitor's email app.
    contactEndpoint: '',
    contactAccessKey: ''
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Safety net: every Book Pickup link goes to the booking portal */
  $$('a[data-book]').forEach(function (a) {
    a.href = CONFIG.bookingUrl; a.target = '_blank'; a.rel = 'noopener';
  });

  /* Mobile nav */
  var burger = $('.burger'), nav = $('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); document.body.style.overflow = ''; burger.setAttribute('aria-expanded', 'false'); });
    });
  }
  $$('.dd > button').forEach(function (b) {
    b.addEventListener('click', function () { b.parentElement.classList.toggle('open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { $$('.dd.open').forEach(function (d) { d.classList.remove('open'); }); }
  });

  /* Reveal on scroll */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* Year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ZIP availability check (approximate: DFW-area ZIP ranges; final route day confirmed at booking) */
  $$('.zip-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (form.querySelector('input').value || '').trim();
      var out = form.parentElement.querySelector('.zip-result');
      out.className = 'zip-result';
      if (!/^\d{5}$/.test(v)) { out.classList.add('no'); out.textContent = 'Please enter a valid 5-digit ZIP code.'; return; }
      var n = parseInt(v, 10);
      var dfw = (n >= 75001 && n <= 75099) || (n >= 75201 && n <= 75398) || (n >= 76001 && n <= 76299) ||
                (n >= 75009 && n <= 75098) || (n >= 75401 && n <= 75499);
      if (dfw) {
        out.classList.add('ok');
        out.innerHTML = 'Good news — ' + v + ' looks like it is in our Dallas-Fort Worth coverage area. <a href="' + CONFIG.bookingUrl + '" target="_blank" rel="noopener"><strong>Book your pickup &rarr;</strong></a><br><span class="fine">Your route day is confirmed at booking.</span>';
      } else {
        out.classList.add('no');
        out.innerHTML = 'We may not cover ' + v + ' yet. Call <a href="tel:+12143480666">' + CONFIG.phone + '</a> and we will check for you.';
      }
    });
  });

  /* Tabs (pricing, etc.) */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('.tab', wrap), panels = $$('.tabpanel', wrap.parentElement);
    function show(id) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.target === id); });
      panels.forEach(function (p) { p.hidden = p.id !== id; });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.target); history.replaceState(null, '', '#' + t.dataset.target); }); });
    var h = location.hash.slice(1);
    show(h && document.getElementById(h) && panels.some(function (p) { return p.id === h; }) ? h : tabs[0].dataset.target);
  });

  /* FAQ search */
  var fs = $('.faq-search');
  if (fs) {
    fs.addEventListener('input', function () {
      var q = fs.value.toLowerCase().trim();
      $$('.faq details').forEach(function (d) { d.style.display = !q || d.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none'; });
      $$('.faq-group').forEach(function (g) {
        var any = $$('details', g).some(function (d) { return d.style.display !== 'none'; });
        g.style.display = any ? '' : 'none';
      });
    });
  }

  /* Generic filter (locations search / blog categories) */
  var ls = $('[data-filter-input]');
  if (ls) {
    ls.addEventListener('input', function () {
      var q = ls.value.toLowerCase().trim();
      $$('[data-filter-item]').forEach(function (it) { it.style.display = !q || it.dataset.filterItem.toLowerCase().indexOf(q) > -1 ? '' : 'none'; });
    });
  }
  $$('[data-cat-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.dataset.catFilter;
      $$('[data-cat-filter]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      $$('[data-cat]').forEach(function (it) { it.style.display = c === 'all' || it.dataset.cat === c ? '' : 'none'; });
    });
  });

  /* Cost calculator */
  var calc = $('#calc');
  if (calc) {
    var MIN = 45, LB = 2.49;
    var totalEl = $('#calc-total'), meter = $('#calc-meter'), msg = $('#calc-msg');
    var lbInput = $('#calc-lbs');
    function compute() {
      var t = (parseFloat(lbInput.value) || 0) * LB;
      $$('.qty input', calc).forEach(function (i) { t += (parseInt(i.value, 10) || 0) * parseFloat(i.dataset.price); });
      totalEl.textContent = '$' + t.toFixed(2);
      var pct = Math.min(100, t / MIN * 100);
      meter.style.width = pct + '%';
      if (t === 0) msg.textContent = 'Add items to see your estimate.';
      else if (t >= MIN) msg.textContent = '✓ You qualify for free pickup & delivery.';
      else msg.textContent = 'Add $' + (MIN - t).toFixed(2) + ' more to reach the $45 minimum for free pickup & delivery.';
    }
    $$('.qty', calc).forEach(function (q) {
      var inp = $('input', q);
      $$('button', q).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = parseInt(inp.value, 10) || 0;
          inp.value = Math.max(0, v + (b.dataset.d === '+' ? 1 : -1)); compute();
        });
      });
      inp.addEventListener('input', compute);
    });
    lbInput.addEventListener('input', compute);
    $('#calc-reset').addEventListener('click', function () { lbInput.value = 0; $$('.qty input', calc).forEach(function (i) { i.value = 0; }); compute(); });
    compute();
  }

  /* Contact form */
  var cf = $('#contact-form');
  if (cf) {
    var topic = new URLSearchParams(location.search).get('topic');
    if (topic) {
      var sel = cf.elements['topic'];
      $$('option', sel).forEach(function (o) { if (o.value.toLowerCase().indexOf(topic.toLowerCase()) === 0 || o.dataset.key === topic) sel.value = o.value; });
    }
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var msgBox = $('.form-msg', cf.parentElement);
      msgBox.className = 'form-msg';
      if (!cf.checkValidity()) { cf.reportValidity(); return; }
      var d = new FormData(cf);
      var garments = d.getAll('garment').join(', ');
      var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nPhone: ' + (d.get('phone') || '-') +
        '\nTopic: ' + d.get('topic') + '\nCity / ZIP: ' + (d.get('city') || '-') + '\nPreferred contact: ' + d.get('method') +
        '\nGarments: ' + (garments || '-') + '\n\n' + d.get('message');
      if (CONFIG.contactEndpoint) {
        fetch(CONFIG.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ access_key: CONFIG.contactAccessKey, subject: 'Website enquiry: ' + d.get('topic'), name: d.get('name'), email: d.get('email'), message: body }) })
          .then(function (r) { if (!r.ok) throw 0; msgBox.className = 'form-msg show'; msgBox.textContent = 'Thank you! We received your message and will reply shortly.'; cf.reset(); })
          .catch(function () { msgBox.className = 'form-msg show err'; msgBox.textContent = 'Sorry, something went wrong. Please call ' + CONFIG.phone + '.'; });
      } else {
        window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Website enquiry: ' + d.get('topic')) + '&body=' + encodeURIComponent(body);
        msgBox.className = 'form-msg show'; msgBox.textContent = 'Your email app should open with your message. If it does not, email ' + CONFIG.email + ' or call ' + CONFIG.phone + '.';
      }
    });
  }

  /* Reviews (data in /assets/js/reviews.js) */
  var list = $('#review-list');
  var data = window.BL_REVIEWS || [];
  if (list) {
    if (data.length) {
      list.innerHTML = data.map(function (r) {
        var s = ''; for (var i = 0; i < 5; i++) s += i < r.rating ? '★' : '☆';
        return '<article class="review reveal in"><div class="stars" aria-label="' + r.rating + ' out of 5">' + s + '</div><p>' + esc(r.text) + '</p><div class="who">' + esc(r.name) + (r.location ? ' <span class="fine">· ' + esc(r.location) + '</span>' : '') + '</div></article>';
      }).join('');
      var avg = data.reduce(function (a, r) { return a + r.rating; }, 0) / data.length;
      var sm = $('#review-summary'); if (sm) sm.innerHTML = '<b>' + avg.toFixed(1) + '</b> / 5 average from ' + data.length + ' review' + (data.length > 1 ? 's' : '');
      $$('[data-has-reviews]').forEach(function (el) { el.hidden = false; });
      $$('[data-no-reviews]').forEach(function (el) { el.hidden = true; });
    }
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
})();
