import { Capability, a } from "pepr";
import { V1Container } from "@kubernetes/client-node";

import { mutatePodForNonRoot } from "./lib/pod/not-root";
import { mutatePodForRequredLabels } from "./lib/pod/required-labels";
import { mutatePodRequireRequestsEqualLimits } from "./lib/pod/requests-equal-limits-and-minimum-resources";
import { V1ResourceRequirements } from "@kubernetes/client-node";
export const PolicyFixer = new Capability({
  name: "policy-fixer",
  description: "A simple example capability to show how things work.",
  namespaces: [],
});

const { When } = PolicyFixer;

const REQUIRED_LABELS: { [key: string]: string | null } = {
  "pepr-kyverno-label": "yes",
  "pepr-kyverno-test-value": "600",
};

/**
 * Mutate the provided Pod to ensure it does not use host namespaces.
 * @param pod The Pod to be validated/mutated.
 */
function disallowHostNamespaces(pod: a.Pod) {
  pod.spec.hostPID = false;
  pod.spec.hostIPC = false;
  pod.spec.hostNetwork = false;
}

/**
 * Mutate the provided Pod in place to ensure its root filesystem is read-only.
 * @param pod The Pod to be mutated.
 */
function mutatePodRequireRORootFS(pod: a.Pod) {
  // Helper function to set readOnlyRootFilesystem to true for a container's securityContext
  const setReadOnlyRootFS = (container: V1Container) => {
    container.securityContext = container.securityContext || {};
    container.securityContext.readOnlyRootFilesystem = true;
  };

  // Set required security configurations for each container type
  ["containers", "initContainers", "ephemeralContainers"].forEach(
    containerType => {
      pod.spec![containerType]?.forEach(setReadOnlyRootFS);
    }
  );
}

When(a.Pod)
  .IsCreated()
  .Then(req => {
    mutatePodForNonRoot(req.Raw);
    mutatePodForRequredLabels(req.Raw, REQUIRED_LABELS);
    disallowHostNamespaces(req.Raw);
    mutatePodRequireRORootFS(req.Raw);
    mutatePodRequireRequestsEqualLimits(req.Raw);
  });
