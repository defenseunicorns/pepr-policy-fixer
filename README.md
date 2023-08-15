# Pepr Module

This is a Pepr Module. [Pepr](https://github.com/defenseunicorns/pepr) is a Kubernetes transformation system written in Typescript.

## Pepr Kyverno Policy Fixer Capability

The `Pepr Kyverno Policy Fixer` capability within this module seeks to enhance the security and compliance of Kubernetes resources. Instead of waiting for Kyverno policy violations post-resource deployment, this capability proactively modifies the resource definitions to make them compliant, thus preventing potential violations.

**Key Features**:

- **Automated Correction**: Adjust Kubernetes resource definitions ahead of time to prevent potential policy violations.
- **Enhanced Compliance**: Ensure Kubernetes resources adhere to best practices before they're deployed.

### Directory Structure and Naming Convention

```
Module Root
├── package.json
├── pepr.ts
└── capabilities/
    ├── policy-fixer.ts
    └── lib/
        ├── pod/
        │   ├── non-root-user-group.ts
        │   └── required-labels.ts
        ├── <other-object-type>/
        │   └── <what-it-fixes>.ts
        └── ...
```

Within this structure:

- `non-root.ts` contains logic to ensure pods' user and group settings are non-root.
- `required-labels.ts` ensures that specific labels are present on pods.

By following the naming convention of `object-type/what-it-fixes.ts`, the purpose of each capability is evident based on its file path.

