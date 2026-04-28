customElements.define('site-header', class extends HTMLElement {
  connectedCallback() {
    const page = this.getAttribute('data-page') || '';
    const active = (p) => page === p ? 'style="color:var(--text);border-color:var(--text-dim);"' : '';
    this.outerHTML = `
<header class="site-header">
  <div class="container">
    <h1>
      차즘 보물찾기 힌트 모음
      <span class="collab-badge">차즘 X 김선태</span>
    </h1>
    <p>&quot;숨겨진 차키를 찾아라&quot; 힌트를 한눈에 · 비공식 큐레이션</p>
    <nav>
      <div class="nav-left">
        <a href="/" ${active('hints')}>힌트</a>
        <a href="/cards" ${active('cards')}>그림카드</a>
        <a href="/about" ${active('about')}>About</a>
      </div>
      <div class="nav-right">
        <a href="https://chazm.co.kr/treasure" target="_blank" rel="noopener">
          <img class="nav-icon" src="https://www.google.com/s2/favicons?domain=chazm.co.kr&sz=32" alt="" />공식 이벤트 페이지 ↗
        </a>
        <a href="https://open.kakao.com/o/p8FeFVri" target="_blank" rel="noopener">
          <img class="nav-icon" src="https://www.google.com/s2/favicons?domain=kakao.com&sz=32" alt="" />오픈 채팅방 ↗
        </a>
      </div>
    </nav>
  </div>
</header>`;
  }
});
