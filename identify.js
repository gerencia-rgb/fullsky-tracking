<script>
(function () {
  const ENDPOINT = "https://twdsjzrajfvjovrphucn.supabase.co/functions/v1/mkt-identify";
  const FORM_ID = "fs-blog-subscribe";
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function pickUuid(keys) {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v && uuidRe.test(v)) return v;
    }
    return null;
  }

  function scanLocalStorageForUuid() {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      if (v && uuidRe.test(v)) return v;
    }
    return null;
  }

  function getVisitorId() {
    return (
      pickUuid(["visitor_id", "mkt_visitor_id", "fs_visitor_id", "anon_id"]) ||
      scanLocalStorageForUuid()
    );
  }

  function getSessionId() {
    return pickUuid(["session_id", "mkt_session_id", "fs_session_id"]);
  }

  function send(payload) {
    const body = JSON.stringify(payload);

    // Más robusto si hay redirect post-submit
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      return navigator.sendBeacon(ENDPOINT, blob);
    }

    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }

  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      if (!form || form.id !== FORM_ID) return;

      const emailEl = form.querySelector('input[type="email"], input[name*="mail" i]');
      const email = emailEl && emailEl.value ? String(emailEl.value).trim().toLowerCase() : "";
      if (!email) return;

      const visitor_id = getVisitorId();
      if (!visitor_id) return;

      const session_id = getSessionId();

      send({
        visitor_id,
        session_id,
        identity_type: "email",
        identity_value: email,
        source: "framer_blog_subscribe"
      });
    },
    true
  );
})();
</script>
