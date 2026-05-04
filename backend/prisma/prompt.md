# Prompts Solicitados

## Prompt 1 - Diseno ERD a SQL + Prisma

Actua como un equipo experto en diseno y desarrollo de software.
Objetivo: Convertir un ERD en formato Mermaid a un script SQL optimizado y expandirlo con migraciones Prisma, asegurando normalizacion hasta 3NF y aplicando buenas practicas de optimizacion.

Tareas:
1. Analiza el ERD proporcionado y genera un script SQL completo (PostgreSQL) con:
   - Tablas normalizadas hasta 3NF (evitar redundancias, separar entidades como employment_type, interview_result, benefits si requieren escalabilidad).
   - Claves primarias y foraneas con ON DELETE CASCADE.
   - Indices en claves foraneas y campos de busqueda frecuentes (status, title, application_date).
   - Restricciones de unicidad en emails, nombres y campos criticos.
   - Comentarios claros en cada tabla para documentacion.

2. Genera el archivo schema.prisma con modelos equivalentes:
   - Relaciones explicitas con @relation.
   - Uso correcto de @id, @default(autoincrement()), @unique.
   - Tipos adecuados (String, Int, Float, DateTime, Boolean).
   - Relaciones con cascada para mantener integridad referencial.

3. Expande la estructura con migraciones Prisma:
   - Migraciones listas para ejecutar con npx prisma migrate dev.
   - Indices adicionales en campos de busqueda y filtros.
   - Normalizacion sugerida:
     - Crear tabla employment_type en lugar de texto libre.
     - Crear tabla interview_result para estandarizar resultados.
     - Separar benefits y requirements en tablas relacionadas si se necesitan consultas estructuradas.

4. Opcional: Genera un script de seeds iniciales para poblar datos de prueba:
   - Companias, empleados, candidatos, posiciones, flujos de entrevistas.
   - Datos consistentes para validar integridad y relaciones.

5. Incluye sugerencias de optimizacion:
   - Uso de GIN/BTREE indexes en campos de texto y busqueda.
   - Particionamiento de tablas grandes (ejemplo: application por ano).
   - Auditoria con timestamps (created_at, updated_at) en tablas criticas.
   - Considerar vistas materializadas para reportes frecuentes.

Formato de salida:
- Primero el script SQL completo.
- Luego el schema.prisma.
- Finalmente los seeds opcionales.
- Comentarios con sugerencias de optimizacion y normalizacion.

Requisitos:
- Codigo limpio, comentado y listo para copiar/pegar en VS Code.
- Cumplir con buenas practicas de bases de datos y Prisma.
- Incluir sugerencias de optimizacion y normalizacion en comentarios dentro del codigo.

## Prompt 2 - Ejecucion solicitada

1. Aplica la migracion.
2. Coloca los cambios en la carpeta backend/prisma.
3. Crea 3 nuevos datos de prueba.
4. Crea un nuevo archivo prompt.md donde asentaras los prompts solicitados.

## Prompt 3 - Migracion de datos desde base de datos legacy

Tengo dos bases de datos PostgreSQL corriendo en puertos distintos:
- Puerto 5432: base de datos antigua del proyecto anterior (ai4devs-tdd-202602) con candidatos existentes.
- Puerto 5433: base de datos nueva de este proyecto (AI4Devs-db-202602) recien creada y vacia.

Necesito migrar todos los candidatos (con sus relaciones: Education, WorkExperience, Resume) desde la BD en puerto 5432 hacia la BD en puerto 5433, sin duplicar registros si ya existen.

Crea un script TypeScript en backend/prisma/migrateFrom5432.ts que:
1. Se conecte a ambas bases de datos usando Prisma Client (una instancia por BD).
2. Lea todos los candidatos de la BD origen (5432) con sus relaciones (education, workExperience, resumes).
3. Para cada candidato, verifique si ya existe en la BD destino (por email) y lo omita si ya esta.
4. Inserte los candidatos nuevos junto con sus relaciones en la BD destino (5433).
5. Use variables de entorno para las URLs de conexion, con valores por defecto seguros.
6. Imprima un resumen al final: cuantos candidatos migrados, cuantos omitidos.

Ademas, agrega el script al package.json del backend como:
"db:migrate:legacy": "npx ts-node --transpile-only prisma/migrateFrom5432.ts"

## Prompt 4 - Correccion del endpoint raiz del backend

El endpoint GET / del backend retorna un error o el texto "Hola LTI!" en lugar de algo util.

Modifica backend/src/index.ts para que:
1. Elimine la respuesta hardcodeada "Hola LTI!" del endpoint GET /.
2. En su lugar, agregue un redirect 302 desde GET / hacia GET /candidates.

De esta forma, al acceder a la raiz del servidor se redirige automaticamente al listado de candidatos.
