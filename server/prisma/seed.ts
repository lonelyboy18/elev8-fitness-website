// Seeds a demo account + sample rows so a fresh database is immediately usable for local
// development and manual QA. Safe to re-run — every insert is upsert-or-skip.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@elev8.fit" },
    update: {},
    create: {
      name: "Demo Member",
      email: "demo@elev8.fit",
      mobile: "9876543210",
      passwordHash,
      plan: "bft",
      subscriptionStatus: "active",
      subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`User ready: ${demoUser.email} (password: password123)`);

  const existingBooking = await prisma.booking.findFirst({ where: { userId: demoUser.id } });
  if (!existingBooking) {
    await prisma.booking.create({
      data: { userId: demoUser.id, classType: "bft", classDate: new Date(), timeSlot: "05:30" },
    });
    console.log("Seeded a demo booking.");
  }

  const feedbackCount = await prisma.feedbackSubmission.count();
  if (feedbackCount === 0) {
    await prisma.feedbackSubmission.createMany({
      data: [
        { name: "Stephanie Dsouza", email: "stephanie@example.com", rating: 5, feedback: "Best calisthenics coaching in Goa!" },
        { name: "Tanushree Bhattacharya", email: "tanushree@example.com", rating: 5, feedback: "Life changing experience with amazing coaches." },
      ],
    });
    console.log("Seeded feedback submissions.");
  }

  const contactCount = await prisma.contact.count();
  if (contactCount === 0) {
    await prisma.contact.create({
      data: { name: "Prospective Member", email: "prospect@example.com", phone: null, message: "Interested in a free trial class." },
    });
    console.log("Seeded a contact submission.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
