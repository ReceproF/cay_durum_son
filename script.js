// Sayaç ve durum yönetimi için global değişkenler
let teaTimer = null;
let waterTimer = null;
let isAdminPanelMaximized = false;

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    // Admin toggle butonunu göster/gizle
    const adminToggle = document.getElementById('admin-toggle');
    if (adminToggle) {
        adminToggle.style.display = localStorage.getItem('adminLoggedIn') === 'true' ? 'block' : 'block'; // Her zaman göster
    }
    
    // Admin panelini gizle
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
    
    // Geri bildirim olaylarını ekle
    setupFeedbackEvents();
    loadFeedbacks();
    
    // Kayıtlı değerleri yükle
    const packageCount = localStorage.getItem('teaPackageCount');
    const times = localStorage.getItem('teaTimes');
    const price = localStorage.getItem('teaPrice');
    const priceDate = localStorage.getItem('teaPriceDate');
    
    if (packageCount) {
        document.getElementById('tea-package-status').innerText = 
            `${packageCount} Paket Çay Mevcut`;
    }
    
    if (times) {
        document.getElementById('tea-times').innerHTML = 
            times.split('\n')
                .filter(time => time.trim())
                .map(time => `<li>${time}</li>`)
                .join('');
    }
    
    if (price) {
        document.getElementById('tea-price').innerText = `${price} TL`;
    }
    
    if (priceDate) {
        document.getElementById('tea-date').innerText = priceDate;
    }
});

// Geri bildirim olaylarını ayarla
function setupFeedbackEvents() {
    const feedbackSection = document.querySelector('.feedback-section');
    const minimizeButton = document.querySelector('.feedback-minimize');
    
    feedbackSection.addEventListener('click', function(e) {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
        }
    });
    
    minimizeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        feedbackSection.classList.remove('active');
    });
    
    document.querySelector('.feedback-form').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Admin giriş modalını göster
function showAdminLogin() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    } else {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.classList.add('show');
        } else {
            console.error('Admin giriş modalı bulunamadı!');
        }
    }
}

// Admin girişi
function adminLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    if (username === 'admin' && password === '55samsun55') {
        if (remember) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminPassword', password);
        }
        
        document.getElementById('admin-toggle').style.display = 'block';
        showAdminPanel();
        closeModal();
    } else {
        alert('Kullanıcı adı veya şifre hatalı!');
    }
}

// Giriş durumunu kontrol et
function checkLoginStatus() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('admin-toggle').style.display = 'block';
        const savedUsername = localStorage.getItem('adminUsername');
        const savedPassword = localStorage.getItem('adminPassword');
        if (savedUsername && savedPassword) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('password').value = savedPassword;
            document.getElementById('remember').checked = true;
        }
    }
}

// Admin panelini göster
function showAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
        panel.style.display = 'block';
        // Panel pozisyonunu sıfırla
        panel.style.transform = 'translate(-50%, -50%)';
        makeDraggable(panel);
    }
}

// Panel sürüklenebilir özelliği
function makeDraggable(element) {
    const header = element.querySelector('.admin-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (element.classList.contains('maximized')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, element);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
}

// Panel kontrolleri
function minimizePanel() {
    const panel = document.getElementById('admin-panel');
    if (panel.classList.contains('maximized')) {
        panel.classList.remove('maximized');
        panel.style.transform = 'translate(-50%, -50%)';
    }
}

function maximizePanel() {
    const panel = document.getElementById('admin-panel');
    const isMaximized = panel.classList.toggle('maximized');
    
    if (isMaximized) {
        panel.style.transform = 'none';
    } else {
        panel.style.transform = 'translate(-50%, -50%)';
    }
}

function closePanel() {
    document.getElementById('admin-panel').style.display = 'none';
}

// Çay durumu yönetimi
function setTeaStatus(status) {
    const teaMessage = document.getElementById('tea-message');
    const statusCard = document.getElementById('tea-status');
    
    teaMessage.innerText = status;
    
    // Renk sınıflarını temizle
    statusCard.classList.remove('status-ready', 'status-warning', 'status-empty', 'status-not-ready');
    
    // Duruma göre renk ekle
    switch(status) {
        case 'Hazır':
            statusCard.classList.add('status-ready');
            break;
        case 'Bitmek Üzere':
            statusCard.classList.add('status-warning');
            break;
        case 'Bitti':
            statusCard.classList.add('status-empty');
            break;
        case 'Hazır Değil':
            statusCard.classList.add('status-not-ready');
            break;
    }
}

// Su durumu yönetimi
function setWaterStatus(status) {
    const waterMessage = document.getElementById('water-message');
    const statusCard = document.getElementById('water-status');
    
    waterMessage.innerText = status;
    statusCard.classList.remove('status-ready', 'status-not-ready');
    statusCard.classList.add(status === 'Hazır' ? 'status-ready' : 'status-not-ready');
}

// Sayaç başlatma fonksiyonları
function startTeaTimer() {
    if (teaTimer) clearInterval(teaTimer);
    
    let minutes = parseInt(document.getElementById('tea-timer-input').value);
    if (isNaN(minutes) || minutes <= 0) {
        alert('Lütfen geçerli bir dakika değeri girin!');
        return;
    }
    
    let seconds = minutes * 60;
    setTeaStatus('Hazırlanıyor');
    
    teaTimer = setInterval(() => {
        if (seconds <= 0) {
            clearInterval(teaTimer);
            setTeaStatus('Hazır');
            document.getElementById('tea-timer').innerText = '';
            return;
        }
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('tea-timer').innerText = 
            `Çaya ${mins}:${secs < 10 ? '0' : ''}${secs} dakika`;
        seconds--;
    }, 1000);
}

function startWaterTimer() {
    if (waterTimer) clearInterval(waterTimer);
    
    let minutes = parseInt(document.getElementById('water-timer-input').value);
    if (isNaN(minutes) || minutes <= 0) {
        alert('Lütfen geçerli bir dakika değeri girin!');
        return;
    }
    
    let seconds = minutes * 60;
    setWaterStatus('Hazırlanıyor');
    
    waterTimer = setInterval(() => {
        if (seconds <= 0) {
            clearInterval(waterTimer);
            setWaterStatus('Hazır');
            document.getElementById('water-timer').innerText = '';
            return;
        }
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('water-timer').innerText = 
            `Suyun kaynamasına ${mins}:${secs < 10 ? '0' : ''}${secs} dakika`;
        seconds--;
    }, 1000);
}

// Geri bildirim yönetimi
function submitFeedback(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const name = document.getElementById('feedback-name').value || 'Anonim';
    const text = document.getElementById('feedback-text').value;
    
    if (!text.trim()) {
        alert('Lütfen bir geri bildirim yazın!');
        return false;
    }
    
    const feedback = {
        name,
        text,
        date: new Date().toLocaleString()
    };
    
    // Geri bildirimleri localStorage'a kaydet
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    // Formu temizle
    document.getElementById('feedback-name').value = '';
    document.getElementById('feedback-text').value = '';
    
    // Başarı mesajı göster
    alert('Geri bildiriminiz başarıyla gönderildi!');
    
    // Geri bildirim panelini kapat
    const feedbackSection = document.querySelector('.feedback-section');
    feedbackSection.classList.remove('active');
    
    // Admin panelindeki geri bildirimleri güncelle
    loadFeedbacks();
    
    return false; // Form submit'i engelle
}

// Geri bildirimleri yükle
function loadFeedbacks() {
    const feedbackList = document.getElementById('feedback-list');
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    
    feedbackList.innerHTML = feedbacks.map(feedback => `
        <div class="feedback-item">
            <h4>${feedback.name}</h4>
            <p>${feedback.text}</p>
            <small>${feedback.date}</small>
        </div>
    `).join('');
}

// Çay paketi durumunu güncelle
function updateTeaPackage() {
    const packageCount = document.getElementById('tea-package-input').value;
    if (!packageCount || packageCount < 0) {
        alert('Lütfen geçerli bir paket sayısı girin!');
        return;
    }
    
    document.getElementById('tea-package-status').innerText = 
        `${packageCount} Paket Çay Mevcut`;
    localStorage.setItem('teaPackageCount', packageCount);
    alert('Çay paketi durumu güncellendi!');
}

// Çay içme saatlerini güncelle
function updateTeaTimes() {
    const times = document.getElementById('tea-times-input').value.trim();
    if (!times) {
        alert('Lütfen çay içme saatlerini girin!');
        return;
    }
    
    const timesList = document.getElementById('tea-times');
    const formattedTimes = times.split('\n')
        .filter(time => time.trim())
        .map(time => `<li>${time}</li>`)
        .join('');
        
    timesList.innerHTML = formattedTimes;
    localStorage.setItem('teaTimes', times);
    alert('Çay içme saatleri güncellendi!');
}

// Çay ücretini güncelle
function updateTeaPrice() {
    const price = document.getElementById('tea-price-input').value;
    const dateInput = document.getElementById('tea-date-input').value;
    
    if (!price || !dateInput) {
        alert('Lütfen ücret ve tarih bilgilerini eksiksiz girin!');
        return;
    }

    // Tarih formatını kontrol et (GG.AA.YYYY)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/;
    if (!dateRegex.test(dateInput)) {
        alert('Lütfen tarihi GG.AA.YYYY formatında girin!\nÖrnek: 25.03.2024');
        return;
    }
    
    document.getElementById('tea-price').innerText = `${price} TL`;
    document.getElementById('tea-date').innerText = dateInput;
        
    localStorage.setItem('teaPrice', price);
    localStorage.setItem('teaPriceDate', dateInput);
    alert('Çay ücreti güncellendi!');
}

// Geri bildirim fonksiyonları
function toggleFeedback() {
    const feedbackSection = document.querySelector('.feedback-section');
    if (!feedbackSection.classList.contains('active')) {
        feedbackSection.classList.add('active');
    }
}

function minimizeFeedback(event) {
    event.stopPropagation(); // Tıklama olayının üst elemana yayılmasını engelle
    const feedbackSection = document.querySelector('.feedback-section');
    feedbackSection.classList.remove('active');
}

// Geri bildirim butonu tıklama olayı
document.querySelector('.feedback-section').addEventListener('click', function(e) {
    if (!this.classList.contains('active')) {
        toggleFeedback();
    }
});

// Modal fonksiyonları
function closeModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Sayfa yüklendiğinde giriş durumunu kontrol et
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        const savedUsername = localStorage.getItem('adminUsername');
        const savedPassword = localStorage.getItem('adminPassword');
        if (savedUsername && savedPassword) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('password').value = savedPassword;
            document.getElementById('remember').checked = true;
        }
    }
});

// Modal CSS'ini düzenle
const modalStyle = `
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal.show {
    display: flex;
    justify-content: center;
    align-items: center;
}`;

// Style elementini oluştur ve sayfaya ekle
const styleElement = document.createElement('style');
styleElement.textContent = modalStyle;
document.head.appendChild(styleElement); 