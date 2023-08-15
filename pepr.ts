import { PeprModule } from "pepr";
import cfg from "./package.json";

import { PolicyFixer } from "./capabilities/policy-fixer";


new PeprModule(cfg, [
  PolicyFixer,
]);
