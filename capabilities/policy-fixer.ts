import { Capability, a } from "pepr";

import { mutatePodForNonRoot } from "./lib/pod/not-root";
import { mutatePodForRequredLabels } from "./lib/pod/required-labels";

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

When(a.Pod)
  .IsCreated()
  .Then(req => {
    mutatePodForNonRoot(req.Raw);
    mutatePodForRequredLabels(req.Raw, REQUIRED_LABELS);
  });
