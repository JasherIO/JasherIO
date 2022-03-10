import core from '@actions/core';
import github from '@actions/github';
import parse_frontmatter from 'front-matter';
import { marked } from 'marked';
import reading_time from 'reading-time';
import invariant from 'tiny-invariant';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const filenames = JSON.parse(core.getInput('files'));
const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

const repo = github.context.payload.repository.name;
const owner = github.context.payload.repository.owner.name;

function get_file(path) {
  return octokit.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path });
};

function parse(file) {
  const slug = file.data.path.replace('.md', '');
  
  const decoded = Buffer.from(file.data.content, 'base64').toString();
  const { attributes: frontmatter, body } = parse_frontmatter(decoded);

  const html = marked(body);
  const stats = reading_time(stats);

  return {
    slug,
    frontmatter,
    html,
    stats
  }
};

async function get_parsed_files() {
  const responses = await Promise.all(filenames.map(get_file));
  return responses.map(parse);
}

(async () => {
  const parsed = await get_parsed_files();
  const output = JSON.stringify(parsed);
  core.setOutput('files', output);
  console.log(output);
})();