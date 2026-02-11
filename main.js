// main.js - わかる！できた！算数学習サイト
// バージョン: 2.0
// 作成日: 2026年2月11日

/* ================================================
   1. グローバル変数
   ================================================ */

let apps = [];
let categories = [];
let activeCategory = 'all';
let activeGrade = null;
let currentSort = 'default';

/* ================================================
   2. データ読み込み
   ================================================ */

async function loadAppData() {
    try {
        const response = await fetch('data/apps.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        apps = data.apps || [];
        categories = data.categories || [];
        console.log('アプリデータを読み込みました:', apps.length, '件');
        return true;
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        apps = [];
        categories = [];
        return false;
    }
}

/* ================================================
   3. フィルター機能
   ================================================ */

function filterApps() {
    let filtered = [...apps];

    // カテゴリフィルター
    if (activeCategory !== 'all') {
        filtered = filtered.filter(app => {
            const appCategory = String(app.category || '').toLowerCase();
            return appCategory === activeCategory.toLowerCase();
        });
    }

    // 学年フィルター
    if (activeGrade) {
        filtered = filtered.filter(app => {
            const gradeRange = app.gradeRange || [];
            return gradeRange.includes(parseInt(activeGrade));
        });
    }

    // ソート
    filtered = sortApps(filtered, currentSort);

    return filtered;
}

function sortApps(appsList, sortBy) {
    const sorted = [...appsList];

    switch(sortBy) {
        case 'newest':
            sorted.sort((a, b) => {
                const dateA = new Date(a.createdDate || '2024-01-01');
                const dateB = new Date(b.createdDate || '2024-01-01');
                return dateB - dateA;
            });
            break;

        case 'popular':
            sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;

        case 'grade-asc':
            sorted.sort((a, b) => {
                const gradeA = Math.min(...(a.gradeRange || [6]));
                const gradeB = Math.min(...(b.gradeRange || [6]));
                return gradeA - gradeB;
            });
            break;

        default:
            // デフォルトはそのまま（おすすめ順）
            break;
    }

    return sorted;
}

function resetFilters() {
    activeCategory = 'all';
    activeGrade = null;
    currentSort = 'default';

    // UIをリセット
    document.querySelectorAll('.pill[data-category]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.pill[data-category="all"]')?.classList.add('active');

    document.querySelectorAll('.pill[data-grade]').forEach(btn => {
        btn.classList.remove('active');
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'default';
    }

    renderApps(filterApps());
}

/* ================================================
   4. 検索機能
   ================================================ */

function setupSearch() {
    const searchInput = document.getElementById('headerSearch');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const keyword = e.target.value.toLowerCase().trim();

            if (keyword.length === 0) {
                renderApps(filterApps());
                return;
            }

            const filtered = apps.filter(app =>
                (app.name || '').toLowerCase().includes(keyword) ||
                (app.description || '').toLowerCase().includes(keyword) ||
                (app.category || '').toLowerCase().includes(keyword) ||
                (app.difficulty || '').toLowerCase().includes(keyword) ||
                (app.grade || '').toLowerCase().includes(keyword)
            );

            renderApps(filtered);

            // 検索結果がない場合は空状態を表示
            if (filtered.length === 0) {
                showEmptyState();
            }
        }, 300); // 300msのデバウンス
    });
}

/* ================================================
   5. レンダリング
   ================================================ */

function renderApps(appsList) {
    const appGrid = document.getElementById('appGrid');
    const emptyState = document.getElementById('emptyState');

    if (!appGrid) return;

    // 空状態を非表示
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // アプリが0件の場合
    if (appsList.length === 0) {
        showEmptyState();
        return;
    }

    // アプリカードを生成
    appGrid.innerHTML = appsList.map(app => createAppCard(app)).join('');
}

function createAppCard(app) {
    const difficulty = app.difficulty || '初級';
    const grade = app.grade || '';
    const category = getCategoryName(app.category);
    const link = app.link || `app-detail.html?id=${app.id}`;

    return `
        <div class="app-card" role="article" aria-labelledby="app-${app.id}-title">
            <h3 id="app-${app.id}-title" class="app-title">${app.name}</h3>
            <p class="app-description">${app.description}</p>
            <div class="app-badges" style="margin: 16px 0;">
                <span class="badge badge-difficulty">${difficulty}</span>
                ${grade ? `<span class="badge badge-grade">${grade}</span>` : ''}
                ${category ? `<span class="badge badge-category">${category}</span>` : ''}
            </div>
            <a href="${link}" class="btn btn-primary" target="_self" rel="noopener" aria-label="${app.name}をスタート">
                はじめる
            </a>
        </div>
    `;
}

function getCategoryName(categoryId) {
    if (!categoryId) return '';
    const category = categories.find(c => String(c.id).toLowerCase() === String(categoryId).toLowerCase());
    return category ? category.name : categoryId;
}

function showEmptyState() {
    const appGrid = document.getElementById('appGrid');
    const emptyState = document.getElementById('emptyState');

    if (appGrid) {
        appGrid.innerHTML = '';
    }

    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

/* ================================================
   6. 学習状況管理（LocalStorage）
   ================================================ */

function loadUserProgress() {
    try {
        const progress = localStorage.getItem('userProgress');
        if (!progress) {
            return {
                level: 1,
                streak: 1,
                badges: 0,
                lastVisit: new Date().toISOString()
            };
        }
        return JSON.parse(progress);
    } catch (error) {
        console.error('ユーザー進捗読み込みエラー:', error);
        return {
            level: 1,
            streak: 1,
            badges: 0,
            lastVisit: new Date().toISOString()
        };
    }
}

function saveUserProgress(progress) {
    try {
        localStorage.setItem('userProgress', JSON.stringify(progress));
    } catch (error) {
        console.error('ユーザー進捗保存エラー:', error);
    }
}

function updateUserDisplay() {
    const progress = loadUserProgress();

    // レベル表示
    const levelEl = document.getElementById('userLevel');
    if (levelEl) {
        levelEl.textContent = `Lv.${progress.level}`;
    }

    // 連続日数表示
    const streakEl = document.getElementById('userStreak');
    if (streakEl) {
        streakEl.textContent = `${progress.streak}日`;
    }

    // バッジ表示
    const badgesEl = document.getElementById('userBadges');
    if (badgesEl) {
        badgesEl.textContent = `${progress.badges}個`;
    }

    // ユーザー名表示（LocalStorageから）
    const userName = localStorage.getItem('userName') || 'きみ';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = userName;
    }

    const recUserNameEl = document.getElementById('recUserName');
    if (recUserNameEl) {
        recUserNameEl.textContent = userName === 'きみ' ? 'あなた' : userName;
    }
}

/* ================================================
   7. イベントリスナー設定
   ================================================ */

function setupFilters() {
    // カテゴリフィルター
    document.querySelectorAll('.pill[data-category]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.category;

            // アクティブ状態を更新
            document.querySelectorAll('.pill[data-category]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            renderApps(filterApps());
        });
    });

    // 学年フィルター
    document.querySelectorAll('.pill[data-grade]').forEach(btn => {
        btn.addEventListener('click', () => {
            const grade = btn.dataset.grade;

            // トグル機能
            if (activeGrade === grade) {
                activeGrade = null;
                btn.classList.remove('active');
            } else {
                activeGrade = grade;
                document.querySelectorAll('.pill[data-grade]').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
            }

            renderApps(filterApps());
        });
    });

    // ソート
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderApps(filterApps());
        });
    }
}

function setupDailyChallenge() {
    // デイリーチャレンジのデータ読み込み
    // 今回はサンプルとして固定データ
    const dailyGrid = document.getElementById('dailyChallenge');
    if (!dailyGrid || apps.length === 0) return;

    // アプリから3つランダムに選択
    const shuffled = [...apps].sort(() => 0.5 - Math.random());
    const dailyApps = shuffled.slice(0, 3);

    if (dailyApps.length > 0) {
        dailyGrid.innerHTML = dailyApps.map(app => `
            <a href="${app.link || `app-detail.html?id=${app.id}`}" class="challenge-card">
                <div class="challenge-icon">${getCategoryIcon(app.category)}</div>
                <div class="challenge-name">${app.name}</div>
                <div class="challenge-target">${app.grade || ''}</div>
                <div class="challenge-progress">0/3</div>
            </a>
        `).join('');
    }
}

function getCategoryIcon(category) {
    const icons = {
        'basic': '🔢',
        'multiplication': '✖️',
        'division': '➗',
        'geometry': '📐',
        'fraction': '🍕',
        'decimal': '💯',
        'ratio': '⚖️'
    };
    return icons[category] || '🎯';
}

function setupRecommendations() {
    // おすすめアプリの表示
    const recGrid = document.getElementById('recGrid');
    if (!recGrid || apps.length === 0) return;

    // 簡易的な推奨ロジック（ランダムに3つ選択）
    const shuffled = [...apps].sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 3);

    if (recommended.length > 0) {
        recGrid.innerHTML = recommended.map(app => `
            <div class="rec-card">
                <div class="rec-badge">おすすめ</div>
                <div class="rec-icon">${getCategoryIcon(app.category)}</div>
                <h3>${app.name}</h3>
                <p>${app.description}</p>
                <div class="rec-reason">
                    💡 ${app.grade || ''}におすすめ！
                </div>
                <a href="${app.link || `app-detail.html?id=${app.id}`}" class="btn btn-secondary">
                    やってみる
                </a>
            </div>
        `).join('');
    }
}

/* ================================================
   8. ユーティリティ
   ================================================ */

function toggleMenu() {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

/* ================================================
   9. 初期化
   ================================================ */

async function initialize() {
    console.log('初期化開始');

    try {
        // データ読み込み
        await loadAppData();

        // ユーザー進捗表示
        updateUserDisplay();

        // アプリ一覧表示
        renderApps(filterApps());

        // 検索機能セットアップ
        setupSearch();

        // フィルターセットアップ
        setupFilters();

        // デイリーチャレンジセットアップ
        setupDailyChallenge();

        // おすすめセットアップ
        setupRecommendations();

        console.log('初期化完了');
    } catch (error) {
        console.error('初期化エラー:', error);
    }
}

/* ================================================
   10. DOMContentLoaded
   ================================================ */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// グローバル関数を公開（HTMLから呼び出すため）
window.toggleMenu = toggleMenu;
window.resetFilters = resetFilters;
