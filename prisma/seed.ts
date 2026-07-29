import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed is disabled in production.");
  }
  if (process.env.SEED_DEMO_DATA !== "true") {
    throw new Error("Set SEED_DEMO_DATA=true to acknowledge creation of non-production demo data.");
  }

  const email = process.env.SEED_USER_EMAIL ?? "demo@careeros.example";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "CareerOS Demo",
      emailVerified: false,
      careerProfile: {
        create: {
          headline: "Example profile for local development",
          targetRole: "Software Engineer",
          preferredLocations: ["Remote"],
          remotePreference: "REMOTE",
        },
      },
    },
  });
}

main()
  .finally(async () => prisma.$disconnect());
