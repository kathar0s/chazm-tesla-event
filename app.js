function hintApp() {
  return {
    data: { event: null, hints: [], groups: [], updated_at: null },
    selectedHint: null,
    sourceEl: null,
    closing: false,
    query: '',
    activeCategory: 'day1',
    reportUrl: 'https://github.com/kathar0s/chazm-tesla-event/issues/new?template=hint-report.yml',
    kakaoChatUrl: 'https://open.kakao.com/o/p8FeFVri',

    hintIndex: {},
    dragState: null,
    swipeThreshold: 50,
    showSwipeHint: false,
    buildTime: null,

    _sorted: [],
    _categoryHints: {},
    _categoryCounts: {},

    async init() {
      try {
        const res = await fetch('hints.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load hints.json: ${res.status}`);
        this.data = await res.json();
      } catch (err) {
        console.error(err);
        this.data = { event: null, hints: [], groups: [], updated_at: null };
      }
      // Precompute derived collections so per-render getters are O(1)
      this._sorted = [...(this.data.hints || [])].sort((a, b) => {
        if ((a.day || 0) !== (b.day || 0)) return (a.day || 0) - (b.day || 0);
        return a.number - b.number;
      });
      this._categoryHints = {};
      this._categoryCounts = {};
      for (const h of this._sorted) {
        (this._categoryHints[h.category] ||= []).push(h);
        this._categoryCounts[h.category] = (this._categoryCounts[h.category] || 0) + 1;
      }
      try {
        const hasStacks = (this.data.hints || []).some(
          (h) => (h.keywords || []).length > 1
        );
        if (hasStacks && localStorage.getItem('swipe-hint-dismissed') !== '1') {
          this.showSwipeHint = true;
        }
      } catch (_) {}
      const metaBuild = document.querySelector('meta[name="build-time"]')?.content;
      this.buildTime =
        metaBuild && metaBuild !== '__BUILD_TIME__' ? metaBuild : this.data.updated_at;
    },

    dismissSwipeHint() {
      this.showSwipeHint = false;
      try { localStorage.setItem('swipe-hint-dismissed', '1'); } catch (_) {}
    },

    get sortedHints() {
      return this._sorted;
    },

    get categories() {
      return this.data.categories || [];
    },

    category(id) {
      return this.categories.find((c) => c.id === id) || null;
    },

    get categoryHints() {
      return this._categoryHints[this.activeCategory] || [];
    },

    get filteredHints() {
      const q = this.query.trim().toLowerCase();
      if (!q) return this.categoryHints;
      // Search is global across all categories
      return this._sorted.filter((h) =>
        (h.keywords || []).some((kw) => kw.toLowerCase().includes(q))
      );
    },

    get categoryCounts() {
      return this._categoryCounts;
    },

    get reportUrlWithQuery() {
      const q = this.query.trim();
      if (!q) return this.reportUrl;
      return `${this.reportUrl}&keywords=${encodeURIComponent(q)}`;
    },

    hintKey(hint) {
      return String(hint.number);
    },

    hintLabel(hint) {
      const cat = this.category(hint.category);
      const header = cat ? cat.header : '힌트';
      return `${header} No.${hint.number}`;
    },

    modalCardLabel(hint, idx) {
      const base = this.hintLabel(hint);
      return hint.keywords.length > 1 ? `${base} (${idx + 1}/${hint.keywords.length})` : base;
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

    hintIndexKey(hint) {
      return `${hint.category}-${hint.number}`;
    },

    getIndex(hint) {
      return this.hintIndex[this.hintIndexKey(hint)] || 0;
    },

    topKeyword(hint) {
      return hint.keywords[this.getIndex(hint)];
    },

    cycleKeyword(hint, step = 1) {
      const n = hint.keywords.length;
      if (n <= 1) return;
      const cur = this.getIndex(hint);
      this.hintIndex[this.hintIndexKey(hint)] = (cur + step + n) % n;
    },

    orderedKeywords(hint) {
      const n = hint.keywords.length;
      const start = this.getIndex(hint);
      return Array.from({ length: n }, (_, i) => hint.keywords[(start + i) % n]);
    },

    onPointerDown(event, hint) {
      if (!hint || hint.keywords.length <= 1) return;
      const el = event.currentTarget;
      try { el.setPointerCapture(event.pointerId); } catch (_) {}
      this.dragState = {
        hint,
        el,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        dragged: false,
      };
      el.style.transition = 'none';
    },

    onPointerMove(event, hint) {
      if (!this.dragState || this.dragState.hint !== hint) return;
      const dx = event.clientX - this.dragState.startX;
      const dy = event.clientY - this.dragState.startY;
      this.dragState.currentX = event.clientX;
      if (!this.dragState.dragged && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        this.dragState.dragged = true;
      }
    },

    onPointerUp(event, hint) {
      if (!this.dragState || this.dragState.hint !== hint) return;
      const dx = this.dragState.currentX - this.dragState.startX;
      const el = this.dragState.el;
      const dragged = this.dragState.dragged;
      try { el.releasePointerCapture?.(this.dragState.pointerId); } catch (_) {}
      if (dragged && Math.abs(dx) > this.swipeThreshold) {
        this.cycleKeyword(hint, dx > 0 ? -1 : 1);
        el.style.transition = 'none';
        el.style.opacity = '0.55';
        el.offsetHeight;
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 140ms ease-out';
          el.style.opacity = '1';
        });
      }
      const wasDragged = dragged;
      setTimeout(() => {
        if (this.dragState && this.dragState.hint === hint) this.dragState = null;
      }, 180);
      if (wasDragged) {
        event.preventDefault?.();
        event.stopPropagation?.();
        this.suppressClick = true;
        setTimeout(() => { this.suppressClick = false; }, 60);
      }
    },

    onPointerCancel(event, hint) {
      if (!this.dragState || this.dragState.hint !== hint) return;
      this.dragState = null;
    },

    onCardClick(event, hint) {
      if (this.suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.openHint(hint, event);
    },

    computeFlip(sourceRect, targetRect) {
      const dx = sourceRect.left + sourceRect.width / 2 - (targetRect.left + targetRect.width / 2);
      const dy = sourceRect.top + sourceRect.height / 2 - (targetRect.top + targetRect.height / 2);
      const sx = sourceRect.width / targetRect.width;
      const sy = sourceRect.height / targetRect.height;
      return { dx, dy, sx, sy };
    },

    isPlaceholder(hint) {
      return !hint.image && (!hint.keywords || hint.keywords.length === 0);
    },

    isImagePending(hint) {
      return hint.category === 'day3' && !hint.image;
    },

    placeholderReportUrl(hint) {
      const cat = this.category(hint.category);
      const label = cat ? cat.label : '';
      const title = `[제보] ${label} 힌트 No.${hint.number} 이미지`;
      return `${this.reportUrl}&title=${encodeURIComponent(title)}`;
    },

    cardStyle(hint) {
      return {
        visibility: this.selectedHint?.number === hint.number ? 'hidden' : '',
      };
    },

    markSourceCardsForTransition(hint) {
      if (!this.sourceEl) return [];
      const cards = Array.from(this.sourceEl.querySelectorAll('.card'));
      cards.forEach((card, i) => {
        card.style.viewTransitionName = `hint-${hint.category}-${hint.number}-p${i}`;
      });
      return cards;
    },

    clearSourceCardsTransition() {
      if (!this.sourceEl) return;
      this.sourceEl.querySelectorAll('.card').forEach((card) => {
        card.style.viewTransitionName = '';
      });
    },

    setActiveTransitionName(hint) {
      let tag = document.getElementById('vt-active-style');
      if (!tag) {
        tag = document.createElement('style');
        tag.id = 'vt-active-style';
        document.head.appendChild(tag);
      }
      if (!hint) {
        tag.textContent = '';
        return;
      }
      const count = hint.image ? 1 : Math.max(1, hint.keywords?.length || 0);
      const rules = Array.from({ length: count }, (_, i) =>
        `::view-transition-group(hint-${hint.category}-${hint.number}-p${i}) { z-index: ${310 - i} !important; }`
      );
      tag.textContent = rules.join('\n');
    },

    openHint(hint, event) {
      if (this.closing) return;
      this.sourceEl = event?.currentTarget || null;
      this.setActiveTransitionName(hint);
      this.markSourceCardsForTransition(hint);

      const apply = (resolve) => {
        this.selectedHint = hint;
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          this.clearSourceCardsTransition();
          if (resolve) resolve();
        });
      };

      if (document.startViewTransition) {
        document.startViewTransition(() => new Promise((r) => apply(r)));
      } else {
        apply();
        requestAnimationFrame(() => this.animateOpen());
      }
    },

    animateOpen() {
      const cards = document.querySelectorAll('.modal-card');
      const meta = document.querySelector('.modal-meta-panel');
      const backdrop = document.querySelector('.modal-backdrop');
      if (!cards.length) return;

      if (backdrop) {
        backdrop.style.transition = 'none';
        backdrop.style.opacity = '0';
        backdrop.offsetHeight;
        backdrop.style.transition = 'opacity 260ms ease-out';
        backdrop.style.opacity = '1';
      }

      const s = this.sourceEl?.getBoundingClientRect();
      cards.forEach((card, i) => {
        const startRotation = cards.length > 1 ? (i - (cards.length - 1) / 2) * 6 : 0;
        if (!s) {
          card.style.transition = 'none';
          card.style.opacity = '0';
          card.style.transform = `scale(0.9) rotate(${startRotation}deg)`;
          card.offsetHeight;
          card.style.transition = `transform 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease-out`;
          card.style.transform = '';
          card.style.opacity = '1';
          return;
        }
        const t = card.getBoundingClientRect();
        const { dx, dy, sx, sy } = this.computeFlip(s, t);
        card.style.transformOrigin = 'center center';
        card.style.transition = 'none';
        card.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${startRotation}deg)`;
        card.style.opacity = '1';
        card.offsetHeight;
        card.style.transition = `transform 600ms cubic-bezier(0.22, 1, 0.36, 1)`;
        card.style.transform = '';
      });

      if (meta) {
        const metaDelay = 360;
        meta.style.transition = 'none';
        meta.style.opacity = '0';
        meta.style.transform = 'translateY(-8px)';
        meta.offsetHeight;
        meta.style.transition = `opacity 300ms ${metaDelay}ms ease-out, transform 300ms ${metaDelay}ms ease-out`;
        meta.style.opacity = '1';
        meta.style.transform = '';
      }
    },

    closeHint() {
      if (this.closing || !this.selectedHint) return;
      const hintBeingClosed = this.selectedHint;
      const slot = this.sourceEl;

      const reset = (resolve) => {
        this.selectedHint = null;
        document.body.style.overflow = '';
        this.$nextTick(() => {
          if (slot) {
            const cards = Array.from(slot.querySelectorAll('.card'));
            cards.forEach((card, i) => {
              card.style.viewTransitionName = `hint-${hintBeingClosed.category}-${hintBeingClosed.number}-p${i}`;
            });
          }
          if (resolve) resolve();
        });
      };

      const cleanup = () => {
        if (slot) {
          slot.querySelectorAll('.card').forEach((card) => {
            card.style.viewTransitionName = '';
          });
        }
        this.setActiveTransitionName(null);
        this.sourceEl = null;
        this.closing = false;
      };

      if (document.startViewTransition) {
        const t = document.startViewTransition(() => new Promise((r) => reset(r)));
        t.finished.finally(cleanup);
      } else {
        this.closing = true;
        const cards = document.querySelectorAll('.modal-card');
        const backdrop = document.querySelector('.modal-backdrop');
        const duration = 360;
        const s = this.sourceEl?.getBoundingClientRect();
        if (!cards.length || !s) {
          reset();
          return;
        }
        cards.forEach((card) => {
          const t = card.getBoundingClientRect();
          const { dx, dy, sx, sy } = this.computeFlip(s, t);
          card.style.transition = `transform ${duration}ms cubic-bezier(0.64, 0, 0.78, 0), opacity ${duration}ms ease-in`;
          card.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        });
        if (backdrop) {
          backdrop.style.transition = `opacity ${duration}ms ease-in`;
          backdrop.style.opacity = '0';
        }
        setTimeout(() => {
          reset();
          cleanup();
        }, duration);
      }
    },
  };
}
