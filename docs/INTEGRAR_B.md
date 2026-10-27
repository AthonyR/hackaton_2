# Incorporar la entrega B

El ZIP contiene el proyecto completo: base, A, B y las rutas temporales de C. `package.json`,
`src/` y los demás archivos están directamente en la raíz del ZIP.

## Antes de copiar

1. Coordinar el turno de B: nadie debe modificar `main` durante esta incorporación.
2. Abrir en IntelliJ la copia ya clonada de `https://github.com/AthonyR/hackaton_2.git`.
3. Ejecutar `git status`. Si hay cambios propios, conservarlos y resolverlos antes de reemplazar.
4. Ejecutar `git pull --ff-only origin main` y luego `git rev-parse HEAD`.
5. La entrega parte de **`4ed9006b02bb45466072cbf83be9e17a61820546`**. Si el resultado es otro
   commit, comparar y conciliar la entrega antes de copiar: podría sobrescribir cambios nuevos.
6. Guardar un respaldo del proyecto fuera de su carpeta.

## Copiar y ejecutar

1. Descomprimir el ZIP en una carpeta temporal.
2. Copiar su contenido sobre la raíz del clon (la carpeta que contiene `package.json`).
   No crear una subcarpeta adicional. Conservar el `.git`, `.idea` y `.env.local` propios.
   El ZIP no contiene esos directorios/archivos ni elimina ninguno: no hay archivos borrados en B.
3. Usar Node 24 LTS y ejecutar `npm ci`.
4. Si aún no existe `.env.local`, copiar `.env.example` a `.env.local`.
5. Ejecutar `npm run lint`, `npm run build` y `npm run dev`.
6. Abrir `http://localhost:5173`, iniciar sesión con la cuenta del equipo y comprobar `/wanted`.
   `/news` muestra 423 hasta que el docente apruebe el CP3.

## Incorporar a main

Revisar `git status`, `git diff --stat` y `ENTREGA.txt`. Los cambios de código deben quedar en las
dos carpetas de B; A, C y las dependencias se incluyen completos, pero no fueron modificados.

```powershell
git add src/modules/wanted src/modules/news README.md ESTADO_EQUIPO.md docs/MODULOS.md docs/MODULO_B.md docs/INTEGRAR_B.md ENTREGA.txt
git commit -m "feat: implement module B wanted and news"
git push origin main
```

Usar la identidad real configurada del integrante que incorpora la entrega. Si el push es rechazado
por cambios remotos, conservar el trabajo y conciliar antes de volver a subir; no usar force.
Avisar al equipo cuando termine el push. Antes de encargar C, la copia principal debe recibirlo.

No se requieren `git init`, otro repositorio, otro backend ni nuevas dependencias.
