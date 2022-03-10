import core from '@actions/core';
import github from '@actions/github';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

const repo = github.context.payload.repository.name;
const owner = github.context.payload.repository.owner.name;
const refs = github.context.payload.commits.map(commit => commit.id);

function get_commit(ref) {
  return octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', { owner, repo, ref });
};

async function get_files() {
  const responses = await Promise.all(refs.map(get_commit));
  const files = responses.flatMap(response => response.data.files);
  const filenames = files.flatMap(file => file.filename);
  return Array.from(new Set(filenames));
}

(async () => {
  const files = await get_files();
  console.log(files);
})();