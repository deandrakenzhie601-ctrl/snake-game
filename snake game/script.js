// === 1. Setup Awal & Seleksi DOM ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // 'ctx' adalah "kuas" untuk menggambar di canvas
 
// UI Skor
const currentScoreEl = document.getElementById('currentScore');
const topScoreEl = document.getElementById('topScore');
 
// UI Leaderboard
const leaderboardListEl = document.getElementById('leaderboardList');
 
// UI Layar Mulai
const startScreen = document.getElementById('startScreen');
const usernameInput = document.getElementById('usernameInput');
const startButton = document.getElementById('startButton');
 
// UI Layar Game Over
const gameOverScreen = document.getElementById('gameOverScreen');
const finalPlayerEl = document.getElementById('finalPlayer');
const finalScoreEl = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgainButton');
 
// === 2. Variabel Status Game ===
const tileSize = 20; // Ukuran setiap kotak (ular & makanan) dalam piksel
let snake; // Akan berisi array {x, y} dari bagian tubuh ular
let food; // Akan berisi objek {x, y} dari posisi makanan
let direction; // String ('up', 'down', 'left', 'right')
let score;
let topScore = 0; // Dimulai dari 0 saat halaman di-load
let leaderboard = []; // Array kosong untuk menyimpan {nama, skor}
let username = '';
let gameLoopInterval; // Variabel untuk menyimpan "detak jantung" game
let isGameOver;
 
function initGame() {
    isGameOver = false;
    // Sembunyikan layar game over & tampilkan canvas
    gameOverScreen.classList.add('hidden');
    canvas.style.display = 'block';
    // Reset status game
    snake = [
        { x: 10, y: 10 }, // Kepala ular
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    score = 0;
    updateScoreDisplay(); // Update UI
    placeFood(); // Buat makanan pertama
    // Hentikan loop lama jika ada, dan mulai loop baru
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 100); // 100ms = 10 frame per detik
}
 
function gameLoop() {
    if (isGameOver) return; // Jika game over, hentikan semua proses
    updateSnakePosition(); // 1. Hitung posisi baru
    if (isGameOver) return; // Cek lagi jika update tadi menyebabkan game over
    draw(); // 2. Gambar hasilnya di layar
}
 
function updateSnakePosition() {
    const head = { ...snake[0] }; // Salin posisi kepala saat ini
    // 1. Tentukan posisi kepala BERIKUTNYA berdasarkan arah
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    // 2. Cek Tabrakan Dinding
    const gridSize = canvas.width / tileSize;
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        endGame();
        return;
    }
    // 3. Cek Tabrakan Diri Sendiri
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
    // 4. Tambahkan kepala baru di depan array
    snake.unshift(head);
    // 5. Cek Makan Makanan
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScoreDisplay();
        placeFood(); // Tempatkan makanan baru
    } else {
        snake.pop(); // Hapus ekor jika TIDAK makan
    }
}
 
function placeFood() {
    const gridSize = canvas.width / tileSize;
    while (true) {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
 
        let onSnake = false;
        for (const part of snake) {
            if (part.x === food.x && part.y === food.y) {
                onSnake = true;
                break;
            }
        }
        if (!onSnake) break;
    }
 
}
function endGame() {
    isGameOver = true;
    clearInterval(gameLoopInterval); // Hentikan "detak jantung" game!
    // Update Skor Tertinggi
    if (score > topScore) {
        topScore = score;
    }
    // Update Leaderboard
    updateLeaderboard();
    // Tampilkan layar Game Over
    finalPlayerEl.textContent = username;
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden'); // Tampilkan popup game over
}
 
function draw() {
    // 1. Bersihkan canvas
    ctx.fillStyle = '#000'; // Latar belakang canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 2. Gambar makanan
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
    // ... (kode menggambar border) ...
    // 3. Gambar ular
    snake.forEach((part, index) => {
        if (index === 0) {
            // Ini adalah kepala
            drawSnakeHead(part);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
            // Ini adalah badan
            // ... (kode menggambar badan ular) ...
        }
    });
}
 
// Fitur 4: Kepala Ular dengan Mata
function drawSnakeHead(head) {
    const x = head.x * tileSize;
    const y = head.y * tileSize;
    
    // Gambar kotak kepala
    ctx.fillStyle = '#006400'; // Warna kepala (lebih gelap)
    ctx.fillRect(x, y, tileSize, tileSize);
 
    // Gambar mata
    ctx.fillStyle = 'white'; // Warna bola mata
    const eyeSize = tileSize / 5;
    let eye1X, eye1Y, eye2X, eye2Y;
 
    // Tentukan posisi mata berdasarkan arah
    switch (direction) {
        case 'up':
            eye1X = x + tileSize / 4;
            eye1Y = y + tileSize / 4;
            eye2X = x + tileSize - (tileSize / 4);
            eye2Y = y + tileSize / 4;
            break;
        case 'down':
            eye1X = x + tileSize / 4;
            eye1Y = y + tileSize - (tileSize / 4);
            eye2X = x + tileSize - (tileSize / 4);
            eye2Y = y + tileSize - (tileSize / 4);
            break;
        case 'left':
            eye1X = x + tileSize / 4;
            eye1Y = y + tileSize / 4;
            eye2X = x + tileSize / 4;
            eye2Y = y + tileSize - (tileSize / 4);
            break;
        case 'right':
            eye1X = x + tileSize - (tileSize / 4);
            eye1Y = y + tileSize / 4;
            eye2X = x + tileSize - (tileSize / 4);
            eye2Y = y + tileSize - (tileSize / 4);
            break;
    }
 
    // Gambar mata 1
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Gambar mata 2
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, 2 * Math.PI);
    ctx.fill();
}
 
// Fitur 1 & 2: Update Tampilan Skor
function updateScoreDisplay() {
    currentScoreEl.textContent = score;
    topScoreEl.textContent = topScore;
}
// Fitur 3: Update Leaderboard
function updateLeaderboard() {
    // 1. Tambahkan skor saat ini ke array leaderboard
    leaderboard.push({ name: username, score: score });
    // 2. Urutkan (sort) dari tertinggi ke terendah
    leaderboard.sort((a, b) => b.score - a.score);
    // 3. Ambil 5 teratas saja
    leaderboard = leaderboard.slice(0, 5);
    // 4. Tampilkan di HTML
    leaderboardListEl.innerHTML = ''; // Kosongkan list lama
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        // Membuat elemen HTML baru dengan string
        li.innerHTML = `<span class="leaderboard-name">${entry.name}</span>: <span
    class="leaderboard-score">${entry.score}</span>`;
        leaderboardListEl.appendChild(li);
    });
}
 
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
        case 's':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
        case 'd':
            if (direction !== 'left') direction = 'right';
            break;
    }
});
 
// Tombol Mulai
startButton.addEventListener('click', () => {
    username = usernameInput.value || 'Player'; // Ambil username
    startScreen.classList.add('hidden'); // Sembunyikan layar mulai
    initGame(); // Mulai game
});
// Tombol Main Lagi
playAgainButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden'); // Kembali ke layar input nama
});
