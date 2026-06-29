import fs from 'fs';
import path from 'path';

export type TemplateVars = Record<string, string | number | null | undefined>;

export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    if (value == null) return '';
    return String(value);
  });
}

export function loadEmailTemplate(name: string): string {
  const filePath = path.join(__dirname, '../templates/email', `${name}.html`);
  return fs.readFileSync(filePath, 'utf8');
}

export function renderEmailTemplate(name: string, vars: TemplateVars): string {
  const raw = loadEmailTemplate(name);
  return renderTemplate(raw, vars);
}
