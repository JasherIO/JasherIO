import core from '@actions/core';
import github from '@actions/github';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const commits = JSON.parse(core.getInput('commits'));
const refs = commits.map(commit => commit.id);
const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

const repository = '';
console.log('repository: ', github.context.payload.repository);
console.log('commits: ', github.context.payload.commits);

function get_commit({ repository, ref }) {
  return octokit.request('GET /repos/{repository}/commits/{ref}', { repository: 'JasherIO/JasherIO', ref });
};

async function get_files({ repository, refs }) {
  const responses = await Promise.all(refs.map(ref => get_commit({ repository, ref })));
  const files = responses.flatMap(response => response.data.files);
  const filenames = files.flatMap(file => file.filename);
  return Array.from(new Set(filenames));
}

(async () => {
  const files = await get_files({ repository, refs });
  console.log(files);
})();