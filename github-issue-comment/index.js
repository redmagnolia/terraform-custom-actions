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
            body: createTerraformStepComment(terraformStep, core),
          });

    } catch (error) {
        core.setFailed(error);
    }
})();

function createTerraformStepComment(terraformStep, core) {
    switch(terraformStep) {
        case 'format': return formatComment(core);
        default: throw new Error(`⛔ Unsupported terraform step: ${terraformStep}.`);
    }
}

function formatComment(core) {
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