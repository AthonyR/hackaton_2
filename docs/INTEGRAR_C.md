# Incorporar la entrega C

El ZIP contiene el proyecto completo: base, A, B y C. `package.json`, `src/`, configuraciones
y documentación están directamente en la raíz, sin una carpeta envolvente.

## Preparar la copia del integrante C

1. Coordinar el turno: nadie debe modificar main mientras C incorpora esta entrega.
2. Abrir el clon existente de `https://github.com/AthonyR/hackaton_2.git` en IntelliJ.
3. Revisar `git status`; conservar y resolver cambios propios antes de reemplazar archivos.
4. Ejecutar `git pull --ff-only origin main` y `git rev-parse HEAD`.
5. La base de este ZIP es **`76b8aea194db87952e7f8c07dfb809a76d38fea2`** (ya incluye B).
   Si main está en otro commit, comparar y conciliar antes de copiar para conservar cambios nuevos.
6. Guardar un respaldo del proyecto fuera del clon.

## Copiar y verificar

1. Descomprimir primero el ZIP en una carpeta temporal.
2. Copiar su contenido a la raíz del clon (donde está `package.json`), sin crear otra subcarpeta.
   Conservar su propio `.git`, `.env.local` y `.idea`. Ninguno viene incluido en el ZIP.
3. No hay archivos eliminados en C. Revisar la lista de añadidos/modificados de `ENTREGA.txt`.
4. Usar Node 24 LTS y ejecutar `npm ci`.
5. Si no existe `.env.local`, copiar `.env.example` a `.env.local`.
6. Ejecutar `npm run lint`, `npm run build` y `npm run dev`.
7. Entrar con la cuenta oficial. `/sagas` requiere CP3 aprobado. Comprobar resumen, historia,
   scroll, teclado y un enlace `?stage=<slug>` en desktop/mobile.

## Commit y push

Revisar el diff. El código nuevo corresponde solo a `src/modules/sagas/`; A y B no cambiaron.

```powershell
git add src/modules/sagas README.md ESTADO_EQUIPO.md docs/MODULOS.md docs/MODULO_C.md docs/INTEGRAR_C.md ENTREGA.txt
git commit -m "feat: implement module C saga scrollytelling"
git push origin main
```

Usar la identidad real de C. Si el push es rechazado por cambios remotos, conservar el trabajo
y conciliar; no usar force ni sobrescribir cambios nuevos del equipo.

Avisar al terminar. Después, la copia principal debe recibir el push de C antes de la revisión final.
No se requieren otro repositorio, backend ni dependencias nuevas. Este paso no incluye despliegue.
