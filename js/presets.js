/**
 * Pre-configured Style & Template Presets
 * Zero emojis - pure professional presets
 */

const Presets = {
  // Style Presets
  styles: {
    dhrubojyoti: {
      id: 'dhrubojyoti',
      name: 'Reference - Modern Blue',
      description: 'Clean circular avatar with vertical blue divider line',
      settings: {
        template: 'vertical-divider',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        nameFontSize: 17,
        nameFontWeight: '700',
        nameColor: '#0F172A',
        titleFontSize: 13,
        titleColor: '#64748B',
        bodyFontSize: 12.5,
        bodyColor: '#334155',
        labelColor: '#475569',
        accentColor: '#2563EB',
        linkColor: '#2563EB',
        dividerStyle: 'solid',
        dividerThickness: 2,
        dividerColor: '#2563EB',
        avatarShape: 'circle',
        avatarSize: 85,
        avatarBorderWidth: 0,
        avatarBorderColor: '#2563EB',
        avatarDpi: 2,
        iconStyle: 'brand',
        iconSize: 18,
        iconSpacing: 6,
        showLabels: true,
        labelPhone: 'M:',
        labelEmail: 'E:',
        showBadges: false
      }
    },
    siliconValley: {
      id: 'siliconValley',
      name: 'Silicon Valley Minimal',
      description: 'Charcoal typography with emerald green tech accent',
      settings: {
        template: 'vertical-divider',
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        nameFontSize: 17,
        nameFontWeight: '700',
        nameColor: '#111827',
        titleFontSize: 13,
        titleColor: '#4B5563',
        bodyFontSize: 12.5,
        bodyColor: '#374151',
        labelColor: '#10B981',
        accentColor: '#10B981',
        linkColor: '#10B981',
        dividerStyle: 'solid',
        dividerThickness: 2,
        dividerColor: '#10B981',
        avatarShape: 'rounded',
        avatarSize: 90,
        avatarBorderWidth: 2,
        avatarBorderColor: '#E5E7EB',
        avatarDpi: 2,
        iconStyle: 'accent',
        iconSize: 18,
        iconSpacing: 10,
        showLabels: true,
        labelPhone: 'P:',
        labelEmail: 'E:',
        showBadges: true,
        badgeText: 'Verified Developer'
      }
    },
    corporateNavy: {
      id: 'corporateNavy',
      name: 'Corporate Executive',
      description: 'Formal navy and slate aesthetic with structured grid',
      settings: {
        template: 'two-column',
        fontFamily: "Helvetica, Arial, sans-serif",
        nameFontSize: 18,
        nameFontWeight: '700',
        nameColor: '#1E3A8A',
        titleFontSize: 13,
        titleColor: '#475569',
        bodyFontSize: 12.5,
        bodyColor: '#1E293B',
        labelColor: '#1E3A8A',
        accentColor: '#1E3A8A',
        linkColor: '#1E3A8A',
        dividerStyle: 'solid',
        dividerThickness: 1,
        dividerColor: '#CBD5E1',
        avatarShape: 'square',
        avatarSize: 95,
        avatarBorderWidth: 1,
        avatarBorderColor: '#CBD5E1',
        avatarDpi: 2,
        iconStyle: 'monochrome',
        iconSize: 18,
        iconSpacing: 8,
        showLabels: true,
        labelPhone: 'Tel:',
        labelEmail: 'Email:',
        showBadges: false
      }
    },
    academicScholar: {
      id: 'academicScholar',
      name: 'Academic Scholar',
      description: 'Classic serif typography with deep sapphire accents',
      settings: {
        template: 'vertical-divider',
        fontFamily: "Georgia, 'Times New Roman', serif",
        nameFontSize: 18,
        nameFontWeight: '700',
        nameColor: '#1E1B4B',
        titleFontSize: 13.5,
        titleColor: '#52525B',
        bodyFontSize: 12.5,
        bodyColor: '#27272A',
        labelColor: '#312E81',
        accentColor: '#3730A3',
        linkColor: '#3730A3',
        dividerStyle: 'solid',
        dividerThickness: 2,
        dividerColor: '#3730A3',
        avatarShape: 'circle',
        avatarSize: 95,
        avatarBorderWidth: 2,
        avatarBorderColor: '#E0E7FF',
        avatarDpi: 2,
        iconStyle: 'accent',
        iconSize: 18,
        iconSpacing: 8,
        showLabels: true,
        labelPhone: 'Cell:',
        labelEmail: 'Institutional:',
        showBadges: true,
        badgeText: 'BRAC University'
      }
    },
    nordicMinimal: {
      id: 'nordicMinimal',
      name: 'Nordic Clean Slate',
      description: 'Airy layout with cool slate and sky blue highlights',
      settings: {
        template: 'horizontal-bar',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        nameFontSize: 17,
        nameFontWeight: '600',
        nameColor: '#0F172A',
        titleFontSize: 13,
        titleColor: '#64748B',
        bodyFontSize: 12,
        bodyColor: '#334155',
        labelColor: '#0284C7',
        accentColor: '#0284C7',
        linkColor: '#0284C7',
        dividerStyle: 'solid',
        dividerThickness: 1.5,
        dividerColor: '#E2E8F0',
        avatarShape: 'squircle',
        avatarSize: 85,
        avatarBorderWidth: 0,
        avatarBorderColor: '#0284C7',
        avatarDpi: 2,
        iconStyle: 'pill',
        iconSize: 16,
        iconSpacing: 6,
        showLabels: false,
        showBadges: false
      }
    },
    cyberpunkSlate: {
      id: 'cyberpunkSlate',
      name: 'Cyberpunk Violet',
      description: 'High contrast modern dark-slate and electric violet',
      settings: {
        template: 'modern-card',
        fontFamily: "'Courier New', Courier, monospace",
        nameFontSize: 18,
        nameFontWeight: '700',
        nameColor: '#0F172A',
        titleFontSize: 13,
        titleColor: '#7C3AED',
        bodyFontSize: 12,
        bodyColor: '#334155',
        labelColor: '#7C3AED',
        accentColor: '#7C3AED',
        linkColor: '#7C3AED',
        dividerStyle: 'dashed',
        dividerThickness: 2,
        dividerColor: '#7C3AED',
        avatarShape: 'squircle',
        avatarSize: 90,
        avatarBorderWidth: 2,
        avatarBorderColor: '#7C3AED',
        avatarDpi: 2,
        iconStyle: 'accent',
        iconSize: 18,
        iconSpacing: 8,
        showLabels: true,
        labelPhone: 'MOB//',
        labelEmail: 'NET//',
        showBadges: true,
        badgeText: 'Dev Protocol v2'
      }
    }
  },

  // Default Initial Data
  defaultData: {
    fullName: 'Dhrubojyoti',
    jobTitle: 'Undergraduate Student',
    company: 'BRAC University',
    department: 'Dept. of Computer Science & Engineering',
    phone: '+880 1607-608232',
    email: 'dhrubojyoti.saha@g.bracu.ac.bd',
    website: 'www.dhrubojyoti.dev',
    address: '38/1, Block-B, Aftabnagar, Dhaka-1212',
    country: 'Bangladesh',
    avatarUrl: typeof DEFAULT_AVATAR_BASE64 !== 'undefined' ? DEFAULT_AVATAR_BASE64 : 'assets/default-avatar.jpg',
    ctaText: 'Schedule a Meeting',
    ctaUrl: 'https://calendly.com',
    showCta: false,
    badgeText: 'Undergraduate Researcher',
    showBadge: false,
    disclaimerText: 'CONFIDENTIALITY NOTICE: This transmission may contain confidential information intended only for the use of the individual or entity named.',
    showDisclaimer: false,
    greenNoteText: 'Please consider the environment before printing this email.',
    showGreenNote: false,
    socials: [
      { id: 'facebook', enabled: true, url: 'https://facebook.com' },
      { id: 'x', enabled: true, url: 'https://x.com' },
      { id: 'youtube', enabled: true, url: 'https://youtube.com' },
      { id: 'linkedin', enabled: true, url: 'https://linkedin.com' },
      { id: 'instagram', enabled: true, url: 'https://instagram.com' },
      { id: 'github', enabled: false, url: 'https://github.com' },
      { id: 'website', enabled: false, url: 'https://dhrubojyoti.dev' },
      { id: 'whatsapp', enabled: false, url: 'https://wa.me/8801607608232' }
    ]
  },

  // Full Email Templates
  emailTemplates: [
    {
      id: 'professional-outreach',
      name: 'Professional Outreach / Introduction',
      subject: 'Introduction & Project Collaboration Opportunity',
      greeting: 'Dear Colleague,',
      paragraphs: [
        'I hope this message finds you well. I am reaching out regarding our recent developments in automated workflow systems and software architecture.',
        'We have prepared an overview of the technical specifications and would appreciate your valuable feedback on the roadmap.',
        'Please let me know if you would be open to a brief 15-minute sync later this week to discuss potential collaboration points.'
      ],
      ctaText: 'View Project Specifications',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Best regards,'
    },
    {
      id: 'portfolio-showcase',
      name: 'Portfolio / Project Showcase',
      subject: 'New Release: High-Definition Signature & Template Engine',
      greeting: 'Hello there,',
      paragraphs: [
        'I am excited to share a major milestone in our engineering showcase! We have officially released our new browser-based High-Definition Email Engine.',
        'Key capabilities include Retina 2x/3x high-DPI scaling, cross-client email-safe HTML tables, and seamless clipboard direct pasting into Gmail and Outlook.',
        'You can explore the live demo and interactive features through the link below.'
      ],
      ctaText: 'Explore Interactive Demo',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Warm regards,'
    },
    {
      id: 'meeting-followup',
      name: 'Meeting Follow-up & Action Items',
      subject: 'Follow-up & Key Action Items from Today\'s Discussion',
      greeting: 'Hi Team,',
      paragraphs: [
        'Thank you for your time during our discussion today. Here is a brief recap of the agreed next steps and action items:',
        '- Complete system architecture review by Friday.\n- Finalize responsive email template formatting.\n- Deploy staging environment for integration testing.',
        'Please review the updated documentation link below and let me know if anything needs adjustment.'
      ],
      ctaText: 'Open Action Tracker',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Sincerely,'
    },
    {
      id: 'academic-thesis',
      name: 'Academic Research & Thesis Update',
      subject: 'Research Progress & Thesis Manuscript Review',
      greeting: 'Respected Professor,',
      paragraphs: [
        'I am writing to provide an update on my current undergraduate research progress and submit the latest draft of our thesis manuscript.',
        'The empirical analysis and benchmarking tests have been incorporated into Chapter 4 as discussed in our previous advisory meeting.',
        'I look forward to your guidance and suggestions on the revision.'
      ],
      ctaText: 'Access Thesis Manuscript Draft',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Respectfully,'
    },
    {
      id: 'formal-inquiry',
      name: 'Formal Inquiry / Application',
      subject: 'Inquiry Regarding Opportunities & Research Positions',
      greeting: 'Dear Hiring Team / Research Lead,',
      paragraphs: [
        'I am writing to express my strong interest in joining your team as a software engineering and computational research intern.',
        'With hands-on experience in full-stack web technologies, distributed architectures, and rigorous academic foundations at BRAC University, I am keen to contribute to high-impact projects.',
        'My resume, code repositories, and project portfolio are linked below for your review.'
      ],
      ctaText: 'Review Portfolio & Resume',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'With highest regards,'
    }
  ]
};
