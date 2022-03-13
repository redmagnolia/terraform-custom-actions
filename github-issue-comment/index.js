const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    try {
        const context = github.context;
        const token = core.getInput("github-token");
        const octokit = github.getOctokit(token);

        const terraformStep = core.getInput("terraform-step");

        await octokit.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue_number,
            body: createTerraformStepComment(terraformStep),
          });

    } catch (error) {
        core.setFailed(error.message);
    }
})();

function createTerraformStepComment(terraformStep) {
    switch(terraformStep) {
        case 'format': formatStep();
        default: throw new Error('⛔ Unsupported terraform step.');
    }
}

function formatStep() {
    const formatOutcome = core.getInput('format-outcome');
    
    if (formatOutcome == 'success') {
        return '🖌 Terraform Format and Style ✅'
    }

    const formatOutput = core.getInput('format-output');
    return `🖌 Terraform Format and Style ❌
\`\`\`\n
${formatOutput}
\`\`\``;
}