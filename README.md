# Terraform Custom Actions

Custom Terraform GitHub Actions for infrastructure planning and provisioning.


## Terraform Plan Action

This action runs the following Terraform commands on a configuration and posts a comment with the generated plan on a pull-request.

### Usage

As a step of a job in a GitHub workflow:

```yaml
- name: Terraform Plan
  uses: redmagnolia/terraform-custom-actions/plan@<version>
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

#### Format

Checks whether the Terraform configuration has been formatted correctly.

```yaml
- name: Terraform Format
  id: fmt
  run: terraform fmt -check
  shell: bash
```

A comment is posted in case the configuration is not formatted properly.


#### Initialisation

The Terraform configuration is initialised.

```yaml
- name: Terraform Init
  id: init
  run: terraform init -no-color
  shell: bash
```

A comment is posted in case there is an error during initialisation.


#### Validation

The Terraform configuration is validated.

```yaml
- name: Terraform Validate
  id: validate
  run: terraform validate -no-color
  shell: bash
```

A comment is posted in case the configuration is not valid.


#### Plan

A Terraform plan is generated based on the configuration.

```yaml
- name: Terraform Plan
  id: plan
  run: terraform plan -detailed-exitcode -no-color || true
  shell: bash
```

A comment is posted as a summary for all the steps executed - `fmt | init | validate | plan`. The plan can be expanded by clicking on _*Show Plan*_.


## Terraform Apply Action

This action applies the Terraform configuration to the associated cloud provider.

### Usage

As a step of a job in a GitHub workflow:

```yaml
- name: Terraform Apply
  uses: redmagnolia/terraform-custom-actions/apply@<version>
```

#### Apply

The Terraform commands `fmt | init | validate | plan` are executed again without the comments just to make sure that the configuration is still valid in case of direct merge to the main branch (if branch protection is not available or enabled).

```yaml
- name: Terraform Apply
  if: ${{ github.ref == 'refs/heads/main' }}
  run: |
    terraform fmt -check
    terraform init
    terraform validate
    terraform apply -auto-approve
  shell: bash
```


## Commentator Action

A custom Javascript action that creates/overwrites comments on a pull-request given the Terraform command outcome and outputs.
