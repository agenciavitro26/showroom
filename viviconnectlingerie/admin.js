// --- CONFIGURAÇÃO ---
const PB_URL = "http://181.214.221.254"; // SEU IP
const pb = new PocketBase(PB_URL);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    checkAuth();
});

// --- AUTENTICAÇÃO ---
function checkAuth() {
    if (pb.authStore.isValid) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        loadDashboard();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard-screen').classList.add('hidden');
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    
    try {
        await pb.collection('users').authWithPassword(email, pass);
        checkAuth();
    } catch (err) {
        errorMsg.classList.remove('hidden');
    }
});

function logout() {
    pb.authStore.clear();
    checkAuth();
}

// --- NAVEGAÇÃO ---
function switchTab(tab) {
    document.getElementById('view-products').classList.add('hidden');
    document.getElementById('view-categories').classList.add('hidden');
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    
    // Atualiza botões
    const btnProd = document.getElementById('tab-btn-products');
    const btnCat = document.getElementById('tab-btn-categories');
    
    if(tab === 'products') {
        btnProd.classList.remove('text-gray-500', 'hover:bg-white/50');
        btnProd.classList.add('bg-white', 'text-brand-dark', 'shadow-sm');
        btnCat.classList.add('text-gray-500', 'hover:bg-white/50');
        btnCat.classList.remove('bg-white', 'text-brand-dark', 'shadow-sm');
    } else {
        btnCat.classList.remove('text-gray-500', 'hover:bg-white/50');
        btnCat.classList.add('bg-white', 'text-brand-dark', 'shadow-sm');
        btnProd.classList.add('text-gray-500', 'hover:bg-white/50');
        btnProd.classList.remove('bg-white', 'text-brand-dark', 'shadow-sm');
    }
}

async function loadDashboard() {
    await loadCategories(); // Carrega primeiro para ter o Select pronto
    await loadProducts();
}

// --- CATEGORIAS ---
async function loadCategories() {
    try {
        const list = await pb.collection('categorias').getFullList({ sort: 'nome' });
        
        // 1. Renderiza Lista Visual
        const container = document.getElementById('categories-list');
        container.innerHTML = '';
        
        // 2. Preenche Select do Formulário de Produtos
        const select = document.getElementById('prod-category');
        select.innerHTML = '<option value="">Selecione...</option>';

        list.forEach(cat => {
            // Lista Visual
            const card = document.createElement('div');
            card.className = "bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center";
            card.innerHTML = `
                <span class="font-bold text-sm text-gray-700">${cat.nome}</span>
                <button onclick="deleteCategory('${cat.id}')" class="text-gray-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            `;
            container.appendChild(card);

            // Select
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.innerText = cat.nome;
            select.appendChild(opt);
        });
        
        lucide.createIcons();
    } catch (err) { console.error(err); }
}

async function addCategory() {
    const input = document.getElementById('new-cat-name');
    const nome = input.value.trim();
    if(nome) {
        try {
            await pb.collection('categorias').create({ nome: nome, ativa: true });
            input.value = '';
            loadCategories();
        } catch(e) { alert("Erro ao criar categoria"); }
    }
}

async function deleteCategory(id) {
    if(confirm("Tem certeza?")) {
        await pb.collection('categorias').delete(id);
        loadCategories();
    }
}

// --- PRODUTOS ---
async function loadProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = '<div class="text-center py-10"><div class="loader mx-auto"></div></div>';

    try {
        const records = await pb.collection('produtos').getList(1, 50, { sort: '-created', expand: 'categoria' });
        
        container.innerHTML = '';
        
        if(records.items.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400 py-10 text-sm">Nenhum produto cadastrado.</p>';
            return;
        }

        records.items.forEach(p => {
            const img = p.foto_capa ? `${PB_URL}/api/files/${p.collectionId}/${p.id}/${p.foto_capa}?thumb=100x100` : 'https://placehold.co/100';
            
            const card = document.createElement('div');
            card.className = "bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-center";
            
            card.innerHTML = `
                <div class="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                    <img src="${img}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-800 text-sm leading-tight truncate">${p.titulo}</h4>
                    <p class="text-xs text-gray-500 mb-1">${p.expand?.categoria?.nome || 'Sem Categoria'}</p>
                    <span class="text-brand-dark font-bold text-sm">R$ ${p.preco_por.toFixed(2)}</span>
                </div>
                <button onclick="deleteProduct('${p.id}')" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 shrink-0">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            container.appendChild(card);
        });
        lucide.createIcons();

    } catch (err) { console.error(err); }
}

// --- MODAL DE PRODUTO ---
function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('preview-cover').classList.add('hidden');
    document.getElementById('modal-title').innerText = "Novo Produto";
    
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    // Animação de entrada
    modal.classList.remove('translate-y-full');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
}

function previewImage(input, imgId) {
    const preview = document.getElementById(imgId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function saveProduct() {
    const btn = document.getElementById('btn-save');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loader border-white border-t-transparent"></div>';
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('titulo', document.getElementById('prod-title').value);
        formData.append('categoria', document.getElementById('prod-category').value);
        formData.append('preco_por', document.getElementById('prod-price').value);
        formData.append('preco_de', document.getElementById('prod-price-old').value || 0);
        formData.append('descricao', document.getElementById('prod-desc').value);
        formData.append('disponivel', document.getElementById('prod-active').checked);
        formData.append('destaque', document.getElementById('prod-featured').checked);

        const fileInput = document.getElementById('prod-cover');
        if(fileInput.files.length > 0) {
            formData.append('foto_capa', fileInput.files[0]);
        }

        const galleryInput = document.getElementById('prod-gallery');
        if(galleryInput.files.length > 0) {
            for (let i = 0; i < galleryInput.files.length; i++) {
                formData.append('galeria', galleryInput.files[i]);
            }
        }

        // Validação básica
        if(!document.getElementById('prod-title').value || !document.getElementById('prod-price').value) {
            throw new Error("Preencha Nome e Preço!");
        }

        await pb.collection('produtos').create(formData);
        
        closeProductModal();
        loadProducts();
        alert("Produto salvo!");

    } catch (err) {
        alert("Erro: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function deleteProduct(id) {
    if(confirm("Apagar este produto?")) {
        try {
            await pb.collection('produtos').delete(id);
            loadProducts();
        } catch(e) { alert("Erro ao apagar."); }
    }
}