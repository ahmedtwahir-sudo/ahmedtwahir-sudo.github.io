/* =========================================================
   BLOG FORMATTING TOOLBAR (Markdown)
   Loaded after admin.js. Works on #blog-content.
   Posts are still saved as plain text in blog.json.
========================================================= */

(function () {

  const box = document.getElementById('blog-content');
  const toolbar = document.getElementById('blog-toolbar');
  const preview = document.getElementById('blog-preview');

  if (!box || !toolbar || !preview) {
    return;
  }

  let previewing = false;


  /* ---------- helpers ---------- */

  function notifyChange() {
    // Lets the admin's unsaved-changes tracking notice toolbar edits
    box.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function wrap(before, after, placeholder) {
    const start = box.selectionStart;
    const end = box.selectionEnd;
    const selected = box.value.slice(start, end) || placeholder;

    box.setRangeText(before + selected + after, start, end, 'end');

    // keep the inner text selected so you can type over the placeholder
    box.setSelectionRange(
      start + before.length,
      start + before.length + selected.length
    );

    box.focus();
    notifyChange();
  }

  function prefixLines(makePrefix) {
    const value = box.value;
    const start = value.lastIndexOf('\n', box.selectionStart - 1) + 1;

    let end = value.indexOf('\n', box.selectionEnd);
    if (end === -1) end = value.length;

    const lines = value.slice(start, end).split('\n');
    const result = lines
      .map((line, i) => makePrefix(i) + line)
      .join('\n');

    box.setRangeText(result, start, end, 'select');
    box.focus();
    notifyChange();
  }

  function insertBlock(text) {
    const start = box.selectionStart;
    const needsBreak = start > 0 && box.value[start - 1] !== '\n';
    box.setRangeText((needsBreak ? '\n' : '') + text, start, box.selectionEnd, 'end');
    box.focus();
    notifyChange();
  }


  /* ---------- actions ---------- */

  const actions = {
    bold:   () => wrap('**', '**', 'bold text'),
    italic: () => wrap('*', '*', 'italic text'),
    h2:     () => prefixLines(() => '## '),
    h3:     () => prefixLines(() => '### '),
    ul:     () => prefixLines(() => '- '),
    ol:     () => prefixLines(i => (i + 1) + '. '),
    quote:  () => prefixLines(() => '> '),
    link:   () => wrap('[', '](https://)', 'link text'),
    hr:     () => insertBlock('\n---\n\n')
  };


  /* ---------- preview ---------- */

  function renderPreview() {
    if (!window.marked || !window.DOMPurify) {
      preview.textContent =
        'Preview unavailable: formatting libraries did not load. Check your internet connection.';
      return;
    }

    const html = window.marked.parse(box.value, { breaks: true });
    preview.innerHTML = window.DOMPurify.sanitize(html);
  }

  function setPreview(on) {
    previewing = on;
    box.hidden = on;
    preview.hidden = !on;

    toolbar.querySelectorAll('[data-fmt]').forEach(button => {
      if (button.dataset.fmt !== 'preview') {
        button.disabled = on;
      }
    });

    const toggle = toolbar.querySelector('[data-fmt="preview"]');
    toggle.textContent = on ? 'Edit' : 'Preview';
    toggle.classList.toggle('active', on);

    if (on) renderPreview();
    else box.focus();
  }


  /* ---------- events ---------- */

  toolbar.addEventListener('click', function (event) {
    const button = event.target.closest('[data-fmt]');
    if (!button) return;

    const name = button.dataset.fmt;

    if (name === 'preview') {
      setPreview(!previewing);
      return;
    }

    if (actions[name]) actions[name]();
  });

  box.addEventListener('keydown', function (event) {
    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();

    if (key === 'b') { event.preventDefault(); actions.bold(); }
    if (key === 'i') { event.preventDefault(); actions.italic(); }
  });

  // Reopening the editor for another post always starts in write mode
  const editor = document.getElementById('blog-editor');
  if (editor) {
    new MutationObserver(function () {
      if (previewing) setPreview(false);
    }).observe(editor, { attributes: true, attributeFilter: ['hidden'] });
  }

})();
