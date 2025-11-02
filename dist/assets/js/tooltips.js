// Tooltips Interativos
document.addEventListener('DOMContentLoaded', function() {

    // Função para ajustar posição de tooltips próximos às bordas
    function adjustTooltipPosition() {
        const tooltips = document.querySelectorAll('.term-tooltip, .bio-tooltip');

        tooltips.forEach(tooltip => {
            const rect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Se o tooltip está muito à direita
            if (rect.right > viewportWidth - 100) {
                tooltip.classList.add('tooltip-left');
            }

            // Se o tooltip está muito à esquerda
            if (rect.left < 100) {
                tooltip.classList.remove('tooltip-left');
            }
        });
    }

    // Executar ao carregar e ao redimensionar
    adjustTooltipPosition();
    window.addEventListener('resize', adjustTooltipPosition);

    // Suporte para mobile (tap para mostrar tooltip)
    if ('ontouchstart' in window) {
        const tooltips = document.querySelectorAll('.term-tooltip, .bio-tooltip');

        tooltips.forEach(tooltip => {
            tooltip.addEventListener('touchstart', function(e) {
                // Remove 'active' de todos os outros tooltips
                tooltips.forEach(t => {
                    if (t !== tooltip) {
                        t.classList.remove('active');
                    }
                });

                // Toggle 'active' no tooltip clicado
                this.classList.toggle('active');
                e.preventDefault();
            });
        });

        // Remover tooltip ao tocar fora
        document.addEventListener('touchstart', function(e) {
            if (!e.target.closest('.term-tooltip, .bio-tooltip')) {
                tooltips.forEach(t => t.classList.remove('active'));
            }
        });
    }

    // Lazy loading de conteúdo biográfico (opcional)
    const bioTooltips = document.querySelectorAll('.bio-tooltip[data-bio-url]');

    bioTooltips.forEach(tooltip => {
        let loaded = false;

        tooltip.addEventListener('mouseenter', function() {
            if (!loaded && this.dataset.bioUrl) {
                fetch(this.dataset.bioUrl)
                    .then(response => response.json())
                    .then(data => {
                        this.dataset.tooltip = data.bio;
                        loaded = true;
                    })
                    .catch(error => {
                        console.error('Erro ao carregar biografia:', error);
                    });
            }
        });
    });

    // Acessibilidade: permitir navegação por teclado
    const allTooltips = document.querySelectorAll('.term-tooltip, .bio-tooltip');

    allTooltips.forEach(tooltip => {
        // Tornar focável
        if (!tooltip.hasAttribute('tabindex')) {
            tooltip.setAttribute('tabindex', '0');
        }

        // Mostrar tooltip ao focar
        tooltip.addEventListener('focus', function() {
            this.classList.add('active');
        });

        tooltip.addEventListener('blur', function() {
            this.classList.remove('active');
        });

        // Fechar tooltip com Escape
        tooltip.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.classList.remove('active');
                this.blur();
            }
        });
    });
});

// Função utilitária para criar tooltips dinamicamente
function createTooltip(element, content, type = 'term') {
    element.classList.add(type === 'bio' ? 'bio-tooltip' : 'term-tooltip');
    element.setAttribute('data-tooltip', content);
    element.setAttribute('tabindex', '0');
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.createTooltip = createTooltip;
}
