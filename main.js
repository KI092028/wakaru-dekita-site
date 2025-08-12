// main.js - 子供達の「わかる！」「できた！」を増やす、お役立ちサイト用JS

// グローバル変数
let apps = [];
let categories = [];

// DOM要素が準備できているかチェックする関数
function isDOMReady() {
  return document.readyState === 'complete' || document.readyState === 'interactive';
}

// 要素が存在するかチェックする関数
function waitForElement(selector, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkElement = () => {
      attempts++;
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
      } else if (attempts >= maxAttempts) {
        reject(new Error(`要素 ${selector} が見つかりませんでした`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
}

// データを読み込む関数
async function loadAppData() {
  try {
    const response = await fetch('data/apps.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    apps = data.apps;
    categories = data.categories;
    window.apps = apps; // グローバルアクセス用
    console.log('アプリデータを読み込みました:', apps.length, '件');
    return true;
  } catch (error) {
    console.error('データ読み込みエラー:', error);
    // フォールバック用のデフォルトデータ
    apps = [
      {
        id: 'addition',
        name: 'たし算練習',
        category: 'basic',
        description: '基本のたし算を楽しく練習しよう！',
        screenshot: 'img/placeholder.svg',
        link: 'app-detail.html?id=addition',
        difficulty: '初級',
        grade: '1-2年生'
      }
    ];
    window.apps = apps;
    return false;
  }
}

// アプリカードをレンダリングする関数
function renderApps(filteredApps) {
  console.log('renderApps関数が呼び出されました');
  const container = document.getElementById('appContainer');
  
  // デバッグ用: containerの状態を確認
  console.log('appContainer要素:', container);
  
  // エラーハンドリング: containerが存在しない場合
  if (!container) {
    console.error('appContainer要素が見つかりません');
    return;
  }
  
  console.log('アプリカードをレンダリング中...');
  container.innerHTML = ''; // リセット
  
  if (filteredApps.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          <h4>🔍 検索結果がありません</h4>
          <p>別のキーワードで検索してみてください。</p>
        </div>
      </div>
    `;
    return;
  }
  
  filteredApps.forEach(app => {
    const card = `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card menu-card h-100" role="article" aria-labelledby="${app.id}-title">
          <img src="${app.screenshot}" class="card-img-top" alt="${app.name}のスクリーンショット" 
               style="height: 150px; object-fit: cover;" loading="lazy">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title" id="${app.id}-title" style="color: var(--main-blue);">${app.name}</h5>
            <p class="card-text flex-grow-1">${app.description}</p>
            <div class="mt-auto">
              <div class="mb-2">
                <span class="badge bg-success me-2">${app.difficulty}</span>
                <span class="badge bg-info">${app.grade}</span>
              </div>
              <a href="${app.link}" class="btn btn-primary w-100" 
                 style="background: var(--main-blue); border: none;" 
                 aria-label="${app.name}をスタート">
                スタート
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
  console.log('レンダリング完了');
}

// 検索機能
function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.querySelector('.search-form');
  
  console.log('searchInput:', searchInput);
  console.log('searchForm:', searchForm);
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyword = searchInput.value.toLowerCase();
      const filtered = apps.filter(app => 
        app.name.toLowerCase().includes(keyword) || 
        app.description.toLowerCase().includes(keyword) ||
        app.category.toLowerCase().includes(keyword) ||
        app.difficulty.toLowerCase().includes(keyword) ||
        app.grade.toLowerCase().includes(keyword)
      );
      renderApps(filtered);
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const filtered = apps.filter(app => 
        app.name.toLowerCase().includes(keyword) || 
        app.description.toLowerCase().includes(keyword) ||
        app.category.toLowerCase().includes(keyword) ||
        app.difficulty.toLowerCase().includes(keyword) ||
        app.grade.toLowerCase().includes(keyword)
      );
      renderApps(filtered);
    });
  }
}

// 初期化関数
async function initializeApp() {
  console.log('初期化開始');
  
  // データを読み込み
  await loadAppData();
  
  // 現在のページを判定
  const isDetailPage = window.location.pathname.includes('app-detail.html');
  
  if (isDetailPage) {
    console.log('詳細ページのため、main.jsの初期化をスキップします');
    return;
  }
  
  // appContainer要素を待機
  try {
    const container = await waitForElement('#appContainer');
    console.log('appContainer要素が見つかりました:', container);
    renderApps(apps);
    initializeSearch();
  } catch (error) {
    console.error('初期化エラー:', error);
  }
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoadedイベントが発火しました');
  console.log('document.readyState:', document.readyState);
  
  if (document.readyState === 'loading') {
    console.log('DOMがまだ読み込み中です');
  } else {
    console.log('DOMが読み込み完了しています');
  }
  
  initializeApp();
});

// フォールバック用のloadイベント
window.addEventListener('load', () => {
  console.log('window.loadイベントが発火しました');
  
  // 詳細ページの場合はスキップ
  const isDetailPage = window.location.pathname.includes('app-detail.html');
  if (isDetailPage) {
    console.log('詳細ページのため、main.jsのloadイベントをスキップします');
    return;
  }
  
  const container = document.getElementById('appContainer');
  if (container && container.children.length === 0) {
    console.log('loadイベントでレンダリングを実行');
    renderApps(apps);
  }
});

// 即座に実行（DOMが既に準備できている場合）
if (isDOMReady()) {
  console.log('DOMが既に準備できているため、即座に初期化を実行');
  
  // 詳細ページの場合はスキップ
  const isDetailPage = window.location.pathname.includes('app-detail.html');
  if (!isDetailPage) {
    initializeApp();
  }
}