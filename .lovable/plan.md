# Trasladar la base de datos y credenciales de Supabase a Lovable Cloud

Este proyecto está conectado a un Supabase externo, así que Lovable Cloud no puede activarse aquí. El traslado se hace sobre un **proyecto nuevo** (remix o proyecto nuevo) con Cloud activado, y luego se copian esquema, datos, secretos y usuarios.

## Pasos

1. **Crear el proyecto destino con Cloud**
   Nuevo proyecto en Lovable con Lovable Cloud activado (sin conectar ningún Supabase externo). Copiar allí el código de la app.

2. **Recrear el esquema**
   Aplicar en Cloud una migración con todo lo actual: tablas (`apps`, `app_icons`, `user_profiles`, `user_roles`, `user_favorites`, `user_notes`, `webapp_suggestions`), el enum `app_role`, las funciones (`has_role`, `is_admin_user`, `handle_new_user`, `increment_login_count`, `get_all_users_for_admin`, `update_updated_at_column`), triggers, GRANTs y políticas RLS.

3. **Exportar y cargar los datos**
   Exportar cada tabla del Supabase actual a CSV (SQL Editor o `COPY ... TO CSV`) e importarlas en Cloud en orden de dependencias: primero `apps` y `app_icons`, luego las tablas de usuario.

4. **Archivos de Storage**
   Recrear los buckets (`app-logos` público, `icons` y `wosanova` privados) con sus políticas y volver a subir los archivos descargados del Supabase actual.

5. **Edge functions y secretos**
   Copiar `fetch-brandfetch` y `webapp-suggestions`. Las credenciales **no se transfieren**: hay que volver a introducir `BRANDFETCH_API_KEY`, `GROQ_API_KEY` y `OPENWEATHERMAP_API_KEY` en el proyecto Cloud (las de Supabase y `LOVABLE_API_KEY` se generan solas).

6. **Usuarios de Auth**
   Los usuarios no se copian con CSV. Dos opciones:
   - Pedir a los usuarios que se registren de nuevo (más simple).
   - Migrarlos con la Admin API de Supabase conservando los hashes de contraseña, manteniendo los mismos UUID para que las filas de `user_profiles`, `user_roles`, favoritos y notas sigan enlazadas.

7. **Verificación y corte**
   Probar login, permisos de admin, sugerencias, favoritos y notas en el proyecto Cloud, y sólo entonces apuntar el dominio `new.wosanova.com` al nuevo proyecto.

## Notas técnicas

- Mantener los UUID de usuario es la clave: si cambian, hay que remapear todas las FKs a `auth.users`.
- Las políticas actuales mezclan comprobaciones por email (`%@wosanova.com`) y por `user_roles`; conviene unificarlas en `has_role()` durante la migración.
- Durante la exportación, poner la app en modo lectura para evitar datos escritos en el Supabase viejo después del volcado.

## Alternativa

Quedarse en el Supabase actual: no requiere ningún trabajo y todo sigue funcionando igual. La ventaja de Cloud es la gestión integrada desde Lovable (secretos, funciones, IA) sin cuenta externa.
