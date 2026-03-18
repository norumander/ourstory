import { PrismaClient, Category } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data (idempotent)
  await prisma.metricEvent.deleteMany();
  await prisma.communityFollow.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.fundraiser.deleteMany();
  await prisma.community.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const passwordHash = await hash("demodemo123", 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "demo@ourstory.app",
        passwordHash,
        displayName: "Demo User",
        username: "demo",
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah.chen@example.com",
        passwordHash: await hash("password123", 10),
        displayName: "Sarah Chen",
        username: "sarah.chen",
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "marcus.johnson@example.com",
        passwordHash: await hash("password123", 10),
        displayName: "Marcus Johnson",
        username: "marcus.johnson",
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "elena.rodriguez@example.com",
        passwordHash: await hash("password123", 10),
        displayName: "Elena Rodriguez",
        username: "elena.rodriguez",
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "james.wright@example.com",
        passwordHash: await hash("password123", 10),
        displayName: "James Wright",
        username: "james.wright",
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "aisha.patel@example.com",
        passwordHash: await hash("password123", 10),
        displayName: "Aisha Patel",
        username: "aisha.patel",
        avatarUrl: null,
      },
    }),
  ]);

  const [demo, sarah, marcus, elena, james, aisha] = users;
  console.log(`Created ${users.length} users`);

  // --- Communities ---
  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: "Bay Area Disaster Relief",
        slug: "bay-area-disaster-relief",
        description:
          "Supporting families and communities affected by natural disasters across the San Francisco Bay Area. From wildfire recovery to earthquake preparedness, we mobilize resources when it matters most.",
        imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
      },
    }),
    prisma.community.create({
      data: {
        name: "Education for All",
        slug: "education-for-all",
        description:
          "Providing educational opportunities to underserved students through scholarships, tutoring programs, and school supply drives. Every child deserves a chance to learn.",
        imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
      },
    }),
    prisma.community.create({
      data: {
        name: "Animal Rescue Network",
        slug: "animal-rescue-network",
        description:
          "A network of animal lovers dedicated to rescuing, rehabilitating, and rehoming animals in need. From shelter support to veterinary care funds.",
        imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
      },
    }),
  ]);

  const [disasterRelief, education, animalRescue] = communities;
  console.log(`Created ${communities.length} communities`);

  // --- Fundraisers ---
  const now = new Date();
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 86_400_000);

  const fundraisers = await Promise.all([
    // Disaster Relief community
    prisma.fundraiser.create({
      data: {
        title: "Wildfire Recovery Fund for Napa Valley Families",
        story:
          "Last month, the Napa Valley wildfires displaced over 200 families in our community. Many lost everything — homes, belongings, irreplaceable memories. We're raising funds to provide temporary housing, clothing, and essential supplies while families rebuild. Every dollar goes directly to affected families through our verified distribution network.",
        goalAmount: 5000000, // $50,000
        raisedAmount: 4250000, // $42,500 = 85%
        donationCount: 0, // will be updated after donations
        category: Category.Emergency,
        imageUrl: "https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?w=800",
        organizerId: sarah.id,
        communityId: disasterRelief.id,
        createdAt: daysAgo(45),
      },
    }),
    prisma.fundraiser.create({
      data: {
        title: "Earthquake Preparedness Kits for Schools",
        story:
          "After last year's 4.7 magnitude earthquake, many Bay Area schools realized they were woefully underprepared. We're purchasing emergency kits — water, first aid, flashlights, blankets — for 15 elementary schools in the East Bay. These kits could save lives when the next earthquake hits.",
        goalAmount: 1500000, // $15,000
        raisedAmount: 750000, // $7,500 = 50%
        donationCount: 0,
        category: Category.Community,
        imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",
        organizerId: marcus.id,
        communityId: disasterRelief.id,
        createdAt: daysAgo(30),
      },
    }),
    prisma.fundraiser.create({
      data: {
        title: "Flood Damage Repair for Senior Center",
        story:
          "The Oak Park Senior Center suffered severe flood damage during last week's atmospheric river event. The center serves 150+ seniors daily with meals, social activities, and health screenings. We need to repair the flooring, replace damaged equipment, and get the center reopened as quickly as possible.",
        goalAmount: 2500000, // $25,000
        raisedAmount: 250000, // $2,500 = 10%
        donationCount: 0,
        category: Category.Emergency,
        imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800",
        organizerId: elena.id,
        communityId: disasterRelief.id,
        createdAt: daysAgo(7),
      },
    }),

    // Education community
    prisma.fundraiser.create({
      data: {
        title: "STEM Scholarships for First-Gen College Students",
        story:
          "We're creating a scholarship fund for first-generation college students pursuing STEM degrees. These students face unique challenges — no family experience navigating college applications, financial aid, or campus culture. Our scholarships cover tuition gaps and provide mentorship matching with professionals in their field.",
        goalAmount: 10000000, // $100,000
        raisedAmount: 6500000, // $65,000 = 65%
        donationCount: 0,
        category: Category.Education,
        imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",
        organizerId: james.id,
        communityId: education.id,
        createdAt: daysAgo(60),
      },
    }),
    prisma.fundraiser.create({
      data: {
        title: "Laptops for Remote Learning Students",
        story:
          "Many students in our district still don't have reliable access to a computer at home. We're purchasing refurbished laptops and providing internet hotspots to ensure every student can participate in hybrid learning. No student should fall behind because of a digital divide.",
        goalAmount: 800000, // $8,000
        raisedAmount: 760000, // $7,600 = 95%
        donationCount: 0,
        category: Category.Education,
        imageUrl: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800",
        organizerId: aisha.id,
        communityId: education.id,
        createdAt: daysAgo(50),
      },
    }),

    // Animal Rescue community
    prisma.fundraiser.create({
      data: {
        title: "Emergency Vet Fund for Rescued Strays",
        story:
          "Our rescue network takes in over 50 stray animals each month. Many arrive injured, malnourished, or sick. Veterinary bills are our biggest expense, and this winter has been particularly brutal. This fund covers emergency surgeries, vaccinations, and rehabilitation for animals who have no one else to help them.",
        goalAmount: 3000000, // $30,000
        raisedAmount: 2100000, // $21,000 = 70%
        donationCount: 0,
        category: Category.Animals,
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
        organizerId: demo.id,
        communityId: animalRescue.id,
        createdAt: daysAgo(40),
      },
    }),
    prisma.fundraiser.create({
      data: {
        title: "Build a New Animal Shelter Wing",
        story:
          "Our shelter is at 150% capacity. Animals are being housed in temporary crates and hallways. We've secured a building permit to add a new wing with 30 additional kennels, a veterinary exam room, and an outdoor exercise area. The construction is partially funded — we need the community's help to finish it.",
        goalAmount: 7500000, // $75,000
        raisedAmount: 3000000, // $30,000 = 40%
        donationCount: 0,
        category: Category.Animals,
        imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800",
        organizerId: marcus.id,
        communityId: animalRescue.id,
        createdAt: daysAgo(35),
      },
    }),

    // No community
    prisma.fundraiser.create({
      data: {
        title: "Memorial Fund for Coach Williams",
        story:
          "Coach Williams dedicated 30 years to our community's youth basketball program. He passed away unexpectedly last month, leaving behind a legacy of mentorship and countless lives changed through sports. This fund supports his family with funeral expenses and establishes a youth sports scholarship in his name.",
        goalAmount: 2000000, // $20,000
        raisedAmount: 1800000, // $18,000 = 90%
        donationCount: 0,
        category: Category.Memorial,
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
        organizerId: elena.id,
        communityId: null,
        createdAt: daysAgo(20),
      },
    }),
    prisma.fundraiser.create({
      data: {
        title: "Community Garden for Downtown Neighborhood",
        story:
          "Our downtown neighborhood lacks green space and access to fresh produce. We're transforming a vacant lot into a community garden with 40 raised beds, a composting station, and a small greenhouse. The garden will provide free produce to local food banks and serve as a gathering place for neighbors.",
        goalAmount: 1200000, // $12,000
        raisedAmount: 360000, // $3,600 = 30%
        donationCount: 0,
        category: Category.Environment,
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        organizerId: aisha.id,
        communityId: null,
        createdAt: daysAgo(15),
      },
    }),
  ]);

  console.log(`Created ${fundraisers.length} fundraisers`);

  // --- Donations (30+, spread across 60-day range) ---
  const donationData: {
    amount: number;
    message: string | null;
    donorId: string;
    fundraiserIdx: number;
    daysAgo: number;
  }[] = [
    // Wildfire Recovery (idx 0)
    { amount: 10000, message: "Stay strong, Napa!", donorId: demo.id, fundraiserIdx: 0, daysAgo: 44 },
    { amount: 25000, message: "Our family is thinking of you all.", donorId: marcus.id, fundraiserIdx: 0, daysAgo: 42 },
    { amount: 5000, message: null, donorId: elena.id, fundraiserIdx: 0, daysAgo: 40 },
    { amount: 50000, message: "From one community to another — we've been there.", donorId: james.id, fundraiserIdx: 0, daysAgo: 38 },
    { amount: 15000, message: "Sending love and support.", donorId: aisha.id, fundraiserIdx: 0, daysAgo: 30 },

    // Earthquake Kits (idx 1)
    { amount: 7500, message: "Every school deserves to be prepared.", donorId: sarah.id, fundraiserIdx: 1, daysAgo: 28 },
    { amount: 20000, message: null, donorId: demo.id, fundraiserIdx: 1, daysAgo: 25 },
    { amount: 5000, message: "For the kids.", donorId: elena.id, fundraiserIdx: 1, daysAgo: 20 },

    // Flood Damage (idx 2)
    { amount: 10000, message: "The seniors need that center.", donorId: james.id, fundraiserIdx: 2, daysAgo: 6 },
    { amount: 5000, message: null, donorId: sarah.id, fundraiserIdx: 2, daysAgo: 5 },

    // STEM Scholarships (idx 3)
    { amount: 100000, message: "Education changes everything.", donorId: demo.id, fundraiserIdx: 3, daysAgo: 58 },
    { amount: 50000, message: "I was a first-gen student. Paying it forward.", donorId: sarah.id, fundraiserIdx: 3, daysAgo: 55 },
    { amount: 25000, message: null, donorId: marcus.id, fundraiserIdx: 3, daysAgo: 50 },
    { amount: 75000, message: "The world needs more STEM graduates.", donorId: elena.id, fundraiserIdx: 3, daysAgo: 45 },
    { amount: 15000, message: "Small contribution, big belief in these students.", donorId: aisha.id, fundraiserIdx: 3, daysAgo: 35 },

    // Laptops (idx 4)
    { amount: 20000, message: "No student left offline.", donorId: demo.id, fundraiserIdx: 4, daysAgo: 48 },
    { amount: 15000, message: null, donorId: james.id, fundraiserIdx: 4, daysAgo: 45 },
    { amount: 10000, message: "Happy to help bridge the digital divide.", donorId: sarah.id, fundraiserIdx: 4, daysAgo: 40 },
    { amount: 30000, message: "Every kid deserves a fair shot.", donorId: marcus.id, fundraiserIdx: 4, daysAgo: 32 },

    // Emergency Vet Fund (idx 5)
    { amount: 5000, message: "For the animals!", donorId: sarah.id, fundraiserIdx: 5, daysAgo: 38 },
    { amount: 25000, message: "Thank you for saving these animals.", donorId: elena.id, fundraiserIdx: 5, daysAgo: 35 },
    { amount: 10000, message: null, donorId: james.id, fundraiserIdx: 5, daysAgo: 30 },
    { amount: 7500, message: "Wishing the rescues a speedy recovery.", donorId: aisha.id, fundraiserIdx: 5, daysAgo: 22 },

    // Shelter Wing (idx 6)
    { amount: 50000, message: "More space = more lives saved.", donorId: demo.id, fundraiserIdx: 6, daysAgo: 33 },
    { amount: 25000, message: null, donorId: sarah.id, fundraiserIdx: 6, daysAgo: 28 },
    { amount: 15000, message: "Build it and they will come.", donorId: elena.id, fundraiserIdx: 6, daysAgo: 20 },

    // Memorial Fund (idx 7)
    { amount: 20000, message: "Coach changed my life. RIP.", donorId: demo.id, fundraiserIdx: 7, daysAgo: 18 },
    { amount: 25000, message: "He believed in every kid he coached.", donorId: sarah.id, fundraiserIdx: 7, daysAgo: 15 },
    { amount: 15000, message: null, donorId: marcus.id, fundraiserIdx: 7, daysAgo: 12 },
    { amount: 10000, message: "His legacy lives on.", donorId: aisha.id, fundraiserIdx: 7, daysAgo: 8 },

    // Community Garden (idx 8)
    { amount: 5000, message: "Love this idea!", donorId: james.id, fundraiserIdx: 8, daysAgo: 14 },
    { amount: 7500, message: "Green spaces make better neighborhoods.", donorId: elena.id, fundraiserIdx: 8, daysAgo: 10 },
    { amount: 3000, message: null, donorId: demo.id, fundraiserIdx: 8, daysAgo: 5 },
  ];

  // Create donations and update fundraiser counts
  const donationCounts = new Map<number, number>();
  for (const d of donationData) {
    await prisma.donation.create({
      data: {
        amount: d.amount,
        message: d.message,
        donorId: d.donorId,
        fundraiserId: fundraisers[d.fundraiserIdx].id,
        createdAt: daysAgo(d.daysAgo),
      },
    });
    donationCounts.set(
      d.fundraiserIdx,
      (donationCounts.get(d.fundraiserIdx) || 0) + 1
    );
  }

  // Update donation counts on fundraisers
  for (const [idx, count] of donationCounts) {
    await prisma.fundraiser.update({
      where: { id: fundraisers[idx].id },
      data: { donationCount: count },
    });
  }

  console.log(`Created ${donationData.length} donations`);

  // --- Follow relationships ---
  // User follows
  const userFollows = [
    { followerId: demo.id, followingId: sarah.id },
    { followerId: demo.id, followingId: marcus.id },
    { followerId: sarah.id, followingId: demo.id },
    { followerId: sarah.id, followingId: elena.id },
    { followerId: marcus.id, followingId: sarah.id },
    { followerId: marcus.id, followingId: james.id },
    { followerId: elena.id, followingId: demo.id },
    { followerId: elena.id, followingId: aisha.id },
    { followerId: james.id, followingId: sarah.id },
    { followerId: aisha.id, followingId: demo.id },
    { followerId: aisha.id, followingId: elena.id },
  ];

  for (const follow of userFollows) {
    await prisma.userFollow.create({ data: follow });
  }
  console.log(`Created ${userFollows.length} user follows`);

  // Community follows
  const communityFollows = [
    { userId: demo.id, communityId: disasterRelief.id },
    { userId: demo.id, communityId: animalRescue.id },
    { userId: sarah.id, communityId: disasterRelief.id },
    { userId: sarah.id, communityId: education.id },
    { userId: sarah.id, communityId: animalRescue.id },
    { userId: marcus.id, communityId: disasterRelief.id },
    { userId: marcus.id, communityId: animalRescue.id },
    { userId: elena.id, communityId: disasterRelief.id },
    { userId: elena.id, communityId: education.id },
    { userId: james.id, communityId: education.id },
    { userId: james.id, communityId: animalRescue.id },
    { userId: aisha.id, communityId: education.id },
  ];

  for (const follow of communityFollows) {
    await prisma.communityFollow.create({ data: follow });
  }
  console.log(`Created ${communityFollows.length} community follows`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
