import { PrismaClient } from '@prisma/client';

const sourceUrl = process.env.SOURCE_DATABASE_URL || 'postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb';
const targetUrl = process.env.DATABASE_URL || 'postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5433/LTIdb';

const source = new PrismaClient({
  datasources: { db: { url: sourceUrl } }
});

const target = new PrismaClient({
  datasources: { db: { url: targetUrl } }
});

async function migrateCandidates() {
  const sourceCandidates = await source.candidate.findMany({
    include: {
      educations: true,
      workExperiences: true,
      resumes: true
    },
    orderBy: { id: 'asc' }
  });

  let migrated = 0;
  let skipped = 0;

  for (const c of sourceCandidates) {
    const exists = await target.candidate.findUnique({ where: { email: c.email } });

    if (exists) {
      skipped += 1;
      continue;
    }

    await target.candidate.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        linkedinUrl: c.linkedinUrl,
        desiredSalary: c.desiredSalary,
        educations: {
          create: c.educations.map((e) => ({
            institution: e.institution,
            title: e.title,
            startDate: e.startDate,
            endDate: e.endDate
          }))
        },
        workExperiences: {
          create: c.workExperiences.map((w) => ({
            company: w.company,
            position: w.position,
            description: w.description,
            startDate: w.startDate,
            endDate: w.endDate
          }))
        },
        resumes: {
          create: c.resumes.map((r) => ({
            filePath: r.filePath,
            fileType: r.fileType,
            uploadDate: r.uploadDate
          }))
        }
      }
    });

    migrated += 1;
  }

  console.log(`Migration finished. Migrated: ${migrated}, Skipped: ${skipped}, Source total: ${sourceCandidates.length}`);
}

migrateCandidates()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
