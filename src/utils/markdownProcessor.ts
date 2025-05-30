
import * as yaml from 'js-yaml';
import { ExtendedMetadata } from '@/types/metadata';

export function extractFrontmatter(markdown: string): { metadata: Partial<ExtendedMetadata>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);
  
  if (match) {
    try {
      const metadata = yaml.load(match[1]) as Partial<ExtendedMetadata>;
      return {
        metadata: metadata || {},
        content: match[2]
      };
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return {
        metadata: {},
        content: markdown
      };
    }
  }
  
  return {
    metadata: {},
    content: markdown
  };
}

export function injectFrontmatter(markdown: string, metadata: ExtendedMetadata): string {
  // Remove existing frontmatter if present
  const { content } = extractFrontmatter(markdown);
  
  // Generate YAML frontmatter
  const yamlString = yaml.dump(metadata, { indent: 2 });
  
  return `---\n${yamlString}---\n\n${content}`;
}

export function generateBibTeX(references: any[]): string {
  return references.map(ref => {
    const bibEntry = `@${ref.type || 'article'}{${ref.id},
  title={${ref.title}},
  author={${ref.author}},
  year={${ref.year}}`;
    
    const additionalFields = [];
    if (ref.journal) additionalFields.push(`  journal={${ref.journal}}`);
    if (ref.volume) additionalFields.push(`  volume={${ref.volume}}`);
    if (ref.pages) additionalFields.push(`  pages={${ref.pages}}`);
    if (ref.doi) additionalFields.push(`  doi={${ref.doi}}`);
    if (ref.url) additionalFields.push(`  url={${ref.url}}`);
    
    return bibEntry + (additionalFields.length > 0 ? ',\n' + additionalFields.join(',\n') : '') + '\n}';
  }).join('\n\n');
}
