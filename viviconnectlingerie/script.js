// Inicializa ícones do Lucide
lucide.createIcons();

// 1. DADOS MOCKADOS (Simulando Banco de Dados)
const mockProducts = [
    {
        name: "Conjunto Renda Luxury",
        description: "Sutiã com bojo e calcinha fio duplo em renda francesa.",
        price: "R$ 129,90",
        category: "Lingerie",
        image: "https://images.unsplash.com/photo-1616486029423-aaa478965c97?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Body Noir Elegance",
        description: "Body preto com transparência estratégica e decote profundo.",
        price: "R$ 159,90",
        category: "Lingerie",
        image: "https://images.unsplash.com/photo-1588147775923-4412a3266942?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Robe de Cetim Rose",
        description: "Toque de seda, perfeito para momentos de relaxamento.",
        price: "R$ 89,90",
        category: "Noite",
        image: "https://images.unsplash.com/photo-1512353087810-25dfcd100962?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Baby Doll Comfort",
        description: "Malha fria super confortável com detalhes em renda.",
        price: "R$ 69,90",
        category: "Pijamas",
        image: "https://images.unsplash.com/photo-1596472537359-21758e1f573c?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Óleo de Massagem",
        description: "Aroma morango com champanhe. Esquenta em contato com a pele.",
        price: "R$ 45,00",
        category: "Sexy Shop",
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Algemas de Pelúcia",
        description: "Acessório divertido e confortável para apimentar a relação.",
        price: "R$ 35,00",
        category: "Sexy Shop",
        image: "https://images.unsplash.com/photo-1575540325855-4b5d285a3845?q=80&w=800&auto=format&fit=crop"
    }
];

// Definição de Categorias
const categories = ["Todos", "Lingerie", "Pijamas", "Noite", "Sexy Shop"];

// Referências DOM
const catContainer = document.getElementById('categories-container');
const grid = document.getElementById('products-grid');

// 2. FUNÇÃO DE RENDERIZAR FILTROS
function initCategories() {
    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.innerText = cat;
        // Estilo condicional (Primeiro item ativo por padrão)
        btn.className = `whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-transparent
            ${index === 0 ? 'bg-brand-DEFAULT text-white shadow-md' : 'bg-white text-gray-600 hover:border-brand-DEFAULT hover:text-brand-DEFAULT'}`;
        
        btn.onclick = () => {
            // Remove ativo de todos
            Array.from(catContainer.children).forEach(c => {
                c.className = 'whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-transparent bg-white text-gray-600 hover:border-brand-DEFAULT hover:text-brand-DEFAULT';
            });
            // Ativa o clicado
            btn.className = 'whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-transparent bg-brand-DEFAULT text-white shadow-md';
            
            renderProducts(cat);
        };
        catContainer.appendChild(btn);
    });
}

// 3. FUNÇÃO DE RENDERIZAR PRODUTOS
function renderProducts(filterCategory) {
    grid.innerHTML = ''; // Limpa grid

    const filtered = filterCategory === "Todos" 
        ? mockProducts 
        : mockProducts.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-full text-gray-500 py-10">Nenhum produto nesta categoria no momento.</p>';
        return;
    }

    filtered.forEach(product => {
        const msg = `Olá! Gostei do ${product.name} que vi no site. Ainda tem disponível?`;
        const zapLink = `https://api.whatsapp.com/send?phone=5511933489947&text=${encodeURIComponent(msg)}`;

        const card = document.createElement('div');
        card.className = 'product-card animate-card group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100';
        
        card.innerHTML = `
            <div class="relative overflow-hidden aspect-[3/4]">
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-brand-dark text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-sm z-10">
                    ${product.category}
                </span>
                <img src="${product.image}" alt="${product.name}" class="product-img w-full h-full object-cover transition-transform duration-700 ease-in-out">
                
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a href="${zapLink}" target="_blank" class="bg-white text-brand-dark px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-brand-DEFAULT hover:text-white">
                        Pedir no WhatsApp
                    </a>
                </div>
            </div>
            
            <div class="p-5 text-center">
                <h3 class="font-serif text-lg text-gray-900 mb-1 truncate">${product.name}</h3>
                <p class="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[2.5em]">${product.description}</p>
                <div class="flex items-center justify-center gap-2">
                    <span class="text-brand-DEFAULT font-bold text-lg">${product.price}</span>
                </div>
                
                <a href="${zapLink}" target="_blank" class="mt-4 w-full block sm:hidden bg-brand-light text-brand-dark py-2 rounded text-sm font-bold hover:bg-brand-DEFAULT hover:text-white transition-colors">
                    Eu Quero
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
    
    // Atualiza ícones nos novos elementos
    lucide.createIcons();
}

// Inicialização
initCategories();
renderProducts("Todos");