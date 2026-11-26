
$("transaction-form").addEventListener("submit", async e => {
    e.preventDefault();
    if (!currentUser) return;

    const amount = Number($("transaction-amount").value);
    const type = $("transaction-type").value;
    const note = $("transaction-note").value.trim();
    const goalId = $("transaction-goal").value;

    if (!goalId) {
      message("transaction-message", "Please select a savings goal.", true);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      message("transaction-message", "Enter an amount greater than zero.", true);
      return;
    }

    const { error } = await supabase.rpc("record_savings_movement", {
      p_goal_id: goalId,
      p_amount: amount,
      p_type: type,
      p_note: note || null
    });

    if (error) {
      message("transaction-message", error.message, true);
    } else {
      $("transaction-form").reset();
      message("transaction-message", "Transaction saved and savings balance updated.");
      await refreshData();
    }
});


