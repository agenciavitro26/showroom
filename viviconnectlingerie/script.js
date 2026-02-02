// Inicializa ícones do Lucide
lucide.createIcons();

// --- 1. BASE DE DADOS COMPLETA (21 PRODUTOS) ---
const mockProducts = [
    { 
        id: 1, 
        name: "Calcinha Conforto", 
        price: 16.00, 
        category: "Calcinhas", 
        desc: "Você merece conforto o dia inteiro sem abrir mão da beleza! Nossas calcinhas sem costura são perfeitas para o dia a dia, com toque macio e caimento impecável. Disponível do P ao GG. Cores: Preto, vermelho, branco, verde menta, rosê, pink, roxo, coral.",
        images: ["./assets/produto-1-a.jpg", "./assets/produto-1-b.jpg"] 
    },
    { 
        id: 2, 
        name: "Calcinha Fio Corações", 
        price: 16.00, 
        category: "Calcinhas", 
        desc: "Um modelo mais lindo que o outro! Calcinha estilo fio, com detalhes em corações e cores vibrantes que são puro charme. Conforto, estilo e delicadeza em uma peça só.",
        images: ["./assets/produto-2-a.jpg", "./assets/produto-2-b.jpg"] 
    },
    { 
        id: 3, 
        name: "Sutiã Conjunto Brilho", 
        price: 69.99, 
        category: "Conjuntos", 
        desc: "Conjunto sofisticado com detalhe de brilho na lateral e na alça. Disponível do P ao GG.",
        images: ["./assets/produto-3-a.jpg", "./assets/produto-3-b.jpg"] 
    },
    { 
        id: 4, 
        name: "Conjunto Lindo com Renda", 
        price: 59.99, 
        category: "Conjuntos", 
        desc: "Lindo conjunto trabalhado com renda delicada. Disponível do P ao GG.",
        images: ["./assets/produto-4-a.jpg", "./assets/produto-4-b.jpg"] 
    },
    { 
        id: 5, 
        name: "Body Elegante em Renda", 
        price: 70.00, 
        category: "Body", 
        desc: "Body elegante em renda super sexy. Valoriza o corpo e traz sensualidade.",
        images: ["./assets/produto-5-a.jpg", "./assets/produto-5-b.jpg"] 
    },
    { 
        id: 6, 
        name: "Conjunto Espera Marido", 
        price: 20.00, 
        category: "Camisolas", 
        desc: "Baby Doll sensual estilo 'Espera Marido'. Perfeito para momentos especiais.",
        images: ["./assets/produto-6-a.jpg", "./assets/produto-6-b.jpg"] 
    },
    { 
        id: 7, 
        name: "Conjunto Lingerie Night Up", 
        price: 60.00, 
        category: "Conjuntos", 
        desc: "Conjunto Lingerie Night Up Sexy. Disponível do P ao GG.",
        images: ["./assets/produto-7-a.jpg", "./assets/produto-7-b.jpg"] 
    },
    { 
        id: 8, 
        name: "Xana Louca Bisnaga", 
        price: 16.00, 
        category: "Sex Shop", 
        desc: "Gel excitante Xana Louca (Bisnaga). Sensações de aquecimento e vibração.",
        images: ["./assets/produto-8-a.jpg", "./assets/produto-8-b.jpg"] 
    },
    { 
        id: 9, 
        name: "Baby Doll Lunar Renda Bicolor", 
        price: 65.00, 
        category: "Camisolas", 
        desc: "Baby Doll Lunar em Renda luxuosa Bicolor. Disponível do P ao GG.",
        images: ["./assets/produto-9-a.jpg", "./assets/produto-9-b.jpg"] 
    },
    { 
        id: 10, 
        name: "Lubrificante Love Lub", 
        price: 18.00, 
        category: "Sex Shop", 
        desc: "Lubrificante Love Lub à base de água. Conforto e prazer.",
        images: ["./assets/produto-10-a.jpg", "./assets/produto-10-b.jpg"] 
    },
    { 
        id: 11, 
        name: "Pijama Americano Estampado", 
        price: 95.00, 
        category: "Pijamas", 
        desc: "Pijama Americano estampado, unindo conforto e estilo para suas noites.",
        images: ["./assets/produto-11-a.jpg", "./assets/produto-11-b.jpg"] 
    },
    { 
        id: 12, 
        name: "Vibrador Ponto G", 
        price: 22.00, 
        category: "Sex Shop", 
        desc: "Vibrador desenhado especificamente para estimulação do Ponto G.",
        images: ["./assets/produto-12-a.jpg", "./assets/produto-12-b.jpg"] 
    },
    { 
        id: 13, 
        name: "Estimulador Masculino EGG", 
        price: 24.00, 
        category: "Sex Shop", 
        desc: "Masturbador masculino EGG. Textura interna surpreendente.",
        images: ["./assets/produto-13-a.jpg", "./assets/produto-13-b.jpg"] 
    },
    { 
        id: 14, 
        name: "Camisola Americana Botões", 
        price: 95.00, 
        category: "Camisolas", 
        desc: "Camisola Americana com fecho frontal de botões. Prática e elegante.",
        images: ["./assets/produto-14-a.jpg", "./assets/produto-14-b.jpg"] 
    },
    { 
        id: 15, 
        name: "Pijama Conforto Infantil (Masc)", 
        price: 60.00, 
        category: "Infantil", 
        desc: "Pijama Conforto masculino infantil. Praticidade e estilo para as noites dos pequenos.",
        images: ["./assets/produto-15-a.jpg", "./assets/produto-15-b.jpg"] 
    },
    { 
        id: 16, 
        name: "Baby Doll Conforto Infantil", 
        price: 55.00, 
        category: "Infantil", 
        desc: "Baby Doll conforto Infantil com estampas de personagens.",
        images: ["./assets/produto-16-a.jpg", "./assets/produto-16-b.jpg"] 
    },
    { 
        id: 17, 
        name: "Baby Doll de Liganete", 
        price: 23.00, 
        category: "Camisolas", 
        desc: "Baby Doll de Liganete, tecido fresquinho e confortável.",
        images: ["./assets/produto-17-a.jpg", "./assets/produto-17-b.jpg"] 
    },
    { 
        id: 18, 
        name: "Pijama Virgínia", 
        price: 30.00, 
        category: "Pijamas", 
        desc: "Pijama Virgínia super confortável. Disponível do P ao GG.",
        images: ["./assets/produto-18-a.jpg", "./assets/produto-18-b.jpg"] 
    },
    { 
        id: 19, 
        name: "Camisola Sensual Renda", 
        price: 60.00, 
        category: "Camisolas", 
        desc: "Nossa camisola é aquele toque de conforto com sensualidade que você merece. Leve, charmosa e com renda que valoriza o corpo. Disponível do P ao XG. Cores: rosa, branca, preta e azul.",
        images: ["./assets/produto-19-a.jpg", "./assets/produto-19-b.jpg"] 
    },
    { 
        id: 20, 
        name: "Conjunto Lingerie Corações", 
        price: 60.00, 
        category: "Conjuntos", 
        desc: "Puro charme e delicadeza para você se sentir ainda mais linda e confiante.",
        images: ["./assets/produto-20-a.jpg", "./assets/produto-20-b.jpg"] 
    },
    { 
        id: 21, 
        name: "Lingerie Valoriza Beleza", 
        price: 70.00, 
        category: "Conjuntos", 
        desc: "Disponível nas cores branco e vermelho. Com renda delicada, alças ajustáveis e um caimento incrível.",
        images: ["./assets/produto-21-a.jpg", "./assets/produto-21-b.jpg"] 
    }
];

// CATEGORIAS ATUALIZADAS
const categories = ["Todos", "Conjuntos", "Sutiãs", "Calcinhas", "Body", "Camisolas", "Pijamas", "Infantil", "Sex Shop"];
let cart = [];

// --- 2. LÓGICA DE SCROLL ---
const floatingControls = document.getElementById('floating-controls');
const btnMenuAction = document.getElementById('btn-menu-action');
let isScrolled = false;

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        if (!isScrolled) {
            // Move para baixo (considerando a barra do rodapé)
            floatingControls.style.transform = `translateY(calc(100vh - 180px))`;
            
            btnMenuAction.innerHTML = '<i data-lucide="arrow-up" class="w-6 h-6"></i>';
            lucide.createIcons();
            
            btnMenuAction.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                btnMenuAction.blur(); 
            };
            
            isScrolled = true;
        }
    } else {
        if (isScrolled) {
            floatingControls.style.transform = `translateY(0)`;
            
            btnMenuAction.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
            lucide.createIcons();
            
            btnMenuAction.onclick = () => {
                toggleMenu();
                btnMenuAction.blur();
            };
            
            isScrolled = false;
        }
    }
});
btnMenuAction.onclick = () => { toggleMenu(); btnMenuAction.blur(); };

// --- 3. NAVEGAÇÃO SPA ---
function navigateTo(pageId) {
    toggleMenu(true); 
    const pages = {
        'home': document.getElementById('page-home'),
        'about': document.getElementById('page-about'),
        'delivery': document.getElementById('page-delivery')
    };
    Object.values(pages).forEach(el => el.classList.add('hidden'));
    if (pages[pageId]) {
        pages[pageId].classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function scrollToVitrine() {
    document.getElementById('vitrine-anchor').scrollIntoView({ behavior: 'smooth' });
}

// --- 4. MENU MOBILE ---
function toggleMenu(forceClose = false) {
    const overlay = document.getElementById('menu-overlay');
    const drawer = document.getElementById('menu-drawer');
    const isHidden = overlay.classList.contains('hidden');
    
    if (forceClose || !isHidden) {
        overlay.classList.add('opacity-0');
        drawer.classList.add('-translate-x-full');
        setTimeout(() => overlay.classList.add('hidden'), 500);
    } else {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        drawer.classList.remove('-translate-x-full');
    }
}

// --- 5. CATEGORIAS ---
function initCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';
    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.innerText = cat;
        
        const baseClass = "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm outline-none";
        const activeClass = "bg-brand-deep text-white border-brand-deep";
        const inactiveClass = "bg-white text-gray-600 border-gray-200 hover:border-brand-DEFAULT hover:text-brand-DEFAULT";
        
        btn.className = `${baseClass} ${index === 0 ? activeClass : inactiveClass}`;
        
        btn.onclick = () => {
            Array.from(container.children).forEach(c => c.className = `${baseClass} ${inactiveClass}`);
            btn.className = `${baseClass} ${activeClass}`;
            
            const grid = document.getElementById('products-grid');
            grid.classList.remove('opacity-100');
            grid.classList.add('opacity-0');
            
            setTimeout(() => {
                renderGrid(cat);
                grid.classList.remove('opacity-0');
                grid.classList.add('opacity-100');
            }, 300);
        };
        container.appendChild(btn);
    });
}

function renderGrid(category) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    const filtered = category === "Todos" ? mockProducts : mockProducts.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-10">Nenhum item encontrado nesta categoria.</p>';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = "product-card group cursor-pointer";
        card.onclick = () => openProductModal(p.id);
        
        const mainImage = p.images && p.images.length > 0 ? p.images[0] : './assets/logo.png';

        card.innerHTML = `
            <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100 shadow-sm mb-2">
                <img src="${mainImage}" class="product-img w-full h-full object-cover transition-transform duration-500 select-none" onerror="this.src='./assets/logo.png'">
                <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                    <span class="text-white text-xs font-bold">Ver Detalhes</span>
                </div>
            </div>
            <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">${p.category}</p>
                <h3 class="text-gray-800 font-medium leading-tight truncate text-sm">${p.name}</h3>
                <p class="text-brand-dark font-bold mt-1">R$ ${p.price.toFixed(2).replace('.',',')}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- 6. CARROSSEL DE IMAGENS ---
let currentProduct = null;
let currentImageIndex = 0;

function openProductModal(id) {
    const p = mockProducts.find(x => x.id === id);
    if (!p) return;
    currentProduct = p;
    currentImageIndex = 0;

    document.getElementById('modal-cat').innerText = p.category;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.desc;
    document.getElementById('modal-price').innerText = "R$ " + p.price.toFixed(2).replace('.',',');
    
    updateCarousel();

    document.getElementById('prev-slide').onclick = (e) => { e.stopPropagation(); prevSlide(); };
    document.getElementById('next-slide').onclick = (e) => { e.stopPropagation(); nextSlide(); };

    const btn = document.getElementById('modal-add-btn');
    btn.onclick = () => {
        addToCart(p.id);
        closeProductModal();
    };

    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('translate-y-full');
    }, 10);
}

function updateCarousel() {
    const imgEl = document.getElementById('modal-img');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const dotsContainer = document.getElementById('carousel-dots');
    
    const images = currentProduct.images || [];
    
    imgEl.style.opacity = '0';
    setTimeout(() => {
        if(images.length > 0) {
            imgEl.src = images[currentImageIndex];
        } else {
            imgEl.src = './assets/logo.png';
        }
        imgEl.onerror = function() { this.src = './assets/logo.png'; };
        imgEl.style.opacity = '1';
    }, 150);

    // Botões sempre visíveis (mas desabilitados se só 1 foto)
    if(images.length > 1) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }

    dotsContainer.innerHTML = '';
    if(images.length > 1) {
        images.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${idx === currentImageIndex ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });
    }
}

function nextSlide() {
    if(!currentProduct || !currentProduct.images) return;
    if(currentImageIndex < currentProduct.images.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0;
    }
    updateCarousel();
}

function prevSlide() {
    if(!currentProduct || !currentProduct.images) return;
    if(currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = currentProduct.images.length - 1;
    }
    updateCarousel();
}

function closeProductModal(e) {
    if (e && e.target.id !== 'product-modal') return;
    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-content');
    modal.classList.add('opacity-0');
    content.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// --- 7. CARRINHO & FRETE ---
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Renderiza e recalcula frete com delay para garantir que DOM está pronto
        setTimeout(() => renderCart(), 50);
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function addToCart(id) {
    const prod = mockProducts.find(p => p.id === id);
    if(prod) {
        cart.push(prod);
        updateCartBadge();
        toggleCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    badge.innerText = cart.length;
    if (cart.length > 0) {
        badge.classList.remove('opacity-0', 'scale-0');
        badge.classList.add('pop-in');
        setTimeout(() => badge.classList.remove('pop-in'), 300);
    } else {
        badge.classList.add('opacity-0', 'scale-0');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const btnCheckout = document.getElementById('btn-checkout');
    const bar = document.getElementById('shipping-bar');
    const status = document.getElementById('shipping-status');
    const totalEl = document.getElementById('cart-total');

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-300">
                <i data-lucide="shopping-bag" class="w-16 h-16 mb-4 stroke-1"></i>
                <p>Sua sacola está vazia</p>
            </div>`;
        btnCheckout.disabled = true;
        bar.style.width = '0%'; 
        totalEl.innerText = "R$ 0,00";
        status.innerText = "Falta R$ 300";
    } else {
        btnCheckout.disabled = false;
        cart.forEach((item, index) => {
            total += item.price;
            const thumb = item.images && item.images.length > 0 ? item.images[0] : './assets/logo.png';
            
            const el = document.createElement('div');
            el.className = "flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm";
            el.innerHTML = `
                <img src="${thumb}" class="w-12 h-12 rounded-md object-cover select-none" onerror="this.src='./assets/logo.png'">
                <div class="flex-1">
                    <h4 class="text-xs font-bold text-gray-700 line-clamp-1">${item.name}</h4>
                    <p class="text-xs font-bold text-brand-dark">R$ ${item.price.toFixed(2).replace('.',',')}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-500 p-2 focus:outline-none"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            `;
            container.appendChild(el);
        });
    }

    // CALCULO FRETE (SIMPLIFICADO)
    const goal = 300;
    const progress = Math.min((total / goal) * 100, 100);
    
    totalEl.innerText = "R$ " + total.toFixed(2).replace('.',',');

    // Aplica Width diretamente
    bar.style.width = `${progress}%`;
    
    if (total >= goal) {
        bar.classList.remove('bg-brand-DEFAULT');
        bar.classList.add('bg-green-500');
        status.innerHTML = "<span class='text-green-600'>PARABÉNS!</span>";
    } else {
        bar.classList.add('bg-brand-DEFAULT');
        bar.classList.remove('bg-green-500');
        const remaining = goal - total;
        status.innerText = `Falta R$ ${remaining.toFixed(2).replace('.',',')}`;
    }
    
    lucide.createIcons();
}

function checkoutWhatsApp() {
    let msg = "*Olá! Pedido via Site Vivi Connect:*\n\n";
    let total = 0;
    cart.forEach(i => {
        msg += `• ${i.name} - R$ ${i.price.toFixed(2).replace('.',',')}\n`;
        total += i.price;
    });
    
    msg += `\n*Total Produtos: R$ ${total.toFixed(2).replace('.',',')}*`;
    
    if(total >= 300) {
        msg += "\n*Frete: GRÁTIS* (Compra acima de R$300) 🎉";
    } else {
        msg += "\n_Frete a calcular_";
    }
    
    msg += "\n\nEndereço de Entrega: (Por favor preencher)";
    window.open(`https://api.whatsapp.com/send?phone=5511933489947&text=${encodeURIComponent(msg)}`);
}

// Inicialização
initCategories();
renderGrid("Todos");