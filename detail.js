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
  
  // SEO対策: 動的にメタタグとタイトルを更新
  updatePageSEO(app);
  
  // iframe srcをapps/フォルダ内のHTMLファイルに設定
  const iframeSrc = `apps/${app.id}.html`;
  
  container.innerHTML = `
    <div class="col-12 col-lg-10">
      <div class="card p-4" role="main" aria-labelledby="app-title">
        <header class="mb-4">
          <h1 id="app-title" class="mb-3" style="color: var(--main-blue);">${app.name}</h1>
          <div class="mb-3">
            <span class="badge bg-success me-2">${app.difficulty || '初級'}</span>
            <span class="badge bg-info">${app.grade || ''}</span>
          </div>
        </header>
        
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

// SEO対策: ページのメタタグとタイトルを動的に更新
function updatePageSEO(app) {
  // タイトルの更新
  document.title = `${app.name} | 小学校算数アプリおすすめ | 子供達の「わかる！」「できた！」を増やす、お役立ちサイト`;
  
  // メタディスクリプションの更新
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = `${app.name}の詳細ページ。${app.description} 小学校算数アプリで子供の学習をサポートします。無料で利用できる子供向け学習ツールです。`;
  }
  
  // メタキーワードの更新
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    const categoryKeywords = {
      'basic': '足し算練習, 引き算練習, 基本計算',
      'multiplication': 'かけ算九九, 九九練習',
      'division': 'わり算練習, 割り算問題',
      'geometry': '図形学習, 図形問題'
    };
    const categoryKeyword = categoryKeywords[app.category] || '小学校算数アプリ';
    metaKeywords.content = `小学校算数アプリ, ${categoryKeyword}, 子供学習ツール, 無料算数ゲーム, 小学生おすすめアプリ`;
  }
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
