/**
 * Team / Group Batch Signature Generator Engine
 * 100% on-device CSV processing, master branding sync, and batch ZIP export
 */

const TeamEngine = {
  // Team Roster State
  roster: [
    {
      id: 'member_1',
      fullName: 'Alex Vance',
      jobTitle: 'Principal Systems Architect',
      department: 'Infrastructure & Cloud',
      company: 'OmniCore Global',
      email: 'alex.vance@omnicore.io',
      phone: '+1 (415) 890-1201',
      website: 'www.omnicore.io',
      avatarUrl: '',
      location: 'San Francisco, CA'
    },
    {
      id: 'member_2',
      fullName: 'Elena Rostova',
      jobTitle: 'Lead Research Scientist',
      department: 'AI & Computational Biology',
      company: 'OmniCore Global',
      email: 'elena.rostova@omnicore.io',
      phone: '+1 (415) 890-1202',
      website: 'www.omnicore.io',
      avatarUrl: '',
      location: 'Boston, MA'
    },
    {
      id: 'member_3',
      fullName: 'Marcus Sterling',
      jobTitle: 'VP of Product Strategy',
      department: 'Executive Leadership',
      company: 'OmniCore Global',
      email: 'marcus.sterling@omnicore.io',
      phone: '+1 (415) 890-1203',
      website: 'www.omnicore.io',
      avatarUrl: '',
      location: 'London, UK'
    },
    {
      id: 'member_4',
      fullName: 'Sophia Chen',
      jobTitle: 'Senior Brand & UX Designer',
      department: 'Design Systems',
      company: 'OmniCore Global',
      email: 'sophia.chen@omnicore.io',
      phone: '+1 (415) 890-1204',
      website: 'www.omnicore.io',
      avatarUrl: '',
      location: 'Singapore'
    }
  ],

  activeMemberId: 'member_1',

  /**
   * Get active selected roster member
   */
  getActiveMember() {
    return this.roster.find(m => m.id === this.activeMemberId) || this.roster[0] || null;
  },

  /**
   * Add new team member
   */
  addMember(memberData = {}) {
    const id = 'member_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newMember = {
      id,
      fullName: memberData.fullName || 'New Team Member',
      jobTitle: memberData.jobTitle || 'Team Role',
      department: memberData.department || '',
      company: memberData.company || 'Company Name',
      email: memberData.email || 'member@company.com',
      phone: memberData.phone || '',
      website: memberData.website || '',
      avatarUrl: memberData.avatarUrl || '',
      location: memberData.location || ''
    };
    this.roster.push(newMember);
    return newMember;
  },

  /**
   * Update member fields
   */
  updateMember(id, updates = {}) {
    const member = this.roster.find(m => m.id === id);
    if (member) {
      Object.assign(member, updates);
      return member;
    }
    return null;
  },

  /**
   * Remove member by ID
   */
  removeMember(id) {
    this.roster = this.roster.filter(m => m.id !== id);
    if (this.activeMemberId === id) {
      this.activeMemberId = this.roster[0] ? this.roster[0].id : null;
    }
  },

  /**
   * Parse CSV string into roster array
   */
  parseCsv(csvText) {
    if (!csvText || !csvText.trim()) return [];

    const lines = [];
    let currentLine = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentLine.push(currentField.trim());
        if (currentLine.some(f => f.length > 0)) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField.length > 0 || currentLine.length > 0) {
      currentLine.push(currentField.trim());
      if (currentLine.some(f => f.length > 0)) {
        lines.push(currentLine);
      }
    }

    if (lines.length < 2) return [];

    // Header mapping
    const headers = lines[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const parsedMembers = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const member = {
        id: 'member_' + Date.now().toString(36) + '_' + i,
        fullName: '',
        jobTitle: '',
        department: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        avatarUrl: '',
        location: ''
      };

      headers.forEach((h, colIdx) => {
        const val = (row[colIdx] || '').trim();
        if (!val) return;

        if (h.includes('name') || h === 'fullname' || h === 'employee') {
          member.fullName = val;
        } else if (h.includes('title') || h.includes('role') || h.includes('designation') || h.includes('position')) {
          member.jobTitle = val;
        } else if (h.includes('dept') || h.includes('department')) {
          member.department = val;
        } else if (h.includes('company') || h.includes('org') || h.includes('organization')) {
          member.company = val;
        } else if (h.includes('email') || h.includes('mail')) {
          member.email = val;
        } else if (h.includes('phone') || h.includes('mobile') || h.includes('tel') || h.includes('cell')) {
          member.phone = val;
        } else if (h.includes('web') || h.includes('site') || h.includes('url')) {
          member.website = val;
        } else if (h.includes('avatar') || h.includes('photo') || h.includes('image') || h.includes('pic')) {
          member.avatarUrl = val;
        } else if (h.includes('loc') || h.includes('address') || h.includes('city') || h.includes('country')) {
          member.location = val;
        }
      });

      if (member.fullName || member.email) {
        if (!member.fullName && member.email) {
          member.fullName = member.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
        parsedMembers.push(member);
      }
    }

    if (parsedMembers.length > 0) {
      this.roster = parsedMembers;
      this.activeMemberId = parsedMembers[0].id;
    }

    return parsedMembers;
  },

  /**
   * Generate downloadable sample CSV file
   */
  downloadSampleCsv() {
    const csvContent = [
      'Full Name,Job Title,Department,Company,Email,Phone,Website,Location,Avatar URL',
      'Alex Vance,Principal Systems Architect,Cloud Infrastructure,OmniCore Global,alex.vance@omnicore.io,+1 (415) 890-1201,www.omnicore.io,"San Francisco, CA",',
      'Elena Rostova,Lead Research Scientist,AI Computational Biology,OmniCore Global,elena.rostova@omnicore.io,+1 (415) 890-1202,www.omnicore.io,"Boston, MA",',
      'Marcus Sterling,VP of Product Strategy,Executive Leadership,OmniCore Global,marcus.sterling@omnicore.io,+1 (415) 890-1203,www.omnicore.io,"London, UK",',
      'Sophia Chen,Senior Brand & UX Designer,Design Systems,OmniCore Global,sophia.chen@omnicore.io,+1 (415) 890-1204,www.omnicore.io,"Singapore",'
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mailcraft-team-roster-sample.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * Generate and export complete Team Batch ZIP archive
   * Pure client-side zero server transmission
   */
  async exportTeamBatchZip(masterData, masterSettings, onProgress) {
    if (!this.roster.length) {
      throw new Error('Roster is empty. Please add or import team members.');
    }

    const files = [];
    const directoryIndexRows = [];

    for (let i = 0; i < this.roster.length; i++) {
      const member = this.roster[i];
      if (onProgress) {
        onProgress(i + 1, this.roster.length, member.fullName);
      }

      // Merge master company branding with individual member details
      const memberData = {
        ...masterData,
        fullName: member.fullName || masterData.fullName,
        jobTitle: member.jobTitle || masterData.jobTitle,
        department: member.department || masterData.department,
        company: member.company || masterData.company,
        email: member.email || masterData.email,
        phone: member.phone || masterData.phone,
        website: member.website || masterData.website,
        address: member.location || masterData.address,
        avatarUrl: member.avatarUrl || masterData.avatarUrl,
        quoteText: (masterData.showQuote && typeof Quotes !== 'undefined') ? Quotes.getRandomQuote() : (masterData.quoteText || '')
      };

      const htmlContent = SignatureEngine.generateHtml(memberData, masterSettings, false, true);
      const safeName = (member.fullName || 'member_' + (i + 1))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      const fileName = `signatures/${safeName || 'member_' + (i + 1)}.html`;
      files.push({
        name: fileName,
        content: `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${member.fullName} - Email Signature</title>\n</head>\n<body style="margin:20px; font-family:sans-serif;">\n<!-- Copy the table below into your email client settings -->\n${htmlContent}\n</body>\n</html>`
      });

      directoryIndexRows.push(`
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 16px; font-weight: 600;">${member.fullName}</td>
          <td style="padding: 12px 16px; color: #64748B;">${member.jobTitle || '-'}</td>
          <td style="padding: 12px 16px; color: #64748B;">${member.department || '-'}</td>
          <td style="padding: 12px 16px;"><a href="mailto:${member.email}" style="color: #2563EB;">${member.email}</a></td>
          <td style="padding: 12px 16px;"><a href="${fileName}" target="_blank" style="display:inline-block; padding: 4px 10px; background: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-size: 12px;">Open Signature</a></td>
        </tr>
      `);
    }

    // Add Index Directory HTML
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Team Signatures Directory - ${masterData.company || 'MailCraft'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; color: #0F172A; margin: 0; padding: 40px 20px; }
    .container { max-width: 960px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 32px; }
    h1 { margin-top: 0; font-size: 22px; color: #0F172A; }
    p { color: #64748B; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    th { text-align: left; padding: 12px 16px; background: #F1F5F9; color: #475569; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Team Email Signatures Directory</h1>
    <p>Generated by <strong>MailCraft Studio</strong> &bull; Total Team Members: ${this.roster.length}</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Job Title</th>
          <th>Department</th>
          <th>Email</th>
          <th>Signature File</th>
        </tr>
      </thead>
      <tbody>
        ${directoryIndexRows.join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    files.unshift({ name: 'index.html', content: indexHtml });

    // Build and download zip
    const zipBlob = ZipBuilder.createZip(files);
    const zipName = `mailcraft-team-signatures-${Date.now().toString(36)}.zip`;
    ZipBuilder.downloadZip(zipBlob, zipName);
    return { count: this.roster.length, zipName };
  }
};
