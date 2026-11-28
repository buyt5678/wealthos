(() => {
  const cfg = window.WEALTHOS_CONFIG || {};
  const ready = cfg.supabaseUrl && cfg.supabasePublishableKey &&
    !cfg.supabaseUrl.includes("PASTE_") && !cfg.supabasePublishableKey.includes("PASTE_");
  const $ = (id) => document.getElementById(id);
  const authPanel = $("auth-panel"), appPanel = $("app-panel");
  let supabase, mode = "login", currentUser = null;

  function message(id, text, isError=false) {
    const el = $(id); el.textContent = text; el.className = "message " + (isError ? "error" : "success");
  }
  function money(value) {
    return new Intl.NumberFormat("en-US", {style:"currency", currency:"USD"}).format(Number(value || 0));
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function showAuth() { authPanel.classList.remove("hidden"); appPanel.classList.add("hidden"); }
  function showApp(user) {
    currentUser = user; authPanel.classList.add("hidden"); appPanel.classList.remove("hidden");
    $("signed-in-as").textContent = user.email || "Signed in";
    refreshData();
  }
  async function refreshData() {
    if (!currentUser) return;
    const [goalsRes, txRes] = await Promise.all([
      supabase.from("savings_goals").select("id,title,target_amount,saved_amount,currency,created_at").order("created_at",{ascending:false}),
      supabase.from("transactions").select("id,amount,transaction_type,note,created_at").order("created_at",{ascending:false}).limit(30)
    ]);
    if (goalsRes.error) message("goal-message", goalsRes.error.message, true);
    if (txRes.error) message("transaction-message", txRes.error.message, true);
    const goals = goalsRes.data || [], txs = txRes.data || [];
    const total = goals.reduce((sum,g)=>sum+Number(g.saved_amount||0),0);
   $("total-saved").textContent = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2
}).format(total);
    $("goals-list").innerHTML = goals.length ? goals.map(g => {
      const saved = Number(g.saved_amount||0), target = Number(g.target_amount||0);
      const pct = target > 0 ? Math.min(100, saved/target*100) : 0;
      return `<article class="goal-item"><div class="goal-top"><strong>${escapeHTML(g.title)}</strong><span>${money(saved)} / ${money(target)}</span></div><div class="progress"><span style="width:${pct}%"></span></div><div class="goal-bottom"><small>${pct.toFixed(0)}% complete</small><button class="text-button add-to-goal" data-id="${g.id}">Add savings</button></div></article>`;
    }).join("") : '<p class="muted">No goals yet. Add your first goal above.</p>';
    $("transactions-list").innerHTML = txs.length ? txs.map(t => `<div class="tx-row"><div><strong>${t.transaction_type === "deposit" ? "Deposit" : "Withdrawal"}</strong><small>${escapeHTML(t.note || "No note")} · ${new Date(t.created_at).toLocaleDateString()}</small></div><strong class="${t.transaction_type}">${t.transaction_type === "deposit" ? "+" : "−"}${money(t.amount)}</strong></div>`).join("") : '<p class="muted">No records yet.</p>';
  }
  $("show-login").addEventListener("click",()=>setMode("login"));
  $("show-signup").addEventListener("click",()=>setMode("signup"));
  function setMode(next) {
    mode=next; $("show-login").classList.toggle("active",mode==="login"); $("show-signup").classList.toggle("active",mode==="signup");
    $("auth-submit").textContent=mode==="login"?"Sign in":"Create account";
    $("password").autocomplete=mode==="login"?"current-password":"new-password";
    message("auth-message","");
  }
  $("auth-form").addEventListener("submit",async e=>{
    e.preventDefault(); if(!ready) return message("auth-message","Add your Supabase details to config.js first.",true);
    const email=$("email").value.trim(), password=$("password").value;
    $("auth-submit").disabled=true;
    try {
      if(mode==="signup") {
        const {data,error}=await supabase.auth.signUp({email,password});
        if(error) throw error;
        if(data.session) showApp(data.user);
        else message("auth-message","Account created. Check your email for a confirmation link, then return here to sign in.");
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error; showApp(data.user);
      }
    } catch(err) { message("auth-message",err.message || "Authentication failed.",true); }
    finally { $("auth-submit").disabled=false; }
  });
  $("sign-out").addEventListener("click",async()=>{await supabase.auth.signOut();currentUser=null;showAuth();});
  $("goal-form").addEventListener("submit",async e=>{
    e.preventDefault(); if(!currentUser) return;
    const title=$("goal-title").value.trim(), target=Number($("goal-target").value);
    const {error}=await supabase.from("savings_goals").insert({user_id:currentUser.id,title,target_amount:target,saved_amount:0,currency:"USD"});
    if(error) message("goal-message",error.message,true);
    else { $("goal-form").reset(); message("goal-message","Goal saved to your account."); await refreshData(); }
  });
  $("goals-list").addEventListener("click",async e=>{
    const btn=e.target.closest(".add-to-goal"); if(!btn) return;
    const raw=prompt("How much would you like to add to this goal (USD)?");
    if(raw===null) return; const amount=Number(raw);
    if(!Number.isFinite(amount)||amount<=0) return message("goal-message","Enter a valid positive amount.",true);
    const {data,error}=await supabase.from("savings_goals").select("saved_amount").eq("id",btn.dataset.id).single();
    if(error) return message("goal-message",error.message,true);
    const {error:updateError}=await supabase.from("savings_goals").update({saved_amount:Number(data.saved_amount||0)+amount}).eq("id",btn.dataset.id);
    if(updateError) message("goal-message",updateError.message,true);
    else { message("goal-message","Goal progress updated."); await refreshData(); }
  });
  $("transaction-form").addEventListener("submit",async e=>{
    e.preventDefault(); if(!currentUser) return;
    const amount=Number($("transaction-amount").value), type=$("transaction-type").value, note=$("transaction-note").value.trim();
    const {error}=await supabase.from("transactions").insert({user_id:currentUser.id,amount,transaction_type:type,note:note||null});
    if(error) message("transaction-message",error.message,true);
    else { $("transaction-form").reset(); message("transaction-message","Record saved to your account."); await refreshData(); }
  });
  if(!ready) {
    showAuth(); $("auth-submit").disabled=true;
    message("auth-message","Supabase connection not configured yet. Create config.js from config.example.js and add your Project URL and Publishable key.",true);
    return;
  }
  if(!window.supabase?.createClient) { message("auth-message","Supabase library did not load. Check your internet connection.",true); return; }
  supabase=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  supabase.auth.getSession().then(({data})=>{if(data.session)showApp(data.session.user);else showAuth();});
  supabase.auth.onAuthStateChange((_event,session)=>{if(session)showApp(session.user);});
})();
