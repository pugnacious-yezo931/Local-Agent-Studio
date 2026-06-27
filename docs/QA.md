# QA

Дата проверки: 2026-06-25.

## Команды

```powershell
npm.cmd run build
$env:LOCAL_AGENT_CAPTURE_INTERACT="1"
npm.cmd exec electron -- scripts/capture-electron.cjs
Remove-Item Env:\LOCAL_AGENT_CAPTURE_INTERACT
npm.cmd run package:win
```

## Что проверено

- TypeScript `tsc --noEmit` проходит.
- Vite production build проходит.
- Backend smoke проверил чтение и патчинг трёх ComfyUI workflow без реального `/prompt`: Z-Image, Flux.2 и Ideogram v4 получили prompt, seed/negative/effort.
- Electron production renderer открывает `dist/index.html` через preload bridge.
- Composer принимает ввод.
- Enter отправляет сообщение.
- `/run Write-Output ok` выполняется через subprocess sandbox.
- Ответ `/run` отображается Markdown-ом: жирные поля и fenced code block.
- Production screenshot сохранён в `docs\rendered-screen.png`.
- NSIS installer собран: `release\Local Agent Studio-0.1.0-x64.exe`.

## Что не проверено полностью

- Реальный Ollama streaming не удалось проверить на этом запуске: локальный `http://localhost:11434/api/tags` вернул пустой список моделей, а выбранная в старом settings модель отсутствовала на сервере.
- Реальная ComfyUI генерация не запускалась; проверена подготовка workflow payload и наличие workflow-файлов.
- Web search summary требует доступного Ollama model runtime; сама логика multi-search и streaming собирается TypeScript-ом.
