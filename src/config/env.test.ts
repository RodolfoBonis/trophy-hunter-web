import { describe, expect, it } from "vitest";
import { assertHttps, loadConfig, setConfigForTests } from "./env";

describe("assertHttps", () => {
  const https = { oidcAuthority: "https://auth.rb.lab/realms/platform" };
  it("aceita https e qualquer coisa em dev", () => {
    expect(() => assertHttps(https, false)).not.toThrow();
    expect(() => assertHttps({ oidcAuthority: "http://localhost:8080/realms/platform" }, true)).not.toThrow();
  });
  it("recusa http fora do dev", () => {
    expect(() => assertHttps({ oidcAuthority: "http://auth.rb.lab" }, false)).toThrow(/OIDC_AUTHORITY/);
  });
});

describe("loadConfig", () => {
  it("lê o runtime config de window.__APP_CONFIG__ e remove a barra final da apiBase", () => {
    setConfigForTests(undefined as never);
    window.__APP_CONFIG__ = {
      oidcAuthority: "https://auth.rb.lab/realms/platform",
      oidcClientId: "trophy-hunter-web",
      oidcScope: "openid profile email",
      apiBase: "/api/",
    };
    const config = loadConfig();
    expect(config.apiBase).toBe("/api");
    expect(config.oidcClientId).toBe("trophy-hunter-web");
    expect(config.oidcScope).toBe("openid profile email");
    delete window.__APP_CONFIG__;
  });

  it("rejeita authority inválida", () => {
    window.__APP_CONFIG__ = { oidcAuthority: "not-a-url", apiBase: "/api" };
    expect(() => loadConfig()).toThrow();
    delete window.__APP_CONFIG__;
  });
});
