#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const CONFIG_SCHEMA_URL = "https://opencode.ai/config.json";
const MODEL_SCHEMA_URL = "https://models.dev/model-schema.json";

const files = process.argv.slice(2);
if (files.length === 0) files.push("opencode.json");

function fail(message, code) {
  console.error(message);
  process.exit(code);
}

if (files.some((f) => f.endsWith(".jsonc"))) {
  fail("JSONC input is not supported; validate it by hand.", 2);
}

const present = files.filter((f) => existsSync(f));
for (const f of files) {
  if (!present.includes(f)) console.warn(`skip (missing): ${f}`);
}
if (present.length === 0) fail("no config files found", 1);

const parsed = [];
for (const f of present) {
  try {
    parsed.push({ file: f, config: JSON.parse(readFileSync(f, "utf8")) });
    console.log(`json ok: ${f}`);
  } catch (e) {
    fail(`${f}: invalid JSON: ${e.message}`, 1);
  }
}

const require = createRequire(import.meta.url);
let Ajv;
try {
  Ajv = require("ajv/dist/2020");
} catch {
  fail("ajv not found. Run `npm install` at the repo root.", 2);
}

let configSchema;
let modelSchema;
try {
  const [configRes, modelRes] = await Promise.all([
    fetch(CONFIG_SCHEMA_URL),
    fetch(MODEL_SCHEMA_URL),
  ]);
  if (!configRes.ok || !modelRes.ok) {
    throw new Error(`HTTP ${configRes.status} config, ${modelRes.status} model`);
  }
  configSchema = await configRes.json();
  modelSchema = await modelRes.json();
} catch (e) {
  fail(`could not fetch schemas (${e.message}); JSON was parsed, not validated.`, 2);
}

const ajv = new Ajv({
  strict: false,
  validateFormats: false,
  allowUnionTypes: true,
  allErrors: true,
});
ajv.addSchema(modelSchema, MODEL_SCHEMA_URL);

let validate;
try {
  validate = ajv.compile(configSchema);
} catch (e) {
  fail(`could not compile schema: ${e.message}`, 2);
}

let invalid = 0;
for (const { file, config } of parsed) {
  if (validate(config)) {
    console.log(`schema ok: ${file}`);
    continue;
  }
  invalid += 1;
  console.error(`schema INVALID: ${file}`);
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "/"} ${err.message}`);
  }
}

process.exit(invalid === 0 ? 0 : 1);
