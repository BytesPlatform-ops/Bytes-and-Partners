/** Live, per-project palette drafts. Copy the object into projects.ts. */
export function createCasePalette(dialog) {
  const drafts = new Map();
  const tool = document.createElement('details');
  tool.className = 'case-palette';
  tool.innerHTML = `<summary>◐ Colors</summary><div class="case-palette-body"><strong>Case-study colors</strong><p class="case-palette-name"></p><div class="case-palette-fields"></div><textarea aria-label="Theme code to copy" readonly rows="5"></textarea><div class="case-palette-actions"><button type="button" data-copy>Copy code</button><button type="button" data-reset>Reset</button></div><span role="status" class="case-palette-status"></span></div>`;
  dialog.append(tool);
  let project = null;
  const fields = new Map();
  const code = tool.querySelector('textarea');
  const status = tool.querySelector('[role="status"]');
  function apply() {
    const theme = drafts.get(project.slug);
    // Preserve the chosen palette while keeping labels visible when the
    // accent and background are intentionally identical.
    dialog.style.setProperty('--case-accent-ink', theme.accent.toLowerCase() === theme.bg.toLowerCase() ? theme.fg : theme.accent);
    for (const key of ['accent', 'bg', 'fg']) {
      dialog.style.setProperty(`--case-${key}`, theme[key]);
      fields.get(key).color.value = theme[key];
      fields.get(key).text.value = theme[key];
      fields.get(key).text.setAttribute('aria-invalid', 'false');
    }
    code.value = `caseTheme: {\n  accent: "${theme.accent}",\n  bg: "${theme.bg}",\n  fg: "${theme.fg}",\n},`;
    status.textContent = '';
  }
  for (const [key, label] of [['accent', 'Accent'], ['bg', 'Background'], ['fg', 'Foreground']]) {
    const row = document.createElement('label');
    row.textContent = label;
    const color = document.createElement('input');
    color.type = 'color'; color.setAttribute('aria-label', `${label} color`);
    const text = document.createElement('input');
    text.type = 'text'; text.maxLength = 7; text.setAttribute('aria-label', `${label} hex`); text.spellcheck = false;
    color.addEventListener('input', () => { drafts.get(project.slug)[key] = color.value; apply(); });
    text.addEventListener('input', () => {
      const valid = /^#[0-9a-f]{6}$/i.test(text.value);
      text.setAttribute('aria-invalid', String(!valid));
      if (valid) { drafts.get(project.slug)[key] = text.value; apply(); }
    });
    row.append(color, text); tool.querySelector('.case-palette-fields').append(row); fields.set(key, { color, text });
  }
  tool.querySelector('[data-reset]').addEventListener('click', () => { drafts.set(project.slug, { ...project.caseTheme }); apply(); });
  tool.querySelector('[data-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(code.value); status.textContent = 'Copied — paste into this project in src/data/projects.ts'; }
    catch { code.focus(); code.select(); status.textContent = 'Select and copy the code above.'; }
  });
  return {
    setProject(value) {
      project = value;
      if (!drafts.has(project.slug)) drafts.set(project.slug, { ...project.caseTheme });
      tool.querySelector('.case-palette-name').textContent = project.name;
      apply();
    },
    dispose() { tool.remove(); drafts.clear(); },
  };
}
