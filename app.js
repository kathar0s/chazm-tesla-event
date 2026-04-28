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
    copyState: 'idle',
    countdown: null,
    countdownLabel: '',
    _tick: 0,

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

      this.startCountdown();
    },

    startCountdown() {
      // 힌트 공개 종료: 2026-04-29 18:00 KST = 09:00 UTC
      const LAST_HINT_UTC = Date.UTC(2026, 3, 29, 9, 0, 0);
      // 미발견 카드 일괄 공개: 2026-05-08 00:00 KST = 2026-05-07 15:00 UTC
      const CARD_REVEAL_UTC = Date.UTC(2026, 4, 7, 15, 0, 0);

      const tick = () => {
        this._tick++;
        const now = Date.now();

        if (now >= CARD_REVEAL_UTC) {
          this.countdown = null;
          this.countdownLabel = '';
          return;
        }

        let target, label;

        if (now < LAST_HINT_UTC) {
          // 힌트 공개 기간: 다음 일차 공개까지
          const d = new Date(now);
          const todayRelease = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 9, 0, 0);
          let next = now < todayRelease ? todayRelease : todayRelease + 86400000;
          if (next > LAST_HINT_UTC) next = LAST_HINT_UTC;
          target = next;
          const kst = new Date(next + 9 * 3600000);
          label = `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 힌트 공개까지`;
        } else {
          // 차키 수색 기간: 카드 일괄 공개까지
          target = CARD_REVEAL_UTC;
          label = '미발견 카드 일괄 공개까지';
        }

        const diff = target - now;
        const totalH = Math.floor(diff / 3600000);
        const days = Math.floor(totalH / 24);
        const h = totalH % 24;
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        this.countdown = days > 0 ? `${days}일 ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
        this.countdownLabel = label;
      };

      tick();
      setInterval(tick, 1000);
    },

    cardRevealStatus() {
      void this._tick;
      const now = Date.now();
      const CARD_REVEAL_UTC = Date.UTC(2026, 4, 7, 15, 0, 0);
      if (now >= CARD_REVEAL_UTC) return 'released';
      const LAST_HINT_UTC = Date.UTC(2026, 3, 29, 9, 0, 0);
      return now >= LAST_HINT_UTC ? 'active' : 'upcoming';
    },

    dayStatus(n) {
      void this._tick;
      // n일차 공개 시각: 2026-04-(23+n) 18:00 KST = 09:00 UTC
      const releaseUTC = Date.UTC(2026, 3, 23 + n, 9, 0, 0);
      const now = Date.now();
      if (now >= releaseUTC) return 'released';
      // 다음 카운트다운 대상이 이 날이면 active
      const d = new Date(now);
      const todayRelease = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 9, 0, 0);
      const next = now < todayRelease ? todayRelease : todayRelease + 86400000;
      return next === releaseUTC ? 'active' : 'upcoming';
    },

    setDayCategory(n) {
      this.activeCategory = 'day' + n;
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

    navList() {
      // Same list visible in the grid (respects active tab + search)
      return this.filteredHints;
    },

    navIndex() {
      const list = this.navList();
      if (!this.selectedHint) return -1;
      return list.findIndex(
        (h) => h.category === this.selectedHint.category && h.number === this.selectedHint.number
      );
    },

    prevHint() {
      const list = this.navList();
      const idx = this.navIndex();
      if (idx < 0 || list.length <= 1) return;
      this._navigateTo(list[(idx - 1 + list.length) % list.length]);
    },

    nextHint() {
      const list = this.navList();
      const idx = this.navIndex();
      if (idx < 0 || list.length <= 1) return;
      this._navigateTo(list[(idx + 1) % list.length]);
    },

    _navigateTo(hint) {
      if (!hint || hint === this.selectedHint) return;
      this.selectedHint = hint;
      this.setActiveTransitionName(hint);
    },

    isPlaceholder(hint) {
      return !hint.image && (!hint.keywords || hint.keywords.length === 0);
    },

    isImagePending(hint) {
      return (hint.category === 'day3' || hint.category === 'day4') && !hint.image;
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

    copyForAI() {
      const hints = this.filteredHints;
      if (!hints.length) return;

      const isSearch = this.query.trim() !== '';
      const cat = isSearch ? null : this.category(this.activeCategory);
      const header = cat ? cat.header : `검색: ${this.query.trim()}`;

      const lines = [`[차즘 보물찾기] ${header} (${hints.length}개)\n`];
      for (const h of hints) {
        const kw = h.keywords && h.keywords.length ? h.keywords.join(', ') : '(이미지 힌트)';
        lines.push(`No.${h.number}: ${kw}`);
      }
      lines.push('');
      lines.push('출처: https://chazm.co.kr/treasure');

      const text = lines.join('\n');

      const finish = () => {
        this.copyState = 'copied';
        setTimeout(() => { this.copyState = 'idle'; }, 2000);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(finish).catch(() => {
          this._fallbackCopy(text);
          finish();
        });
      } else {
        this._fallbackCopy(text);
        finish();
      }
    },

    _fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
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
