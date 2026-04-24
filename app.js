function hintApp() {
  return {
    data: { event: null, hints: [], groups: [], updated_at: null },
    selectedHint: null,

    async init() {
      try {
        const res = await fetch('hints.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load hints.json: ${res.status}`);
        this.data = await res.json();
      } catch (err) {
        console.error(err);
        this.data = { event: null, hints: [], groups: [], updated_at: null };
      }
    },

    get sortedHints() {
      return [...(this.data.hints || [])].sort((a, b) => {
        if (a.number !== b.number) return a.number - b.number;
        return (a.sub || 0) - (b.sub || 0);
      });
    },

    hintKey(hint) {
      return `${hint.number}-${hint.sub || 0}`;
    },

    hintLabel(hint) {
      const base = hint.sub ? `힌트 No.${hint.number}-${hint.sub}` : `힌트 No.${hint.number}`;
      return hint.day ? `${hint.day}일차 ${base}` : base;
    },

    keywordSizeClass(keyword) {
      if (!keyword) return '';
      const len = [...keyword].length;
      if (len <= 1) return 'short';
      if (len >= 5) return 'long';
      return '';
    },

    groupName(groupId) {
      if (!groupId) return null;
      const group = (this.data.groups || []).find((g) => g.id === groupId);
      return group ? group.name : null;
    },

    formatDate(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}. ${mm}. ${dd} ${hh}:${min}`;
    },

    openHint(hint) {
      this.selectedHint = hint;
      document.body.style.overflow = 'hidden';
    },

    closeHint() {
      this.selectedHint = null;
      document.body.style.overflow = '';
    },
  };
}
