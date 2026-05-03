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
