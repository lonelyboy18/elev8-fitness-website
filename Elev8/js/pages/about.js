// ============================================================
// About Page — "Our Members" showcase (paginated flip cards)
// ============================================================

// Tap-to-flip member cards
(function () {
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.member-flip-btn'));
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var flipped = btn.classList.toggle('is-flipped');
      btn.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    });
  });
}());

// Members carousel — paginated, no autoplay, moves only on user interaction
(function () {
  var track = document.getElementById('membersTrack');
  if (!track) return;

  var pages = Array.prototype.slice.call(track.querySelectorAll('.members-page'));
  var dots  = Array.prototype.slice.call(document.querySelectorAll('.members-dot'));
  var prevBtn = document.getElementById('membersPrev');
  var nextBtn = document.getElementById('membersNext');
  var pageCount = pages.length;
  var current = 0;

  function goTo(next) {
    current = ((next % pageCount) + pageCount) % pageCount;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(dot.dataset.page, 10) || 0);
    });
  });

  goTo(0);
}());
