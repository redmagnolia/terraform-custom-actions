const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    try {
        const context = github.context;
        const token = core.getInput("github-token");
        const octokit = github.getOctokit(token);

        const terraformStep = core.getInput("terraform-step");
        const formatOutcome = core.getInput('format-outcome');
        const formatOutput = core.getInput('format-output');

        let comment = null;

        switch(terraformStep) {
            case 'format': comment = formatComment(formatOutcome, formatOutput);
        }

        console.log('Comment: ', comment);

        if (comment) {
            await octokit.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue_number,
                body: comment,
              });
        }

    } catch (error) {
        core.setFailed(error);
    }
})();

function formatComment(outcome, output) {
    if (outcome == 'success') {
        return '🖌 Terraform Format and Style ✅'
    }

    return `🖌 Terraform Format and Style ❌
\`\`\`\n
${output}
\`\`\``;
}