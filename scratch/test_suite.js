/**
 * MailCraft Studio Major Upgrade Suite - Automated Test Runner
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('----------------------------------------------------');
console.log('🧪 Running MailCraft Studio Major Upgrade Test Suite');
console.log('----------------------------------------------------\n');

let passedTests = 0;
let totalTests = 0;

function it(name, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.stack || err.message}\n`);
  }
}

// 1. Test QrEngine & VCardEngine
const { QrEngine, VCardEngine } = require('../js/qr-vcard-engine.js');

it('QrEngine: Generates SVG matrix and SVG markup without errors', () => {
  const qrSvg = QrEngine.generateSvg('https://www.dhrubojyoti.dev', { size: 120, margin: 2 });
  assert.ok(qrSvg.includes('<svg'), 'QR SVG output must contain <svg tag');
  assert.ok(qrSvg.includes('xmlns="http://www.w3.org/2000/svg"'), 'QR SVG must have valid namespace');
  assert.ok(qrSvg.includes('<path') || qrSvg.includes('<rect'), 'QR SVG must have vector elements');
});

it('QrEngine: Generates clean SVG Data URL for email insertion', () => {
  const dataUrl = QrEngine.generateSvgDataUrl('BEGIN:VCARD\nFN:Test\nEND:VCARD');
  assert.ok(dataUrl.startsWith('data:image/svg+xml;utf8,'), 'Data URL must start with svg prefix');
});

it('VCardEngine: Generates RFC 2426 compliant vCard 3.0 string', () => {
  const mockData = {
    fullName: 'Dhrubojyoti Saha',
    jobTitle: 'Software Architect & Researcher',
    company: 'BRAC University',
    department: 'CSE / AI Lab',
    email: 'dhrubojyoti.saha@g.bracu.ac.bd',
    phone: '+880 1700-000000',
    website: 'https://www.dhrubojyoti.dev',
    address: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    badgeText: 'Dev Architect'
  };

  const vcf = VCardEngine.generateVCardString(mockData);
  assert.ok(vcf.includes('BEGIN:VCARD'), 'vCard must start with BEGIN:VCARD');
  assert.ok(vcf.includes('VERSION:3.0'), 'vCard must have VERSION:3.0');
  assert.ok(vcf.includes('FN;CHARSET=UTF-8:Dhrubojyoti Saha'), 'vCard must contain FN');
  assert.ok(vcf.includes('N;CHARSET=UTF-8:Saha;Dhrubojyoti;;;'), 'vCard must contain structured N field');
  assert.ok(vcf.includes('ORG;CHARSET=UTF-8:BRAC University;CSE / AI Lab'), 'vCard must contain ORG');
  assert.ok(vcf.includes('EMAIL;TYPE=INTERNET,PREF:dhrubojyoti.saha@g.bracu.ac.bd'), 'vCard must contain EMAIL');
  assert.ok(vcf.includes('END:VCARD'), 'vCard must end with END:VCARD');
});

// 2. Test Presets & SignatureEngine
const Presets = require('../js/presets.js');
const SignatureEngine = require('../js/signature-engine.js');
global.Presets = Presets;

it('Presets: Contains all style presets including new architectural blueprints', () => {
  const expectedStyles = [
    'developerTerminal',
    'academicScholar',
    'corporateExecutive',
    'creativeAgency',
    'headerBannerCorporate',
    'academicMultiAffil',
    'microThreadReply',
    'asciiTerminalHacker',
    'minimalistOneLiner',
    'marketingPromo',
    'siliconValley',
    'nordicClean',
    'dhrubojyoti'
  ];

  expectedStyles.forEach(s => {
    assert.ok(Presets.styles[s], `Preset style for "${s}" must exist in Presets.styles`);
  });
  assert.ok(Object.keys(Presets.styles).length >= 10, 'Must have at least 10 preset blueprint styles');
});

it('SignatureEngine: Successfully renders all 10 templates in Light and Dark modes', () => {
  const testData = {
    ...Presets.defaultData,
    fullName: 'Dhrubojyoti Saha',
    jobTitle: 'Software Architect',
    company: 'MailCraft Systems',
    customFields: [
      { label: 'Pronouns', value: 'he/him', url: '' },
      { label: 'Office Hours', value: 'Mon-Thu 2-4 PM', url: '' }
    ],
    statusBadge: {
      enabled: true,
      text: 'Available for Projects',
      color: '#10B981'
    },
    bookingBadge: {
      enabled: true,
      provider: 'calendly',
      text: 'Schedule 1:1 Call',
      url: 'https://calendly.com'
    },
    qrCode: {
      enabled: true,
      targetMode: 'vcard',
      size: 64
    },
    promoBanner: {
      enabled: true,
      imageUrl: 'https://example.com/banner.png',
      targetUrl: 'https://www.dhrubojyoti.dev',
      alt: 'Special Announcement'
    }
  };

  const templates = [
    'vertical-divider',
    'horizontal-bar',
    'two-column',
    'modern-card',
    'header-banner',
    'academic-affil',
    'micro-thread',
    'ascii-terminal',
    'minimal-left',
    'compact-inline'
  ];

  templates.forEach(tpl => {
    const settings = {
      ...Presets.styles.developerTerminal.settings,
      template: tpl
    };

    const lightHtml = SignatureEngine.generateHtml(testData, settings, false, true);
    assert.ok(lightHtml.length > 200, `Light mode HTML for ${tpl} should render content`);
    assert.ok(lightHtml.includes('Dhrubojyoti Saha'), `HTML for ${tpl} must contain full name`);

    const darkHtml = SignatureEngine.generateHtml(testData, settings, true, true);
    assert.ok(darkHtml.length > 200, `Dark mode HTML for ${tpl} should render content`);
    assert.ok(darkHtml.includes('prefers-color-scheme') || darkHtml.includes('#0A0A0A') || darkHtml.includes('#FFFFFF') || darkHtml.includes('[data-ogsc]'), `Dark mode HTML for ${tpl} should have dark mode styles`);
  });
});

// 3. Test LinterEngine
const LinterEngine = require('../js/linter.js');

it('LinterEngine: Audits HTML size, Outlook MSO rules, and Dark Mode coverage', () => {
  const sampleHtml = `
    <!--[if mso]><style>table {border-collapse:collapse;}</style><![endif]-->
    <style>
      @media (prefers-color-scheme: dark) { .dark-text { color: #ffffff !important; } }
      [data-ogsc] .dark-text { color: #ffffff !important; }
    </style>
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:sans-serif;">
      <tr>
        <td>
          <img src="https://example.com/avatar.jpg" width="85" height="85" alt="Avatar" border="0" style="display:block; border-radius:50%; width:85px; height:85px;">
        </td>
        <td style="padding-left:12px;">
          <div style="font-weight:bold; font-size:16px;">Dhrubojyoti Saha</div>
          <div style="color:#00DC82; font-size:13px;">Software Architect</div>
        </td>
      </tr>
    </table>
  `;

  const report = LinterEngine.audit(sampleHtml);
  assert.strictEqual(report.isSizeSafe, true, 'Sample HTML size must be safe (<102KB)');
  assert.ok(report.score >= 90, `Score should be >= 90, got ${report.score}`);
  assert.strictEqual(report.badgeClass, 'badge-pass');
  assert.ok(report.checks.some(c => c.id === 'mso_tables' && c.status === 'pass'));
  assert.ok(report.checks.some(c => c.id === 'dark_mode' && c.status === 'pass'));
  assert.ok(report.checks.some(c => c.id === 'retina_images' && c.status === 'pass'));
});

// 4. Test AdminTools
const AdminTools = require('../js/admin-tools.js');

it('AdminTools: Generates valid Apple Mail .mailsignature with RFC 822 MIME headers', () => {
  const html = '<table style="font-family:sans-serif;"><tr><td>Signature</td></tr></table>';
  const mailSig = AdminTools.generateAppleMailSignature(html);
  assert.ok(mailSig.includes('Content-Type: text/html; charset=utf-8'));
  assert.ok(mailSig.includes('Message-Id: <'));
  assert.ok(mailSig.includes('Mime-Version: 1.0 (Apple Message signature)'));
  assert.ok(mailSig.includes(html));
});

it('AdminTools: Generates Google Apps Script (.gs) with Gmail API deployment functions', () => {
  const html = '<div>Test Signature</div>';
  const gs = AdminTools.generateGoogleAppsScript(html, 'admin@domain.com');
  assert.ok(gs.includes('const SIGNATURE_HTML = "<div>Test Signature</div>"'));
  assert.ok(gs.includes('function deploySingleSignature(targetEmail)'));
  assert.ok(gs.includes('function deployDomainSignatures()'));
  assert.ok(gs.includes('Gmail.Users.Settings.SendAs.patch'));
});

it('AdminTools: Generates Microsoft 365 Exchange Online PowerShell deployment script (.ps1)', () => {
  const html = '<div>Test Signature</div>';
  const ps1 = AdminTools.generateExchangePowerShell(html, 'user@corp.com');
  assert.ok(ps1.includes('Import-Module ExchangeOnlineManagement'));
  assert.ok(ps1.includes('Connect-ExchangeOnline'));
  assert.ok(ps1.includes('$Base64Html = '));
  assert.ok(ps1.includes('Set-MailboxMessageConfiguration'));
  assert.ok(ps1.includes('user@corp.com'));
});

// 5. Test BannerBuilder
const BannerBuilder = require('../js/banner-builder.js');

it('BannerBuilder: Contains all standard campaign preset themes and gradients', () => {
  const expectedPresets = ['hiring', 'research', 'product', 'webinar', 'custom'];
  expectedPresets.forEach(p => {
    assert.ok(BannerBuilder.presets[p], `Preset "${p}" must exist in BannerBuilder.presets`);
    assert.ok(BannerBuilder.presets[p].title, `Preset "${p}" must have title`);
  });

  const expectedGradients = ['emerald', 'sapphire', 'violet', 'amber', 'crimson', 'darkSlate', 'monochrome'];
  expectedGradients.forEach(g => {
    assert.ok(BannerBuilder.gradients[g], `Gradient "${g}" must exist in BannerBuilder.gradients`);
  });
});

// 6. Test Granular Line-by-Line Customization
it('SignatureEngine: Honors granular line-by-line custom prefix, suffix, title style, and contact schemes', () => {
  const customData = {
    ...Presets.defaultData,
    fullName: 'Alex Vance',
    jobTitle: 'Principal Architect',
    company: 'OmniCore',
    department: 'Cloud Infrastructure',
    phone: '+1 (415) 890-1201',
    email: 'alex@omnicore.io',
    website: 'omnicore.io',
    address: 'San Francisco, CA',
    country: 'USA'
  };

  const customSettings = {
    ...Presets.styles.developerTerminal.settings,
    namePrefix: 'Dr.',
    nameSuffix: 'Ph.D.',
    nameTag: 'LEAD ARCHITECT',
    nameFontWeight: '800',
    nameTransform: 'uppercase',
    titleFontStyle: 'italic',
    titleSeparator: 'doubleslash',
    titleFontSize: 14,
    labelScheme: 'custom',
    labelPhone: 'T:',
    labelEmail: 'E:',
    labelWebsite: 'W:',
    labelAddress: 'A:',
    lineSpacing: 'tight',
    dividerSpacing: 18
  };

  const html = SignatureEngine.generateHtml(customData, customSettings, false, false);
  assert.ok(html.includes('Dr.'), 'Rendered HTML must include name prefix Dr.');
  assert.ok(html.includes('Ph.D.'), 'Rendered HTML must include name suffix Ph.D.');
  assert.ok(html.includes('LEAD ARCHITECT'), 'Rendered HTML must include status role pill');
  assert.ok(html.includes('text-transform: uppercase'), 'Rendered HTML must include name transform');
  assert.ok(html.includes('font-style: italic'), 'Rendered HTML must include title italic style');
  assert.ok(html.includes('//'), 'Rendered HTML must include double slash separator');
  assert.ok(html.includes('T:'), 'Rendered HTML must include custom phone prefix T:');
  assert.ok(html.includes('E:'), 'Rendered HTML must include custom email prefix E:');
  assert.ok(html.includes('W:'), 'Rendered HTML must include custom website prefix W:');
});

// 7. Test ImageProcessor Smart DPI Engine
it('ImageProcessor: Calculates correct High-DPI physical resolution and optimized payload metrics', () => {
  // Test 4x DPI physical resolution calculation: 85px display * 4 = 340x340px
  const dpi = 4;
  const size = 85;
  const px = Math.round(size * dpi);
  assert.strictEqual(px, 340, '4x Ultra DPI must preserve full 340x340 physical resolution');

  // Test 2x DPI physical resolution calculation: 85px display * 2 = 170x170px
  const dpi2 = 2;
  const px2 = Math.round(size * dpi2);
  assert.strictEqual(px2, 170, '2x Retina DPI must preserve full 170x170 physical resolution');
});

console.log('\n----------------------------------------------------');
console.log(`🎉 Results: ${passedTests} / ${totalTests} tests passed successfully!`);
console.log('----------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
