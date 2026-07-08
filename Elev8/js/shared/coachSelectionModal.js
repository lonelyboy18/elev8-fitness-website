// Reusable "Choose Your Coach" modal renderer. Mirrors the React CoachSelectionModal component:
// any modal marked with [data-coach-cards] gets its coach cards rendered from
// js/config/coachContacts.js, and the WhatsApp message is picked by looking up data-coach-context
// on the modal itself in MESSAGE_BUILDERS below (one entry per CTA site-wide — the single source
// of truth for WhatsApp message copy, same role as shared/lib/whatsapp.ts on the React side).
// Bootstrap's own modal JS (already loaded via bootstrap.bundle.min.js) handles open/close,
// backdrop click, Esc and the fade animation — this script only builds card markup and wa.me links.
(function () {
  var PERSON_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">' +
    '<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path></svg>';

  function buildWhatsAppLink(whatsappNumber, message) {
    return 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);
  }

  var MESSAGE_BUILDERS = {
    trial: function (name) {
      return "Hi " + name + "!\n\nI'd like to book a free trial at ELEV8.\n\nWhen can I come for my free trial?";
    },
    community: function (name) {
      return "Hi " + name + "!\n\nI'd like to join ELEV8 Fitness.\n\nWhen can I join?";
    },
    'bft-enroll': function (name) {
      return "Hi " + name + "!\n\nI'd like to enroll in the Bodyweight Functional Training (BFT) program at ELEV8.\n\nCan you tell me more about the program and how I can get started?";
    },
    'cst-enroll': function (name) {
      return "Hi " + name + "!\n\nI'd like to enroll in the Calisthenics Skill Training (CST) program at ELEV8.\n\nCan you tell me more about the program and how I can get started?";
    },
    'program-guidance': function (name) {
      return "Hi " + name + "!\n\nI'm interested in joining ELEV8, but I'm not sure which program is right for me.\n\nCould you guide me and recommend the best program based on my goals?\n\nThank you!";
    },
    'gallery-trial': function (name) {
      return "Hi " + name + "!\n\nI was looking through the Elev8 gallery and I'd love to experience a session myself.\n\nI'd like to book a free trial.\n\nWhen can I come?";
    },
    enquiry: function (name) {
      return "Hi " + name + "!\n\nI have an enquiry regarding ELEV8 Fitness.\n\nI'd like to know more about your programs and memberships.\n\nCould you please help me?\n\nThank you!";
    }
  };

  function buildMessage(context, coachName) {
    var builder = MESSAGE_BUILDERS[context] || MESSAGE_BUILDERS.trial;
    return builder(coachName);
  }

  function renderCoachCards(container, context) {
    var coaches = window.ELEV8_COACH_CONTACTS || [];
    container.innerHTML = coaches
      .map(function (coach) {
        var href = buildWhatsAppLink(coach.whatsappNumber, buildMessage(context, coach.name));
        return (
          '<div class="coach-select-card">' +
            '<span class="coach-select-avatar">' + PERSON_ICON + '</span>' +
            '<h6 class="coach-select-name">' + coach.name + '</h6>' +
            '<p class="coach-select-role">' + coach.role + '</p>' +
            '<p class="coach-select-phone">' + coach.phoneDisplay + '</p>' +
            '<a class="btn btn-success w-100" href="' + href + '" target="_blank" rel="noopener noreferrer" data-bs-dismiss="modal">Message ' + coach.name + '</a>' +
          '</div>'
        );
      })
      .join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll('[data-coach-cards]');
    containers.forEach(function (container) {
      var modal = container.closest('.modal');
      var context = modal ? modal.getAttribute('data-coach-context') : 'trial';
      renderCoachCards(container, context);
    });
  });
})();
