import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const lika = await prisma.user.create({
    data: {
      email: "lika@taskflow.dev",
      name: "Lika",
      passwordHash: "seed-placeholder",
    },
  });

  const nino = await prisma.user.create({
    data: {
      email: "nino@taskflow.dev",
      name: "Nino",
      passwordHash: "seed-placeholder",
    },
  });

  const website = await prisma.project.create({
    data: {
      name: "Website redesign",
      description: "New landing page and blog",
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: website.id,
      userId: lika.id,
      role: "OWNER",
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: website.id,
      userId: nino.id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: website.id,
      title: "Design homepage",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: nino.id,
      createdById: lika.id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: website.id,
      title: "Write first blog post",
      createdById: lika.id,
    },
  });

  const projects = await prisma.project.findMany({
    include: { members: true, tasks: true },
  });
  console.dir(projects, { depth: null });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
