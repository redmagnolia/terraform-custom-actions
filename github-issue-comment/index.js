const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    try {
        const context = github.context;
        const token = core.getInput("github-token");
        const octokit = github.getOctokit(token);

        const terraformStep = core.getInput("terraform-step");

        switch(terraformStep) {
            case 'format': formatStep(context, octokit);
            default: throw new Error('⛔ Unsupported terraform step.');
        }

    } catch (error) {
        core.setFailed(error.message);
    }
});

function formatStep(context, octokit) {
    const comments = octokit.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue_number,
      });
      
      console.dir('Format comments: ', comments);
}