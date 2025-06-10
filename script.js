document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // === STATE & KONFIGURASI UTAMA ===
    // ===================================

    let turnamen; // Objek utama yang menyimpan semua state turnamen
    const MASTER_TIM_LIST = [
        { nama: "FTI", logo: "assets/fti.png" }, 
        { nama: "FEB", logo: "assets/feb.png" },
        { nama: "FKIP", logo: "assets/fkip.png" }, 
        { nama: "FISIP", logo: "assets/fisip.png" },
        { nama: "FIKES", logo: "assets/fikes.png" }, 
        { nama: "FIB", logo: "assets/fib.png" },
    ];
    const MASTER_MOSI_LIST = [
        { 
            judul: "KM Legalisasi penggunaan ganja medis di Indonesia untuk alasan kemanusiaan", 
            deskripsi: "Penggunaan ganja medis telah terbukti secara ilmiah membantu pengobatan beberapa kondisi kronis seperti epilepsi atau kanker. Namun di Indonesia, penggunaannya masih dilarang. Mosi ini mempertanyakan moralitas pelarangan di tengah kebutuhan pasien." 
        },
        { 
            judul: "KAM mewajibkan perusahaan besar mempublikasikan data kesenjangan gaji berbasis gender", 
            deskripsi: "Transparansi penggajian dinilai mampu menekan ketimpangan gaji antara laki-laki dan perempuan di lingkungan profesional. Kewajiban ini sudah diterapkan di beberapa negara sebagai upaya kesetaraan gender." 
        },
        { 
            judul: "KM larangan eks narapidana korupsi untuk maju dalam pemilu legislatif, tanpa kecuali", 
            deskripsi: "Larangan ini bertujuan untuk menjaga integritas lembaga legislatif dan mencegah terulangnya praktik korupsi." 
        },
        { 
            judul: "KMB demokrasi tidak selalu menjadi sistem pemerintahan yang paling adil", 
            deskripsi: "Demokrasi sering dianggap sebagai bentuk pemerintahan ideal. Namun dalam praktiknya, demokrasi bisa melahirkan tirani mayoritas, kooptasi elite, dan marginalisasi kelompok minoritas." 
        },
        {
            judul: "KM idealisme lebih penting daripada realisme dalam politik nasional",
            deskripsi: "Realisme mengedepankan kepentingan dan kekuasaan, sementara idealisme menekankan nilai dan moral. Mosi ini mempertanyakan fondasi moral dalam pengambilan keputusan politik."
        },
        {
            judul: "KAM menolak kompromi politik jika bertentangan dengan prinsip keadilan",
            deskripsi: "Kompromi sering digunakan untuk stabilitas, tapi dapat mengorbankan prinsip. Apakah stabilitas lebih penting dari keadilan?"
        },
        {
            judul: "KMB Mahasiswa harus memiliki keterlibatan dalam pemilihan rektor",
            deskripsi: "Mahasiswa harus memiliki peran aktif dalam proses pemilihan rektor, karena mereka adalah bagian vital dari komunitas kampus dan pihak yang paling terdampak oleh kepemimpinan universitas."
        },
        {
            judul: "KMB Memberikan kewenangan legislatif terbatas kepada mahasiswa melalui forum kampus resmi",
            deskripsi: "Mosi ini berangkat dari gagasan bahwa mahasiswa tidak hanya sebagai objek kebijakan kampus, tetapi juga sebagai bagian penting dari komunitas akademik yang layak memiliki peran aktif dalam proses pengambilan keputusan, khususnya melalui forum-forum resmi seperti senat mahasiswa, kongres mahasiswa, atau dewan perwakilan mahasiswa."
        }
    ];
    const STORAGE_KEY = 'tournamentState_v5';

    // ===================================
    // === [BARU] AUDIO ASSETS ===
    // ===================================
    // Pastikan Anda sudah membuat folder assets/sounds/ dan menaruh file audio di dalamnya
    const audioMatchSpin = new Audio('assets/sounds/match-spin.mp3');
    audioMatchSpin.loop = true; // Agar suara berulang selama animasi
    const audioMosiSpin = new Audio('assets/sounds/mosi-spin.mp3');
    audioMosiSpin.loop = true; // Agar suara berulang selama roda berputar
    const audioWinner = new Audio('assets/sounds/winner-reveal.mp3');


    // ===================================
    // === SELEKSI ELEMEN DOM ===
    // ===================================
    const setupView = document.getElementById('setup-view');
    const teamListContainer = document.getElementById('team-list-container');
    const startBtn = document.getElementById('start-tournament-btn');
    const resetBtn = document.getElementById('reset-btn');
    const matchView = document.getElementById('match-view');
    const winnerView = document.getElementById('winner-view');
    const restartBtn = document.getElementById('restart-btn');
    const roundTitleEl = document.getElementById('round-title');
    const team1Card = document.getElementById('team1-card');
    const team2Card = document.getElementById('team2-card');
    const mosiTerpilihEl = document.getElementById('mosi-terpilih');
    const spinMosiBtn = document.getElementById('spin-mosi-btn');
    const scoreInputArea = document.getElementById('score-input-area');
    const skorTim1Input = document.getElementById('skor-tim-1');
    const skorTim2Input = document.getElementById('skor-tim-2');
    const labelSkor1 = document.getElementById('label-skor-1');
    const labelSkor2 = document.getElementById('label-skor-2');
    const saveScoreBtn = document.getElementById('save-score-btn');
    const matchLogContainer = document.getElementById('match-log-container');
    const viewBracketBtn = document.getElementById('view-bracket-btn');
    const bracketModal = document.getElementById('bracket-modal');
    const closeBracketBtn = document.querySelector('.close-bracket-btn');
    const fullBracketContainer = document.getElementById('full-bracket-container');
    const modalMosi = document.getElementById('modal-mosi');
    const closeModalBtn = modalMosi.querySelector('.close-btn');
    const spinnerView = document.getElementById('spinner-view');
    const resultView = document.getElementById('result-view');
    const spinBtn = document.getElementById('spin-btn');
    const closeResultBtn = document.getElementById('close-result-btn');
    const resultTitleEl = document.getElementById('result-title');
    const resultDescriptionEl = document.getElementById('result-description');
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    
    // ===================================
    // === MANAJEMEN STATE (SAVE/LOAD) ===
    // ===================================

    const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(turnamen));

    const loadState = () => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        try {
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed && parsed.status && parsed.peserta) {
                    turnamen = parsed;
                } else { throw new Error("State tersimpan tidak valid."); }
            } else {
                initNewTournament();
            }
        } catch (e) {
            console.error("Gagal memuat state, memulai turnamen baru.", e);
            initNewTournament();
        }
        render();
    };

    const initNewTournament = () => {
        turnamen = {
            peserta: [],
            mosiTersedia: [...MASTER_MOSI_LIST],
            rounds: [],
            status: 'setup',
            currentRoundIndex: 0,
            currentMatchIndex: 0,
        };
    };

    const fullReset = () => {
        if (confirm("Yakin ingin mereset? Progres akan hilang.")) {
            localStorage.removeItem(STORAGE_KEY);
            initNewTournament();
            render();
        }
    };

    // ==========================================================
    // === [DIUBAH] SISTEM TURNAMEN DENGAN EFEK SUARA ===
    // ==========================================================

    const startTournament = () => {
        startBtn.disabled = true;
    
        initNewTournament();
        let shuffledPeserta = [...MASTER_TIM_LIST].sort(() => 0.5 - Math.random());
        turnamen.peserta = shuffledPeserta.map(p => ({ ...p }));
    
        const firstRoundMatches = [];
        for (let i = 0; i < shuffledPeserta.length; i += 2) {
            if (shuffledPeserta[i + 1]) {
                firstRoundMatches.push({ tim1: shuffledPeserta[i], tim2: shuffledPeserta[i + 1], pemenang: null, mosi: null, skor1: null, skor2: null });
            } else {
                firstRoundMatches.push({ tim1: shuffledPeserta[i], tim2: { nama: "Bye", logo: "assets/logos/bye.png" }, pemenang: shuffledPeserta[i], mosi: 'N/A', skor1: 1, skor2: 0 });
            }
        }
        turnamen.rounds.push(firstRoundMatches);
        turnamen.status = 'berlangsung';
        saveState();
        
        render(); 
    
        const team1NameEl = team1Card.querySelector('.team-name');
        const team1LogoEl = team1Card.querySelector('.team-logo');
        const team2NameEl = team2Card.querySelector('.team-name');
        const team2LogoEl = team2Card.querySelector('.team-logo');
        
        roundTitleEl.textContent = "Mengacak Lawan...";
        mosiTerpilihEl.textContent = 'Menunggu Undian...';
    
        // [BARU] Putar suara gacha
        audioMatchSpin.play();

        const gachaInterval = setInterval(() => {
            team1Card.classList.add('gacha-active');
            team2Card.classList.add('gacha-active');
            let r1 = Math.floor(Math.random() * MASTER_TIM_LIST.length);
            let r2 = Math.floor(Math.random() * MASTER_TIM_LIST.length);
            while (r1 === r2) { r2 = Math.floor(Math.random() * MASTER_TIM_LIST.length); }
            
            team1NameEl.textContent = MASTER_TIM_LIST[r1].nama;
            team1LogoEl.src = MASTER_TIM_LIST[r1].logo;
            team2NameEl.textContent = MASTER_TIM_LIST[r2].nama;
            team2LogoEl.src = MASTER_TIM_LIST[r2].logo;
        }, 100);
    
        setTimeout(() => {
            clearInterval(gachaInterval);
            // [BARU] Hentikan suara gacha
            audioMatchSpin.pause();
            audioMatchSpin.currentTime = 0;

            team1Card.classList.remove('gacha-active');
            team2Card.classList.remove('gacha-active');
            render(); 
        }, 5000);
    };

const saveScores = () => {
    const skor1 = parseInt(skorTim1Input.value, 10);
    const skor2 = parseInt(skorTim2Input.value, 10);
    if (isNaN(skor1) || isNaN(skor2) || skor1 < 0 || skor2 < 0) { alert("Harap masukkan skor yang valid."); return; }
    if (skor1 === skor2) { alert("Skor tidak boleh seri."); return; }

    let currentMatch = turnamen.rounds[turnamen.currentRoundIndex][turnamen.currentMatchIndex];
    currentMatch.skor1 = skor1;
    currentMatch.skor2 = skor2;
    currentMatch.pemenang = skor1 > skor2 ? currentMatch.tim1 : currentMatch.tim2;

    const currentRound = turnamen.rounds[turnamen.currentRoundIndex];
    const isRoundFinished = currentRound.every(match => match.pemenang);

    if (isRoundFinished) {
        const winners = currentRound.map(match => match.pemenang);
        if (winners.length === 1) {
            turnamen.status = 'selesai';
            saveState();
            render();
            // [BARU] Putar suara kemenangan
            audioWinner.play();
            return;
        } else {
            let finalWinnersForNextRound = winners;
            if (winners.length % 2 !== 0) {
                currentRound.sort((a, b) => {
                    const winnerScoreA = Math.max(a.skor1, a.skor2);
                    const winnerScoreB = Math.max(b.skor1, b.skor2);
                    return winnerScoreB - winnerScoreA;
                });
                const sortedWinners = currentRound.map(match => match.pemenang);
                finalWinnersForNextRound = sortedWinners.reverse();
            }
            
            createNextRound(finalWinnersForNextRound);
            turnamen.currentRoundIndex++;
            turnamen.currentMatchIndex = 0;
        }
    } else {
        turnamen.currentMatchIndex++;
    }
    
    saveState();

    const nextMatch = turnamen.rounds[turnamen.currentRoundIndex]?.[turnamen.currentMatchIndex];
    if (!nextMatch || nextMatch.tim2.nama === "Bye") {
        render(); 
        return;
    }

    const team1NameEl = team1Card.querySelector('.team-name');
    const team1LogoEl = team1Card.querySelector('.team-logo');
    const team2NameEl = team2Card.querySelector('.team-name');
    const team2LogoEl = team2Card.querySelector('.team-logo');
    
    roundTitleEl.textContent = "Mempersiapkan Pertandingan Berikutnya...";
    mosiTerpilihEl.textContent = '...';
    team1NameEl.textContent = "?";
    team2NameEl.textContent = "?";
    team1LogoEl.src = "";
    team2LogoEl.src = "";

    // [BARU] Putar suara gacha
    audioMatchSpin.play();

    const gachaInterval = setInterval(() => {
        team1Card.classList.add('gacha-active');
        team2Card.classList.add('gacha-active');
        let r1 = Math.floor(Math.random() * MASTER_TIM_LIST.length);
        let r2 = Math.floor(Math.random() * MASTER_TIM_LIST.length);
        while (r1 === r2) { r2 = Math.floor(Math.random() * MASTER_TIM_LIST.length); }

        team1NameEl.textContent = MASTER_TIM_LIST[r1].nama;
        team1LogoEl.src = MASTER_TIM_LIST[r1].logo;
        team2NameEl.textContent = MASTER_TIM_LIST[r2].nama;
        team2LogoEl.src = MASTER_TIM_LIST[r2].logo;
    }, 100);

    setTimeout(() => {
        clearInterval(gachaInterval);
        // [BARU] Hentikan suara gacha
        audioMatchSpin.pause();
        audioMatchSpin.currentTime = 0;

        team1Card.classList.remove('gacha-active');
        team2Card.classList.remove('gacha-active');
        render(); 
    }, 4500);
};

    const createNextRound = (winners) => {
        const nextRoundMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
            if (winners[i + 1]) {
                nextRoundMatches.push({ tim1: winners[i], tim2: winners[i + 1], pemenang: null, mosi: null, skor1: null, skor2: null });
            } else {
                nextRoundMatches.push({ tim1: winners[i], tim2: { nama: "Bye", logo: "assets/logos/bye.png" }, pemenang: winners[i], mosi: 'N/A', skor1: 1, skor2: 0 });
            }
        }
        turnamen.rounds.push(nextRoundMatches);
    };

    // ===================================
    // === FUNGSI RENDER TAMPILAN ===
    // ===================================

    const render = () => {
        setupView.style.display = turnamen.status === 'setup' ? 'block' : 'none';
        matchView.style.display = turnamen.status === 'berlangsung' ? 'block' : 'none';
        winnerView.style.display = turnamen.status === 'selesai' ? 'block' : 'none';

        if (turnamen.status === 'setup') {
            renderInitialTeams();
        } else if (turnamen.status === 'berlangsung') {
            renderCurrentMatch();
        } else if (turnamen.status === 'selesai') {
            renderWinner();
        }
    };

    const renderInitialTeams = () => {
        teamListContainer.innerHTML = '';
        MASTER_TIM_LIST.forEach(tim => {
            const teamEl = document.createElement('div');
            teamEl.className = 'team-list-item';
            teamEl.innerHTML = `<img src="${tim.logo}" alt="Logo ${tim.nama}"><span>${tim.nama}</span>`;
            teamListContainer.appendChild(teamEl);
        });
        startBtn.disabled = false;
    };

    const renderCurrentMatch = () => {
        if (!turnamen.rounds || turnamen.rounds.length === 0) {
            return;
        }
    
        let currentMatch = turnamen.rounds[turnamen.currentRoundIndex][turnamen.currentMatchIndex];
    
        if (currentMatch && currentMatch.tim2.nama === "Bye") {
            const currentRound = turnamen.rounds[turnamen.currentRoundIndex];
            const isRoundFinished = currentRound.every(match => match.pemenang);
            if (isRoundFinished) {
                const winners = currentRound.map(match => match.pemenang);
                createNextRound(winners);
                turnamen.currentRoundIndex++;
                turnamen.currentMatchIndex = 0;
            } else {
                turnamen.currentMatchIndex++;
            }
            saveState();
            render();
            return;
        }
    
        if (!currentMatch) {
            turnamen.status = 'selesai';
            render();
            return;
        }
    
        let roundName = `Babak ke-${turnamen.currentRoundIndex + 1}`;
        if (turnamen.rounds[turnamen.currentRoundIndex].length === 1) roundName = "Final";
        else if (turnamen.rounds[turnamen.currentRoundIndex].length === 2) roundName = "Semifinal";
        
        roundTitleEl.textContent = `${roundName} - Match ${turnamen.currentMatchIndex + 1}`;
        team1Card.querySelector('.team-logo').src = currentMatch.tim1?.logo || '';
        team1Card.querySelector('.team-name').textContent = currentMatch.tim1?.nama || 'TBD';
        team2Card.querySelector('.team-logo').src = currentMatch.tim2?.logo || '';
        team2Card.querySelector('.team-name').textContent = currentMatch.tim2?.nama || 'TBD';
        mosiTerpilihEl.textContent = currentMatch.mosi || 'Belum ditentukan';
        spinMosiBtn.disabled = !!currentMatch.mosi;
        scoreInputArea.style.display = currentMatch.mosi ? 'flex' : 'none';
        saveScoreBtn.style.display = currentMatch.mosi ? 'flex' : 'none';
        spinMosiBtn.style.display = currentMatch.mosi ? 'none' : 'flex';
        
        if (scoreInputArea.style.display === 'flex') {
            labelSkor1.textContent = `Skor ${currentMatch.tim1.nama}`;
            labelSkor2.textContent = `Skor ${currentMatch.tim2.nama}`;
            skorTim1Input.value = '';
            skorTim2Input.value = '';
        }
        renderLog();
    };

    // [DIUBAH] Fungsi renderWinner untuk menampilkan juara 1 dan 2
    // [DIUBAH] Fungsi renderWinner untuk menyesuaikan dengan struktur HTML baru
const renderWinner = () => {
    const lastRound = turnamen.rounds[turnamen.rounds.length - 1];
    if (lastRound && lastRound[0] && lastRound[0].pemenang) {
        const finalMatch = lastRound[0];
        const winner = finalMatch.pemenang;
        const runnerUp = finalMatch.tim1.nama === winner.nama ? finalMatch.tim2 : finalMatch.tim1;

        // Tampilkan Juara 1
        document.getElementById('winner-name').textContent = winner.nama;
        document.getElementById('winner-logo').src = winner.logo;

        // Tampilkan Juara 2
        document.getElementById('runner-up-name').textContent = runnerUp.nama;
        document.getElementById('runner-up-logo').src = runnerUp.logo;
        document.getElementById('runner-up-details').style.display = 'flex'; // Gunakan flex agar konsisten
    }
    renderLog();
};


    const renderLog = () => {
        matchLogContainer.innerHTML = '';
        const allMatches = turnamen.rounds.flat();
        const finishedMatches = allMatches.filter(match => match.pemenang);
        if (finishedMatches.length === 0) { matchLogContainer.innerHTML = '<p class="empty-log">Belum ada pertandingan yang selesai.</p>'; return; }
        finishedMatches.slice().reverse().forEach(match => {
            const logEl = document.createElement('div');
            logEl.className = 'log-item';
            const scoreText = (match.skor1 !== null) ? `(${match.skor1} - ${match.skor2})` : '';
            logEl.innerHTML = `<p><strong>${match.tim1.nama} vs ${match.tim2.nama}</strong> ${scoreText}</p><p class="mosi">Mosi: ${match.mosi || 'N/A'}</p><p>Pemenang: <strong class="winner">${match.pemenang.nama}</strong></p>`;
            matchLogContainer.appendChild(logEl);
        });
    };

    const renderFullBracket = () => {
        fullBracketContainer.innerHTML = '';
        turnamen.rounds.forEach((round, index) => {
            const roundEl = document.createElement('div');
            roundEl.className = 'bracket-round';
    
            let roundName;
            const matchCount = round.length;
    
            if (matchCount === 1) {
                roundName = "Final";
            } else if (matchCount === 2) {
                roundName = "Semi Final";
            } else {
                roundName = "Babak Penyisihan";
            }
    
            const titleEl = document.createElement('h3');
            titleEl.textContent = roundName;
            roundEl.appendChild(titleEl);
            
            round.forEach(match => {
                const matchEl = document.createElement('div');
                matchEl.className = 'bracket-match';
    
                if (match.tim2?.nama === 'Bye') {
                    matchEl.classList.add('is-bye');
                }
                
                const scoreText = (match.skor1 !== null) ? `${match.skor1} - ${match.skor2}` : 'vs';
                matchEl.innerHTML = `
                    <p class="b-teams">
                        ${match.tim1?.nama || '?'} <span>${scoreText}</span> ${match.tim2?.nama || '?'}
                    </p>
                    ${match.pemenang ? `<p class="b-winner"><i class="fas fa-trophy"></i> ${match.pemenang.nama}</p>` : ''}
                `;
                roundEl.appendChild(matchEl);
            });
            fullBracketContainer.appendChild(roundEl);
        });
    };

    // ===================================
    // === [DIUBAH] LOGIKA SPIN MOSI DENGAN SUARA ===
    // ===================================
    let sedangBerputar = false;
    const colors = ["#f97316", "#111827", "#f59e0b", "#ef4444", "#6b7280", "#10b981", "#facc15", "#3b82f6"];

    const putarRoda = () => {
        if (sedangBerputar || turnamen.mosiTersedia.length === 0) return;
        sedangBerputar = true;
        spinBtn.disabled = true;

        // [BARU] Putar suara roda mosi
        audioMosiSpin.play();

        let putaranSaatIni = 0;
        const putaranEkstra = 15;
        const sudutBerhentiAcak = Math.random() * (2 * Math.PI);
        const totalSudut = (putaranEkstra * 2 * Math.PI) + sudutBerhentiAcak;
        const durasiPutaran = 10000;
        let waktuMulai = null;
        function animasi(waktuSekarang) {
            if (!waktuMulai) waktuMulai = waktuSekarang;
            const waktuBerlalu = waktuSekarang - waktuMulai;
            if (waktuBerlalu >= durasiPutaran) {
                putaranSaatIni = totalSudut % (2 * Math.PI);
                canvas.style.transform = `rotate(${putaranSaatIni}rad)`;
                tentukanPemenangMosi(putaranSaatIni);
                return;
            }
            const progres = waktuBerlalu / durasiPutaran;
            const easing = 1 - Math.pow(1 - progres, 4);
            const sudutSekarang = totalSudut * easing;
            canvas.style.transform = `rotate(${sudutSekarang}rad)`;
            requestAnimationFrame(animasi);
        }
        requestAnimationFrame(animasi);
    };

    const tentukanPemenangMosi = (putaranFinal) => {
        // [BARU] Hentikan suara roda mosi
        audioMosiSpin.pause();
        audioMosiSpin.currentTime = 0;

        const mosiList = turnamen.mosiTersedia;
        if(mosiList.length === 0) { sedangBerputar = false; return; }
        const segmenSudut = 2 * Math.PI / mosiList.length;
        const sudutPointer = (2 * Math.PI) - putaranFinal + (Math.PI / 2);
        const indeksPemenang = Math.floor(sudutPointer / segmenSudut) % mosiList.length;
        const mosiTerpilih = mosiList[indeksPemenang];
        spinnerView.style.display = 'none';
        resultTitleEl.textContent = mosiTerpilih.judul;
        resultDescriptionEl.textContent = mosiTerpilih.deskripsi;
        resultView.style.display = 'block';
        turnamen.rounds[turnamen.currentRoundIndex][turnamen.currentMatchIndex].mosi = mosiTerpilih.judul;
        turnamen.mosiTersedia = turnamen.mosiTersedia.filter(m => m.judul !== mosiTerpilih.judul);
        sedangBerputar = false;
    };
    
    const gambarRoda = () => {
        const mosiList = turnamen.mosiTersedia;
        ctx.clearRect(0, 0, 400, 400);
        if (!mosiList || mosiList.length === 0) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#f0f0f0";
            ctx.font = "bold 20px Poppins";
            ctx.fillText("Semua Mosi Telah Digunakan", 200, 200);
            spinBtn.disabled = true;
            return;
        }
        const segmenSudut = 2 * Math.PI / mosiList.length;
        mosiList.forEach((item, i) => {
            const sudutMulai = i * segmenSudut;
            ctx.beginPath();
            ctx.arc(200, 200, 195, sudutMulai, sudutMulai + segmenSudut);
            ctx.lineTo(200, 200);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.save();
            ctx.translate(200, 200);
            ctx.rotate(sudutMulai + segmenSudut / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = (ctx.fillStyle === "#f0f0f0") ? "#111827" : "#f0f0f0";
            ctx.font = "600 12px Poppins";
            ctx.fillText(item.judul.length > 25 ? item.judul.substring(0, 22) + '...' : item.judul, 185, 5);
            ctx.restore();
        });
    };

    // ===================================
    // === EVENT LISTENERS ===
    // ===================================
    startBtn.addEventListener('click', startTournament);
    if(resetBtn) resetBtn.addEventListener('click', fullReset);
    if(restartBtn) restartBtn.addEventListener('click', fullReset);
    saveScoreBtn.addEventListener('click', saveScores);
    spinMosiBtn.addEventListener('click', () => {
        spinnerView.style.display = 'block';
        resultView.style.display = 'none';
        spinBtn.disabled = false;
        gambarRoda();
        modalMosi.style.display = 'flex';
    });
    spinBtn.addEventListener('click', putarRoda);
    const closeModalAndRefresh = () => {
        modalMosi.style.display = 'none';
        // Hentikan suara jika modal ditutup paksa
        if (!audioMosiSpin.paused) {
            audioMosiSpin.pause();
            audioMosiSpin.currentTime = 0;
        }
        saveState();
        render();
    }
    closeModalBtn.addEventListener('click', closeModalAndRefresh);
    closeResultBtn.addEventListener('click', closeModalAndRefresh);
    viewBracketBtn.addEventListener('click', () => { renderFullBracket(); bracketModal.style.display = 'block'; });
    closeBracketBtn.addEventListener('click', () => { bracketModal.style.display = 'none'; });
    
    // ===================================
    // === INISIALISASI APLIKASI ===
    // ===================================
    loadState();
});