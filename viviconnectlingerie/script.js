// Inicializa ícones
lucide.createIcons();

// --- 1. DADOS (MOCK) ---
const mockProducts = [
    { id: 1, name: "Conjunto Renda Luxury", price: 129.90, category: "Lingerie", image: "https://images.unsplash.com/photo-1616486029423-aaa478965c97?q=80&w=800" },
    { id: 2, name: "Body Noir Elegance", price: 159.90, category: "Lingerie", image: "https://images.unsplash.com/photo-1588147775923-4412a3266942?q=80&w=800" },
    { id: 3, name: "Robe de Cetim Rose", price: 89.90, category: "Noite", image: "https://images.unsplash.com/photo-1512353087810-25dfcd100962?q=80&w=800" },
    { id: 4, name: "Baby Doll Comfort", price: 69.90, category: "Pijamas", image: "https://images.unsplash.com/photo-1596472537359-21758e1f573c?q=80&w=800" },
    { id: 5, name: "Calcinha Algodão Kit", price: 49.90, category: "Lingerie", image: "https://images.unsplash.com/photo-1594892437651-78939c064972?q=80&w=800" },
    { id: 6, name: "Óleo de Massagem Hot", price: 45.00, category: "Sex Shop", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=800" },
    { id: 7, name: "Algemas de Pelúcia", price: 35.00, category: "Sex Shop", image: "https://images.unsplash.com/photo-1575540325855-4b5d285a3845?q=80&w=800" },
    { id: 8, name: "Vibra Bullet", price: 59.90, category: "Sex Shop", image: "https://images.unsplash.com/photo-1576675466548-c89b25134707?q=80&w=800" }
];

const categories = ["Todos", "Lingerie", "Pijamas", "Noite", "Sex Shop"];
let cart = [];

// --- 2. LÓGICA DE UI (MENU & NAVEGAÇÃO) ---
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
const btnOpenMenu = document.getElementById('open-menu');
const btnCloseMenu = document.getElementById('close-menu');

function toggleMenu() {
    const isHidden = mobileMenuOverlay.classList.contains('hidden');
    if (isHidden) {
        mobileMenuOverlay.classList.remove('hidden');
        setTimeout(() => mobileMenuOverlay.classList.remove('opacity-0'), 10);
        mobileMenuDrawer.classList.remove('-translate-x-full');
    } else {
        mobileMenuOverlay.classList.add('opacity-0');
        mobileMenuDrawer.classList.add('-translate-x-full');
        setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 300);
    }
}

btnOpenMenu.addEventListener('click', toggleMenu);
btnCloseMenu.addEventListener('click', toggleMenu);
mobileMenuOverlay.addEventListener('click', toggleMenu);

// --- 3. LÓGICA DE PRODUTOS & CATEGORIAS ---
const catContainer = document.getElementById('categories-container');
const mobileCatList = document.getElementById('mobile-categories-list');
const grid = document.getElementById('products-grid');
const heroSection = document.getElementById('hero-section');
const sectionTitle = document.getElementById('section-title');

function initCategories() {
    categories.forEach((cat, index) => {
        // Botão Desktop/Barra Sticky
        const btn = document.createElement('button');
        btn.innerText = cat;
        // CONTRASTE CORRIGIDO: Se ativo -> Fundo Magenta Escuro + Texto Branco
        // Se inativo -> Fundo Branco + Texto Cinza
        const isActive = index === 0;
        btn.className = `cat-btn whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border shadow-sm
            ${isActive 
                ? 'bg-brand-DEFAULT text-white border-brand-DEFAULT' 
                : 'bg-white text-gray-600 border-transparent hover:border-brand-DEFAULT hover:text-brand-DEFAULT'}`;
        
        btn.onclick = () => filterProducts(cat, btn);
        catContainer.appendChild(btn);

        // Lista do Menu Mobile
        const mobileLink = document.createElement('a');
        mobileLink.innerText = cat;
        mobileLink.href = "#";
        mobileLink.className = "block text-gray-600 hover:text-brand-DEFAULT py-1";
        mobileLink.onclick = (e) => {
            e.preventDefault();
            toggleMenu(); // Fecha menu
            filterProducts(cat, btn); // Filtra
        };
        mobileCatList.appendChild(mobileLink);
    });
}

function filterProducts(category, clickedBtn) {
    // Atualiza Visual dos Botões
    document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = 'cat-btn whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border shadow-sm bg-white text-gray-600 border-transparent hover:border-brand-DEFAULT hover:text-brand-DEFAULT';
    });
    if (clickedBtn) {
        clickedBtn.className = 'cat-btn whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border shadow-sm bg-brand-DEFAULT text-white border-brand-DEFAULT';
    }

    // Lógica de Exibição
    if (category === "Todos") {
        heroSection.style.display = "flex"; // Mostra Hero
        sectionTitle.innerText = "Destaques";
        renderGrid(mockProducts);
    } else {
        heroSection.style.display = "none"; // Esconde Hero
        sectionTitle.innerText = category;
        const filtered = mockProducts.filter(p => p.category === category);
        renderGrid(filtered);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetView() {
    // Volta para a home
    const allBtn = catContainer.firstElementChild;
    filterProducts("Todos", allBtn);
}

function renderGrid(products) {
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-full text-gray-500 py-10">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card animate-card group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col';
        
        card.innerHTML = `
            <div class="relative overflow-hidden aspect-[3/4]">
                <img src="${p.image}" alt="${p.name}" class="product-img w-full h-full object-cover transition-transform duration-700 ease-in-out">
                <button onclick="addToCart(${p.id})" class="absolute bottom-3 right-3 bg-white text-brand-dark p-3 rounded-full shadow-lg hover:bg-brand-DEFAULT hover:text-white transition transform hover:scale-110 active:scale-95">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">${p.category}</p>
                <h3 class="font-serif text-lg text-gray-900 leading-tight mb-2">${p.name}</h3>
                <div class="mt-auto flex justify-between items-center">
                    <span class="text-brand-dark font-bold text-lg">R$ ${p.price.toFixed(2).replace('.',',')}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

// --- 4. CARRINHO DE COMPRAS ---
const cartModal = document.getElementById('cart-modal');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const btnCheckout = document.getElementById('btn-checkout');

function toggleCart() {
    const isHidden = cartModal.classList.contains('hidden');
    if (isHidden) {
        cartModal.classList.remove('hidden');
        cartModal.classList.add('flex');
        renderCart();
    } else {
        cartModal.classList.add('hidden');
        cartModal.classList.remove('flex');
    }
}

function addToCart(id) {
    const product = mockProducts.find(p => p.id === id);
    if (product) {
        cart.push(product);
        updateCartCount();
        
        // Feedback Visual
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm z-[100] shadow-lg animate-fadeIn';
        toast.innerText = `${product.name} adicionado!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartCount();
}

function updateCartCount() {
    cartCount.innerText = cart.length;
    cartCount.style.opacity = cart.length > 0 ? 1 : 0;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-gray-400"><i data-lucide="shopping-bag" class="w-12 h-12 mb-2 opacity-20"></i><p>Sua sacola está vazia</p></div>';
        btnCheckout.disabled = true;
        btnCheckout.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btnCheckout.disabled = false;
        btnCheckout.classList.remove('opacity-50', 'cursor-not-allowed');
        
        cart.forEach((item, index) => {
            total += item.price;
            const el = document.createElement('div');
            el.className = 'flex gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm';
            el.innerHTML = `
                <img src="${item.image}" class="w-16 h-16 object-cover rounded-md">
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-gray-800">${item.name}</h4>
                    <p class="text-sm text-brand-DEFAULT font-bold">R$ ${item.price.toFixed(2).replace('.',',')}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-500 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            `;
            cartItemsContainer.appendChild(el);
        });
    }
    
    cartTotalEl.innerText = "R$ " + total.toFixed(2).replace('.',',');
    lucide.createIcons();
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;

    let message = "*Olá! Gostaria de fazer um pedido pelo site Vivi Connect:*\n\n";
    let total = 0;

    cart.forEach(item => {
        message += `• ${item.name} - R$ ${item.price.toFixed(2).replace('.',',')}\n`;
        total += item.price;
    });

    message += `\n*Total Estimado: R$ ${total.toFixed(2).replace('.',',')}*`;
    message += `\n\n_Gostaria de combinar a entrega e pagamento._`;

    const link = `https://api.whatsapp.com/send?phone=5511933489947&text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
}

// Inicialização
initCategories();
renderGrid(mockProducts);