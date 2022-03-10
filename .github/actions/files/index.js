import core from '@actions/core';
import github from '@actions/github';
import multimatch from 'multimatch';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const patterns = JSON.parse(core.getInput('patterns'));
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
  const unique_filenames = Array.from(new Set(filenames));
  return multimatch(unique_filenames, patterns);
}

(async () => {
  const files = await get_files();
  core.setOutput("files", JSON.stringify(files));

  console.log(files);
})();