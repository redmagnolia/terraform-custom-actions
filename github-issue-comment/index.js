const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    try {
        const context = github.context;
        const token = core.getInput("github-token");
        const octokit = github.getOctokit(token);

        const terraformStep = core.getInput("terraform-step");
        const comment = terraformStepComment(terraformStep);
        
        if (comment) {
            await octokit.rest.issues.listComments({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
            }).then(result => result.data.filter(data => data.user.login == 'github-actions[bot]'))
            .then(filtered => await octokit.rest.issues.deleteComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: filtered.id,
            }));

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

function terraformStepComment(terraformStep) {
    switch(terraformStep) {
        case 'format': return formatComment();
        default: throw new Error(`⛔ Unsupported terraform step: ${terraformStep}.`);
    }
}

function formatComment() {
    const formatOutcome = core.getInput('format-outcome');
    
    if (formatOutcome == 'success') {
        return null;
    }

    const formatOutput = core.getInput('format-output');
    return `🖌 Terraform Format and Style ❌
\`\`\`\n
${formatOutput}
\`\`\``;
}