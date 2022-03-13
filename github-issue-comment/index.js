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
        .then(data => data.filter(data => data.user.login == 'github-actions[bot]' && includesCommentType(terraformStep, data.body)))
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
                body: terraformStepComment(terraformStep),
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
        case 'plan': return planComment();
        default: throw new Error(`⛔ Unsupported terraform step: ${terraformStep}.`);
    }
}

function formatComment() {
    const formatOutcome = core.getInput('format-outcome');
    
    if (formatOutcome == null || formatOutcome == 'success') {
        return `#### 🖌 Terraform Format and Style ✅`;
    }

    const formatOutput = core.getInput('format-output');
    return `#### 🖌 Terraform Format and Style ❌
\`\`\`\n
${formatOutput}
\`\`\``;
}

function initComment() {
    const initOutcome = core.getInput('init-outcome');

    if (initOutcome == null || initOutcome == 'success') {
        return `#### ⚙️ Terraform Initialization ✅`;
    }

    return `#### ⚙️ Terraform Initialization ❌`;
}

function validateComment() {
    const validateOutcome = core.getInput('validate-outcome');

    if (validateOutcome == null || validateOutcome == 'success') {
        return `#### 🤖 Terraform Validation ✅`;
    }

    const validateError = core.getInput('validate-error');

    return `#### 🤖 Terraform Validation ❌
\`\`\`\n
${validateError}
\`\`\``;
}

function planComment() {
    const planOutcome = core.getInput('plan-outcome');
    const planOutput = core.getInput('plan-output');
    const planError = core.getInput('plan-error');

    if (planOutcome == 'success') {
        return `#### 📖 Terraform Plan ✅

<details><summary>Show Plan</summary>

\`\`\`\n
${planOutput}
\`\`\`

</details>`;
    }

    return `#### 📖 Terraform Plan ❌
\`\`\`\n
${planError}
\`\`\``;
}

function includesCommentType(terraformStep, body) {
    switch(terraformStep) {
        case 'format': return body.includes('Terraform Format and Style');
        case 'init': return body.includes('Terraform Initialization');
        case 'validate': return body.includes('Terraform Validation');
        case 'plan': return body.includes('Terraform Plan');
        default: throw new Error(`⛔ Unsupported terraform step: ${terraformStep}.`);
    }
}
