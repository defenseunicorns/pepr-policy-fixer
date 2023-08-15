import { V1Pod } from "@kubernetes/client-node";

export { mutatePodForRequredLabels };
/**
 * Mutate the provided Pod to ensure it has the necessary labels.
 * @param pod The Pod to be validated/mutated.
 * @returns The mutated Pod.
 */
function mutatePodForRequredLabels(
  pod: V1Pod,
  requiredLabels: { [key: string]: string } = null
): V1Pod {
  if (requiredLabels === null) return;

  const labels = pod.metadata?.labels || {};

  for (const [label, requiredValue] of Object.entries(requiredLabels)) {
    const existingValue = labels[label];

    if (
      typeof existingValue === "undefined" ||
      (requiredValue !== null && existingValue !== requiredValue)
    ) {
      labels[label] = requiredValue || "default-value"; // Adjust the 'default-value' as needed.
    }
  }

  // Ensure the pod has the labels attached to its metadata.
  if (!pod.metadata) {
    pod.metadata = { labels };
  } else {
    pod.metadata.labels = labels;
  }

  return pod;
}
