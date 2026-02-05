document.addEventListener("DOMContentLoaded", () => {
    // Inicia os logos caso existam elementos estáticos na página
    initShowroomLogos();
});

/**
 * INICIALIZA O RODAPÉ PADRÃO DA VITRÔ
 * @param {string|null} model - O modelo do site ('agenda', 'loja', etc) para o link de "Saiba Mais".
 */
function initVitroFooter(model) {
    // 1. Definição do Link
    const baseUrl = "https://agenciavitro.com.br/saibamais.html";
    const targetUrl = model ? `${baseUrl}?modelo=${model}` : "https://agenciavitro.com.br";

    // 2. Injeção de Estilos (CSS In-line para garantir independência de frameworks como Tailwind)
    const style = document.createElement('style');
    style.innerHTML = `
        .vitro-footer-fixed {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #0f172a; /* Slate 900 */
            border-top: 1px solid #374151; /* Gray 700 */
            z-index: 9999;
            padding: 10px 16px;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            transition: transform 0.3s ease;
        }

        .vitro-footer-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .vitro-divider {
            display: none;
            height: 24px;
            width: 1px;
            background-color: #374151;
        }
        @media (min-width: 640px) {
            .vitro-divider { display: block; }
        }

        .vitro-footer-text {
            color: #d1d5db; /* Gray 300 */
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        @media (min-width: 640px) {
            .vitro-footer-text { font-size: 14px; }
        }

        .vitro-btn-cta {
            background-color: #10b981; /* Emerald 500 */
            color: #0f172a;
            font-size: 12px;
            font-weight: 900;
            padding: 8px 16px;
            border-radius: 9999px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
        }
        .vitro-btn-cta:hover {
            background-color: #ffffff;
            transform: scale(1.02);
        }
        .vitro-btn-cta:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    // 3. Criação do Elemento HTML
    const footer = document.createElement('div');
    footer.className = 'vitro-footer-fixed';
    
    // Ícone de seta SVG inline para não depender do Lucide
    const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

    footer.innerHTML = `
        <div class="vitro-footer-left">
            <div class="vitro-logo" style="font-size: 5px; color: #fff;"></div>
            
            <div class="vitro-divider"></div>
            
            <span class="vitro-footer-text">
                Gostou do site?
            </span>
        </div>

        <a href="${targetUrl}" target="_blank" class="vitro-btn-cta">
            Saiba mais ${arrowSvg}
        </a>
    `;

    document.body.appendChild(footer);

    // 4. Força a renderização do logo dentro do novo rodapé
    initShowroomLogos();
}

function initShowroomLogos() {
    // 1. INJEÇÃO DO CSS DO LOGOTIPO (COM EFEITOS DE HOVER)
    // Verifica se o estilo já foi injetado para não duplicar
    if (!document.getElementById('vitro-logo-style')) {
        const style = document.createElement('style');
        style.id = 'vitro-logo-style';
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&display=swap');

            /* BASE DO LOGO - CLASSE COM SUFIXO -V */
            .logo-wrapper-v {
                font-family: 'Archivo', sans-serif;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                user-select: none;
                line-height: 1;
                /* Tamanho base */
                font-size: 10px; 
                cursor: pointer;
            }

            /* SUBTÍTULO */
            .brand-sub-v {
                font-size: 1.2em;
                font-weight: 700;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 0.65em;
                margin-left: 0.05em;
                color: inherit; 
                opacity: 0.7;
            }

            /* TÍTULO PRINCIPAL */
            .brand-main-v {
                font-size: 8em;
                font-weight: 900;
                letter-spacing: -0.06em;
                position: relative;
                display: flex;
                align-items: baseline;
                line-height: 0.65;
                color: inherit; 
            }

            /* O CHARME DO ACENTO */
            .char-o-wrapper-v {
                position: relative;
                display: inline-block;
                margin-left: 0.02em;
            }

            .accent-v {
                position: absolute;
                top: -0.20em;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.85em;
                font-weight: 900;
                color: #10b981; /* Verde Vitrô Original */
                
                /* TRANSIÇÃO SUAVE PARA O EFEITO */
                transition: top 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
            }

            /* O PINGO (QUADRADO AGORA) */
            .dot-v {
                width: 0.15em;
                height: 0.15em;
                background-color: #10b981;
                /* border-radius: 50%; removido para ficar quadrado */
                margin-left: 0.1em;
                display: inline-block;
                
                /* TRANSIÇÃO SUAVE PARA O EFEITO */
                transition: background-color 0.3s ease, box-shadow 0.3s ease;
            }

            /* --- EFEITOS DE INTERAÇÃO (HOVER) --- */
            
            /* Ao passar o mouse no logo, o acento sobe e brilha */
            .logo-wrapper-v:hover .accent-v {
                top: -0.35em; /* Levita */
                color: #34d399; /* Verde Luz */
                text-shadow: 0 0 20px rgba(16, 185, 129, 0.6); /* Glow */
            }

            /* Ao passar o mouse no logo, o ponto também brilha */
            .logo-wrapper-v:hover .dot-v {
                background-color: #34d399; /* Verde Luz */
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); /* Glow */
            }
        `;
        document.head.appendChild(style);
    }

    // 2. INJEÇÃO DO HTML
    const logoHTML = `
        <span class="brand-sub-v">agência</span>
        <div class="brand-main-v">
            vitr
            <div class="char-o-wrapper-v">
                <span class="accent-v">^</span>
                <span>o</span>
            </div>
            <span class="dot-v"></span>
        </div>
    `;

    const placeholders = document.querySelectorAll('.vitro-logo');
    placeholders.forEach(el => {
        // Evita renderizar duas vezes no mesmo elemento
        if (!el.classList.contains('logo-wrapper-v')) {
            el.classList.add('logo-wrapper-v');
            el.innerHTML = logoHTML;
        }
    });
}