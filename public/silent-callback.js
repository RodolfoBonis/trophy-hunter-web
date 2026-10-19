// Retorno do login silencioso (iframe, prompt=none): entrega a URL (code/state ou erro) para a aba do
// app, que conclui a troca de tokens em memória. Mesmo protocolo do oidc-client-ts (source "oidc-client").
// Arquivo separado (não inline) por causa da CSP script-src 'self'.
(function () {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ source: "oidc-client", url: window.location.href, keepOpen: false }, window.location.origin);
  }
})();
