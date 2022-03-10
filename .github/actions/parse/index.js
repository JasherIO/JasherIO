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
  console.log('path: ', path);
  return octokit.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path });
};

function hasValidFrontmatter(attributes) {
  return attributes?.title && attributes?.description && attributes?.keywords && attributes?.date && attributes?.category;
};

function parse(file) {
  const slug = file.data.path.replace('.md', '');
  const decoded = Buffer.from(file.data.content, 'base64');
  const { attributes, body } = parse_frontmatter(decoded);
  invariant(hasValidFrontmatter(attributes), `${file.data.path} has bad frontmatter`);

  const date_object = new Date(attributes.date);
  const date = {
    raw: attributes.date,
    text: date_object.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    ISO: date_object.toISOString(),
  };
  const frontmatter = { ...attributes, date };

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
  console.log('responses: ', responses);
  return responses.map(parse);
}

(async () => {
  const parsed = await get_parsed_files();
  const output = JSON.stringify(parsed);
  core.setOutput('files', output);
  console.log(output);
})();