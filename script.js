// ===== ROLETA FUNCIONAL COM GIRO E PARADA PROFISSIONAL MELHORADA =====

// Estados da roleta
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    STOPPING: 'stopping',
    STOPPED: 'stopped'
};

// Estado do jogo
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000, // Mínimo 2 segundos antes de poder parar
    animationId: null,
    velocidadeAtual: 0,
    anguloAtual: 0,
    roletaElement: null,
    autoStopTimeout: null,
    anguloFinal: 0, // Ângulo onde a roleta deve parar
    desacelerando: false,
    // Novos parâmetros para controle de desaceleração suave
    velocidadeInicial: 25,
    velocidadeMinima: 0.2,
    fatorDesaceleracao: 0.98,
    tempoDesaceleracao: 0,
    duracaoDesaceleracao: 3000 // 3 segundos para desaceleração
};

// Elementos DOM
const elements = {
    btnGirar: null,
    btnParar: null,
    roleta: null,
    roletaPointer: null,
    toastContainer: null,
    resultadoModal: null,
    btnContinuar: null,
    premioValor: null,
    novoSaldo: null,
    girosCount: null,
    saldoAtual: null
};

// Configuração de prêmios com setores da roleta
const premiosPossiveis = [
    { valor: 0, texto: 'Tente novamente!', peso: 50, setor: 'cinza' },
    { valor: 25, texto: 'R$ 25,00', peso: 25, setor: 'dourado' },
    { valor: 50, texto: 'R$ 50,00', peso: 15, setor: 'vermelho' },
    { valor: 75, texto: 'R$ 75,00', peso: 10, setor: 'azul' }
];

// Mapeamento dos setores da roleta (8 setores de 45 graus cada)
const setoresRoleta = [
    { inicio: 0, fim: 45, cor: 'dourado', premio: premiosPossiveis[1] },      // 0-45°
    { inicio: 45, fim: 90, cor: 'cinza', premio: premiosPossiveis[0] },       // 45-90°
    { inicio: 90, fim: 135, cor: 'vermelho', premio: premiosPossiveis[2] },   // 90-135°
    { inicio: 135, fim: 180, cor: 'cinza', premio: premiosPossiveis[0] },     // 135-180°
    { inicio: 180, fim: 225, cor: 'azul', premio: premiosPossiveis[3] },      // 180-225°
    { inicio: 225, fim: 270, cor: 'cinza', premio: premiosPossiveis[0] },     // 225-270°
    { inicio: 270, fim: 315, cor: 'dourado', premio: premiosPossiveis[1] },   // 270-315°
    { inicio: 315, fim: 360, cor: 'cinza', premio: premiosPossiveis[0] }      // 315-360°
];

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 RoletaWin - Iniciando sistema profissional melhorado...');
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log('✅ Sistema inicializado com sucesso!');
});

// Inicializar elementos DOM
function inicializarElementos() {
    elements.btnGirar = document.getElementById('btn-girar');
    elements.btnParar = document.getElementById('btn-parar');
    elements.roleta = document.getElementById('roleta');
    elements.roletaPointer = document.getElementById('roleta-pointer');
    elements.toastContainer = document.getElementById('toast-container');
    elements.resultadoModal = document.getElementById('resultado-modal');
    elements.btnContinuar = document.getElementById('btn-continuar');
    elements.premioValor = document.getElementById('premio-valor');
    elements.novoSaldo = document.getElementById('novo-saldo');
    elements.girosCount = document.getElementById('giros-count');
    elements.saldoAtual = document.getElementById('saldo-atual');
    
    // Verificar se elementos essenciais existem
    if (!elements.btnGirar || !elements.roleta) {
        console.error('❌ Elementos essenciais não encontrados!');
        return;
    }
    
    console.log('✅ Elementos DOM inicializados');
}

// Event listeners
function inicializarEventListeners() {
    if (elements.btnGirar) {
        elements.btnGirar.addEventListener('click', iniciarGiro);
        console.log('✅ Event listener do botão GIRAR adicionado');
    }
    
    if (elements.btnParar) {
        elements.btnParar.addEventListener('click', pararGiro);
        console.log('✅ Event listener do botão PARAR adicionado');
    }
    
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener('click', fecharModal);
    }
    
    // Fechar modal clicando fora
    if (elements.resultadoModal) {
        elements.resultadoModal.addEventListener('click', function(e) {
            if (e.target === elements.resultadoModal) {
                fecharModal();
            }
        });
    }
}

// Iniciar giro
function iniciarGiro() {
    console.log('🎯 Iniciando giro profissional melhorado...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE || gameState.girosRestantes <= 0) {
        console.log('❌ Não é possível girar agora. Estado:', gameState.estadoRoleta, 'Giros:', gameState.girosRestantes);
        return;
    }
    
    // Calcular ângulo final baseado no prêmio sorteado
    const premioSorteado = sortearPremio();
    const setorEscolhido = encontrarSetorPorPremio(premioSorteado);
    gameState.anguloFinal = calcularAnguloFinal(setorEscolhido);
    
    console.log('🎲 Prêmio sorteado:', premioSorteado);
    console.log('🎯 Setor escolhido:', setorEscolhido);
    console.log('📐 Ângulo final calculado:', gameState.anguloFinal);
    
    // Resetar estado para novo giro
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.velocidadeAtual = gameState.velocidadeInicial;
    gameState.anguloAtual = 0;
    gameState.desacelerando = false;
    gameState.tempoDesaceleracao = 0;
    
    console.log('✅ Estado atualizado para SPINNING');
    
    // Atualizar interface - trocar botões
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.add('hidden');
        elements.btnParar.classList.remove('hidden');
        elements.btnParar.disabled = true; // Desabilitado inicialmente
        elements.btnParar.innerHTML = '<i class="fas fa-clock"></i><span>AGUARDE...</span>';
        console.log('✅ Botões trocados - GIRAR oculto, PARAR visível');
    }
    
    // Adicionar efeitos visuais à roleta
    if (elements.roleta) {
        elements.roleta.classList.remove('parada', 'desacelerando');
        elements.roleta.classList.add('girando');
        console.log('✅ Efeitos visuais aplicados à roleta');
    }
    
    mostrarToast('🎰 A roleta está girando! Aguarde para poder parar...', 'info');
    
    // Iniciar animação da roleta
    iniciarAnimacaoRoleta();
    
    // Habilitar botão parar após tempo mínimo
    setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            elements.btnParar.disabled = false;
            elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
            mostrarToast('✋ Agora você pode parar a roleta!', 'success');
            console.log('✅ Botão PARAR habilitado');
        }
    }, gameState.tempoMinimoGiro);
    
    // Auto-parar após 10 segundos se o usuário não parar
    gameState.autoStopTimeout = setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            console.log('⏰ Auto-parando após 10 segundos');
            pararGiro();
        }
    }, 10000);
}

// Sortear prêmio baseado nas probabilidades
function sortearPremio() {
    const totalPeso = premiosPossiveis.reduce((total, premio) => total + premio.peso, 0);
    const random = Math.random() * totalPeso;
    
    let acumulado = 0;
    for (let i = 0; i < premiosPossiveis.length; i++) {
        acumulado += premiosPossiveis[i].peso;
        if (random <= acumulado) {
            return premiosPossiveis[i];
        }
    }
    
    // Fallback
    return premiosPossiveis[0];
}

// Encontrar setor correspondente ao prêmio
function encontrarSetorPorPremio(premio) {
    // Filtrar setores que correspondem ao prêmio
    const setoresValidos = setoresRoleta.filter(setor => 
        setor.premio.valor === premio.valor
    );
    
    // Escolher um setor aleatório entre os válidos
    const indiceAleatorio = Math.floor(Math.random() * setoresValidos.length);
    return setoresValidos[indiceAleatorio];
}

// Calcular ângulo final para parar no setor escolhido
function calcularAnguloFinal(setor) {
    // Escolher um ângulo aleatório dentro do setor
    const anguloNoSetor = setor.inicio + Math.random() * (setor.fim - setor.inicio);
    
    // Adicionar voltas completas para tornar o giro mais interessante
    const voltasCompletas = 3 + Math.random() * 2; // 3-5 voltas
    const anguloTotal = (voltasCompletas * 360) + anguloNoSetor;
    
    return anguloTotal;
}

// ===== ANIMAÇÃO MELHORADA COM DESACELERAÇÃO PROFISSIONAL =====

// Função de easing para desaceleração suave (ease-out cubic)
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Função de easing para desaceleração exponencial
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Animação contínua da roleta com efeito profissional melhorado
function iniciarAnimacaoRoleta() {
    console.log('🔄 Iniciando animação profissional melhorada da roleta');
    
    function animar() {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING || gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING) {
            
            if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING && !gameState.desacelerando) {
                // Iniciar desaceleração suave
                gameState.desacelerando = true;
                gameState.tempoDesaceleracao = Date.now();
                
                if (elements.roleta) {
                    elements.roleta.classList.remove('girando');
                    elements.roleta.classList.add('desacelerando');
                }
                console.log('🛑 Iniciando desaceleração suave profissional');
            }
            
            // Calcular nova velocidade e ângulo
            if (gameState.desacelerando) {
                // Calcular progresso da desaceleração (0 a 1)
                const tempoDecorrido = Date.now() - gameState.tempoDesaceleracao;
                const progresso = Math.min(tempoDecorrido / gameState.duracaoDesaceleracao, 1);
                
                if (progresso >= 1) {
                    // Desaceleração completa, finalizar no ângulo exato
                    gameState.anguloAtual = gameState.anguloFinal;
                    finalizarGiro();
                    return;
                } else {
                    // Aplicar curva de desaceleração suave
                    const fatorEasing = easeOutExpo(progresso);
                    
                    // Calcular ângulo atual baseado na curva de desaceleração
                    const anguloInicial = gameState.anguloAtual;
                    const distanciaTotal = gameState.anguloFinal - anguloInicial;
                    
                    // Se esta é a primeira iteração da desaceleração, ajustar o ângulo inicial
                    if (tempoDecorrido < 16) { // ~1 frame
                        gameState.anguloInicialDesaceleracao = gameState.anguloAtual;
                        gameState.distanciaTotalDesaceleracao = gameState.anguloFinal - gameState.anguloAtual;
                    }
                    
                    // Calcular novo ângulo usando interpolação suave
                    const novoAngulo = gameState.anguloInicialDesaceleracao + 
                                     (gameState.distanciaTotalDesaceleracao * fatorEasing);
                    
                    gameState.anguloAtual = novoAngulo;
                    
                    // Calcular velocidade atual para efeitos visuais
                    const velocidadeNormalizada = 1 - progresso;
                    gameState.velocidadeAtual = gameState.velocidadeInicial * velocidadeNormalizada;
                }
            } else {
                // Giro normal em velocidade constante
                gameState.anguloAtual += gameState.velocidadeAtual;
            }
            
            // Aplicar rotação com suavização
            if (elements.roleta) {
                elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
                
                // Adicionar efeito de brilho baseado na velocidade
                const intensidadeBrilho = Math.min(gameState.velocidadeAtual / gameState.velocidadeInicial, 1);
                const filtro = `brightness(${1 + intensidadeBrilho * 0.4}) saturate(${1 + intensidadeBrilho * 0.8})`;
                elements.roleta.style.filter = filtro;
            }
            
            gameState.animationId = requestAnimationFrame(animar);
        }
    }
    
    gameState.animationId = requestAnimationFrame(animar);
}

// Parar giro (chamado pelo botão)
function pararGiro() {
    console.log('🛑 Parando giro com desaceleração profissional...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.SPINNING) {
        console.log('❌ Não é possível parar agora. Estado:', gameState.estadoRoleta);
        return;
    }
    
    // Limpar o timeout de auto-parada se o usuário parar manualmente
    if (gameState.autoStopTimeout) {
        clearTimeout(gameState.autoStopTimeout);
        gameState.autoStopTimeout = null;
    }

    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPING;
    
    // Atualizar botão com feedback visual melhorado
    if (elements.btnParar) {
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>PARANDO...</span>';
        elements.btnParar.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    }
    
    mostrarToast('⏳ Aplicando desaceleração suave...', 'warning');
    console.log('✅ Estado alterado para STOPPING - iniciando desaceleração profissional');
}

// Finalizar giro com efeitos melhorados
function finalizarGiro() {
    console.log('🏁 Finalizando giro com efeitos profissionais...');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPED;
    
    // Parar animação
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
        console.log('✅ Animação parada');
    }
    
    // Remover efeitos visuais da roleta com transição suave
    if (elements.roleta) {
        elements.roleta.classList.remove('girando', 'desacelerando');
        elements.roleta.classList.add('parada');
        
        // Resetar filtros com transição suave
        elements.roleta.style.transition = 'filter 0.5s ease-out';
        elements.roleta.style.filter = 'brightness(1) saturate(1)';
        
        // Remover transição após completar
        setTimeout(() => {
            elements.roleta.style.transition = '';
        }, 500);
    }
    
    // Animar seta indicadora com efeito melhorado
    if (elements.roletaPointer) {
        elements.roletaPointer.classList.add('resultado');
        
        // Adicionar efeito de pulsação
        elements.roletaPointer.style.animation = 'pulsePointer 0.6s ease-in-out 3';
        
        setTimeout(() => {
            elements.roletaPointer.classList.remove('resultado');
            elements.roletaPointer.style.animation = '';
        }, 2000);
    }
    
    // Calcular resultado baseado no ângulo final
    const premio = calcularPremioFinal();
    console.log('🎁 Prêmio final calculado:', premio);
    
    // Atualizar saldo
    gameState.saldoAtual += premio.valor;
    
    // Mostrar resultado com timing melhorado
    setTimeout(() => {
        mostrarResultado(premio);
        
        // Resetar botões após um tempo
        setTimeout(() => {
            resetarBotoes();
        }, 1000);
    }, 800);
}

// Calcular prêmio baseado no ângulo final da roleta
function calcularPremioFinal() {
    // Normalizar ângulo para 0-360
    const anguloNormalizado = gameState.anguloAtual % 360;
    console.log('📐 Ângulo final normalizado:', anguloNormalizado);
    
    // Encontrar o setor correspondente
    for (let setor of setoresRoleta) {
        if (anguloNormalizado >= setor.inicio && anguloNormalizado < setor.fim) {
            console.log('🎯 Setor encontrado:', setor);
            return setor.premio;
        }
    }
    
    // Fallback para o último setor (360°)
    return setoresRoleta[setoresRoleta.length - 1].premio;
}

// Mostrar resultado com efeitos melhorados
function mostrarResultado(premio) {
    console.log('🎉 Mostrando resultado com efeitos profissionais:', premio);
    
    if (!elements.resultadoModal) {
        console.error('❌ Modal de resultado não encontrado');
        return;
    }
    
    // Atualizar conteúdo do modal
    if (elements.premioValor) {
        elements.premioValor.textContent = premio.texto;
    }
    
    if (elements.novoSaldo) {
        elements.novoSaldo.textContent = gameState.saldoAtual.toFixed(2);
    }
    
    // Atualizar título e descrição baseado no prêmio
    const titulo = document.getElementById('resultado-titulo');
    const descricao = document.getElementById('resultado-descricao');
    const icon = document.getElementById('resultado-icon');
    
    if (premio.valor > 0) {
        if (titulo) titulo.textContent = 'Parabéns! 🎉';
        if (descricao) descricao.textContent = 'Você ganhou um prêmio!';
        if (icon) icon.innerHTML = '<i class="fas fa-trophy"></i>';
        
        // Efeitos de vitória melhorados
        criarConfetes();
        mostrarToast(`🏆 Parabéns! Você ganhou ${premio.texto}!`, 'success');
        
        // Efeito sonoro simulado via vibração (se disponível)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    } else {
        if (titulo) titulo.textContent = 'Que pena! 😔';
        if (descricao) descricao.textContent = 'Não foi desta vez, mas continue tentando!';
        if (icon) icon.innerHTML = '<i class="fas fa-heart-broken"></i>';
        
        mostrarToast('😔 Não foi desta vez! Tente novamente.', 'warning');
    }
    
    // Mostrar modal com animação suave
    elements.resultadoModal.classList.remove('hidden');
    elements.resultadoModal.style.animation = 'modalFadeIn 0.4s ease-out';
    
    // Atualizar interface
    atualizarInterface();
    console.log('✅ Modal de resultado exibido com efeitos profissionais');
}

// Fechar modal
function fecharModal() {
    console.log('❌ Fechando modal');
    
    if (elements.resultadoModal) {
        elements.resultadoModal.style.animation = 'modalFadeOut 0.3s ease-in';
        setTimeout(() => {
            elements.resultadoModal.classList.add('hidden');
            elements.resultadoModal.style.animation = '';
        }, 300);
    }
    
    // Verificar se ainda há giros
    if (gameState.girosRestantes <= 0) {
        mostrarMensagemSemGiros();
    } else {
        gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
        console.log('✅ Estado resetado para IDLE');
    }
}

// Resetar botões com estilo melhorado
function resetarBotoes() {
    console.log('🔄 Resetando botões com estilo profissional');
    
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.remove('hidden');
        elements.btnParar.classList.add('hidden');
        elements.btnGirar.disabled = false;
        elements.btnGirar.innerHTML = '<i class="fas fa-play"></i><span>GIRAR</span><div class="btn-bg"></div>';
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span><div class="btn-bg"></div>';
        
        // Resetar estilo do botão parar
        elements.btnParar.style.background = '';
        
        console.log('✅ Botões resetados com estilo profissional');
    }
}

// Mostrar mensagem quando não há mais giros
function mostrarMensagemSemGiros() {
    console.log('🚫 Giros esgotados');
    
    const girosSection = document.getElementById('giros-gratis-info');
    if (!girosSection) return;
    
    girosSection.innerHTML = `
        <div class="mensagem-sem-giros" style="text-align: center; padding: 2rem;">
            <div class="sem-giros-icon" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 1rem;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="sem-giros-titulo" style="color: #ffffff; margin-bottom: 1rem;">Giros Grátis Esgotados</h3>
            <p class="sem-giros-descricao" style="color: #cccccc; margin-bottom: 2rem;">
                Você utilizou todos os seus giros grátis! Para continuar jogando, 
                escolha uma das mesas premium abaixo ou faça um depósito.
            </p>
            <div class="sem-giros-acoes" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-depositar" style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #0a0e27; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-credit-card"></i>
                    <span>Fazer Depósito</span>
                </button>
                <button class="btn-mesas" style="background: rgba(255, 255, 255, 0.1); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-table"></i>
                    <span>Ver Mesas</span>
                </button>
            </div>
        </div>
    `;
    
    mostrarToast('🎯 Explore as mesas premium para continuar jogando!', 'info');
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar contador de giros
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosRestantes;
    }
    
    // Atualizar saldo
    if (elements.saldoAtual) {
        elements.saldoAtual.textContent = gameState.saldoAtual.toFixed(2);
    }
    
    // Mostrar/ocultar informações de giros
    const girosInfo = document.getElementById('giros-info');
    if (girosInfo) {
        if (gameState.girosRestantes > 0) {
            girosInfo.style.display = 'block';
        } else {
            girosInfo.style.display = 'none';
        }
    }
    
    console.log('✅ Interface atualizada');
}

// Função para mostrar toast (assumindo que existe)
function mostrarToast(mensagem, tipo) {
    console.log(`📢 Toast [${tipo}]: ${mensagem}`);
    // Implementação do toast seria aqui
}

// Função para criar confetes (assumindo que existe)
function criarConfetes() {
    console.log('🎊 Criando efeito de confetes');
    // Implementação dos confetes seria aqui
}

// ===== CSS ADICIONAL PARA ANIMAÇÕES MELHORADAS =====

// Adicionar estilos CSS dinamicamente
const estilosAdicionais = `
<style>
/* Animações melhoradas para o ponteiro */
@keyframes pulsePointer {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
}

/* Animações para o modal */
@keyframes modalFadeIn {
    from { 
        opacity: 0; 
        transform: scale(0.8) translateY(-20px); 
    }
    to { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
    }
}

@keyframes modalFadeOut {
    from { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
    }
    to { 
        opacity: 0; 
        transform: scale(0.8) translateY(-20px); 
    }
}

/* Melhorias na animação da roleta */
.roleta-mini.desacelerando {
    transition: filter 0.3s ease-out;
}

/* Efeito de hover melhorado nos botões */
.btn-jogar:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
}

.btn-jogar:active {
    transform: translateY(0) scale(0.98);
}
</style>
`;

// Adicionar estilos ao documento
document.head.insertAdjacentHTML('beforeend', estilosAdicionais);

console.log('🎨 Estilos CSS melhorados adicionados');

