const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    try {
        const context = github.context;
        const token = core.getInput("github-token");
        const octokit = github.getOctokit(token);

        const terraformStep = core.getInput("terraform-step");
        const comment = await terraformStepComment(terraformStep);
        
        if (comment) {
            await octokit.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: terraformStepComment(terraformStep, context, octokit),
              });
        }

    } catch (error) {
        core.setFailed(error.message);
    }
})();

async function terraformStepComment(terraformStep, context, octokit) {
    switch(terraformStep) {
        case 'format': return await formatComment(context, octokit);
        default: throw new Error(`⛔ Unsupported terraform step: ${terraformStep}.`);
    }
}

async function formatComment(context, octokit) {
    const formatOutcome = core.getInput('format-outcome');
    
    if (formatOutcome == 'success') {
        const oldComments = await octokit.rest.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
        });

        console.log('Old comments: ', oldComments);

        return null;
    }

    const formatOutput = core.getInput('format-output');
    return `🖌 Terraform Format and Style ❌
\`\`\`\n
${formatOutput}
\`\`\``;
}