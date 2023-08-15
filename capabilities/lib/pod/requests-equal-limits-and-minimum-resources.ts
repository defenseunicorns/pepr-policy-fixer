import { V1Pod, V1Container } from "@kubernetes/client-node";

export { mutatePodRequireRequestsEqualLimits };
/**
 * Convert memory to MiB
 * @param value Memory value.
 * @param unit Memory unit.
 */
function memoryToMiB(value: number, unit: string): number {
  switch (unit) {
    case "Ki":
      return value / 1024;
    case "Mi":
      return value;
    case "Gi":
      return value * 1024;
    case "Ti":
      return value * 1024 * 1024;
    case "KB":
      return value / 1000;
    case "MB":
      return value;
    case "GB":
      return value * 1000;
    case "TB":
      return value * 1000 * 1000;
    default:
      return value;
  }
}

/**
 * Convert CPU to millicores.
 * @param value CPU value.
 * @param unit CPU unit.
 */
function cpuToMillicores(value: number, unit: string): number {
  if (unit === "m" || !unit) {
    return value;
  } else {
    // Assume it's in cores if no unit specified
    return value * 1000;
  }
}

/**
 * Extract numeric value and unit from resource string.
 * @param str Resource string.
 */
function extractValueAndUnit(str: string): [number, string] {
  const match = str.match(/^(\d+(?:\.\d+)?)([a-zA-Z]*)$/);
  if (!match) throw new Error(`Invalid format: ${str}`);
  return [parseFloat(match[1]), match[2]];
}

/**
 * Mutate the provided Pod in place to ensure resource requests are equal to resource limits.
 * @param pod The Pod to be mutated.
 */
function mutatePodRequireRequestsEqualLimits(pod: V1Pod): void {
  // Helper function to set resource requests equal to resource limits
  const setResources = (container: V1Container) => {
    container.resources = container.resources || {};

    // Ensure requests and limits objects exist
    container.resources.requests = container.resources.requests || {};
    container.resources.limits = container.resources.limits || {};

    // Update CPU
    let maxCPU = 100; // Default in millicores
    if (container.resources.requests.cpu || container.resources.limits.cpu) {
      const [reqValue, reqUnit] = container.resources.requests.cpu
        ? extractValueAndUnit(container.resources.requests.cpu)
        : [0, ""];
      const [limValue, limUnit] = container.resources.limits.cpu
        ? extractValueAndUnit(container.resources.limits.cpu)
        : [0, ""];
      maxCPU = Math.max(
        cpuToMillicores(reqValue, reqUnit),
        cpuToMillicores(limValue, limUnit)
      );
    }

    container.resources.requests.cpu = maxCPU.toString() + "m";
    container.resources.limits.cpu = maxCPU.toString() + "m";

    // Update memory
    let maxMemory = 64; // Default in MiB
    if (
      container.resources.requests.memory ||
      container.resources.limits.memory
    ) {
      const [reqValue, reqUnit] = container.resources.requests.memory
        ? extractValueAndUnit(container.resources.requests.memory)
        : [0, "Mi"];
      const [limValue, limUnit] = container.resources.limits.memory
        ? extractValueAndUnit(container.resources.limits.memory)
        : [0, "Mi"];
      maxMemory = Math.max(
        memoryToMiB(reqValue, reqUnit),
        memoryToMiB(limValue, limUnit)
      );
    }

    container.resources.requests.memory = maxMemory.toString() + "Mi";
    container.resources.limits.memory = maxMemory.toString() + "Mi";
  };

  // Set required resources for each container type
  ["containers", "initContainers"].forEach(containerType => {
    pod.spec![containerType]?.forEach(setResources);
  });
}
