export interface Testimonial {
  quote: string;
  name: string;
  tag: string;
  avatar: string;
}

/** Source content ported verbatim from html/index.html's testimonial ticker (two DOM sets for the seamless CSS loop). */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I think what really differentiates this place is how thoughtfully the workouts are planned every single day. A complete, well-rounded approach — calisthenics, functional training, weight training. The coaches take the extra step to correct your form. Highly recommend!",
    name: "Stephanie Dsouza",
    tag: "Google Review",
    avatar: "S",
  },
  {
    quote:
      "Recently joined Elev8 and it's a life changing experience. Discipline and consistency is what matters and our coaches Raj and Nimay make sure we follow the same. Extremely hardworking, talented young guys who personally train and guide. Keep up the good work!",
    name: "Tanushree Bhattacharya",
    tag: "Local Guide · Google Review",
    avatar: "T",
  },
  {
    quote:
      "My journey with calisthenics has been a month and I am thoroughly enjoying every session. Nimay and Raj are outstanding coaches and thorough professionals. I have started noticing marked improvements in my daily body movements. I wish team Elev8 tons of success!",
    name: "Dimple Utagi",
    tag: "Google Review",
    avatar: "D",
  },
  {
    quote:
      "Raj Misal and Nimay Kamat are fantastic calisthenics coaches! They make workouts fun, have flexible timings, and are super supportive. Best part? They prioritize your body's readiness and don't push you beyond limits. Their guidance has helped me build strength and stay active!",
    name: "Ketki Falari",
    tag: "Local Guide · Google Review",
    avatar: "K",
  },
  {
    quote: "Awesome — the trainers are well experienced and though it's a group training, personal attention is paid to you. Love working out with them.",
    name: "Sonia Cassy Fernandes",
    tag: "Google Review",
    avatar: "S",
  },
  {
    quote:
      "Elev8 Calisthenics Gym is a phenomenal fitness hub. Their expertise and dedication work wonders in arousing the athletic spirit within every enrollee. Excellent coaching is an understatement — theirs is transcendent. Highly recommended!",
    name: "Joseph Fernandes",
    tag: "Local Guide · Google Review",
    avatar: "J",
  },
];
