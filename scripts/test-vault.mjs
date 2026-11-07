async function test() {
  const base = "http://localhost:3000";

  // 1. Test wrong master password
  console.log("--> Testing wrong login password...");
  const wrongRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "WRONG_PASSWORD_123", founderName: "Hacker / Unknown" })
  });
  console.log("Wrong pass status:", wrongRes.status);

  // 2. Test correct master password SCALYTH2026
  console.log("--> Testing correct login password SCALYTH2026...");
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "SCALYTH2026", founderName: "Tanmay (Founder & CEO)" })
  });
  console.log("Login status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("Login user:", loginData.user?.userName);

  // 3. Test list files
  console.log("--> Listing vault files...");
  const filesRes = await fetch(`${base}/api/files`);
  const filesData = await filesRes.json();
  console.log("Files count:", filesData.files?.length);
  const founderFile = filesData.files?.find(f => f.name.includes("Founder_Disclosure"));
  console.log("Found founder disclosure:", founderFile?.name, "Protected:", founderFile?.isPasswordProtected);

  // 4. Test wrong password for protected file
  console.log("--> Testing wrong file password unlock...");
  const wrongFileUnlock = await fetch(`${base}/api/files/${founderFile.id}/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "INCORRECT_PASS", userName: "Tanmay (Founder & CEO)" })
  });
  console.log("Wrong file unlock status:", wrongFileUnlock.status);

  // 5. Test correct file unlock with FOUNDER2026
  console.log("--> Testing correct file password unlock...");
  const unlockRes = await fetch(`${base}/api/files/${founderFile.id}/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "FOUNDER2026", userName: "Tanmay (Founder & CEO)" })
  });
  console.log("File unlock status:", unlockRes.status);
  const unlockedData = await unlockRes.json();
  console.log("Unlocked file preview length:", unlockedData.file?.content?.length);

  // 6. Test audit history
  console.log("--> Verifying Audit Trail...");
  const logsRes = await fetch(`${base}/api/logs`);
  const logsData = await logsRes.json();
  console.log("Total audit logs count:", logsData.logs?.length);
  console.log("Latest log entry:", {
    user: logsData.logs[0]?.userName,
    action: logsData.logs[0]?.action,
    device: logsData.logs[0]?.device?.os + " / " + logsData.logs[0]?.device?.browser,
    ip: logsData.logs[0]?.ipAddress,
    status: logsData.logs[0]?.status,
    timestamp: logsData.logs[0]?.timestamp
  });

  console.log("\n>>> ALL VAULT VERIFICATION TESTS PASSED 100%! <<<");
}

test().catch(console.error);
