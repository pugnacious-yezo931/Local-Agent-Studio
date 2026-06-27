const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { endpoint, fetchJson } = require("./fetch.cjs");

const IMAGE_PRESETS = {
  "z-image-turbo": {
    label: "Z-Image-Turbo",
    steps: 8,
    cfg: 1,
    sampler: "euler",
    scheduler: "normal",
    workflowKey: "zImageWorkflowPath",
    checkpointKey: "zImageCheckpoint",
  },
  "flux2-klein-9b": {
    label: "Flux.2 klein 9b",
    steps: 20,
    cfg: 5,
    sampler: "euler",
    scheduler: "normal",
    workflowKey: "fluxWorkflowPath",
    checkpointKey: "fluxCheckpoint",
  },
  "ideogram-v4": {
    label: "Ideogram v4",
    steps: 20,
    cfg: 7,
    sampler: "euler",
    scheduler: "normal",
    workflowKey: "ideogramWorkflowPath",
  },
};

function clamp(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return min;
  }
  return Math.max(min, Math.min(parsed, max));
}

function resolveImageModel(settings, override) {
  const model = override || settings.image?.model || "z-image-turbo";
  return IMAGE_PRESETS[model] ? model : "z-image-turbo";
}

function checkpointFor(settings, model) {
  const preset = IMAGE_PRESETS[model];
  if (preset.checkpointKey && settings.image?.[preset.checkpointKey]) {
    return settings.image[preset.checkpointKey];
  }
  return settings.comfy.defaultCheckpoint;
}

function workflowPathFor(settings, model) {
  const preset = IMAGE_PRESETS[model];
  const modelPath = preset.workflowKey ? settings.image?.[preset.workflowKey] : "";
  return modelPath || settings.comfy.workflowPath || "";
}

function builtInWorkflow(settings, prompt, negativePrompt, generation) {
  return {
    "3": {
      class_type: "KSampler",
      inputs: {
        seed: generation.seed,
        steps: generation.steps,
        cfg: generation.cfg,
        sampler_name: generation.sampler,
        scheduler: generation.scheduler,
        denoise: 1,
        model: ["4", 0],
        positive: ["6", 0],
        negative: ["7", 0],
        latent_image: ["5", 0],
      },
    },
    "4": {
      class_type: "CheckpointLoaderSimple",
      inputs: {
        ckpt_name: generation.checkpoint,
      },
    },
    "5": {
      class_type: "EmptyLatentImage",
      inputs: {
        width: 1024,
        height: 1024,
        batch_size: 1,
      },
    },
    "6": {
      class_type: "CLIPTextEncode",
      inputs: {
        text: prompt,
        clip: ["4", 1],
      },
    },
    "7": {
      class_type: "CLIPTextEncode",
      inputs: {
        text: negativePrompt,
        clip: ["4", 1],
      },
    },
    "8": {
      class_type: "VAEDecode",
      inputs: {
        samples: ["3", 0],
        vae: ["4", 2],
      },
    },
    "9": {
      class_type: "SaveImage",
      inputs: {
        filename_prefix: `local-agent-${generation.model}`,
        images: ["8", 0],
      },
    },
  };
}

function replaceTokens(value, replacements) {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(replacements, key)) {
        return String(replacements[key]);
      }
      return match;
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceTokens(item, replacements));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceTokens(item, replacements)]));
  }

  return value;
}

function parseResolution(value) {
  const match = String(value || "").match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return { width: 1024, height: 1024 };
  }
  return {
    width: clamp(Number(match[1]), 256, 4096),
    height: clamp(Number(match[2]), 256, 4096),
  };
}

function ideogramPrompt(prompt) {
  const trimmed = prompt.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  return JSON.stringify(
    {
      high_level_description: trimmed,
      style_description: {
        aesthetics: trimmed,
        lighting: "Match the user's prompt.",
        medium: "High quality image generation.",
        art_style: "Follow the user's requested style.",
      },
      compositional_deconstruction: {
        background: "Use a background that supports the requested scene.",
        elements: [
          {
            type: "obj",
            bbox: [0, 0, 1000, 1000],
            desc: trimmed,
          },
        ],
      },
    },
    null,
    2,
  );
}

function patchNode(workflow, nodeId, patch) {
  if (!workflow[nodeId]) {
    return;
  }
  workflow[nodeId].inputs = {
    ...(workflow[nodeId].inputs || {}),
    ...patch,
  };
}

function patchFirstByTitle(workflow, titlePattern, patch) {
  for (const node of Object.values(workflow)) {
    const title = node?._meta?.title || "";
    if (titlePattern.test(title)) {
      node.inputs = {
        ...(node.inputs || {}),
        ...patch,
      };
      return;
    }
  }
}

function patchWorkflowForModel(workflow, prompt, negativePrompt, generation, settings) {
  const resolution = parseResolution(settings.image?.ideogramResolution || "1024x1024");

  if (generation.model === "z-image-turbo") {
    patchNode(workflow, "57:27", { text: prompt });
    patchNode(workflow, "57:3", {
      seed: generation.seed,
      steps: generation.steps,
      cfg: generation.cfg,
    });
    patchNode(workflow, "57:13", {
      width: resolution.width,
      height: resolution.height,
    });
    patchNode(workflow, "57:28", {
      unet_name: generation.checkpoint,
    });
    return workflow;
  }

  if (generation.model === "flux2-klein-9b") {
    patchNode(workflow, "75:74", { text: prompt });
    patchNode(workflow, "75:67", { text: negativePrompt });
    patchNode(workflow, "75:73", { noise_seed: generation.seed });
    patchNode(workflow, "75:62", { steps: generation.steps });
    patchNode(workflow, "75:63", { cfg: generation.cfg });
    patchNode(workflow, "75:68", { value: resolution.width });
    patchNode(workflow, "75:69", { value: resolution.height });
    patchNode(workflow, "75:70", {
      unet_name: generation.checkpoint,
    });
    return workflow;
  }

  if (generation.model === "ideogram-v4") {
    const effort = String(generation.ideogramEffort || "default").toLowerCase();
    const choice = effort === "quality" ? "Quality" : effort === "turbo" ? "Turbo" : "Default";
    patchNode(workflow, "98:24", { text: ideogramPrompt(prompt) });
    patchNode(workflow, "98:18", { noise_seed: generation.seed });
    patchNode(workflow, "98:156", { choice });
    patchNode(workflow, "183", { value: resolution.width });
    patchNode(workflow, "184", { value: resolution.height });
    return workflow;
  }

  patchFirstByTitle(workflow, /positive|prompt/i, { text: prompt });
  patchFirstByTitle(workflow, /negative/i, { text: negativePrompt });
  return workflow;
}

function loadWorkflow(settings, prompt, negativePrompt, generation) {
  const replacements = {
    prompt,
    negativePrompt,
    checkpoint: generation.checkpoint,
    model: generation.model,
    seed: generation.seed,
    steps: generation.steps,
    cfg: generation.cfg,
    sampler: generation.sampler,
    scheduler: generation.scheduler,
    ideogramEffort: generation.ideogramEffort,
  };

  const selectedWorkflowPath = workflowPathFor(settings, generation.model);
  if (!selectedWorkflowPath) {
    return builtInWorkflow(settings, prompt, negativePrompt, generation);
  }

  const raw = fs.readFileSync(path.resolve(selectedWorkflowPath), "utf8");
  const parsed = JSON.parse(raw);
  const withTokens = replaceTokens(parsed, replacements);
  return patchWorkflowForModel(withTokens, prompt, negativePrompt, generation, settings);
}

async function queueComfyJob({ prompt, negativePrompt, settings, model, ideogramEffort }) {
  const preset = IMAGE_PRESETS[model];
  const seed = Math.floor(Math.random() * 1_000_000_000_000_000);
  const generation = {
    model,
    seed,
    steps: preset.steps,
    cfg: preset.cfg,
    sampler: preset.sampler,
    scheduler: preset.scheduler,
    checkpoint: checkpointFor(settings, model),
    ideogramEffort,
  };
  const clientId = randomUUID();
  const workflow = loadWorkflow(settings, prompt, negativePrompt, generation);
  const data = await fetchJson(endpoint(settings.comfy.baseUrl, "/prompt"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      prompt: workflow,
    }),
    timeoutMs: 30000,
  });

  return {
    clientId,
    promptId: data.prompt_id,
    number: data.number,
    nodeErrors: data.node_errors,
  };
}

async function queueComfyPrompt({ prompt, negativePrompt, settings, imageModel, ideogramEffort, count }) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is empty");
  }

  const model = resolveImageModel(settings, imageModel);
  const maxJobs = clamp(settings.agent?.maxImageJobs ?? 3, 1, 3);
  const total = clamp(count || settings.image?.repeat || 1, 1, maxJobs);
  const normalizedPrompt = prompt.trim();
  const normalizedNegative = negativePrompt || settings.comfy.negativePrompt;
  const jobs = [];

  for (let index = 0; index < total; index += 1) {
    jobs.push(
      await queueComfyJob({
        prompt: normalizedPrompt,
        negativePrompt: normalizedNegative,
        settings,
        model,
        ideogramEffort: ideogramEffort || settings.image?.ideogramEffort || "default",
      }),
    );
  }

  return {
    provider: "comfy",
    model,
    count: total,
    clientId: jobs[0]?.clientId || randomUUID(),
    promptId: jobs[0]?.promptId,
    number: jobs[0]?.number,
    nodeErrors: jobs[0]?.nodeErrors,
    jobs,
  };
}

async function getComfyHistory({ promptId, settings }) {
  const pathSuffix = promptId ? `/history/${encodeURIComponent(promptId)}` : "/history";
  return fetchJson(endpoint(settings.comfy.baseUrl, pathSuffix), { timeoutMs: 10000 });
}

module.exports = {
  getComfyHistory,
  queueComfyPrompt,
};
