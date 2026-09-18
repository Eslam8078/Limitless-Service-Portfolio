# Limitless Portfolio — Ultimate (Fixed)

Angular 20 portfolio for Limitless Marketing Services.

## Fixes in this package
- All Angular packages are pinned to the same `20.1.8` patch version to prevent npm `ERESOLVE` peer-dependency conflicts.
- `main.ts` now bootstraps the actual `AppComponent` instead of containing a second duplicate application component.
- `tsconfig.app.json` points to the real standalone app entry point.
- No `--force` or `--legacy-peer-deps` is required.

## Requirements
Use a Node.js version supported by Angular 20.1.x (Node `20.19+`, `22.12+`, or `24+`).

## Run
```bash
npm install
npm start
```

## Production build
```bash
npm run build
```

## If you previously installed the broken package
Delete `node_modules` and `package-lock.json` in the project folder first, then run `npm install` again.

```bash
# Windows CMD
rmdir /s /q node_modules
del package-lock.json
npm install
npm start
```
