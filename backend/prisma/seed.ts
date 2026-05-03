/**
 * seed.ts - LTI Talent Tracking System (ATS)
 * Seeds iniciales para poblar datos de prueba.
 *
 * Ejecutar con:
 *   npx ts-node prisma/seed.ts
 * o si hay script en package.json:
 *   npx prisma db seed
 *
 * Los datos son consistentes entre sí para validar
 * integridad referencial y relaciones del esquema.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed del ATS...');

  // ----------------------------------------------------------
  // 1. CATÁLOGOS NORMALIZADOS
  // ----------------------------------------------------------

  // Tipos de empleo
  const [fullTime, partTime, freelance, internship] = await Promise.all([
    prisma.employmentType.upsert({
      where: { name: 'Full-time' },
      update: {},
      create: { name: 'Full-time', description: 'Jornada completa (40h/semana)' },
    }),
    prisma.employmentType.upsert({
      where: { name: 'Part-time' },
      update: {},
      create: { name: 'Part-time', description: 'Jornada parcial (menos de 40h/semana)' },
    }),
    prisma.employmentType.upsert({
      where: { name: 'Freelance' },
      update: {},
      create: { name: 'Freelance', description: 'Contrato por proyecto o por hora' },
    }),
    prisma.employmentType.upsert({
      where: { name: 'Internship' },
      update: {},
      create: { name: 'Internship', description: 'Prácticas o beca' },
    }),
  ]);
  console.log('✅ EmploymentTypes creados');

  // Tipos de entrevista
  const [techInterview, hrInterview, culturalInterview, caseInterview] = await Promise.all([
    prisma.interviewType.upsert({
      where: { name: 'Técnica' },
      update: {},
      create: { name: 'Técnica', description: 'Evaluación de habilidades técnicas y resolución de problemas' },
    }),
    prisma.interviewType.upsert({
      where: { name: 'RRHH' },
      update: {},
      create: { name: 'RRHH', description: 'Entrevista de Recursos Humanos, fit cultural y soft skills' },
    }),
    prisma.interviewType.upsert({
      where: { name: 'Cultural' },
      update: {},
      create: { name: 'Cultural', description: 'Evaluación de alineación con los valores de la empresa' },
    }),
    prisma.interviewType.upsert({
      where: { name: 'Caso Práctico' },
      update: {},
      create: { name: 'Caso Práctico', description: 'Resolución de un caso o reto real de negocio' },
    }),
  ]);
  console.log('✅ InterviewTypes creados');

  // Resultados de entrevista
  const [resultPending, resultApproved, resultRejected, resultOnHold] = await Promise.all([
    prisma.interviewResult.upsert({
      where: { name: 'Pendiente' },
      update: {},
      create: { name: 'Pendiente', description: 'La entrevista aún no tiene resultado asignado' },
    }),
    prisma.interviewResult.upsert({
      where: { name: 'Aprobado' },
      update: {},
      create: { name: 'Aprobado', description: 'El candidato supera este paso del proceso' },
    }),
    prisma.interviewResult.upsert({
      where: { name: 'Rechazado' },
      update: {},
      create: { name: 'Rechazado', description: 'El candidato no supera este paso del proceso' },
    }),
    prisma.interviewResult.upsert({
      where: { name: 'En espera' },
      update: {},
      create: { name: 'En espera', description: 'Decisión aplazada, pendiente de otros candidatos' },
    }),
  ]);
  console.log('✅ InterviewResults creados');

  // Beneficios laborales
  const [benefitRemote, benefitHealth, benefitTraining, benefitFlexHours, benefitBonus] =
    await Promise.all([
      prisma.benefit.upsert({
        where: { name: 'Trabajo remoto' },
        update: {},
        create: { name: 'Trabajo remoto', description: 'Posibilidad de trabajar desde casa total o parcialmente' },
      }),
      prisma.benefit.upsert({
        where: { name: 'Seguro médico' },
        update: {},
        create: { name: 'Seguro médico', description: 'Seguro de salud privado incluido' },
      }),
      prisma.benefit.upsert({
        where: { name: 'Formación continua' },
        update: {},
        create: { name: 'Formación continua', description: 'Presupuesto anual para cursos y certificaciones' },
      }),
      prisma.benefit.upsert({
        where: { name: 'Horario flexible' },
        update: {},
        create: { name: 'Horario flexible', description: 'Flexibilidad para organizar la jornada laboral' },
      }),
      prisma.benefit.upsert({
        where: { name: 'Bonus anual' },
        update: {},
        create: { name: 'Bonus anual', description: 'Retribución variable anual por objetivos' },
      }),
    ]);
  console.log('✅ Benefits creados');

  // ----------------------------------------------------------
  // 2. EMPRESAS
  // ----------------------------------------------------------
  const [techCorp, startupXYZ] = await Promise.all([
    prisma.company.upsert({
      where: { name: 'TechCorp España S.L.' },
      update: {},
      create: {
        name: 'TechCorp España S.L.',
        description: 'Empresa tecnológica especializada en desarrollo de software a medida',
        location: 'Madrid, España',
        website: 'https://techcorp.es',
      },
    }),
    prisma.company.upsert({
      where: { name: 'StartupXYZ' },
      update: {},
      create: {
        name: 'StartupXYZ',
        description: 'Startup de fintech con enfoque en pagos digitales',
        location: 'Barcelona, España',
        website: 'https://startupxyz.io',
      },
    }),
  ]);
  console.log('✅ Companies creadas');

  // ----------------------------------------------------------
  // 3. EMPLEADOS (reclutadores e interviewers)
  // ----------------------------------------------------------
  const [recruiterAna, interviewerCarlos, recruiterLuis] = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'ana.garcia@techcorp.es' },
      update: {},
      create: {
        companyId: techCorp.id,
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@techcorp.es',
        role: 'recruiter',
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { email: 'carlos.martinez@techcorp.es' },
      update: {},
      create: {
        companyId: techCorp.id,
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@techcorp.es',
        role: 'interviewer',
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { email: 'luis.perez@startupxyz.io' },
      update: {},
      create: {
        companyId: startupXYZ.id,
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@startupxyz.io',
        role: 'recruiter',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Employees creados');

  // ----------------------------------------------------------
  // 4. FLUJOS DE ENTREVISTAS
  // ----------------------------------------------------------
  const flowTech = await prisma.interviewFlow.create({
    data: {
      description: 'Flujo estándar para posiciones técnicas (3 pasos)',
      steps: {
        create: [
          { interviewTypeId: hrInterview.id, name: 'Screening RRHH', orderIndex: 1 },
          { interviewTypeId: techInterview.id, name: 'Prueba Técnica', orderIndex: 2 },
          { interviewTypeId: culturalInterview.id, name: 'Entrevista Cultural con Manager', orderIndex: 3 },
        ],
      },
    },
    include: { steps: true },
  });

  const flowSenior = await prisma.interviewFlow.create({
    data: {
      description: 'Flujo para posiciones senior (4 pasos)',
      steps: {
        create: [
          { interviewTypeId: hrInterview.id, name: 'Llamada Inicial RRHH', orderIndex: 1 },
          { interviewTypeId: techInterview.id, name: 'Entrevista Técnica Profunda', orderIndex: 2 },
          { interviewTypeId: caseInterview.id, name: 'Caso de Negocio', orderIndex: 3 },
          { interviewTypeId: culturalInterview.id, name: 'Entrevista con C-Level', orderIndex: 4 },
        ],
      },
    },
    include: { steps: true },
  });
  console.log('✅ InterviewFlows y Steps creados');

  // ----------------------------------------------------------
  // 5. POSICIONES
  // ----------------------------------------------------------
  const [positionBackend, positionFrontend, positionPM] = await Promise.all([
    prisma.position.create({
      data: {
        companyId: techCorp.id,
        employmentTypeId: fullTime.id,
        interviewFlowId: flowSenior.id,
        title: 'Backend Developer Senior (Node.js)',
        description: 'Buscamos un desarrollador backend senior con experiencia en Node.js, TypeScript y PostgreSQL para liderar el desarrollo de nuestra plataforma SaaS.',
        status: 'active',
        isVisible: true,
        location: 'Madrid (híbrido)',
        salaryMin: 45000,
        salaryMax: 60000,
        requirements: {
          create: [
            { description: 'Mínimo 5 años de experiencia en Node.js y TypeScript' },
            { description: 'Experiencia con PostgreSQL y ORMs (Prisma, TypeORM)' },
            { description: 'Conocimientos de Docker y CI/CD' },
            { description: 'Experiencia con arquitecturas REST y GraphQL' },
          ],
        },
        benefits: {
          create: [
            { benefitId: benefitRemote.id },
            { benefitId: benefitHealth.id },
            { benefitId: benefitTraining.id },
            { benefitId: benefitFlexHours.id },
            { benefitId: benefitBonus.id },
          ],
        },
      },
    }),
    prisma.position.create({
      data: {
        companyId: techCorp.id,
        employmentTypeId: fullTime.id,
        interviewFlowId: flowTech.id,
        title: 'Frontend Developer (React)',
        description: 'Incorporamos frontend developer con pasión por la UX y experiencia en React y TypeScript.',
        status: 'active',
        isVisible: true,
        location: 'Madrid (presencial)',
        salaryMin: 35000,
        salaryMax: 48000,
        requirements: {
          create: [
            { description: 'Mínimo 3 años de experiencia en React y TypeScript' },
            { description: 'Conocimientos de CSS-in-JS y sistemas de diseño' },
            { description: 'Experiencia con testing (Jest, React Testing Library)' },
          ],
        },
        benefits: {
          create: [
            { benefitId: benefitHealth.id },
            { benefitId: benefitTraining.id },
            { benefitId: benefitFlexHours.id },
          ],
        },
      },
    }),
    prisma.position.create({
      data: {
        companyId: startupXYZ.id,
        employmentTypeId: fullTime.id,
        interviewFlowId: flowSenior.id,
        title: 'Product Manager',
        description: 'Buscamos un PM para liderar el desarrollo de nuevas funcionalidades de nuestra plataforma fintech.',
        status: 'active',
        isVisible: true,
        location: 'Barcelona (remoto)',
        salaryMin: 50000,
        salaryMax: 70000,
        requirements: {
          create: [
            { description: 'Mínimo 4 años de experiencia como Product Manager' },
            { description: 'Experiencia en fintech o sector financiero valorable' },
            { description: 'Dominio de metodologías ágiles (Scrum, Kanban)' },
          ],
        },
        benefits: {
          create: [
            { benefitId: benefitRemote.id },
            { benefitId: benefitBonus.id },
            { benefitId: benefitTraining.id },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Positions creadas');

  // ----------------------------------------------------------
  // 6. CANDIDATOS
  // ----------------------------------------------------------
  const [
    candidateAlbert,
    candidateSara,
    candidateMiguel,
    candidateLaura,
    candidateDiego,
    candidateElena,
  ] = await Promise.all([
    prisma.candidate.upsert({
      where: { email: 'albert.saelices@gmail.com' },
      update: {},
      create: {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        phone: '656874937',
        address: 'Calle Sant Dalmir 2, 5ºB. Barcelona',
        linkedinUrl: 'https://linkedin.com/in/albert-saelices',
        desiredSalary: 55000,
        educations: {
          create: [
            {
              institution: 'UC3M',
              title: 'Computer Science',
              startDate: new Date('2006-12-31'),
              endDate: new Date('2010-12-26'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Coca Cola',
              position: 'SWE',
              description: 'Desarrollo de sistemas internos',
              startDate: new Date('2011-01-13'),
              endDate: new Date('2013-01-17'),
            },
            {
              company: 'Accenture',
              position: 'Senior Backend Developer',
              description: 'Liderazgo técnico en proyectos Node.js',
              startDate: new Date('2013-02-01'),
              endDate: null,
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/1715760936750-cv.pdf',
              fileType: 'application/pdf',
              uploadDate: new Date(),
            },
          ],
        },
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'sara.lopez@gmail.com' },
      update: {},
      create: {
        firstName: 'Sara',
        lastName: 'López',
        email: 'sara.lopez@gmail.com',
        phone: '612345678',
        address: 'Calle Mayor 10, Madrid',
        linkedinUrl: 'https://linkedin.com/in/sara-lopez',
        desiredSalary: 42000,
        educations: {
          create: [
            {
              institution: 'Universidad Politécnica de Madrid',
              title: 'Ingeniería Informática',
              startDate: new Date('2015-09-01'),
              endDate: new Date('2019-06-30'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Indra',
              position: 'Frontend Developer',
              description: 'Desarrollo de interfaces con React y Angular',
              startDate: new Date('2019-09-01'),
              endDate: null,
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/sara-lopez-cv.pdf',
              fileType: 'application/pdf',
              uploadDate: new Date(),
            },
          ],
        },
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'miguel.rodriguez@gmail.com' },
      update: {},
      create: {
        firstName: 'Miguel',
        lastName: 'Rodríguez',
        email: 'miguel.rodriguez@gmail.com',
        phone: '699112233',
        address: 'Paseo de Gracia 50, Barcelona',
        desiredSalary: 65000,
        educations: {
          create: [
            {
              institution: 'ESADE Business School',
              title: 'MBA',
              startDate: new Date('2012-09-01'),
              endDate: new Date('2014-06-30'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Cabify',
              position: 'Product Manager',
              description: 'Gestión del producto de pagos y checkout',
              startDate: new Date('2017-01-01'),
              endDate: null,
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/miguel-rodriguez-cv.pdf',
              fileType: 'application/pdf',
              uploadDate: new Date(),
            },
          ],
        },
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'laura.fernandez@gmail.com' },
      update: {},
      create: {
        firstName: 'Laura',
        lastName: 'Fernandez',
        email: 'laura.fernandez@gmail.com',
        phone: '611223344',
        address: 'Avenida de America 25, Madrid',
        linkedinUrl: 'https://linkedin.com/in/laura-fernandez-dev',
        desiredSalary: 47000,
        educations: {
          create: [
            {
              institution: 'Universidad de Sevilla',
              title: 'Ingenieria del Software',
              startDate: new Date('2014-09-01'),
              endDate: new Date('2018-06-30'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Everis',
              position: 'Backend Developer',
              description: 'Desarrollo de microservicios con Node.js',
              startDate: new Date('2018-10-01'),
              endDate: null,
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/laura-fernandez-cv.pdf',
              fileType: 'application/pdf',
              uploadDate: new Date(),
            },
          ],
        },
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'diego.navarro@gmail.com' },
      update: {},
      create: {
        firstName: 'Diego',
        lastName: 'Navarro',
        email: 'diego.navarro@gmail.com',
        phone: '622334455',
        address: 'Calle Colon 18, Valencia',
        desiredSalary: 39000,
        educations: {
          create: [
            {
              institution: 'Universidad de Valencia',
              title: 'Telecomunicaciones',
              startDate: new Date('2013-09-01'),
              endDate: new Date('2017-06-30'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Nunsys',
              position: 'Frontend Developer',
              description: 'Interfaces SPA con React y Redux',
              startDate: new Date('2019-03-01'),
              endDate: null,
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/diego-navarro-cv.pdf',
              fileType: 'application/pdf',
              uploadDate: new Date(),
            },
          ],
        },
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'elena.santos@gmail.com' },
      update: {},
      create: {
        firstName: 'Elena',
        lastName: 'Santos',
        email: 'elena.santos@gmail.com',
        phone: '633445566',
        address: 'Gran Via 92, Barcelona',
        linkedinUrl: 'https://linkedin.com/in/elena-santos-pm',
        desiredSalary: 68000,
        educations: {
          create: [
            {
              institution: 'Universitat de Barcelona',
              title: 'ADE',
              startDate: new Date('2011-09-01'),
              endDate: new Date('2015-06-30'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Glovo',
              position: 'Senior Product Owner',
              description: 'Definicion de roadmap y discovery de producto',
              startDate: new Date('2018-05-01'),
              endDate: null,
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/elena-santos-cv.pdf',
              fileType: 'application/pdf',
              uploadDate: new Date(),
            },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Candidates creados');

  // ----------------------------------------------------------
  // 7. APLICACIONES
  // ----------------------------------------------------------
  const [
    appAlbertBackend,
    appSaraFrontend,
    appMiguelPM,
    appLauraBackend,
    appDiegoFrontend,
    appElenaPM,
  ] = await Promise.all([
    prisma.application.create({
      data: {
        candidateId: candidateAlbert.id,
        positionId: positionBackend.id,
        status: 'interview',
        coverLetter: 'Estoy muy interesado en esta posición. Tengo experiencia sólida en Node.js y TypeScript.',
        applicationDate: new Date('2024-04-01'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidateSara.id,
        positionId: positionFrontend.id,
        status: 'in_review',
        coverLetter: 'Me apasiona el desarrollo frontend y creo que puedo aportar mucho al equipo.',
        applicationDate: new Date('2024-04-05'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidateMiguel.id,
        positionId: positionPM.id,
        status: 'interview',
        coverLetter: 'Mi experiencia en fintech y como PM me hace el candidato ideal para esta posición.',
        applicationDate: new Date('2024-04-03'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidateLaura.id,
        positionId: positionBackend.id,
        status: 'in_review',
        coverLetter: 'He trabajado en APIs escalables con Node.js y me interesa crecer hacia arquitectura.',
        applicationDate: new Date('2024-04-11'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidateDiego.id,
        positionId: positionFrontend.id,
        status: 'pending',
        coverLetter: 'Estoy enfocado en frontend moderno y performance en React.',
        applicationDate: new Date('2024-04-12'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidateElena.id,
        positionId: positionPM.id,
        status: 'offer',
        coverLetter: 'Aporto experiencia liderando productos digitales y equipos cross-funcionales.',
        applicationDate: new Date('2024-04-13'),
      },
    }),
  ]);
  console.log('✅ Applications creadas');

  // ----------------------------------------------------------
  // 8. ENTREVISTAS
  // ----------------------------------------------------------

  // Albert - paso 1 (Llamada inicial RRHH) → Aprobado
  // Albert - paso 2 (Técnica profunda) → En espera
  const stepsBackend = flowSenior.steps.sort((a, b) => a.orderIndex - b.orderIndex);

  await prisma.interview.create({
    data: {
      applicationId: appAlbertBackend.id,
      interviewStepId: stepsBackend[0].id,
      employeeId: recruiterAna.id,
      resultId: resultApproved.id,
      interviewDate: new Date('2024-04-08T10:00:00Z'),
      notes: 'Candidato muy comunicativo, buena actitud. Avanza a fase técnica.',
      score: 8.5,
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: appAlbertBackend.id,
      interviewStepId: stepsBackend[1].id,
      employeeId: interviewerCarlos.id,
      resultId: resultOnHold.id,
      interviewDate: new Date('2024-04-15T11:00:00Z'),
      notes: 'Buenos conocimientos de Node.js. Flojo en arquitecturas distribuidas. Pendiente de decisión.',
      score: 7.2,
    },
  });

  // Sara - paso 1 (Screening RRHH) → Aprobado
  const stepsFrontend = flowTech.steps.sort((a, b) => a.orderIndex - b.orderIndex);

  await prisma.interview.create({
    data: {
      applicationId: appSaraFrontend.id,
      interviewStepId: stepsFrontend[0].id,
      employeeId: recruiterAna.id,
      resultId: resultApproved.id,
      interviewDate: new Date('2024-04-09T09:00:00Z'),
      notes: 'Excelente perfil. Muy motivada con React y TypeScript. Avanza.',
      score: 9.0,
    },
  });

  // Miguel - paso 1 (Llamada inicial RRHH) → Pendiente
  const stepsPM = flowSenior.steps.sort((a, b) => a.orderIndex - b.orderIndex);

  await prisma.interview.create({
    data: {
      applicationId: appMiguelPM.id,
      interviewStepId: stepsPM[0].id,
      employeeId: recruiterLuis.id,
      resultId: resultPending.id,
      interviewDate: new Date('2024-04-10T16:00:00Z'),
      notes: 'Primera toma de contacto. Pendiente de resultado formal.',
      score: null,
    },
  });

  console.log('✅ Interviews creadas');
  console.log('\n🎉 Seed completado exitosamente.');
  console.log(`   Candidatos: 6 | Posiciones: 3 | Aplicaciones: 6 | Entrevistas: 4`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
