const mainContent = document.getElementById('main-content');
const modal = document.getElementById('book-modal');
const closeModalBtn = document.getElementById('close-modal');

// 1. JSON 데이터 불러오기
async function loadBooks() {
    try {
        const response = await fetch('books.json');
        const books = await response.json();
        
        // 연도순(과거->최신)으로 정렬
        books.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        // 10년 단위(시대별)로 데이터 그룹화
        const booksByDecade = {};
        books.forEach(book => {
            const year = parseInt(book.year);
            // 예: 1922 -> 1920, 2015 -> 2010
            const decade = Math.floor(year / 10) * 10; 
            
            if (!booksByDecade[decade]) {
                booksByDecade[decade] = [];
            }
            booksByDecade[decade].push(book);
        });

        // 화면에 그리기
        renderEras(booksByDecade);
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        mainContent.innerHTML = `<p style="text-align:center; padding: 3rem; color:#e74c3c; font-weight:bold;">
            📚 데이터를 불러오지 못했습니다. books.json 파일이 GitHub에 잘 업로드되었는지 확인해주세요.
        </p>`;
    }
}

// 2. 시대별 섹션 및 책 카드 그리기
function renderEras(booksByDecade) {
    // 1920년대, 1930년대 순으로 정렬
    const decades = Object.keys(booksByDecade).sort((a, b) => a - b);
    
    decades.forEach(decade => {
        // 시대별 묶음 섹션 만들기
        const section = document.createElement('section');
        section.className = 'era-section';
        
        // 시대 타이틀 (예: 1920년대)
        const title = document.createElement('h2');
        title.className = 'era-title';
        title.innerText = `${decade}년대 뉴베리 수상작`;
        section.appendChild(title);

        // 책 카드가 들어갈 그리드
        const grid = document.createElement('div');
        grid.className = 'book-grid';

        // 해당 시대의 책들을 카드로 만들기
        booksByDecade[decade].forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // 데이터 예외 처리 (값이 없을 경우 기본 텍스트)
            const titleText = book.original_title || "제목 없음";
            const genreText = (book.genre && book.genre !== "-") ? book.genre : "장르 미상";
            const arText = (book.ar_level && book.ar_level !== "-") ? `AR ${book.ar_level}` : "AR 미상";
            const koreanTitle = (book.korean_title && book.korean_title !== "-") ? `<br><small style="color:#7f8c8d;">(${book.korean_title})</small>` : "";

            card.innerHTML = `
                <div class="tags">
                    <span class="tag year-tag">${book.year}</span>
                    <span class="tag genre-tag">${genreText}</span>
                    <span class="tag ar-tag">${arText}</span>
                </div>
                <div class="book-title">${titleText} ${koreanTitle}</div>
                <div class="book-author">by ${book.author}</div>
                <div class="click-hint">👆 클릭하여 줄거리 보기</div>
            `;

            // 클릭 시 모달창 열기
            card.addEventListener('click', () => openModal(book, titleText, genreText, arText));
            grid.appendChild(card);
        });

        section.appendChild(grid);
        mainContent.appendChild(section);
    });
}

// 3. 모달창 열기 로직
function openModal(book, titleText, genreText, arText) {
    document.getElementById('modal-year').innerText = book.year;
    document.getElementById('modal-genre').innerText = genreText;
    document.getElementById('modal-ar').innerText = arText;
    document.getElementById('modal-title').innerText = titleText;
    document.getElementById('modal-author').innerText = `by ${book.author}`;
    
    const summaryText = (book.summary && book.summary !== "-") ? book.summary : "상세 줄거리가 제공되지 않습니다.";
    document.getElementById('modal-summary').innerText = summaryText;
    
    modal.classList.remove('hide');
}

// 4. 모달창 닫기 로직
closeModalBtn.addEventListener('click', () => modal.classList.add('hide'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hide');
});

// 웹페이지 로드 시 데이터 불러오기 시작
document.addEventListener('DOMContentLoaded', loadBooks);
