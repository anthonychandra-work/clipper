import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const WEB_DIR = resolve(ROOT_DIR, 'web');
export const SERVICE_DIR = resolve(ROOT_DIR, 'service');

const DEFAULT_WEB_PORT = 3000;
const DEFAULT_SERVICE_PORT = 8765;
const DEFAULT_WEB_BUILD_DIR = '.next';
const HIGHEST_PORT = 65535;
const PATH_VARIABLES = ['CLIPPER_DATA_DIR', 'CLIPPER_FFMPEG_DIR', 'CLIPPER_KEY_FILE'];

export function readRunSettings(environment) {
  return {
    webPort: readPort(environment, 'CLIPPER_WEB_PORT') ?? DEFAULT_WEB_PORT,
    servicePort: readPort(environment, 'CLIPPER_SERVICE_PORT') ?? DEFAULT_SERVICE_PORT,
    webBuildDir: environment.CLIPPER_WEB_BUILD_DIR ?? DEFAULT_WEB_BUILD_DIR,
    paths: resolveGivenPaths(environment),
  };
}

export function describeRunEnvironment(settings, environment) {
  return {
    ...environment,
    ...settings.paths,
    CLIPPER_WEB_PORT: String(settings.webPort),
    CLIPPER_SERVICE_PORT: String(settings.servicePort),
    CLIPPER_WEB_BUILD_DIR: settings.webBuildDir,
    NEXT_TELEMETRY_DISABLED: '1',
  };
}

function readPort(environment, name) {
  const given = environment[name];
  if (given === undefined || given === '') return null;
  const port = Number(given);
  if (Number.isInteger(port) && port > 0 && port <= HIGHEST_PORT) return port;
  throw new Error(`${name} must be a port number from 1 to ${HIGHEST_PORT}, and it is "${given}".`);
}

function resolveGivenPaths(environment) {
  const startedIn = environment.INIT_CWD ?? process.cwd();
  const given = PATH_VARIABLES.filter((name) => environment[name]);
  return Object.fromEntries(given.map((name) => [name, resolve(startedIn, environment[name])]));
}
