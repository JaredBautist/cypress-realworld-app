# Cypress Real World App (Fork) – Pipeline CI/CD

Este README resume exclusivamente lo solicitado: instrucciones de instalación y arranque del proyecto, descripción del workflow `ci.yml`, implementación del Page Object `LoginPage.js` y del spec `custom-flow.spec.ts`, más el análisis de resultados respaldado por las capturas entregadas.

---

## 1. Instalación

1. Clona tu fork del repositorio oficial:
   ```bash
   git clone https://github.com/TU_USUARIO/cypress-realworld-app.git
   cd cypress-realworld-app
   ```
2. Instala dependencias con npm (el pipeline usa `npm ci --legacy-peer-deps` para reproducibilidad):
   ```bash
   npm install
   ```
   > Si deseas replicar exactamente el pipeline, ejecuta `npm ci --legacy-peer-deps` sobre un entorno limpio.

## 2. Cómo iniciar el proyecto

```bash
npm run dev
```
- Frontend: http://localhost:3000
- API/Backend: http://localhost:3001

## 3. Pipeline CI/CD (`.github/workflows/ci.yml`)

| Paso | Propósito |
| --- | --- |
| `on: [push, pull_request]` | Ejecutar la validación en cada commit o PR. |
| `actions/checkout@v3` | Descarga el fork. |
| `actions/setup-node@v3` + `node-version: 18` | Garantiza la misma versión de Node que local. |
| `npm ci --legacy-peer-deps` | Instalación limpia basada en `package-lock`. |
| `npm run test:unit` | Corre Vitest para la capa React/TypeScript. |
| `npm run dev & sleep 25` | Levanta backend+frontend antes de Cypress. |
| `cypress-io/github-action@v6` | Ejecuta `npm run cypress:run` en Chrome esperando `http://localhost:3000`. |
| `actions/upload-artifact@v3` (if failure) | Publica `cypress/screenshots` cuando hay errores. |
| `SonarSource/sonarcloud-github-action@v2` | Envía métricas con `SONAR_TOKEN` y `GITHUB_TOKEN`. |

```yaml
name: CI Pipeline
on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci --legacy-peer-deps
      - run: npm run test:unit
      - run: |
          npm run dev &
          sleep 25
      - uses: cypress-io/github-action@v6
        with:
          start: npm run dev
          wait-on: 'http://localhost:3000'
          browser: chrome
      - name: Upload Cypress screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: cypress/screenshots
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=jaredbautist
            -Dsonar.organization=Jared Bautista
```

## 4. Código implementado

### Page Object `pages/LoginPage.js`
- Encapsula `visit`, `fillUsername`, `fillPassword` y `submit` usando selectores `data-test`.
- El helper `login(username, password)` permite invocar todo el flujo en una sola línea dentro de los specs.

### Spec `tests/ui/custom-flow.spec.ts`
- Importa el Page Object para iniciar sesión con `Katharina_Bernier / s3cret`.
- Tras autenticar, verifica que el dashboard muestre el texto `Get Started`, actuando como smoke test para la app real.

## 5. Análisis de resultados

1. **Vitest (`npm run test:unit`)**
   ![Vitest unit tests](capturas%20requeridas/teste%201.png)
   - 44 pruebas ejecutadas en 26 s (8 archivos, 1 skipped por escenarios marcados).
   - Cubre módulos de transacciones, notificaciones, contactos y utilidades; el resumen “PASS Waiting for file changes...” confirma que no quedaron suites pendientes.

2. **Cypress E2E (`npm run cypress:run`)**
   ![Cypress run](capturas%20requeridas/Segundo%20testing.png)
   - Lista cada spec (API y UI) con duración y número de tests; todos muestran check verde.
   - Incluye el spec nuevo `ui/custom-flow.spec.ts`, demostrando que el Page Object se ejercita dentro del pipeline.

3. **Implementación del Page Object**
   ![LoginPage Page Object](capturas%20requeridas/LoginPage.js.png)
   - Captura del editor destacando `visit`, `fillUsername`, `fillPassword`, `submit` y `login`.
   - Este encapsulamiento reduce duplicación y facilita mantener credenciales demo en un solo archivo.

4. **Spec personalizado con verificación de dashboard**
   ![Custom flow spec](capturas%20requeridas/custom%20flow.png)
   - Muestra cómo el spec importa el Page Object, llama `LoginPage.login('Katharina_Bernier','s3cret')` y verifica el texto “Get Started”.
   - Sirve como smoke test del dashboard y como plantilla para futuros escenarios con Page Objects.

5. **Dashboard de SonarCloud**
   ![SonarCloud metrics](capturas%20requeridas/metricas%20dashboard%20de%20SonarCloud%20.png)
   - Panel “Projects > cypress-realworld-app” tras el último análisis (`sonar.projectKey=jaredbautist`).
   - Calidad actual: Seguridad en nivel E (11 issues), Fiabilidad en C (20 issues), Mantenibilidad en A (180 code smells), Hotspots revisados 0 %, Duplications 1.1 %. Estos valores sirven como punto de partida para priorizar deuda técnica y evidencian que el workflow publica datos correctamente.

## 6. Resumen
- Instalación simple (`npm install`) y arranque con `npm run dev`.
- Pipeline automatiza pruebas unitarias, E2E y análisis estático en cada `push`/`pull_request`.
- Page Object + spec custom aseguran que el login y el dashboard estén siempre cubiertos.
- Las capturas adjuntas funcionan como evidencia directa del estado actual del proyecto.
