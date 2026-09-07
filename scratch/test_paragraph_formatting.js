const fs = require('fs');
const path = require('path');

console.log('--- Testing Paragraph Formatting & Anti-Leak UI ---');

// 1. Load EmailTemplateEngine
const engineFile = fs.readFileSync(path.join(__dirname, '../js/email-template-engine.js'), 'utf8');
const SignatureEngine = {
  adjustColorForDark: (c) => c,
  getLuminance: () => 0.5,
  generateHtml: () => '<div>Mock Signature</div>'
};
const Presets = { styles: {} };
eval(engineFile);

// Test formatRichText
const raw = 'Hello **world**, this is *italic* with <u>underlined</u> text, a [portfolio](https://dhrubojyoti.dev), <mark>highlight</mark>, and `code block`.';
const formatted = EmailTemplateEngine.formatRichText(raw, '#334155', '#00DC82', false);

console.log('Formatted Paragraph 1 output:');
console.log(formatted);

if (!formatted.includes('<strong') || !formatted.includes('world</strong>')) throw new Error('Bold formatting failed');
if (!formatted.includes('<em') || !formatted.includes('italic</em>')) throw new Error('Italic formatting failed');
if (!formatted.includes('<u') || !formatted.includes('underlined</u>')) throw new Error('Underline formatting failed');
if (!formatted.includes('<a href="https://dhrubojyoti.dev"') || !formatted.includes('portfolio</a>')) throw new Error('Link formatting failed');
if (!formatted.includes('<mark') || !formatted.includes('highlight</mark>')) throw new Error('Highlight formatting failed');
if (!formatted.includes('<code') || !formatted.includes('code block</code>')) throw new Error('Code formatting failed');

console.log('✓ All formatRichText tests passed!');

// Test full email generation with formatted paragraphs
const fullEmail = EmailTemplateEngine.generateFullEmail({
  paragraphs: [
    'Welcome to our **v2.0 Release**! Visit [our site](https://example.com) for details.',
    '- Feature 1: **Retina 4x**\n- Feature 2: <u>Zero tracking</u>'
  ]
}, {}, {}, false, true);

if (!fullEmail.includes('<strong') || !fullEmail.includes('v2.0 Release</strong>')) throw new Error('Full email missing formatted bold');
if (!fullEmail.includes('<a href="https://example.com"')) throw new Error('Full email missing formatted link');
if (!fullEmail.includes('<li') || !fullEmail.includes('Retina 4x</strong>')) throw new Error('Full email missing formatted list item');

console.log('✓ Full email paragraph rendering with rich formatting passed!');

// 2. Test DOM structure in studio.html via regex / string checks
const studioHtml = fs.readFileSync(path.join(__dirname, '../studio.html'), 'utf8');

if (!studioHtml.includes('class="preheader-anti-leak-box"')) throw new Error('.preheader-anti-leak-box missing in studio.html');
if (!studioHtml.includes('id="tplAntiLeakPadding"')) throw new Error('#tplAntiLeakPadding missing in studio.html');
if (!studioHtml.includes('class="rich-format-toolbar" data-target="tplParagraph1"')) throw new Error('Paragraph 1 rich-format-toolbar missing');
if (!studioHtml.includes('data-action="bold"')) throw new Error('Bold button missing');
if (!studioHtml.includes('data-action="italic"')) throw new Error('Italic button missing');
if (!studioHtml.includes('data-action="underline"')) throw new Error('Underline button missing');
if (!studioHtml.includes('data-action="link"')) throw new Error('Link button missing');
if (!studioHtml.includes('data-action="highlight"')) throw new Error('Highlight button missing');
if (!studioHtml.includes('data-action="code"')) throw new Error('Code button missing');
if (!studioHtml.includes('data-action="bullet"')) throw new Error('Bullet button missing');
if (!studioHtml.includes('data-action="clear"')) throw new Error('Clear button missing');

console.log('✓ Paragraph 1 rich formatting toolbar buttons all exist in studio.html!');
console.log('✓ Prevent Body Leakage box and toggle UI verified in studio.html!');

// 3. Test applyTextareaFormatting logic
const appFile = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
if (!appFile.includes('initParagraphFormattingToolbars()')) throw new Error('initParagraphFormattingToolbars missing in app.js');
if (!appFile.includes('applyTextareaFormatting(textarea, action)')) throw new Error('applyTextareaFormatting missing in app.js');

console.log('✓ App formatting controller methods verified in app.js!');

console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');
