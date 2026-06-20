const booksPerPage = 8; // 한 페이지에 보여줄 책 개수
let currentPage = 1;
let newberyBooks = []; // books.json에서 받아온 데이터를 저장할 빈 배열

const bookGrid = document.getElementById('book-grid');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('summary-modal');
const closeBtn = document.getElementById('close-btn');

// 1. 외부 books.json 파일에서 데이터를 비동기로 불러오는 함수
async function loadBookData() {
    try {
        // 같은 폴더에 있는 books.json 파일을 읽어옵니다.
        const response = await fetch('books.json');
        newberyBooks = await response.json();
        
        // 연도순(과거->최신)으로 자동 정렬
        newberyBooks.sort((a, b) => a.year - b.year);
        
        // 데이터 로드가 완료되면 화면에 첫 페이지와 버튼을 그립니다.
        renderBooks(currentPage);
        renderPagination();
    } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
        bookGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#e74c3c; font-weight:bold;">
            📚 도서 데이터를 불러오는 데 실패했습니다. books.json 파일 형식을 확인해 주세요.
        </p>`;
    }
}

// 2. 특정 페이지에 해당하는 책들만 화면에 그리는 함수
function renderBooks(page) {
    bookGrid.innerHTML = ''; 
    
    const startIndex = (page - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = newberyBooks.slice(startIndex, endIndex);

    booksToShow.forEach((book) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        card.innerHTML = `
            <div class="tag-container">
                <span class="tag year-tag">${book.year}</span>
                <span class="tag genre-tag">${book.genre}</span>
                <span class="tag ar-tag">AR ${book.ar}</span>
            </div>
            <h3 class="book-title">『${book.title}』</h3>
            <div class="book-author">by ${book.author}</div>
            <div class="click-hint">👆 클릭하여 줄거리 보기</div>
        `;

        card.addEventListener('click', () => openModal(book));
        bookGrid.appendChild(card);
    });
}

// 3. 하단 페이지 번호 버튼을 생성하는 함수
function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(newberyBooks.length / booksPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        if (i === currentPage) btn.classList.add('active');
        btn.innerText = i;
        
        btn.addEventListener('click', () => {
            currentPage = i;
            renderBooks(currentPage);
            renderPagination(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        });

        paginationContainer.appendChild(btn);
    }
}

// 4. 모달창(팝업) 제어 로직
function openModal(book) {
    document.getElementById('modal-year').innerText = book.year;
    document.getElementById('modal-genre').innerText = book.genre;
    document.getElementById('modal-ar').innerText = `AR ${book.ar}`;
    document.getElementById('modal-title').innerText = book.title;
    document.getElementById('modal-author').innerText = `by ${book.author}`;
    document.getElementById('modal-summary').innerText = book.summary;
    modal.classList.remove('hide');
}

function closeModal() {
    modal.classList.add('hide');
}

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// 웹페이지 로드가 시작되면 데이터를 가장 먼저 불러옵니다.
document.addEventListener('DOMContentLoaded', loadBookData);
