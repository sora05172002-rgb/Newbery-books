// 선생님께서 수업 목적에 맞게 자유롭게 도서를 추가/수정하실 수 있습니다.
const newberyData = [
    {
        era: "1920s - 1940s: 아동 문학의 기틀 마련",
        books: [
            { year: 1922, title: "The Story of Mankind", author: "Hendrik Willem van Loon" },
            { year: 1944, title: "Johnny Tremain", author: "Esther Forbes" },
            { year: 1948, title: "The Twenty-One Balloons", author: "William Pène du Bois" }
        ]
    },
    {
        era: "1950s - 1970s: 판타지와 현실의 교차",
        books: [
            { year: 1959, title: "The Witch of Blackbird Pond", author: "Elizabeth George Speare" },
            { year: 1963, title: "A Wrinkle in Time", author: "Madeleine L'Engle" },
            { year: 1978, title: "Bridge to Terabithia", author: "Katherine Paterson" },
            { year: 1979, title: "The Westing Game", author: "Ellen Raskin" }
        ]
    },
    {
        era: "1980s - 2000s: 다양한 사회 문제와 자아 성장",
        books: [
            { year: 1990, title: "Number the Stars", author: "Lois Lowry" },
            { year: 1994, title: "The Giver", author: "Lois Lowry" },
            { year: 1999, title: "Holes", author: "Louis Sachar" },
            { year: 2004, title: "The Tale of Despereaux", author: "Kate DiCamillo" }
        ]
    },
    {
        era: "2010s - Present: 다양성(Diversity)과 새로운 시각",
        books: [
            { year: 2014, title: "Flora & Ulysses", author: "Kate DiCamillo" },
            { year: 2015, title: "The Crossover", author: "Kwame Alexander" },
            { year: 2020, title: "New Kid", author: "Jerry Craft" },
            { year: 2023, title: "Freewater", author: "Amina Luqman-Dawson" }
        ]
    }
];

const timelineContainer = document.getElementById('timeline-container');

// 데이터를 바탕으로 웹페이지에 타임라인을 그려주는 함수
function renderTimeline() {
    newberyData.forEach(eraData => {
        // 1. 시대별 섹션 생성
        const eraSection = document.createElement('div');
        eraSection.className = 'era-section';

        // 2. 시대 제목 추가
        const eraTitle = document.createElement('h2');
        eraTitle.className = 'era-title';
        eraTitle.innerText = eraData.era;
        eraSection.appendChild(eraTitle);

        // 3. 책 목록 컨테이너 생성
        const bookList = document.createElement('div');
        bookList.className = 'book-list';

        // 4. 각 책 카드 생성 및 추가
        eraData.books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';

            bookCard.innerHTML = `
                <div class="book-year">${book.year}</div>
                <h3 class="book-title">『${book.title}』</h3>
                <div class="book-author">by ${book.author}</div>
            `;
            
            bookList.appendChild(bookCard);
        });

        eraSection.appendChild(bookList);
        timelineContainer.appendChild(eraSection);
    });
}

// 웹페이지 로드가 완료되면 화면을 그립니다.
document.addEventListener('DOMContentLoaded', renderTimeline);
