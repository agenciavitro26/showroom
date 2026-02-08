// --- CONFIGURAÇÃO ---
const PB_URL = "https://api.agenciavitro.com.br";
const pb = new PocketBase(PB_URL);

// Galeria
let galleryItems = [];
let initialExistingFiles = []; 

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    checkAuth();
    
    document.querySelectorAll('.money-mask').forEach(input => {
        input.addEventListener('input', (e) => formatMoneyInput(e.target));
    });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
}

// --- HELPER: Colar (Com fallback para HTTP) ---
async function pasteFromClipboard(inputId) {
    try {
        const text = await navigator.clipboard.readText();
        if(text) {
            document.getElementById(inputId).value = text;
        }
    } catch (err) {
        // Se falhar (ex: site sem HTTPS), avisa o usuário
        alert("O navegador bloqueou o acesso à área de transferência (requer HTTPS). Por favor, cole o link manualmente.");
        document.getElementById(inputId).focus();
    }
}

// --- SISTEMA DE MODAL ---
function showCustomModal({ title, msg, icon = 'info', input = false, confirmText = 'Confirmar', onConfirm }) {
    const overlay = document.getElementById('custom-modal-overlay');
    const content = document.getElementById('custom-modal-content');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-msg');
    const inputEl = document.getElementById('modal-input');
    const iconEl = document.getElementById('modal-icon');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    titleEl.innerText = title;
    msgEl.innerText = msg;
    confirmBtn.innerText = confirmText;
    iconEl.setAttribute('data-lucide', icon);
    
    if (input) {
        inputEl.classList.remove('hidden');
        inputEl.value = '';
        inputEl.focus();
    } else {
        inputEl.classList.add('hidden');
    }

    overlay.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-90', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
        lucide.createIcons(); 
    }, 10);

    const close = () => {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-90', 'opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 200);
    };

    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newCancel.addEventListener('click', close);
    newConfirm.addEventListener('click', () => {
        if(input && !inputEl.value.trim()) return; 
        const value = input ? inputEl.value.trim() : true;
        onConfirm(value);
        close();
    });
}

function requestLogout() {
    showCustomModal({
        title: "Sair do Painel",
        msg: "Tem certeza que deseja sair?",
        icon: 'log-out',
        confirmText: "Sair",
        onConfirm: () => {
            pb.authStore.clear();
            checkAuth();
        }
    });
}

function requestAddCategory() {
    scrollToTop();
    showCustomModal({
        title: "Nova Categoria",
        msg: "Digite o nome da nova categoria:",
        icon: 'folder-plus',
        input: true,
        confirmText: "Criar",
        onConfirm: async (nome) => {
            if(nome) {
                try {
                    await pb.collection('categorias').create({ nome: nome, ativa: true });
                    loadCategories();
                } catch(e) { alert("Erro ao criar."); }
            }
        }
    });
}

function formatMoneyInput(input) {
    let value = input.value.replace(/\D/g, "");
    value = (Number(value) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
    
    scrollToTop(); 

    if(tab === 'products') loadProducts();
    if(tab === 'categories') loadCategories();
    if(tab === 'home') loadSubscription();
}

async function loadDashboard() {
    switchTab('home'); 
}

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
            
            let colorClass = "text-gray-500";
            let bgClass = "bg-gray-100";
            let iconName = "help-circle";

            if (sub.status === 'Ativo') {
                colorClass = "text-green-600"; bgClass = "bg-green-100"; iconName = "check";
            } else if (sub.status === 'Pendente') {
                colorClass = "text-yellow-600"; bgClass = "bg-yellow-100"; iconName = "clock";
            } else {
                colorClass = "text-red-600"; bgClass = "bg-red-100"; iconName = "x-circle";
            }

            statusText.className = `font-bold text-lg ${colorClass}`;
            statusIcon.className = `w-10 h-10 rounded-full flex items-center justify-center ${bgClass}`;
            statusIcon.innerHTML = `<i data-lucide="${iconName}" class="${colorClass} w-6 h-6"></i>`;

            const btnRecorrente = document.getElementById('btn-recorrente');
            const btnPix = document.getElementById('btn-pix');
            const isAtivo = sub.status === 'Ativo';
            
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
            card.innerHTML = `<span class="font-bold text-lg text-gray-800 text-center leading-tight line-clamp-2">${cat.nome}</span>`;
            container.appendChild(card);
            const opt = document.createElement('option');
            opt.value = cat.id; opt.innerText = cat.nome;
            select.appendChild(opt);
        });
        lucide.createIcons();
    } catch (err) { console.error(err); }
}

async function openCategoryDetails(cat) {
    document.getElementById('view-categories').classList.add('hidden');
    document.getElementById('view-category-detail').classList.remove('hidden');
    document.getElementById('edit-cat-name').value = cat.nome;
    document.getElementById('edit-cat-id').value = cat.id;
    document.getElementById('nav-categories').classList.remove('active', 'text-brand-DEFAULT');
    scrollToTop();

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
        showCustomModal({ title: "Atenção", msg: "Esta categoria possui produtos. Remova-os antes de excluir.", icon: 'alert-triangle' });
        return;
    }
    showCustomModal({
        title: "Excluir Categoria",
        msg: "Tem certeza que deseja apagar esta categoria?",
        confirmText: "Excluir",
        icon: 'trash-2',
        onConfirm: async () => {
            try {
                await pb.collection('categorias').delete(id);
                switchTab('categories');
            } catch(e) { alert("Erro ao excluir."); }
        }
    });
}

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

function openProductModal(productData = null, preSelectedCatId = null) {
    scrollToTop();
    const form = document.getElementById('product-form');
    form.reset();
    document.getElementById('preview-cover').classList.add('hidden');
    document.getElementById('btn-delete-prod').classList.add('hidden');
    document.getElementById('prod-price-original').value = "";
    document.getElementById('prod-price-promo').value = "";

    galleryItems = [];
    initialExistingFiles = [];

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
    scrollToTop();
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

    if(p.galeria) {
        initialExistingFiles = [...p.galeria];
        galleryItems = p.galeria.map(filename => ({ type: 'existing', value: filename }));
    }

    document.getElementById('btn-delete-prod').classList.remove('hidden');
    document.getElementById('btn-save').innerHTML = "<span>Atualizar Produto</span>";
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
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

// --- GERENCIADOR DE GALERIA ---
function openGalleryManager() {
    document.getElementById('gallery-manager').classList.remove('hidden');
    renderGalleryGrid();
}

function closeGalleryManager() {
    document.getElementById('gallery-manager').classList.add('hidden');
}

function handleGallerySelect(input) {
    if(input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            galleryItems.push({ type: 'new', value: file });
        });
    }
    input.value = ""; 
    renderGalleryGrid();
}

function removePhoto(index) {
    galleryItems.splice(index, 1);
    renderGalleryGrid();
}

// Renderiza a grid (Cria o DOM inicial)
function renderGalleryGrid() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    const pid = document.getElementById('prod-id').value;

    galleryItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group cursor-move select-none transition-transform duration-100";
        div.setAttribute('data-index', index);
        
        let contentHtml = '';
        if(item.type === 'existing') {
            let src = `${PB_URL}/api/files/produtos/${pid}/${item.value}?thumb=100x100`;
            div.style.backgroundImage = `url('${src}')`;
        } else {
             const reader = new FileReader();
             reader.onload = (e) => {
                 div.style.backgroundImage = `url(${e.target.result})`;
             };
             reader.readAsDataURL(item.value);
             contentHtml = `<span class="absolute bottom-1 left-1 bg-brand-dark text-white text-[9px] px-1.5 rounded font-bold pointer-events-none">NOVA</span>`;
        }
        
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';

        const delBtn = document.createElement('button');
        delBtn.className = "absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-90 hover:opacity-100 z-10 cursor-pointer";
        delBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        delBtn.onclick = (e) => { e.stopPropagation(); removePhoto(index); };
        
        div.innerHTML = contentHtml;
        div.appendChild(delBtn);

        // Desktop Events
        div.setAttribute('draggable', 'true');
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragenter', handleDragEnter);
        div.addEventListener('dragleave', handleDragLeave);

        // Mobile Touch Events
        div.addEventListener('touchstart', handleTouchStart, {passive: false});

        grid.appendChild(div);
    });

    lucide.createIcons();
}

// --- DRAG & DROP (DESKTOP) ---
let dragSrcIndex = null;

function handleDragStart(e) {
    dragSrcIndex = this.getAttribute('data-index');
    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) { if (e.preventDefault) e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
function handleDragEnter(e) { this.classList.add('border-brand-DEFAULT', 'border-2'); }
function handleDragLeave(e) { this.classList.remove('border-brand-DEFAULT', 'border-2'); }
function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    const dropIndex = this.getAttribute('data-index');
    if (dragSrcIndex !== dropIndex) {
        const draggedItem = galleryItems[dragSrcIndex];
        galleryItems.splice(dragSrcIndex, 1);
        galleryItems.splice(dropIndex, 0, draggedItem);
        renderGalleryGrid();
    }
    return false;
}

// --- DRAG & DROP (MOBILE - COM FANTASMA & SEM TRAVAMENTO) ---
let ghostEl = null;

function handleTouchStart(e) {
    e.preventDefault(); // Necessário para evitar scroll
    dragSrcIndex = parseInt(this.getAttribute('data-index'));
    
    // 1. Criar Fantasma Visual
    const rect = this.getBoundingClientRect();
    ghostEl = this.cloneNode(true);
    ghostEl.style.position = 'fixed';
    ghostEl.style.width = `${rect.width}px`;
    ghostEl.style.height = `${rect.height}px`;
    ghostEl.style.top = `${rect.top}px`;
    ghostEl.style.left = `${rect.left}px`;
    ghostEl.style.zIndex = '1000';
    ghostEl.style.opacity = '0.9';
    ghostEl.style.pointerEvents = 'none'; // Importante para não bloquear a detecção do elemento abaixo
    ghostEl.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
    ghostEl.style.transform = 'scale(1.1)';
    ghostEl.style.border = '2px solid #d946ef';
    
    // Remove botão de delete do fantasma para ficar limpo
    const ghostBtn = ghostEl.querySelector('button');
    if(ghostBtn) ghostBtn.remove();
    
    document.body.appendChild(ghostEl);
    
    // 2. Feedback no original
    this.style.opacity = '0.2';
    
    // 3. Bind eventos globais
    document.addEventListener('touchmove', handleGlobalTouchMove, {passive: false});
    document.addEventListener('touchend', handleGlobalTouchEnd);
}

function handleGlobalTouchMove(e) {
    e.preventDefault();
    if (!ghostEl) return;
    
    const touch = e.touches[0];
    
    // Mover Fantasma
    const w = ghostEl.offsetWidth;
    const h = ghostEl.offsetHeight;
    ghostEl.style.left = `${touch.clientX - w/2}px`;
    ghostEl.style.top = `${touch.clientY - h/2}px`;

    // Detectar elemento alvo abaixo do dedo
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (target && target.closest('[data-index]')) {
        const dropTarget = target.closest('[data-index]');
        const dropIndex = parseInt(dropTarget.getAttribute('data-index'));
        
        // Se estiver sobre um quadrado diferente do original
        if (dropIndex !== dragSrcIndex) {
            
            // 1. Troca os dados no Array
            const draggedItem = galleryItems[dragSrcIndex];
            galleryItems[dragSrcIndex] = galleryItems[dropIndex];
            galleryItems[dropIndex] = draggedItem;

            // 2. Troca visualmente os elementos DOM (Troca background e data-index)
            // Isso evita destruir e recriar o DOM, o que causaria o travamento
            const grid = document.getElementById('gallery-grid');
            const nodes = grid.children;
            const nodeA = nodes[dragSrcIndex];
            const nodeB = nodes[dropIndex];
            
            // Troca Backgrounds
            const bgA = nodeA.style.backgroundImage;
            const bgB = nodeB.style.backgroundImage;
            nodeA.style.backgroundImage = bgB;
            nodeB.style.backgroundImage = bgA;

            // Troca o conteúdo HTML (tag NOVA)
            const htmlA = nodeA.innerHTML;
            const htmlB = nodeB.innerHTML;
            nodeA.innerHTML = htmlB;
            nodeB.innerHTML = htmlA;

            // Corrige opacidade (o novo local do drag deve ficar transparente)
            nodeA.style.opacity = '1';
            nodeB.style.opacity = '0.2';

            // Atualiza o índice atual do drag
            dragSrcIndex = dropIndex;
            
            // Re-bind click do botão de delete (já que trocamos o innerHTML)
            // Como trocamos o HTML, os listeners inline onclick funcionam, mas se for addEventListener precisa recriar.
            // Aqui usamos onclick no HTML string, então funciona.
        }
    }
}

function handleGlobalTouchEnd(e) {
    document.removeEventListener('touchmove', handleGlobalTouchMove);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
    
    if(ghostEl) {
        ghostEl.remove();
        ghostEl = null;
    }
    
    // Renderiza limpo para garantir consistência final
    renderGalleryGrid();
}

// --- SAVE ---
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

        if(!document.getElementById('prod-title').value || !inputOriginal) {
            throw new Error("Preencha Nome e Preço Original!");
        }

        if (id) {
            const currentExisting = galleryItems.filter(i => i.type === 'existing').map(i => i.value);
            const toDelete = initialExistingFiles.filter(filename => !currentExisting.includes(filename));
            
            toDelete.forEach(filename => formData.append('galeria-', filename));

            galleryItems.forEach(item => {
                if(item.type === 'new') formData.append('galeria', item.value);
            });

            await pb.collection('produtos').update(id, formData);
        } else {
             galleryItems.forEach(item => {
                if(item.type === 'new') formData.append('galeria', item.value);
            });
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
        showCustomModal({ title: "Erro", msg: err.message, confirmText: "Ok", icon: 'alert-triangle' });
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function deleteProductFromModal() {
    const id = document.getElementById('prod-id').value;
    if(!id) return;
    showCustomModal({
        title: "Excluir Produto",
        msg: "Tem certeza que deseja apagar este produto permanentemente?",
        confirmText: "Excluir",
        icon: 'trash-2',
        onConfirm: async () => {
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
    });
}