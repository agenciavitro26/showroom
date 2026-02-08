// --- CONFIGURAÇÃO ---
const PB_URL = "https://api.agenciavitro.com.br";
const pb = new PocketBase(PB_URL);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    checkAuth();
    
    // Configura máscaras de dinheiro
    document.querySelectorAll('.money-mask').forEach(input => {
        input.addEventListener('input', (e) => formatMoneyInput(e.target));
    });
});

// --- MÁSCARA DE DINHEIRO ---
function formatMoneyInput(input) {
    let value = input.value.replace(/\D/g, "");
    value = (Number(value) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    input.value = value;
}

function parseMoneyToFloat(valueStr) {
    if(!valueStr) return 0;
    const clean = valueStr.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(clean);
}

function floatToMoney(valueFloat) {
    if(!valueFloat) return '';
    return valueFloat.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// --- AUTENTICAÇÃO ---
function checkAuth() {
    if (pb.authStore.isValid) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        
        // Pega Nome ou Email do Usuário Logado
        const model = pb.authStore.model;
        const displayName = model.name ? model.name : (model.email ? model.email.split('@')[0] : 'Admin');
        
        document.getElementById('user-name-display').innerText = displayName;
        
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
    if(confirm("Deseja realmente sair?")) {
        pb.authStore.clear();
        checkAuth();
    }
}

// --- NAVEGAÇÃO ---
function switchTab(tab) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-products').classList.add('hidden');
    document.getElementById('view-categories').classList.add('hidden');
    document.getElementById('view-category-detail').classList.add('hidden');
    
    ['home', 'products', 'categories'].forEach(t => {
        const btn = document.getElementById(`nav-${t}`);
        if(btn) btn.classList.remove('active', 'text-brand-DEFAULT');
    });

    const target = document.getElementById(`view-${tab}`);
    if(target) target.classList.remove('hidden');
    
    const activeBtn = document.getElementById(`nav-${tab}`);
    if(activeBtn) activeBtn.classList.add('active', 'text-brand-DEFAULT');
    
    if(tab === 'products') loadProducts();
    if(tab === 'categories') loadCategories();
    if(tab === 'home') loadSubscription();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadDashboard() {
    switchTab('home'); 
}

// --- ASSINATURA E HOME ---
async function loadSubscription() {
    const loading = document.getElementById('sub-loading');
    const content = document.getElementById('sub-content');
    loading.classList.remove('hidden');
    content.classList.add('hidden');

    try {
        const result = await pb.collection('assinatura').getList(1, 1);
        
        if (result.items.length > 0) {
            const sub = result.items[0];
            
            document.getElementById('sub-plan').innerText = sub.plano || 'Loja Vitrine';
            
            const dateObj = new Date(sub.vencimento);
            document.getElementById('sub-date').innerText = dateObj.toLocaleDateString('pt-BR');

            const statusText = document.getElementById('sub-status-text');
            const statusIcon = document.getElementById('sub-status-icon');
            
            statusText.innerText = sub.status;
            
            const isAtivo = sub.status === 'Ativo';

            if (isAtivo) {
                statusText.className = "font-bold text-lg text-green-600";
                statusIcon.innerHTML = '<i data-lucide="check" class="text-green-600 w-6 h-6"></i>';
                statusIcon.className = "w-10 h-10 rounded-full flex items-center justify-center bg-green-100";
            } else {
                statusText.className = "font-bold text-lg text-red-500";
                statusIcon.innerHTML = '<i data-lucide="alert-circle" class="text-red-500 w-6 h-6"></i>';
                statusIcon.className = "w-10 h-10 rounded-full flex items-center justify-center bg-red-100";
            }

            const btnRecorrente = document.getElementById('btn-recorrente');
            const btnPix = document.getElementById('btn-pix');
            
            if(sub.link_recorrente) {
                btnRecorrente.href = sub.link_recorrente;
                btnRecorrente.classList.remove('hidden');
                document.getElementById('txt-recorrente').innerText = isAtivo ? "Gerenciar Cartão" : "Assinar (Recorrente)";
            } else {
                btnRecorrente.classList.add('hidden');
            }

            if(sub.link_pix && !isAtivo) {
                btnPix.href = sub.link_pix;
                btnPix.classList.remove('hidden');
            } else {
                btnPix.classList.add('hidden');
            }

        } else {
            document.getElementById('sub-status-text').innerText = "Não configurado";
        }
        
    } catch (err) {
        console.log("Erro assinatura:", err);
    } finally {
        loading.classList.add('hidden');
        content.classList.remove('hidden');
        lucide.createIcons();
    }
}

// --- CATEGORIAS ---
let allCategories = [];

async function loadCategories() {
    try {
        const list = await pb.collection('categorias').getFullList({ sort: 'nome' });
        allCategories = list;
        
        const container = document.getElementById('categories-list');
        container.innerHTML = '';
        
        const select = document.getElementById('prod-category');
        select.innerHTML = '<option value="">Selecione...</option>';

        list.forEach(cat => {
            const card = document.createElement('div');
            card.className = "bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center cursor-pointer hover:border-brand-light hover:shadow-md transition-all h-32";
            card.onclick = () => openCategoryDetails(cat); 
            
            card.innerHTML = `
                <span class="font-bold text-lg text-gray-800 text-center leading-tight line-clamp-2">${cat.nome}</span>
            `;
            container.appendChild(card);

            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.innerText = cat.nome;
            select.appendChild(opt);
        });
        
        lucide.createIcons();
    } catch (err) { console.error(err); }
}

async function promptAddCategory() {
    const nome = prompt("Digite o nome da nova categoria:");
    if(nome && nome.trim()) {
        try {
            await pb.collection('categorias').create({ nome: nome.trim(), ativa: true });
            loadCategories();
        } catch(e) { alert("Erro ao criar categoria"); }
    }
}

// --- DETALHES DA CATEGORIA ---
async function openCategoryDetails(cat) {
    document.getElementById('view-categories').classList.add('hidden');
    document.getElementById('view-category-detail').classList.remove('hidden');
    
    document.getElementById('edit-cat-name').value = cat.nome;
    document.getElementById('edit-cat-id').value = cat.id;
    
    document.getElementById('nav-categories').classList.remove('active', 'text-brand-DEFAULT');

    const container = document.getElementById('cat-products-list');
    container.innerHTML = '<div class="loader mx-auto"></div>';
    
    try {
        const products = await pb.collection('produtos').getList(1, 100, {
            filter: `categoria = "${cat.id}"`,
            sort: '-created'
        });
        
        document.getElementById('cat-product-count').innerText = `${products.items.length} produto(s)`;
        renderProductList(products.items, container);
        
    } catch(e) {
        container.innerHTML = '<p class="text-red-500 text-xs">Erro ao carregar produtos.</p>';
    }
}

async function updateCategoryName() {
    const id = document.getElementById('edit-cat-id').value;
    const nome = document.getElementById('edit-cat-name').value;
    if(!nome) return;
    try {
        await pb.collection('categorias').update(id, { nome: nome });
        alert("Categoria atualizada!");
    } catch(e) { alert("Erro ao atualizar."); }
}

async function deleteCategorySafe() {
    const id = document.getElementById('edit-cat-id').value;
    const countText = document.getElementById('cat-product-count').innerText;
    
    if(!countText.startsWith("0")) {
        alert("Não é possível excluir: Esta categoria possui produtos.");
        return;
    }
    
    if(confirm("Tem certeza que deseja excluir esta categoria?")) {
        try {
            await pb.collection('categorias').delete(id);
            switchTab('categories');
        } catch(e) { alert("Erro ao excluir."); }
    }
}


// --- PRODUTOS ---
async function loadProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = '<div class="text-center py-10"><div class="loader mx-auto"></div></div>';

    try {
        const records = await pb.collection('produtos').getList(1, 50, { sort: '-created', expand: 'categoria' });
        renderProductList(records.items, container);
    } catch (err) { console.error(err); }
}

function renderProductList(items, containerElement) {
    containerElement.innerHTML = '';
    
    if(items.length === 0) {
        containerElement.innerHTML = '<p class="text-center text-gray-400 py-10 text-sm">Nenhum produto aqui.</p>';
        return;
    }

    items.forEach(p => {
        const img = p.foto_capa ? `${PB_URL}/api/files/${p.collectionId}/${p.id}/${p.foto_capa}?thumb=100x100` : 'https://placehold.co/100';
        
        const isPromo = p.preco_de > 0;
        const priceDisplay = isPromo 
            ? `<span class="line-through text-gray-400 text-[10px]">R$ ${p.preco_de.toFixed(2).replace('.',',')}</span> <span class="text-brand-dark">R$ ${p.preco_por.toFixed(2).replace('.',',')}</span>`
            : `<span class="text-gray-800">R$ ${p.preco_por.toFixed(2).replace('.',',')}</span>`;

        const card = document.createElement('div');
        card.className = "bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-center cursor-pointer hover:border-brand-light transition-all active:scale-[0.99]";
        card.onclick = () => editProduct(p);
        
        card.innerHTML = `
            <div class="w-14 h-14 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-200 relative">
                <img src="${img}" class="w-full h-full object-cover">
                ${p.video_youtube ? '<div class="absolute bottom-0 right-0 bg-red-500 text-white p-0.5 rounded-tl-md"><svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' : ''}
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-800 text-sm leading-tight truncate">${p.titulo}</h4>
                <p class="text-xs text-gray-500 mb-0.5">${p.expand?.categoria?.nome || 'Sem Categoria'}</p>
                <div class="font-bold text-sm flex gap-2 items-center">
                    ${priceDisplay}
                </div>
            </div>
            <div class="text-gray-300">
                <i data-lucide="edit-2" class="w-4 h-4"></i>
            </div>
        `;
        containerElement.appendChild(card);
    });
    lucide.createIcons();
}

// --- MODAL DE PRODUTO ---
function openProductModal(productData = null, preSelectedCatId = null) {
    const form = document.getElementById('product-form');
    form.reset();
    document.getElementById('preview-cover').classList.add('hidden');
    document.getElementById('btn-delete-prod').classList.add('hidden');
    
    document.getElementById('prod-price-original').value = "";
    document.getElementById('prod-price-promo').value = "";

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.remove('translate-y-full');

    if (productData) {
        editProduct(productData);
    } else {
        document.getElementById('prod-id').value = '';
        document.getElementById('modal-title').innerText = "Novo Produto";
        document.getElementById('btn-save').innerHTML = "<span>Salvar Produto</span>";
        if(preSelectedCatId) document.getElementById('prod-category').value = preSelectedCatId;
    }
}

function editProduct(p) {
    const modal = document.getElementById('product-modal');
    if(modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.remove('translate-y-full');
    }

    document.getElementById('modal-title').innerText = "Editar Produto";
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-title').value = p.titulo;
    document.getElementById('prod-category').value = p.categoria;
    document.getElementById('prod-desc').value = p.descricao;
    document.getElementById('prod-video').value = p.video_youtube || '';
    document.getElementById('prod-active').checked = p.disponivel;
    document.getElementById('prod-featured').checked = p.destaque;
    
    if (p.preco_de && p.preco_de > 0) {
        document.getElementById('prod-price-original').value = floatToMoney(p.preco_de);
        document.getElementById('prod-price-promo').value = floatToMoney(p.preco_por);
    } else {
        document.getElementById('prod-price-original').value = floatToMoney(p.preco_por);
        document.getElementById('prod-price-promo').value = '';
    }

    if (p.foto_capa) {
        const img = document.getElementById('preview-cover');
        img.src = `${PB_URL}/api/files/${p.collectionId}/${p.id}/${p.foto_capa}`;
        img.classList.remove('hidden');
    }

    document.getElementById('btn-delete-prod').classList.remove('hidden');
    document.getElementById('btn-save').innerHTML = "<span>Atualizar Produto</span>";
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
        const id = document.getElementById('prod-id').value;
        
        const inputOriginal = parseMoneyToFloat(document.getElementById('prod-price-original').value);
        const inputPromoStr = document.getElementById('prod-price-promo').value;
        const inputPromo = inputPromoStr ? parseMoneyToFloat(inputPromoStr) : null;
        
        let dbPrecoDe = 0;
        let dbPrecoPor = inputOriginal;

        if (inputPromo && inputPromo < inputOriginal) {
            dbPrecoDe = inputOriginal;
            dbPrecoPor = inputPromo;
        } 

        const formData = new FormData();
        formData.append('titulo', document.getElementById('prod-title').value);
        formData.append('categoria', document.getElementById('prod-category').value);
        formData.append('preco_por', dbPrecoPor);
        formData.append('preco_de', dbPrecoDe);
        formData.append('descricao', document.getElementById('prod-desc').value);
        formData.append('video_youtube', document.getElementById('prod-video').value);
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

        if(!document.getElementById('prod-title').value || !inputOriginal) {
            throw new Error("Preencha Nome e Preço Original!");
        }

        if (id) {
            await pb.collection('produtos').update(id, formData);
        } else {
            await pb.collection('produtos').create(formData);
        }
        
        closeProductModal();
        
        if(!document.getElementById('view-category-detail').classList.contains('hidden')) {
             const catId = document.getElementById('edit-cat-id').value;
             openCategoryDetails({id: catId, nome: document.getElementById('edit-cat-name').value}); 
        } else {
             loadProducts();
        }

    } catch (err) {
        alert("Erro: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function deleteProductFromModal() {
    const id = document.getElementById('prod-id').value;
    if(!id) return;

    if(confirm("Tem certeza que deseja apagar este produto permanentemente?")) {
        try {
            await pb.collection('produtos').delete(id);
            closeProductModal();
            
            if(!document.getElementById('view-category-detail').classList.contains('hidden')) {
                const catId = document.getElementById('edit-cat-id').value;
                openCategoryDetails({id: catId, nome: document.getElementById('edit-cat-name').value}); 
           } else {
                loadProducts();
           }

        } catch(e) { alert("Erro ao apagar."); }
    }
}