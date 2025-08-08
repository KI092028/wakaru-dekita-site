// detail.js - アプリ詳細ページ用

// URLパラメータからidを取得
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// アプリ詳細をレンダリングする関数
function renderAppDetail(app) {
  const container = document.getElementById('appDetailContainer');
  if (!container) {
    console.error('appDetailContainer要素が見つかりません');
    return;
  }
  
  if (!app) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          <h4>❌ アプリが見つかりませんでした</h4>
          <p>指定されたアプリは存在しないか、削除された可能性があります。</p>
          <a href="index.html" class="btn btn-primary">ホームに戻る</a>
        </div>
      </div>
    `;
    return;
  }
  
  // iframe srcをapps/フォルダ内のHTMLファイルに設定
  const iframeSrc = `apps/${app.id}.html`;
  
  container.innerHTML = `
    <div class="col-12 col-lg-10">
      <div class="card p-4" role="main" aria-labelledby="app-title">
        <header class="mb-4">
          <h1 id="app-title" class="mb-3" style="color: var(--main-blue);">${app.name}</h1>
          <div class="mb-3">
            <span class="badge bg-success me-2">${app.difficulty || '初級'}</span>
            <span class="badge bg-info">${app.grade || '1-2年生'}</span>
          </div>
        </header>
        
        <img src="${app.screenshot}" alt="${app.name}のスクリーンショット" 
             class="app-detail-img" loading="lazy">
        
        <p class="mb-4 lead">${app.description}</p>
        
        <div class="app-container">
          <div class="loading-indicator" id="loading-indicator">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">読み込み中...</span>
            </div>
            <div class="mt-2">アプリを読み込み中...</div>
          </div>
          <iframe src="${iframeSrc}" 
                  class="app-iframe" 
                  title="${app.name}のインタラクティブアプリ" 
                  allowfullscreen 
                  loading="lazy"
                  onload="hideLoadingIndicator()"
                  style="opacity: 0; transition: opacity 0.5s ease;">
          </iframe>
        </div>
      </div>
    </div>
  `;
}

// ローディングインジケーターを非表示にする
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById('loading-indicator');
  const iframe = document.querySelector('.app-iframe');
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  if (iframe) {
    iframe.style.opacity = '1';
  }
}

// ページ初期化
async function initializeDetailPage() {
  const id = getParam('id');
  
  if (!id) {
    renderAppDetail(null);
    return;
  }
  
  // main.jsのappsデータを参照
  if (typeof window.apps !== 'undefined' && window.apps.length > 0) {
    const app = window.apps.find(a => a.id === id);
    renderAppDetail(app);
  } else {
    // appsデータが読み込まれていない場合、JSONファイルから直接読み込み
    try {
      const response = await fetch('data/apps.json');
      if (response.ok) {
        const data = await response.json();
        const app = data.apps.find(a => a.id === id);
        renderAppDetail(app);
      } else {
        throw new Error('データの読み込みに失敗しました');
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      renderAppDetail(null);
    }
  }
}

// DOMContentLoadedイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  console.log('detail.js: DOMContentLoadedイベントが発火しました');
  initializeDetailPage();
});

// フォールバック用のloadイベント
window.addEventListener('load', () => {
  console.log('detail.js: window.loadイベントが発火しました');
  const container = document.getElementById('appDetailContainer');
  if (container && container.children.length === 0) {
    console.log('detail.js: loadイベントで初期化を実行');
    initializeDetailPage();
  }
});
