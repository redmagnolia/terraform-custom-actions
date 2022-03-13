const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    try {
        const context = github.context;
        const token = core.getInput("github-token");
        const octokit = github.getOctokit(token);

        const terraformStep = core.getInput("terraform-step");
        const comment = terraformStepComment(terraformStep);
        
        await octokit.rest.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
        })
        .then(result => result.data)
        .then(data => data.filter(data => data.user.login == 'github-actions[bot]' 
            && (data.body?.includes('Terraform Format and Style')
                || data.body?.includes('Terraform Initialization')
                || data.body?.includes('Terraform Validation')
                || data.body?.includes('Terraform Plan'))))
        .then(filteredData => filteredData.map(data => data.id))
        .then(ids => ids.forEach(id => octokit.rest.issues.deleteComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: id,
        })));

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

function terraformStepComment(terraformStep) {
    switch(terraformStep) {
        case 'format': return formatComment();
        case 'init': return initComment();
        case 'validate': return validateComment();
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

function initComment() {
    const initOutcome = core.getInput('init-outcome');

    if (initOutcome == 'success') {
        return null;
    }

    return '⚙️ Terraform Initialization ❌';
}

function validateComment() {
    const validateOutcome = core.getInput('validate-outcome');

    if (validateOutcome == 'success') {
        return null;
    }

    const validateError = core.getInput('validate-error');

    return `🤖 Terraform Validation ❌
\`\`\`\n
${validateError}
\`\`\``;
}