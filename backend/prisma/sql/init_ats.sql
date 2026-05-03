-- =============================================================
-- LTI - Talent Tracking System (ATS)
-- Script SQL completo para PostgreSQL
-- Normalizado hasta 3NF
-- Autor: equipo LTI
-- =============================================================
-- INSTRUCCIONES DE USO:
--   1. Asegúrate de tener la BD creada: mydatabase
--   2. Ejecuta: psql -U postgres -d mydatabase -f init_ats.sql
--   O aplica migraciones con Prisma: npx prisma migrate dev
-- =============================================================

-- -------------------------------------------------------
-- LIMPIEZA PREVIA (en orden inverso para respetar FK)
-- -------------------------------------------------------
DROP TABLE IF EXISTS "Interview"        CASCADE;
DROP TABLE IF EXISTS "InterviewStep"    CASCADE;
DROP TABLE IF EXISTS "InterviewResult"  CASCADE;
DROP TABLE IF EXISTS "InterviewType"    CASCADE;
DROP TABLE IF EXISTS "InterviewFlow"    CASCADE;
DROP TABLE IF EXISTS "Application"      CASCADE;
DROP TABLE IF EXISTS "PositionBenefit"  CASCADE;
DROP TABLE IF EXISTS "Requirement"      CASCADE;
DROP TABLE IF EXISTS "Benefit"          CASCADE;
DROP TABLE IF EXISTS "Position"         CASCADE;
DROP TABLE IF EXISTS "EmploymentType"   CASCADE;
DROP TABLE IF EXISTS "Employee"         CASCADE;
DROP TABLE IF EXISTS "Company"          CASCADE;
DROP TABLE IF EXISTS "Resume"           CASCADE;
DROP TABLE IF EXISTS "WorkExperience"   CASCADE;
DROP TABLE IF EXISTS "Education"        CASCADE;
DROP TABLE IF EXISTS "Candidate"        CASCADE;

-- =============================================================
-- TABLAS DE CATÁLOGOS NORMALIZADAS (3NF)
-- Se separan en tablas propias para evitar redundancias y
-- permitir escalabilidad sin migraciones de datos masivas.
-- =============================================================

-- -------------------------------------------------------
-- Tipo de empleo (full-time, part-time, contractor, etc.)
-- OPTIMIZACIÓN: Tabla de catálogo → evita texto libre en Position
-- -------------------------------------------------------
CREATE TABLE "EmploymentType" (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    description VARCHAR(255),
    -- RESTRICCIÓN: nombre único para evitar duplicados
    CONSTRAINT uq_employment_type_name UNIQUE (name)
);
COMMENT ON TABLE "EmploymentType" IS 'Catálogo normalizado de tipos de empleo. Evita texto libre en Position.';

-- -------------------------------------------------------
-- Empresa que publica vacantes
-- -------------------------------------------------------
CREATE TABLE "Company" (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    description TEXT,
    location    VARCHAR(255),
    website     VARCHAR(255),
    -- Auditoría: registrar cuándo fue creado/modificado
    "createdAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_name UNIQUE (name)
);
COMMENT ON TABLE "Company" IS 'Empresas clientes que publican posiciones en el ATS.';

-- -------------------------------------------------------
-- Empleado interno (reclutador o entrevistador)
-- Separado de Candidate para no mezclar roles (3NF)
-- -------------------------------------------------------
CREATE TABLE "Employee" (
    id          SERIAL          PRIMARY KEY,
    "companyId" INT             NOT NULL,
    "firstName" VARCHAR(100)    NOT NULL,
    "lastName"  VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    role        VARCHAR(100)    NOT NULL DEFAULT 'recruiter',
    "isActive"  BOOLEAN         NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_employee_company FOREIGN KEY ("companyId")
        REFERENCES "Company"(id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_email UNIQUE (email)
);
COMMENT ON TABLE "Employee" IS 'Reclutadores e interviewers que pertenecen a una empresa.';

-- -------------------------------------------------------
-- Flujo de entrevistas (plantilla reutilizable de pasos)
-- -------------------------------------------------------
CREATE TABLE "InterviewFlow" (
    id          SERIAL      PRIMARY KEY,
    description TEXT,
    "createdAt" TIMESTAMP   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE "InterviewFlow" IS 'Plantilla reutilizable que define los pasos del proceso de entrevistas para una posición.';

-- =============================================================
-- TABLAS PRINCIPALES
-- =============================================================

-- -------------------------------------------------------
-- Candidato (entidad central del ATS)
-- Se añaden createdAt/updatedAt y campos extendidos
-- compatibles con el modelo existente
-- -------------------------------------------------------
CREATE TABLE "Candidate" (
    id              SERIAL          PRIMARY KEY,
    "firstName"     VARCHAR(100)    NOT NULL,
    "lastName"      VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    phone           VARCHAR(15),
    address         VARCHAR(100),
    -- Campos extendidos (nuevos):
    "linkedinUrl"   VARCHAR(255),
    "desiredSalary" DECIMAL(10, 2),
    "createdAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_email UNIQUE (email)
);
COMMENT ON TABLE "Candidate" IS 'Candidatos que aplican a posiciones publicadas en el ATS.';

-- -------------------------------------------------------
-- Educación del candidato
-- -------------------------------------------------------
CREATE TABLE "Education" (
    id              SERIAL          PRIMARY KEY,
    institution     VARCHAR(100)    NOT NULL,
    title           VARCHAR(250)    NOT NULL,
    "startDate"     TIMESTAMP       NOT NULL,
    "endDate"       TIMESTAMP,
    "candidateId"   INT             NOT NULL,
    CONSTRAINT fk_education_candidate FOREIGN KEY ("candidateId")
        REFERENCES "Candidate"(id) ON DELETE CASCADE
);
COMMENT ON TABLE "Education" IS 'Historial académico del candidato.';

-- -------------------------------------------------------
-- Experiencia laboral del candidato
-- -------------------------------------------------------
CREATE TABLE "WorkExperience" (
    id              SERIAL          PRIMARY KEY,
    company         VARCHAR(100)    NOT NULL,
    position        VARCHAR(100)    NOT NULL,
    description     VARCHAR(200),
    "startDate"     TIMESTAMP       NOT NULL,
    "endDate"       TIMESTAMP,
    "candidateId"   INT             NOT NULL,
    CONSTRAINT fk_work_experience_candidate FOREIGN KEY ("candidateId")
        REFERENCES "Candidate"(id) ON DELETE CASCADE
);
COMMENT ON TABLE "WorkExperience" IS 'Historial laboral previo del candidato.';

-- -------------------------------------------------------
-- CV / Currículum del candidato
-- -------------------------------------------------------
CREATE TABLE "Resume" (
    id              SERIAL          PRIMARY KEY,
    "filePath"      VARCHAR(500)    NOT NULL,
    "fileType"      VARCHAR(50)     NOT NULL,
    "uploadDate"    TIMESTAMP       NOT NULL DEFAULT NOW(),
    "candidateId"   INT             NOT NULL,
    CONSTRAINT fk_resume_candidate FOREIGN KEY ("candidateId")
        REFERENCES "Candidate"(id) ON DELETE CASCADE
);
COMMENT ON TABLE "Resume" IS 'Archivos de CV subidos por el candidato.';

-- -------------------------------------------------------
-- Posición / Vacante publicada por una empresa
-- OPTIMIZACIÓN: status e isVisible son candidatos a índices
-- -------------------------------------------------------
CREATE TABLE "Position" (
    id                  SERIAL          PRIMARY KEY,
    "companyId"         INT             NOT NULL,
    "employmentTypeId"  INT             NOT NULL,
    "interviewFlowId"   INT,            -- Flujo asignado (puede ser null al inicio)
    title               VARCHAR(255)    NOT NULL,
    description         TEXT,
    -- status: draft | active | paused | closed
    status              VARCHAR(50)     NOT NULL DEFAULT 'draft',
    "isVisible"         BOOLEAN         NOT NULL DEFAULT FALSE,
    location            VARCHAR(255),
    "salaryMin"         DECIMAL(10, 2),
    "salaryMax"         DECIMAL(10, 2),
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_position_company FOREIGN KEY ("companyId")
        REFERENCES "Company"(id) ON DELETE CASCADE,
    CONSTRAINT fk_position_employment_type FOREIGN KEY ("employmentTypeId")
        REFERENCES "EmploymentType"(id),
    CONSTRAINT fk_position_interview_flow FOREIGN KEY ("interviewFlowId")
        REFERENCES "InterviewFlow"(id) ON DELETE SET NULL,
    -- RESTRICCIÓN: salario mínimo no puede superar al máximo
    CONSTRAINT chk_salary_range CHECK ("salaryMin" IS NULL OR "salaryMax" IS NULL OR "salaryMin" <= "salaryMax")
);
COMMENT ON TABLE "Position" IS 'Vacantes publicadas por las empresas. Conecta con el flujo de entrevistas y las aplicaciones.';

-- -------------------------------------------------------
-- Beneficio laboral (normalizado para reutilización)
-- OPTIMIZACIÓN: tabla catálogo evita strings repetidos en Position
-- -------------------------------------------------------
CREATE TABLE "Benefit" (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uq_benefit_name UNIQUE (name)
);
COMMENT ON TABLE "Benefit" IS 'Catálogo de beneficios laborales reutilizables entre posiciones.';

-- -------------------------------------------------------
-- Relación N:M entre posición y beneficio
-- -------------------------------------------------------
CREATE TABLE "PositionBenefit" (
    "positionId"    INT NOT NULL,
    "benefitId"     INT NOT NULL,
    PRIMARY KEY ("positionId", "benefitId"),
    CONSTRAINT fk_pb_position FOREIGN KEY ("positionId")
        REFERENCES "Position"(id) ON DELETE CASCADE,
    CONSTRAINT fk_pb_benefit FOREIGN KEY ("benefitId")
        REFERENCES "Benefit"(id) ON DELETE CASCADE
);
COMMENT ON TABLE "PositionBenefit" IS 'Tabla puente N:M entre posiciones y beneficios.';

-- -------------------------------------------------------
-- Requisitos de una posición (separados para consultas estructuradas)
-- NORMALIZACIÓN 3NF: evita listas de texto dentro de Position
-- -------------------------------------------------------
CREATE TABLE "Requirement" (
    id              SERIAL  PRIMARY KEY,
    "positionId"    INT     NOT NULL,
    description     TEXT    NOT NULL,
    CONSTRAINT fk_requirement_position FOREIGN KEY ("positionId")
        REFERENCES "Position"(id) ON DELETE CASCADE
);
COMMENT ON TABLE "Requirement" IS 'Requisitos de la posición. Separados en tabla para permitir consultas estructuradas.';

-- -------------------------------------------------------
-- Aplicación de un candidato a una posición
-- OPTIMIZACIÓN: índice en status y applicationDate para filtros
-- -------------------------------------------------------
CREATE TABLE "Application" (
    id                  SERIAL          PRIMARY KEY,
    "candidateId"       INT             NOT NULL,
    "positionId"        INT             NOT NULL,
    "applicationDate"   TIMESTAMP       NOT NULL DEFAULT NOW(),
    -- status: pending | in_review | interview | offer | rejected | accepted
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending',
    "coverLetter"       TEXT,
    notes               TEXT,
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_application_candidate FOREIGN KEY ("candidateId")
        REFERENCES "Candidate"(id) ON DELETE CASCADE,
    CONSTRAINT fk_application_position FOREIGN KEY ("positionId")
        REFERENCES "Position"(id) ON DELETE CASCADE,
    -- RESTRICCIÓN: un candidato no puede aplicar dos veces a la misma posición
    CONSTRAINT uq_application_candidate_position UNIQUE ("candidateId", "positionId")
);
COMMENT ON TABLE "Application" IS 'Registro de aplicaciones. Un candidato aplica a una posición. Status sigue el pipeline del ATS.';

-- -------------------------------------------------------
-- Tipo de entrevista normalizado (técnica, RRHH, cultural, etc.)
-- OPTIMIZACIÓN: tabla catálogo → evita texto libre en InterviewStep
-- -------------------------------------------------------
CREATE TABLE "InterviewType" (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uq_interview_type_name UNIQUE (name)
);
COMMENT ON TABLE "InterviewType" IS 'Catálogo de tipos de entrevista: técnica, RRHH, cultural, caso práctico, etc.';

-- -------------------------------------------------------
-- Paso dentro del flujo de entrevistas
-- -------------------------------------------------------
CREATE TABLE "InterviewStep" (
    id                  SERIAL          PRIMARY KEY,
    "interviewFlowId"   INT             NOT NULL,
    "interviewTypeId"   INT             NOT NULL,
    name                VARCHAR(100)    NOT NULL,
    "orderIndex"        INT             NOT NULL,
    CONSTRAINT fk_step_flow FOREIGN KEY ("interviewFlowId")
        REFERENCES "InterviewFlow"(id) ON DELETE CASCADE,
    CONSTRAINT fk_step_type FOREIGN KEY ("interviewTypeId")
        REFERENCES "InterviewType"(id),
    -- RESTRICCIÓN: orden único dentro del mismo flujo
    CONSTRAINT uq_step_flow_order UNIQUE ("interviewFlowId", "orderIndex")
);
COMMENT ON TABLE "InterviewStep" IS 'Pasos ordenados dentro de un flujo de entrevistas.';

-- -------------------------------------------------------
-- Resultado de entrevista normalizado (aprobado, rechazado, pendiente)
-- NORMALIZACIÓN 3NF: evita strings libres en Interview
-- -------------------------------------------------------
CREATE TABLE "InterviewResult" (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uq_interview_result_name UNIQUE (name)
);
COMMENT ON TABLE "InterviewResult" IS 'Catálogo de resultados posibles de una entrevista.';

-- -------------------------------------------------------
-- Entrevista realizada a un candidato en un paso del flujo
-- -------------------------------------------------------
CREATE TABLE "Interview" (
    id                  SERIAL          PRIMARY KEY,
    "applicationId"     INT             NOT NULL,
    "interviewStepId"   INT             NOT NULL,
    "employeeId"        INT             NOT NULL,
    "resultId"          INT,
    "interviewDate"     TIMESTAMP,
    notes               TEXT,
    -- score: escala 0.00 - 10.00
    score               DECIMAL(4, 2),
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_interview_application FOREIGN KEY ("applicationId")
        REFERENCES "Application"(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_step FOREIGN KEY ("interviewStepId")
        REFERENCES "InterviewStep"(id),
    CONSTRAINT fk_interview_employee FOREIGN KEY ("employeeId")
        REFERENCES "Employee"(id),
    CONSTRAINT fk_interview_result FOREIGN KEY ("resultId")
        REFERENCES "InterviewResult"(id),
    CONSTRAINT chk_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 10))
);
COMMENT ON TABLE "Interview" IS 'Entrevistas realizadas. Vincula una aplicación, un paso del flujo, un entrevistador y un resultado.';

-- =============================================================
-- ÍNDICES DE OPTIMIZACIÓN
-- =============================================================

-- Candidate: búsqueda frecuente por email (ya tiene UNIQUE index)
-- Índice GIN para búsqueda full-text por nombre
CREATE INDEX idx_candidate_name_fts
    ON "Candidate" USING GIN(to_tsvector('spanish', "firstName" || ' ' || "lastName"));

-- Education: filtros por candidato
CREATE INDEX idx_education_candidate ON "Education"("candidateId");

-- WorkExperience: filtros por candidato
CREATE INDEX idx_work_experience_candidate ON "WorkExperience"("candidateId");

-- Resume: filtros por candidato
CREATE INDEX idx_resume_candidate ON "Resume"("candidateId");

-- Employee: búsqueda por empresa
CREATE INDEX idx_employee_company ON "Employee"("companyId");
-- Índice GIN para búsqueda full-text de empleados
CREATE INDEX idx_employee_name_fts
    ON "Employee" USING GIN(to_tsvector('spanish', "firstName" || ' ' || "lastName"));

-- Position: filtros más frecuentes en el ATS
CREATE INDEX idx_position_company     ON "Position"("companyId");
CREATE INDEX idx_position_status      ON "Position"(status);
CREATE INDEX idx_position_visible     ON "Position"("isVisible");
CREATE INDEX idx_position_employment  ON "Position"("employmentTypeId");
-- OPTIMIZACIÓN: GIN para búsqueda full-text del título de posición
CREATE INDEX idx_position_title_fts
    ON "Position" USING GIN(to_tsvector('spanish', title));

-- Application: filtros por candidato, posición, estado y fecha
CREATE INDEX idx_application_candidate ON "Application"("candidateId");
CREATE INDEX idx_application_position  ON "Application"("positionId");
CREATE INDEX idx_application_status    ON "Application"(status);
CREATE INDEX idx_application_date      ON "Application"("applicationDate");

-- Interview: filtros por aplicación y empleado
CREATE INDEX idx_interview_application ON "Interview"("applicationId");
CREATE INDEX idx_interview_employee    ON "Interview"("employeeId");
CREATE INDEX idx_interview_step        ON "Interview"("interviewStepId");
CREATE INDEX idx_interview_date        ON "Interview"("interviewDate");

-- InterviewStep: filtros por flujo
CREATE INDEX idx_interview_step_flow ON "InterviewStep"("interviewFlowId");

-- Requirement: filtros por posición
CREATE INDEX idx_requirement_position ON "Requirement"("positionId");

-- =============================================================
-- VISTA MATERIALIZADA SUGERIDA (para reportes frecuentes)
-- OPTIMIZACIÓN: evita joins costosos en el dashboard de reclutadores
-- Para refrescar: REFRESH MATERIALIZED VIEW mv_application_pipeline;
-- =============================================================
CREATE MATERIALIZED VIEW mv_application_pipeline AS
SELECT
    a.id                        AS application_id,
    c."firstName" || ' ' || c."lastName"  AS candidate_name,
    c.email                     AS candidate_email,
    p.title                     AS position_title,
    co.name                     AS company_name,
    et.name                     AS employment_type,
    a.status                    AS application_status,
    a."applicationDate",
    COUNT(i.id)                 AS total_interviews,
    MAX(i."interviewDate")      AS last_interview_date,
    AVG(i.score)                AS avg_score
FROM "Application" a
JOIN "Candidate"      c  ON c.id  = a."candidateId"
JOIN "Position"       p  ON p.id  = a."positionId"
JOIN "Company"        co ON co.id = p."companyId"
JOIN "EmploymentType" et ON et.id = p."employmentTypeId"
LEFT JOIN "Interview" i  ON i."applicationId" = a.id
GROUP BY
    a.id, c."firstName", c."lastName", c.email,
    p.title, co.name, et.name, a.status, a."applicationDate";

-- Índice en la vista materializada para consultas rápidas por empresa y estado
CREATE UNIQUE INDEX idx_mv_pipeline_id      ON mv_application_pipeline(application_id);
CREATE INDEX         idx_mv_pipeline_status ON mv_application_pipeline(application_status);
CREATE INDEX         idx_mv_pipeline_company ON mv_application_pipeline(company_name);

COMMENT ON MATERIALIZED VIEW mv_application_pipeline IS
    'Vista materializada del pipeline de aplicaciones. Refrescar periódicamente con REFRESH MATERIALIZED VIEW CONCURRENTLY mv_application_pipeline.';

-- =============================================================
-- FIN DEL SCRIPT
-- =============================================================
-- SUGERENCIAS ADICIONALES DE OPTIMIZACIÓN:
--
-- 1. PARTICIONAMIENTO: Para tablas grandes (Application, Interview),
--    particionar por año de applicationDate con PostgreSQL Table Partitioning:
--      CREATE TABLE "Application_2025" PARTITION OF "Application"
--      FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
--
-- 2. AUTOVACUUM: Configurar autovacuum agresivo en Application e Interview
--    por la alta frecuencia de UPDATEs (cambios de status).
--
-- 3. CONEXIONES: Usar PgBouncer como pool de conexiones en producción
--    para evitar el overhead de conexión directa con Prisma.
--
-- 4. CACHÉ: Considerar Redis para cachear resultados de la vista
--    mv_application_pipeline en el dashboard de reclutadores.
-- =============================================================
