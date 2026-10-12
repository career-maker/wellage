/**
 * Site configuration — the single integration point for backend wiring.
 * Nothing in here is a secret; never put API keys in front-end code.
 */
window.PRAANA_CONFIG = {
  phone: "+919048857777",
  phoneDisplay: "+91 9048 857777",
  whatsapp: "919048857777",

  // Approved brochure PDF (path or URL). Empty = no file supplied yet, so the
  // brochure CTAs scroll to the enquiry form with a pre-filled request instead.
  brochureUrl: "wellage.pdf",

  // Lead endpoint. Expected contract: POST application/json
  //   { form: "enquiry" | "visit", name, phone, email, unit?, message?, date?, visitors?, source }
  // and a 2xx response on success. Empty = not connected: the forms validate,
  // then offer WhatsApp / call fallbacks and do NOT claim the enquiry was sent.
  formEndpoint: "",
};
