const fs = require("node:fs");
const { spawn } = require("node:child_process");

function collectProcess(command, args, options) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, args, {
      cwd: options.cwd,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, options.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({
        exitCode: -1,
        stdout,
        stderr: `${stderr}${stderr ? "\n" : ""}${error.message}`,
        durationMs: Date.now() - started,
        timedOut,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        exitCode: code ?? -1,
        stdout,
        stderr,
        durationMs: Date.now() - started,
        timedOut,
      });
    });
  });
}

function subprocessCommand(settings, command) {
  if (settings.sandbox.shell === "cmd") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", command],
    };
  }

  if (settings.sandbox.shell === "bash" || settings.sandbox.shell === "zsh" || settings.sandbox.shell === "sh") {
    return {
      command: settings.sandbox.shell,
      args: ["-lc", command],
    };
  }

  const powershell = process.platform === "win32" ? "powershell.exe" : "pwsh";
  return {
    command: powershell,
    args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
  };
}

function dockerCommand(settings, command) {
  return {
    command: "docker",
    args: [
      "run",
      "--rm",
      "-v",
      `${settings.workspacePath}:/workspace`,
      "-w",
      "/workspace",
      settings.sandbox.dockerImage || "ubuntu:24.04",
      "bash",
      "-lc",
      command,
    ],
  };
}

async function runCommand({ command, settings }) {
  if (!command || !command.trim()) {
    throw new Error("Command is empty");
  }

  fs.mkdirSync(settings.workspacePath, { recursive: true });

  const runner =
    settings.sandbox.mode === "docker" ? dockerCommand(settings, command.trim()) : subprocessCommand(settings, command.trim());

  return collectProcess(runner.command, runner.args, {
    cwd: settings.workspacePath,
    timeoutMs: Number(settings.sandbox.timeoutMs || 60000),
  });
}

module.exports = {
  runCommand,
};
