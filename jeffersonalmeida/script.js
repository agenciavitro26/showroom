// ======================================================
// ARQUIVO: script.js (OTIMIZADO + VISUAL CORRIGIDO)
// ======================================================

// URL ATUALIZADA (SE MUDOU NA NOVA IMPLANTAÇÃO, ATUALIZE AQUI)
const API_URL = "https://script.google.com/macros/s/AKfycby94nMw37zi82dTCMQIqy039Y7MAgGfaSxnYOTkZPwo-sJzhzyzvGbeQDChIKsnVafC/exec"; 

lucide.createIcons();

const services = [
    { id: 1, name: "Corte Cabelo", price: 50.00, duration: "45min", icon: "scissors", desc: "Tesoura ou máquina. Lavagem e finalização." },
    { id: 2, name: "Barba Completa", price: 40.00, duration: "30min", icon: "user", desc: "Ritual completo com massagem facial." },
    { id: 3, name: "Combo (Corte + Barba)", price: 80.00, duration: "1h 15m", icon: "sparkles", featured: true, desc: "O serviço completo." },
    { id: 4, name: "Acabamento", price: 20.00, duration: "15min", icon: "zap", desc: "Apenas alinhamento dos contornos." }
];

let booking = { service: null, barber: null, date: new Date(), time: null, clientName: "", clientPhone: "" };
let currentStep = 1;
const totalSteps = 4;

// Variáveis do Calendário
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
let monthlyBusyDays = []; 
let busyDaysLoadedMonth = -1; // Controle para saber se já carregamos

function init() {
    startHeroSlider();
    setupScrollReveal();
    renderServices();
    document.getElementById('time-slots-container').innerHTML = '';
    updateDateDisplay();
    setupPhoneMask();
}

function setupPhoneMask() {
    const input = document.getElementById('input-phone');
    if(input) {
        input.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }
}

function getLocalDateString(dateObj) {
    const ano = dateObj.getFullYear();
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dateObj.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// --- COMUNICAÇÃO BACKEND ---

async function fetchBusyDays(month, year) {
    // Só busca se mudou o mês
    if (month === busyDaysLoadedMonth && monthlyBusyDays.length > 0) return;

    if (API_URL.includes("SUA_URL")) return; 

    try {
        const response = await fetch(`${API_URL}?action=getBusyDays&month=${month}&year=${year}`);
        const data = await response.json();
        if (data.busyDays) {
            monthlyBusyDays = data.busyDays;
            busyDaysLoadedMonth = month; // Marca como carregado
        }
    } catch (error) { console.error("Erro dias ocupados:", error); }
}

async function fetchTimeSlots(dateObj) {
    const container = document.getElementById('time-slots-container');
    const calendarBtn = document.querySelector('#step-3 button'); 
    
    if(calendarBtn) calendarBtn.style.display = 'none';
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-gold animate-pulse">
            <i data-lucide="loader" class="w-10 h-10 animate-spin mb-4"></i>
            <span class="text-sm font-bold uppercase tracking-widest">Carregando Agenda...</span>
        </div>`;
    lucide.createIcons();

    if (API_URL.includes("SUA_URL")) {
        setTimeout(() => {
             if(calendarBtn) calendarBtn.style.display = 'flex';
             renderTimeSlots(["09:00", "10:00", "11:00", "14:00"]);
        }, 1500); 
        return;
    }
    
    const dateStr = getLocalDateString(dateObj);
    
    try {
        const response = await fetch(`${API_URL}?date=${dateStr}`);
        const data = await response.json();
        
        if(calendarBtn) {
            calendarBtn.style.display = 'flex';
            calendarBtn.classList.add('animate-fadeIn'); 
        }

        // --- OTIMIZAÇÃO: Recebe os BusyDays junto com os slots ---
        if (data.busyDays) {
            monthlyBusyDays = data.busyDays;
            // Define que já carregamos os dados para o mês da data solicitada
            busyDaysLoadedMonth = dateObj.getMonth();
        }

        if (data.slots && data.slots.length > 0) {
            renderTimeSlots(data.slots);
        } else {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-gray-500 animate-fadeIn">
                    <i data-lucide="calendar-x" class="w-10 h-10 mb-2 opacity-50"></i>
                    <span class="text-sm font-bold text-center">Nenhum horário disponível.</span>
                    <span class="text-xs text-center mt-1 opacity-75">Tente selecionar outro dia.</span>
                </div>`;
            lucide.createIcons();
        }
    } catch (error) {
        if(calendarBtn) calendarBtn.style.display = 'flex'; 
        container.innerHTML = '<div class="text-center text-red-500 py-4 text-sm">Erro ao carregar agenda. Verifique sua conexão.</div>';
    }
}

async function sendBookingToBackend() {
    const btn = document.querySelector('#booking-form button');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Agendando...</span> <i data-lucide="loader" class="w-5 h-5 animate-spin"></i>';
    lucide.createIcons();

    if (API_URL.includes("SUA_URL")) { setTimeout(() => showSuccessScreen(), 2000); return; }

    const dateStr = getLocalDateString(booking.date);
    const payload = {
        date: dateStr, time: booking.time, service: booking.service.name,
        name: booking.clientName, phone: booking.clientPhone
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST', redirect: 'follow', body: JSON.stringify(payload) 
        });
        const result = await response.json();
        if (result.status === 'success') showSuccessScreen();
        else throw new Error(result.message || "Erro desconhecido");
    } catch (error) {
        alert('Não foi possível agendar. Tente novamente.');
        btn.disabled = false;
        btn.innerHTML = originalContent;
        lucide.createIcons();
    }
}

function showSuccessScreen() {
    document.getElementById('receipt-name').innerText = booking.clientName;
    document.getElementById('receipt-service').innerText = booking.service.name;
    const dateFull = booking.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    document.getElementById('receipt-date').innerText = `${dateFull} - ${booking.time}`;
    document.getElementById('step-4').classList.add('-translate-x-full');
    document.getElementById('step-success').classList.remove('translate-x-full');
    document.querySelector('#view-booking header').classList.add('-translate-y-full');
}

// --- CALENDÁRIO ---

async function openCalendar() {
    const modal = document.getElementById('calendar-modal');
    const content = document.getElementById('calendar-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);

    // Se já temos os dados do mês atual carregados (via fetchTimeSlots inicial),
    // NÃO mostra loading, renderiza direto.
    if (calMonth === busyDaysLoadedMonth && monthlyBusyDays.length > 0) {
        renderCalendarGrid();
    } else {
        // Se mudou de mês ou ainda não tem dados, aí sim carrega
        document.getElementById('calendar-grid').innerHTML = `
            <div class="col-span-7 flex flex-col justify-center items-center h-[290px] text-gold animate-pulse">
                <i data-lucide="loader" class="w-8 h-8 animate-spin mb-2"></i>
                <span class="text-xs font-bold uppercase tracking-widest">Verificando Mês...</span>
            </div>
        `;
        lucide.createIcons();
        await fetchBusyDays(calMonth, calYear);
        renderCalendarGrid();
    }
}

function closeCalendar() {
    const modal = document.getElementById('calendar-modal');
    const content = document.getElementById('calendar-content');
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

async function changeMonth(dir) {
    calMonth += dir;
    if(calMonth > 11) { calMonth = 0; calYear++; }
    if(calMonth < 0) { calMonth = 11; calYear--; }
    
    // Ao trocar de mês, sempre mostra loading pois precisamos buscar dados novos
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = `
        <div class="col-span-7 flex justify-center items-center h-[290px] text-gold">
            <i data-lucide="loader" class="w-8 h-8 animate-spin"></i>
        </div>
    `;
    lucide.createIcons();

    // Reseta lista pois mudou o mês
    monthlyBusyDays = []; 
    await fetchBusyDays(calMonth, calYear);
    renderCalendarGrid();
}

function renderCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-month-year');
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    
    title.innerText = firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    
    const startDay = firstDay.getDay(); 
    let html = '';
    
    for(let i=0; i < startDay; i++) html += `<div></div>`;
    
    const today = new Date(); today.setHours(0,0,0,0);
    
    for(let i=1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(calYear, calMonth, i);
        let classes = "calendar-day cursor-pointer";
        let clickAttr = `onclick="selectDate(${i})"`;
        
        if(currentDate < today) {
            classes += " disabled text-gray-700 pointer-events-none";
            clickAttr = "";
        } else if (monthlyBusyDays.includes(i)) {
            classes += " disabled bg-red-900/20 text-red-500 pointer-events-none line-through decoration-red-500/50";
            clickAttr = "";
        }
        
        // --- CORREÇÃO VISUAL PARA "HOJE" ---
        // Se for hoje: Fundo Dourado e Texto Preto (bg-gold text-black)
        if(currentDate.getTime() === today.getTime()) {
            classes += " today bg-gold text-black font-bold";
        } else {
            // Se não for hoje, mas for o selecionado
            if(booking.date && currentDate.toDateString() === booking.date.toDateString()) {
                classes += " selected bg-gold text-black font-bold";
            }
        }
        
        html += `<div ${clickAttr} class="${classes}">${i}</div>`;
    }
    
    const usedCells = startDay + lastDay.getDate();
    for(let i=0; i < (42 - usedCells); i++) html += `<div></div>`;
    
    grid.innerHTML = html;
}

function selectDate(day) {
    booking.date = new Date(calYear, calMonth, day);
    booking.time = null;
    updateDateDisplay();
    fetchTimeSlots(booking.date);
    closeCalendar();
}

function updateDateDisplay() {
    const el = document.getElementById('display-date');
    const today = new Date(); today.setHours(0,0,0,0);
    if(booking.date.toDateString() === today.toDateString()) el.innerText = "Hoje";
    else el.innerText = booking.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function renderTimeSlots(slots) {
    const container = document.getElementById('time-slots-container');
    let html = '<div class="grid grid-cols-4 gap-3 animate-fadeIn">'; 
    slots.forEach(time => {
        html += `<button onclick="selectTime('${time}', this)" class="time-pill py-3 rounded-lg border border-dark-border bg-dark-card text-white hover:border-gold font-bold text-sm transition-all">${time}</button>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function selectTime(time, btn) {
    document.querySelectorAll('.time-pill').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    booking.time = time;
    setTimeout(() => nextStep(), 300);
}

function renderServices() {
    const list = document.getElementById('services-list');
    list.innerHTML = services.map(s => `
        <div onclick="selectService(${s.id})" id="service-${s.id}" class="cursor-pointer bg-dark-card border border-dark-border p-4 rounded-xl flex justify-between items-start transition-all hover:border-gray-500 active:scale-95 group">
            <div class="flex gap-4 min-w-0">
                <div class="w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-gold shrink-0"><i data-lucide="${s.icon}"></i></div>
                <div class="min-w-0">
                    <h3 class="font-bold text-white text-lg truncate">${s.name}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">${s.desc}</p>
                    <p class="text-xs text-gold mt-2 font-bold flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${s.duration}</p>
                </div>
            </div>
            <div class="text-right shrink-0 ml-2">
                <p class="font-display font-bold text-xl text-white whitespace-nowrap">R$ ${s.price.toFixed(0)}</p>
                ${s.featured ? '<span class="text-[9px] bg-gold text-black px-2 py-0.5 rounded font-bold uppercase">Popular</span>' : ''}
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function selectService(id) {
    document.querySelectorAll('[id^="service-"]').forEach(el => el.classList.remove('selected-card'));
    document.getElementById(`service-${id}`).classList.add('selected-card');
    booking.service = services.find(s => s.id === id);
    setTimeout(() => nextStep(), 300);
}

function selectBarber(id) { booking.barber = "Jefferson Almeida"; setTimeout(() => nextStep(), 300); fetchTimeSlots(booking.date); }
function updateSummary() {
    document.getElementById('summary-service').innerText = booking.service.name;
    const dateStr = booking.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    document.getElementById('summary-datetime').innerText = `${dateStr} às ${booking.time}`;
}
function finishBooking() {
    const name = document.getElementById('input-name').value;
    const phone = document.getElementById('input-phone').value;
    if(!name || !phone || phone.length < 14) return alert("Preencha nome e telefone válidos.");
    booking.clientName = name; booking.clientPhone = phone;
    sendBookingToBackend();
}
function contactWhatsapp() {
    const msg = `Olá! Agendei o serviço: ${booking.service.name} para ${booking.time}. Não vou conseguir comparecer.`;
    window.open(`https://api.whatsapp.com/send?phone=5511976312740&text=${encodeURIComponent(msg)}`, '_blank');
}
function startHeroSlider() {
    const images = document.querySelectorAll('.hero-image');
    if(images.length === 0) return;
    let idx = 0;
    setInterval(() => { images[idx].classList.remove('active'); idx = (idx + 1) % images.length; images[idx].classList.add('active'); }, 5000);
}
function setupScrollReveal() {
    const observerOptions = { root: document.getElementById('view-home'), threshold: 0.3 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const reveal = entry.target.querySelector('.reveal-content');
                if(reveal) reveal.classList.add('active');
                const bgId = entry.target.id.replace('section-', 'bg-').replace('hero', 'hero');
                document.querySelectorAll('.bg-layer').forEach(bg => bg.classList.remove('active'));
                const activeBg = document.getElementById(bgId.replace('section', 'section')); 
                if(activeBg) activeBg.classList.add('active');
            }
        });
    }, observerOptions);
    document.querySelectorAll('#section-hero, #section-1, #section-2').forEach(s => observer.observe(s));
}
function startBooking() {
    const home = document.getElementById('view-home');
    const app = document.getElementById('view-booking');
    home.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => { home.classList.add('hidden'); app.classList.remove('hidden'); requestAnimationFrame(() => app.classList.remove('opacity-0')); }, 500);
}
function scrollToNextSection() { const next = document.getElementById('section-1'); if(next) next.scrollIntoView({ behavior: 'smooth' }); }
function goBack() {
    if (currentStep > 1) { prevStep(); } else {
        const home = document.getElementById('view-home');
        const app = document.getElementById('view-booking');
        app.classList.add('opacity-0');
        setTimeout(() => { app.classList.add('hidden'); home.classList.remove('hidden', 'opacity-0', 'pointer-events-none'); }, 500);
    }
}
function nextStep() {
    if (currentStep < totalSteps) {
        if(currentStep === 1 && !booking.service) return;
        if(currentStep === 2 && !booking.barber) return;
        if(currentStep === 3 && !booking.time) return;
        const currentEl = document.getElementById(`step-${currentStep}`);
        currentEl.classList.add('-translate-x-full');
        currentStep++;
        const nextEl = document.getElementById(`step-${currentStep}`);
        nextEl.classList.remove('translate-x-full');
        updateUI();
        if(currentStep === 4) updateSummary();
    }
}
function prevStep() {
    const currentEl = document.getElementById(`step-${currentStep}`);
    currentEl.classList.add('translate-x-full');
    currentStep--;
    const prevEl = document.getElementById(`step-${currentStep}`);
    prevEl.classList.remove('-translate-x-full');
    updateUI();
}
function updateUI() { document.getElementById('current-step-num').innerText = currentStep; lucide.createIcons(); }
init();