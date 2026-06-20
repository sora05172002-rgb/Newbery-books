const mainContent = document.getElementById('main-content');

// 1. 브라우저 저장소(localStorage)에서 학생이 예전에 체크한 '읽은 책' 목록 불러오기
let readBooks = JSON.parse(localStorage.getItem('readNewberyBooks')) || [];

// 2. JSON 데이터 불러오기
async function loadBooks() {
    try {
        const response = await fetch('books.json');
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

// 3. 화면 그리기
function renderEras(booksByDecade) {
    const decades = Object.keys(booksByDecade).sort((a, b) => a - b);
    
    decades.forEach(decade => {
        const section = document.createElement('section');
        section.className = 'era-section';
        section.innerHTML = `<h2 class="era-title">${decade}년대 뉴베리 수상작</h2>`;

        const grid = document.createElement('div');
        grid.className = 'book-grid';

        booksByDecade[decade].forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // 이 책이 '읽은 책' 목록에 있다면 카드에 'is-read' 클래스를 미리 추가
            const isRead = readBooks.includes(book.original_title);
            if (isRead) {
                card.classList.add('is-read');
            }
            
            const titleText = book.original_title || "제목 없음";
            const genreText = (book.genre && book.genre !== "-") ? book.genre : "장르 미상";
            const arText = (book.ar_level && book.ar_level !== "-") ? `AR ${book.ar_level}` : "AR 미상";
            const koreanTitle = (book.korean_title && book.korean_title !== "-") ? `<br><small style="color:#7f8c8d;">(${book.korean_title})</small>` : "";
            
            // 알라딘 서점 연동 주소
            const storeUrl = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${encodeURIComponent(book.original_title)}`;

            card.innerHTML = `
                <div class="check-btn" title="읽음 표시">✔</div>
                
                <div class="book-cover-container">
                    <img src="https://placehold.co/200x300/eee/999?text=Loading..." alt="cover" class="book-cover-img real-cover">
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

            // ★ 핵심: 구글 북스 API를 이용해 진짜 책 표지 자동으로 불러오기 ★
            const imgEl = card.querySelector('.real-cover');
            
            // 만약 선생님께서 books.json에 직접 인터넷 주소를 넣으셨다면 그것을 우선 사용
            if (book.image_url && !book.image_url.includes('placehold.co') && book.image_url !== "") {
                imgEl.src = book.image_url;
            } else {
                // 직접 넣은 주소가 없다면 구글 북스에서 자동으로 검색해서 표지 씌우기
                const query = encodeURIComponent(`intitle:${book.original_title} inauthor:${book.author}`);
                fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
                            // 구글 북스에서 찾은 진짜 표지 이미지 덮어쓰기
                            imgEl.src = data.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
                        } else {
                            imgEl.src = 'https://placehold.co/200x300/eee/999?text=No+Cover';
                        }
                    })
                    .catch(() => {
                        imgEl.src = 'https://placehold.co/200x300/eee/999?text=Error';
                    });
            }

            // 체크 버튼 클릭 이벤트
            const checkBtn = card.querySelector('.check-btn');
            checkBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const index = readBooks.indexOf(book.original_title);
                if (index === -1) {
                    readBooks.push(book.original_title);
                    card.classList.add('is-read');
                } else {
                    readBooks.splice(index, 1);
                    card.classList.remove('is-read');
                }
                localStorage.setItem('readNewberyBooks', JSON.stringify(readBooks));
            });

            grid.appendChild(card);
        });

        section.appendChild(grid);
        mainContent.appendChild(section);
    });
}

document.addEventListener('DOMContentLoaded', loadBooks);
