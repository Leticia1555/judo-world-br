/* =====================================================
   CONFIGURAÇÃO - URL DA API
===================================================== */

// Detecta automaticamente se está em desenvolvimento (Live Server) ou produção
const API_BASE_URL = (() => {
    const host = window.location.hostname;
    const port = window.location.port;
    
    // Se estiver em localhost:3000, usa a mesma URL
    if (host === 'localhost' && port === '3000') {
        return 'http://localhost:3000';
    }
    
    // Se estiver em 127.0.0.1:5500 (Live Server), aponta para localhost:3000
    if (host === '127.0.0.1' || host === 'localhost') {
        return 'http://localhost:3000';
    }
    
    // Para outras situações, tenta usar a mesma origem
    return window.location.origin;
})();

console.log("API_BASE_URL:", API_BASE_URL);
