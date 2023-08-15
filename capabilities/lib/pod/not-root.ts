import { V1Pod, V1SecurityContext } from "@kubernetes/client-node";

/**
 * Mutate the provided Pod to ensure it follows the Kyverno policy for non-root groups and users.
 * @param pod The Pod to be validated/mutated.
 * @returns The mutated Pod.
 */
export function mutatePodForNonRoot(
  pod: V1Pod,
  runAsGroup: number = 1000,
  runAsUser: number = 1000
): V1Pod {
  const ensureRunAsGroupAndUser = (
    secCtx?: V1SecurityContext
  ): V1SecurityContext => {
    if (!secCtx) secCtx = {};
    if (!secCtx.runAsGroup || secCtx.runAsGroup <= 0) {
      secCtx.runAsGroup = runAsGroup;
    }
    if (!secCtx.runAsUser || secCtx.runAsUser <= 0) {
      secCtx.runAsUser = runAsUser;
    }
    return secCtx;
  };

  // Mutate pod-level security context
  if (pod.spec?.securityContext) {
    pod.spec.securityContext = ensureRunAsGroupAndUser(
      pod.spec.securityContext
    );

    if (
      pod.spec.securityContext.fsGroup &&
      pod.spec.securityContext?.fsGroup <= 0
    ) {
      pod.spec.securityContext.fsGroup = runAsGroup;
    }
    if (pod.spec.securityContext.supplementalGroups) {
      pod.spec.securityContext.supplementalGroups =
        pod.spec.securityContext.supplementalGroups.map(groupId =>
          groupId <= 0 ? runAsGroup : groupId
        );
    }
  }

  // Mutate containers, initContainers, and ephemeralContainers
  ["containers", "initContainers", "ephemeralContainers"].forEach(
    containerType => {
      pod.spec![containerType]?.forEach(container => {
        container.securityContext = ensureRunAsGroupAndUser(
          container.securityContext
        );
      });
    }
  );

  return pod;
}
