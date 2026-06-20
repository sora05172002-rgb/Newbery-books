const mainContent = document.getElementById('main-content');
let readBooks = JSON.parse(localStorage.getItem('readNewberyBooks')) || [];

async function loadBooks() {
    try {
        // 캐시 방지 코드를 추가하여 항상 최신 JSON을 읽어오게 합니다.
        const response = await fetch('books.json?v=' + new Date().getTime());
        const books = await response.json();
        
        books.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        const booksByDecade = {};
        books.forEach(book => {
            const year = parseInt(book.year);
            const decade = Math.floor(year / 10) * 10; 
            if (!booksByDecade[decade]) booksByDecade[decade] = [];
            booksByDecade[decade].push(book);
        });

        renderEras(booksByDecade);
    } catch (error) {
        mainContent.innerHTML = `<p style="text-align:center; padding: 3rem; color:#e74c3c;">데이터를 불러오지 못했습니다.</p>`;
    }
}

function renderEras(booksByDecade) {
    const decades = Object.keys(booksByDecade).sort((a, b) => a - b);
    
    // ★ 구글 API 차단을 막기 위한 스크롤 감지기 (화면에 보일 때만 이미지 로딩)
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const imgEl = entry.target;
                const title = imgEl.getAttribute('data-title');
                const author = imgEl.getAttribute('data-author');

                // 구글 북스에 표지 검색 요청
                const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
                fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
                            // 진짜 표지로 교체
                            imgEl.src = data.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
                        } else {
                            imgEl.src = 'https://placehold.co/200x300/eee/999?text=No+Cover';
                        }
                    })
                    .catch(() => {
                        imgEl.src = 'https://placehold.co/200x300/eee/999?text=Error';
                    });
                
                // 한 번 불러온 이미지는 다시 감시하지 않음
                observer.unobserve(imgEl);
            }
        });
    }, { rootMargin: "100px" }); // 화면에 나타나기 100px 전부터 미리 로딩 시작

    decades.forEach(decade => {
        const section = document.createElement('section');
        section.className = 'era-section';
        section.innerHTML = `<h2 class="era-title">${decade}년대 뉴베리 수상작</h2>`;

        const grid = document.createElement('div');
        grid.className = 'book-grid';

        booksByDecade[decade].forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // 이름표가 original_title 이든 title 이든 모두 인식하도록 처리
            const titleText = book.original_title || book.title || "제목 없음";
            const isRead = readBooks.includes(titleText);
            if (isRead) card.classList.add('is-read');
            
            const genreText = (book.genre && book.genre !== "-") ? book.genre : "장르 미상";
            const arText = (book.ar_level && book.ar_level !== "-") ? `AR ${book.ar_level}` : "AR 미상";
            const koreanTitle = (book.korean_title && book.korean_title !== "-") ? `<br><small style="color:#7f8c8d;">(${book.korean_title})</small>` : "";
            
            const storeUrl = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${encodeURIComponent(titleText)}`;

            card.innerHTML = `
                <div class="check-btn" title="읽음 표시">✔</div>
                
                <div class="book-cover-container">
                    <img src="https://placehold.co/200x300/eee/999?text=Loading..." 
                         data-title="${titleText.replace(/"/g, '&quot;')}" 
                         data-author="${(book.author || '').replace(/"/g, '&quot;')}" 
                         alt="cover" class="book-cover-img real-cover">
                    <div class="summary-overlay">${book.summary || '상세 줄거리가 없습니다.'}</div>
                </div>
                
                <div class="tags">
                    <span class="tag year-tag">${book.year}</span>
                    <span class="tag genre-tag">${genreText}</span>
                    <span class="tag ar-tag">${arText}</span>
                </div>
                <div class="book-title">${titleText} ${koreanTitle}</div>
                <div class="book-author">by ${book.author}</div>
                
                <a href="${storeUrl}" target="_blank" class="store-link-btn">🛒 서점에서 표지/정보 보기</a>
            `;

            const checkBtn = card.querySelector('.check-btn');
            checkBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const index = readBooks.indexOf(titleText);
                if (index === -1) {
                    readBooks.push(titleText);
                    card.classList.add('is-read');
                } else {
                    readBooks.splice(index, 1);
                    card.classList.remove('is-read');
                }
                localStorage.setItem('readNewberyBooks', JSON.stringify(readBooks));
            });

            grid.appendChild(card);
            
            // 생성된 이미지를 스크롤 감지기에 등록
            const imgEl = card.querySelector('.real-cover');
            imageObserver.observe(imgEl);
        });

        section.appendChild(grid);
        mainContent.appendChild(section);
    });
}

document.addEventListener('DOMContentLoaded', loadBooks);
