// --- 1. CONFIGURAÇÕES FIXAS ---
const SITE_IDENTITY = {
    NAME: "Vivi Connect - Lingerie & Sex Shop",
    COLOR: "#86198f",
};

// !!! IP DA VPS CONFIGURADO AQUI !!!
const PB_URL = "https://api.agenciavitro.com.br";

const STORE_DATA = {
    Whatsapp: "551151998993",
    Frete_Minimo: 200, 
};

const pb = new PocketBase(PB_URL);

let allProducts = [];
let cart = []; 
let currentCategory = "Destaques"; 
let currentSort = "default"; 
let currentView = 'home'; 

if (typeof lucide !== 'undefined') lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    applyFixedIdentity();
    loadStoreData();
    setupEventListeners();
    updateFloatingButton();
});

function applyFixedIdentity() {
    document.title = SITE_IDENTITY.NAME;
    const color = SITE_IDENTITY.COLOR;
    const style = document.createElement('style');
    style.innerHTML = `
        .text-brand-dark { color: ${color} !important; }
        .bg-brand-dark { background-color: ${color} !important; }
        #cart-badge { background-color: ${color} !important; }
        .active-tab { background-color: ${color} !important; color: white !important; }
        button.active-category-btn, 
        .active-category-btn { 
            background-color: ${color} !important; 
            color: white !important; 
            border-color: ${color} !important; 
            opacity: 1 !important;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
}

// --- CARREGAMENTO DE DADOS ---
async function loadStoreData() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<div class="col-span-full py-20 flex justify-center"><i data-lucide="loader-2" class="animate-spin w-8 h-8 text-brand-dark"></i></div>';
    
    try {
        const catsResult = await pb.collection('categorias').getFullList({
            filter: 'ativa = true',
            sort: 'nome'
        });
        
        const productsResult = await pb.collection('produtos').getFullList({
            filter: 'disponivel = true',
            sort: '-created',
            expand: 'categoria'
        });

        allProducts = productsResult.map(record => {
            const getImgUrl = (filename) => {
                if(!filename) return null;
                return `${PB_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
            };

            let imagesArray = [];
            if (record.foto_capa) imagesArray.push({ type: 'image', src: getImgUrl(record.foto_capa) });
            if (record.galeria && record.galeria.length > 0) {
                record.galeria.forEach(img => imagesArray.push({ type: 'image', src: getImgUrl(img) }));
            }
            
            if (record.video_youtube) {
                imagesArray.push({ type: 'video', src: record.video_youtube });
            }

            let catName = "Geral";
            if (record.expand && record.expand.categoria) {
                catName = record.expand.categoria.nome;
            }

            return {
                id: record.id,
                name: record.titulo,
                price: record.preco_por || 0,
                oldPrice: record.preco_de || 0,
                category: catName,
                desc: record.descricao || "", 
                media: imagesArray,
                featured: record.destaque,
                youtube: record.video_youtube 
            };
        });

        renderCategories(catsResult);
        filterAndRender("Destaques"); 

    } catch (error) {
        console.error("Erro PocketBase:", error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Erro ao conectar com o servidor.</p>';
    }
}

function renderCategories(dbCategories) {
    const container = document.getElementById('cats-container');
    container.innerHTML = '';
    
    const specialCats = ["Destaques", "Promoções"];
    const dbCatNames = dbCategories.map(c => c.nome);
    const allCats = [...specialCats, ...dbCatNames];

    allCats.forEach(cat => {
        const btn = document.createElement('button');
        btn.innerText = cat;
        btn.setAttribute('data-cat', cat);
        btn.className = `cat-btn-standard shrink-0`;
        btn.onclick = () => filterAndRender(cat);
        container.appendChild(btn);
    });
}

function filterAndRender(categoryName) {
    currentCategory = categoryName;
    document.getElementById('active-cat-label').innerText = categoryName;
    
    document.querySelectorAll('.cat-btn-standard').forEach(b => {
        if(b.getAttribute('data-cat') === categoryName) {
            b.classList.add('active-category-btn');
            b.style.backgroundColor = SITE_IDENTITY.COLOR;
            b.style.borderColor = SITE_IDENTITY.COLOR;
            b.style.color = 'white';
        } else {
            b.classList.remove('active-category-btn');
            b.style.backgroundColor = '';
            b.style.borderColor = '';
            b.style.color = '';
        }
    });

    let filtered = [];
    if (categoryName === "Destaques") {
        filtered = allProducts.filter(p => p.featured === true);
    } 
    else if (categoryName === "Promoções") {
        filtered = allProducts.filter(p => p.oldPrice > p.price);
    } 
    else {
        filtered = allProducts.filter(p => p.category === categoryName);
    }

    applySort(filtered);
    renderGrid(filtered);
}

function applySort(valueOrList) {
    let listToSort = Array.isArray(valueOrList) ? valueOrList : null;
    if (typeof valueOrList === 'string') {
        currentSort = valueOrList;
        filterAndRender(currentCategory);
        return;
    }
    if (currentSort === "price-asc") listToSort.sort((a, b) => a.price - b.price);
    else if (currentSort === "price-desc") listToSort.sort((a, b) => b.price - a.price);
    else if (currentSort === "az") listToSort.sort((a, b) => a.name.localeCompare(b.name));
}

function renderGrid(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 flex flex-col items-center"><i data-lucide="package-open" class="w-10 h-10 mb-2 opacity-50"></i><p>Nenhum produto encontrado.</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = "group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 cursor-pointer animate-fadeInUp";
        card.onclick = () => openProductModal(p.id);

        const coverImg = (p.media && p.media.length && p.media[0].type === 'image') ? p.media[0].src : 'https://placehold.co/400x400?text=Sem+Foto';
        
        const isPromo = (p.oldPrice > p.price);
        const promoHtml = isPromo 
            ? `<span class="absolute top-2 right-2 bg-brand-dark text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 animate-pulse uppercase tracking-wider shadow-sm">Promoção</span>` 
            : '';

        const videoHtml = p.youtube 
            ? `<div class="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-full z-10"><i data-lucide="play" class="w-3 h-3"></i></div>`
            : '';

        card.innerHTML = `
            <div class="relative w-full pt-[110%] overflow-hidden bg-gray-50">
                ${promoHtml}
                <img src="${coverImg}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
                ${videoHtml}
                <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                    <span class="text-white text-xs font-bold bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">Ver Detalhes</span>
                </div>
            </div>
            <div class="p-3 flex flex-col flex-1">
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">${p.category}</p>
                <h3 class="font-serif text-gray-800 text-sm font-bold leading-tight mb-2 line-clamp-2 min-h-[2.5em]">${p.name}</h3>
                <div class="mt-auto flex items-end gap-2">
                    <span class="font-bold text-brand-dark text-base">R$ ${p.price.toFixed(2).replace('.',',')}</span>
                    ${isPromo ? `<span class="text-xs text-gray-400 line-through mb-0.5">R$ ${p.oldPrice.toFixed(2).replace('.',',')}</span>` : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function navigateTo(viewId) {
    currentView = viewId;
    
    const tabs = ['home', 'about', 'delivery'];
    
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        const section = document.getElementById(`view-${t}`);
        
        if (t === viewId) {
            if(btn) { 
                btn.classList.remove('bg-white/50', 'text-brand-dark', 'hover:bg-white'); 
                btn.classList.add('bg-brand-dark', 'text-white');
            }
            if(section) section.classList.remove('hidden');
        } else {
            if(btn) { 
                btn.classList.add('bg-white/50', 'text-brand-dark', 'hover:bg-white'); 
                btn.classList.remove('bg-brand-dark', 'text-white'); 
            }
            if(section) section.classList.add('hidden');
        }
    });

    const drawer = document.getElementById('menu-drawer');
    if (drawer && !drawer.classList.contains('-translate-x-full')) toggleMenu(true);

    const contentAnchor = document.getElementById('content-anchor');
    if (contentAnchor) {
        contentAnchor.style.minHeight = '100vh';
        contentAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const catsWrapper = document.getElementById('cats-wrapper');
    if(catsWrapper) {
        if(viewId === 'home') catsWrapper.style.display = 'block';
        else catsWrapper.style.display = 'none';
    }

    updateFloatingButton();
}

const floatingControls = document.getElementById('floating-controls');
const miniHeader = document.getElementById('mini-header');
const stickyWrapper = document.getElementById('sticky-header-wrapper');

function updateFloatingButton() {
    const currentScrollY = window.scrollY;
    // Pega o botão dinamicamente para evitar erro de referência
    const btnMenuAction = document.getElementById('btn-menu-action');

    if (miniHeader) {
        if (currentScrollY > 250) {
            miniHeader.classList.remove('max-h-0', 'opacity-0', 'mb-0');
            miniHeader.classList.add('max-h-[100px]', 'opacity-100', 'mb-0');
            if(stickyWrapper) {
                stickyWrapper.classList.add('shadow-md', 'border-gray-100');
                stickyWrapper.classList.remove('rounded-t-[35px]');
            }
        } 
        else {
            miniHeader.classList.add('max-h-0', 'opacity-0', 'mb-0');
            miniHeader.classList.remove('max-h-[100px]', 'opacity-100');
            if(stickyWrapper) {
                stickyWrapper.classList.remove('shadow-md', 'border-gray-100');
                stickyWrapper.classList.add('rounded-t-[35px]');
            }
        }
    }

    if(btnMenuAction) {
        if (currentView !== 'home') {
            btnMenuAction.innerHTML = '<i data-lucide="arrow-left" class="w-6 h-6"></i>';
            btnMenuAction.onclick = () => navigateTo('home');
            floatingControls.style.transform = `translateY(0)`;
        } else if (currentScrollY > 300) {
            btnMenuAction.innerHTML = '<i data-lucide="arrow-up" class="w-6 h-6"></i>';
            btnMenuAction.onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); btnMenuAction.blur(); };
            floatingControls.style.transform = `translateY(calc(100vh - 180px))`;
        } else {
            btnMenuAction.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
            btnMenuAction.onclick = () => { toggleMenu(); btnMenuAction.blur(); };
            floatingControls.style.transform = `translateY(0)`;
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}
window.addEventListener('scroll', updateFloatingButton);

function toggleMenu(forceClose = false) {
    const overlay = document.getElementById('menu-overlay');
    const drawer = document.getElementById('menu-drawer');
    if(!overlay || !drawer) return;
    
    // Força lucide update se precisar
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (forceClose || !overlay.classList.contains('hidden')) {
        overlay.classList.add('opacity-0'); drawer.classList.add('-translate-x-full'); setTimeout(() => overlay.classList.add('hidden'), 300);
    } else {
        overlay.classList.remove('hidden'); setTimeout(() => overlay.classList.remove('opacity-0'), 10); drawer.classList.remove('-translate-x-full');
    }
}
function setupEventListeners() { 
    const overlay = document.getElementById('menu-overlay');
    if(overlay) overlay.onclick = () => toggleMenu(true); 
}

// --- EXTRACT YOUTUBE ID (CORRIGIDO PARA TODOS OS FORMATOS) ---
function extractVideoID(url) {
    if (!url) return false;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : false;
}

// --- MODAL & CARROSSEL ---
let currentProduct = null;
let currentMediaIndex = 0;

function openProductModal(id) {
    const p = allProducts.find(x => x.id === id); if (!p) return;
    currentProduct = p; 
    currentMediaIndex = 0;
    
    document.getElementById('modal-cat').innerText = p.category;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerHTML = p.desc || "Sem descrição disponível."; 
    document.getElementById('modal-price').innerText = `R$ ${p.price.toFixed(2).replace('.',',')}`;
    
    updateCarousel();
    
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden'); 
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('product-modal-content').classList.remove('translate-y-full'); }, 10);
    
    document.getElementById('modal-add-btn').onclick = () => { addToCart(p.id); closeProductModal(); };
    
    document.getElementById('prev-slide').onclick = (e) => { e.stopPropagation(); prevSlide(); };
    document.getElementById('next-slide').onclick = (e) => { e.stopPropagation(); nextSlide(); };
}

function updateCarousel() {
    const imgEl = document.getElementById('modal-img');
    const container = imgEl.parentElement;
    
    const oldIframe = container.querySelector('iframe');
    if(oldIframe) oldIframe.remove();
    
    const media = currentProduct.media || [];
    const currentItem = media[currentMediaIndex] || { type: 'image', src: 'https://placehold.co/400x400' };
    
    const dots = document.getElementById('carousel-dots');
    dots.innerHTML = '';
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    
    if(media.length > 1) {
        media.forEach((_, i) => {
            const d = document.createElement('div');
            d.className = `w-2 h-2 rounded-full mx-1 transition-all duration-300 ${i === currentMediaIndex ? 'bg-brand-dark scale-125' : 'bg-black/20'}`;
            dots.appendChild(d);
        });
        prevBtn.style.display = 'flex'; nextBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'none'; nextBtn.style.display = 'none';
    }

    if (currentItem.type === 'video') {
        imgEl.classList.add('hidden'); 
        
        const videoId = extractVideoID(currentItem.src);

        if (videoId) {
            // Embed seguro com ORIGIN e NO-COOKIE
            const origin = window.location.origin;
            const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&origin=${origin}`;
            
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.className = "absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"; 
            iframe.allow = "autoplay; encrypted-media; loop";
            iframe.frameBorder = "0";
            iframe.setAttribute("loading", "lazy");
            
            container.insertBefore(iframe, imgEl); 
        } else {
             imgEl.classList.remove('hidden');
             imgEl.src = 'https://placehold.co/400x400?text=Erro+Video';
        }
    } else {
        imgEl.classList.remove('hidden');
        imgEl.style.opacity = '0';
        const tempImg = new Image();
        tempImg.src = currentItem.src;
        tempImg.onload = () => { imgEl.src = currentItem.src; requestAnimationFrame(() => { imgEl.style.opacity = '1'; }); };
    }
}

function prevSlide() { 
    if(currentProduct.media.length > 1) { 
        currentMediaIndex = (currentMediaIndex - 1 + currentProduct.media.length) % currentProduct.media.length; 
        updateCarousel(); 
    }
}
function nextSlide() { 
    if(currentProduct.media.length > 1) { 
        currentMediaIndex = (currentMediaIndex + 1) % currentProduct.media.length; 
        updateCarousel(); 
    }
}

function closeProductModal(e) { 
    if(e && e.target.id !== 'product-modal' && !e.target.closest('button')) return;
    const modal = document.getElementById('product-modal');
    modal.classList.add('opacity-0'); document.getElementById('product-modal-content').classList.add('translate-y-full');
    
    const container = document.getElementById('modal-img').parentElement;
    const oldIframe = container.querySelector('iframe');
    if(oldIframe) setTimeout(() => oldIframe.remove(), 300);

    setTimeout(() => modal.classList.add('hidden'), 300); 
}

// --- CARRINHO ---
function toggleCart() {
    const m = document.getElementById('cart-modal');
    if(m.classList.contains('hidden')) { m.classList.remove('hidden'); setTimeout(() => renderCart(), 10); } else m.classList.add('hidden');
}

function addToCart(id) { 
    const p = allProducts.find(x => x.id === id); 
    if(!p) return;
    const existingItem = cart.find(item => item.product.id === id);
    if(existingItem) { existingItem.qty += 1; } else { cart.push({ product: p, qty: 1 }); }
    updateBadge(); 
    toggleCart(); 
}

function changeQty(id, delta) {
    const index = cart.findIndex(item => item.product.id === id);
    if (index === -1) return;
    const item = cart[index];
    const newQty = item.qty + delta;
    if (newQty <= 0) { cart.splice(index, 1); } else { item.qty = newQty; }
    updateBadge();
    renderCart();
}

function updateBadge() { 
    const b = document.getElementById('cart-badge'); 
    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    b.innerText = totalCount; 
    if(totalCount > 0) { b.classList.remove('opacity-0', 'scale-0'); } 
    else { b.classList.add('opacity-0', 'scale-0'); } 
}

function renderCart() {
    const c = document.getElementById('cart-items'); 
    c.innerHTML = ''; 
    let total = 0;

    if (cart.length === 0) {
        c.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-gray-400"><i data-lucide="shopping-bag" class="w-12 h-12 mb-2 opacity-20"></i><p>Sua sacola está vazia.</p></div>';
    }

    cart.forEach((item) => {
        const p = item.product;
        total += p.price * item.qty;

        const d = document.createElement('div'); 
        d.className = "flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-3";
        
        // Prioriza Imagem
        let imgUrl = 'https://placehold.co/100';
        if (p.media && p.media.length) {
             const imgMedia = p.media.find(m => m.type === 'image');
             if(imgMedia) imgUrl = imgMedia.src;
        }

        const minusIcon = item.qty === 1 ? 'trash-2' : 'minus';
        const minusColor = item.qty === 1 ? 'text-red-400 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100';

        d.innerHTML = `
            <div class="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                <img src="${imgUrl}" class="w-full h-full object-cover">
            </div>
            
            <div class="flex-1 flex items-center min-w-0 px-2">
                <h4 class="text-sm font-bold text-gray-800 leading-tight line-clamp-2">${p.name}</h4>
            </div>

            <div class="flex flex-col items-end gap-2 shrink-0">
                <p class="font-bold text-brand-dark text-base">R$ ${(p.price * item.qty).toFixed(2).replace('.',',')}</p>
                <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-7 shadow-sm">
                    <button onclick="changeQty('${p.id}', -1)" class="w-7 h-full flex items-center justify-center ${minusColor} rounded-l-lg transition-colors focus:outline-none">
                        <i data-lucide="${minusIcon}" class="w-3 h-3"></i>
                    </button>
                    <span class="w-6 text-center text-xs font-bold text-gray-700 select-none">${item.qty}</span>
                    <button onclick="changeQty('${p.id}', 1)" class="w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-lg transition-colors focus:outline-none">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                </div>
            </div>
        `;
        c.appendChild(d);
    });

    document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2).replace('.',',')}`;
    
    const min = STORE_DATA.Frete_Minimo;
    let pct = 0;
    if (min > 0) {
        pct = (total / min) * 100;
        if (pct > 100) pct = 100;
        if (pct < 0) pct = 0;
    }
    
    const bar = document.getElementById('shipping-bar');
    const status = document.getElementById('shipping-status');
    
    bar.style.width = `${pct}%`;
    
    if (total >= min) {
        status.innerText = "FRETE GRÁTIS CONQUISTADO!";
        status.classList.add('text-green-600');
        status.classList.remove('text-gray-400');
        bar.classList.add('bg-green-500');
        bar.classList.remove('bg-brand'); 
    } else {
        const falta = min - total;
        status.innerText = `Falta R$ ${falta.toFixed(2).replace('.',',')}`;
        status.classList.remove('text-green-600');
        status.classList.add('text-gray-400');
        bar.classList.remove('bg-green-500');
        bar.classList.add('bg-brand'); 
    }

    document.getElementById('btn-checkout').disabled = cart.length === 0;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function checkoutWhatsApp() {
    let msg = `*Pedido Vivi Connect*\n\n`; 
    let total = 0;
    cart.forEach(item => { 
        const sub = item.product.price * item.qty;
        total += sub;
        msg += `• [${item.qty}x] ${item.product.name}\n   R$ ${sub.toFixed(2).replace('.',',')}\n`; 
    });
    msg += `\n*Total: R$ ${total.toFixed(2).replace('.',',')}*`;
    if (total >= STORE_DATA.Frete_Minimo) { msg += `\n✅ Frete Grátis Conquistado!`; }
    window.open(`https://api.whatsapp.com/send?phone=${STORE_DATA.Whatsapp}&text=${encodeURIComponent(msg)}`);
}