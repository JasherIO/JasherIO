import parse_frontmatter from 'front-matter';
import { marked } from 'marked';
import reading_time from 'reading-time';

export function parse(file) {
  const slug = file.data.path.replace('.md', '');
  
  const decoded = Buffer.from(file.data.content, 'base64').toString();
  const { attributes: frontmatter, body } = parse_frontmatter(decoded);

  const html = marked(body);
  const stats = reading_time(body);

  return {
    slug,
    frontmatter,
    html,
    stats
  }
};
