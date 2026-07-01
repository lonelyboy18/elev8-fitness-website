export interface Review {
  avatar: string;
  name: string;
  tag: string;
  quote: string;
  page: 1 | 2;
}

/** Static member reviews — mirrors the hardcoded #reviewsGrid markup in html/contact.html, 3 per page. */
export const REVIEWS: Review[] = [
  {
    page: 1,
    avatar: "W",
    name: "Wilbur Fernandes",
    tag: "Google Review",
    quote:
      "One of the best places in Goa to start and improve calisthenics. The trainers are very supportive, knowledgeable, and focus properly on form, strength, mobility, and overall fitness. The environment is super motivating and beginner-friendly while still challenging for advanced athletes.",
  },
  {
    page: 1,
    avatar: "T",
    name: "Tanisi Kakodkar",
    tag: "Local Guide · Google Review",
    quote:
      "If you're looking for a place that truly changes you — physically and mentally — Elev8 is honestly one of the best decisions I've made for myself. Coach Raj and Coach Nimay genuinely care about every individual. Since joining, I've not only lost weight and gained strength, but feel more energetic and confident.",
  },
  {
    page: 1,
    avatar: "N",
    name: "Nicole Fernandes",
    tag: "Google Review",
    quote:
      "We have the best coaches at Elev8. Always encouraging and supporting us to do our best. We leave the park feeling energized.",
  },
  {
    page: 2,
    avatar: "S",
    name: "Sajeel Parakh",
    tag: "Local Guide · Google Review",
    quote:
      "The most dedicated trainers I've come across in Goa. Even though we workout in a group the trainers take keen interest in each person's individual growth. Progress matters but not at the cost of right form and technique. Working out is now more than just a routine for us. It's a way of life.",
  },
  {
    page: 2,
    avatar: "R",
    name: "Reshma Porob",
    tag: "Google Review",
    quote:
      "It's been my second month and I couldn't be happier with the results. I was struggling with pull-ups and other bodyweight exercises I couldn't even dream of doing. With proper coach advice and consistency, I finally managed to achieve them. Highly recommend Nimay and Raj at Elev8!",
  },
  {
    page: 2,
    avatar: "S",
    name: "Shruti Deva",
    tag: "Local Guide · Google Review",
    quote:
      "It has been a really fulfilling experience training at Elev8! The workouts are exciting, challenging and super fun. What works for me most is the mobility, fluidity, flexibility and strength that the overall workout provides. Leaves me feeling super charged for the day!",
  },
];
